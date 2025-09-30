// script.js

// === STATE & SETUP ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
let settingsPassword = localStorage.getItem('settingsPassword') || '0000';
let businessName = localStorage.getItem('businessName') || 'ClearScape';
let userName = localStorage.getItem('userName') || 'User';
let currency = localStorage.getItem('currency') || 'GBP';
let recurringTemplates = JSON.parse(localStorage.getItem('recurringTemplates')) || [];

const defaultCategories = {
    Sales: ["Lawn Maintenance", "Hedge Trimming / Maintenance", "Landscaping", "Tree surgery / Felling", "Servicing / Repair", "Fencing", "Decking / Paving", "Other"],
    Expenses: ["Fuel", "Utilities", "Rent", "Services", "Materials", "Equipment", "Petty Cash", "Uniform / Safety Equipment", "Other"],
    Deposit: ["Loan", "Cash Injection", "Rebate / Refund", "Other"],
    Withdrawal: ["Cash Withdrawal", "Other"],
    Refund: ["Goodwill Gesture", "Job Cancellation / Amendment", "Other"],
    Other: []
};

// === ELEMENT SELECTORS ===
const appContainer = document.getElementById('appContainer');
const splashTitle = document.getElementById('splashTitle');
const appNameHeader = document.getElementById('appNameHeader');
const totalSalesEl = document.getElementById('totalSales');
const totalOutflowEl = document.getElementById('totalOutflow');
const outstandingBalanceEl = document.getElementById('outstandingBalance');
const totalOutstandingEl = document.getElementById('totalOutstanding');
const jobTypeSelect = document.getElementById('jobTypeSelect');
const transactionTypeSelect = document.getElementById('transactionTypeSelect');
const fullTransactionList = document.getElementById('fullTransactionList');


// === UTILITY & STATE MANAGEMENT ===
function formatCurrency(amount) {
    return Number(amount).toLocaleString('en-GB', { 
        style: 'currency', 
        currency: currency 
    }); 
}
function saveTransactions() { localStorage.setItem('transactions', JSON.stringify(transactions)); }
function saveRecurringTemplates() { localStorage.setItem('recurringTemplates', JSON.stringify(recurringTemplates)); }

function updateJobTypeDropdown() {
    if (!jobTypeSelect || !transactionTypeSelect) return;
    const selectedType = transactionTypeSelect.value;
    let options = [];
    if (selectedType === 'Sale') options = defaultCategories.Sales;
    else if (selectedType === 'Expense') options = defaultCategories.Expenses;
    else if (selectedType === 'Deposit') options = defaultCategories.Deposit;
    else if (selectedType === 'Withdrawal') options = defaultCategories.Withdrawal;
    else if (selectedType === 'Refund') options = defaultCategories.Refund;
    else {
        const allCategories = [];
        for (const key in defaultCategories) { allCategories.push(...defaultCategories[key]); }
        options = [...new Set(allCategories)];
    }
    jobTypeSelect.innerHTML = '';
    options.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        jobTypeSelect.appendChild(option);
    });
}


// === VIEW MANAGEMENT ===
function showView(viewId) {
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('setupWizardView').style.display = 'none';
    document.getElementById('appContainer').style.display = 'none';
    if (viewId === 'splashScreen' || viewId === 'setupWizardView') {
        document.getElementById(viewId).style.display = 'flex';
    } else {
        appContainer.style.display = 'block';
        document.querySelectorAll('.app-view').forEach(view => {
            view.style.display = 'none';
        });
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.style.display = 'block';
        }
    }
}


// === SPLASH SCREEN ENHANCEMENTS ===
function triggerLogoAnimation() {
    const appLogo = document.getElementById('appLogo');
    if (!appLogo || appLogo.classList.contains('logo-spin') || appLogo.classList.contains('logo-bounce')) return;
    const animations = ['logo-spin', 'logo-bounce'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    appLogo.classList.add(randomAnimation);
    setTimeout(() => { appLogo.classList.remove(randomAnimation); }, 1000);
}

function applySeasonalTheme() {
    const splashScreenEl = document.getElementById('splashScreen');
    if (!splashScreenEl) return;
    splashScreenEl.className = '';
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();
    if (month === 11) { splashScreenEl.classList.add('theme-christmas'); } 
    else if (month === 9 && day >= 20) { splashScreenEl.classList.add('theme-halloween'); }
}

function showSplashScreen() {
    showView('splashScreen');
    applySeasonalTheme();
    const greetings = [`Welcome back, ${userName}!`, "Let's get your finances in order.", "Ready to track your success?", `How's business, ${userName}?`];
    if (splashTitle) splashTitle.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    triggerLogoAnimation();
}


// === INACTIVITY TIMER ===
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showSplashScreen, 5 * 60 * 1000); // 5 minutes
}
['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});


// === CORE FINANCIAL & RECURRING LOGIC ===
function generateRecurringTransactions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let newTransactionsCreated = false;

    recurringTemplates.forEach(template => {
        if (template.repetitionType === 'count' && template.repetitionsMade >= template.totalRepetitions) return;
        let lastDate = new Date(template.lastGeneratedDate);
        let nextDate = new Date(lastDate);
        const incrementDate = () => {
            if (template.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (template.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (template.frequency === 'Quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
            else if (template.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
        };
        incrementDate();
        while (nextDate <= today) {
            if (template.repetitionType === 'count' && template.repetitionsMade >= template.totalRepetitions) break;
            const newTransaction = { ...template.sourceTransaction, id: `t_${Date.now()}_${Math.random()}`, date: nextDate.toISOString().split('T')[0], templateId: template.id };
            transactions.push(newTransaction);
            template.repetitionsMade++;
            newTransactionsCreated = true;
            lastDate = new Date(nextDate);
            incrementDate();
        }
        template.lastGeneratedDate = lastDate.toISOString().split('T')[0];
    });
    if (newTransactionsCreated) {
        saveTransactions();
        saveRecurringTemplates();
        sessionStorage.setItem('newRecurringGenerated', 'true');
    }
}

function updateDashboard() {
    initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
    let totalSales = 0, totalExpenses = 0, totalOutstandingAR = 0;
    let currentBalance = initialBalance;
    const currentYear = new Date().getFullYear();

    transactions.forEach(t => {
        const amountPaid = parseFloat(t.amountPaid);
        if (['Sale', 'Deposit'].includes(t.type)) currentBalance += amountPaid;
        else currentBalance -= amountPaid;
        
        if (new Date(t.date).getFullYear() === currentYear) {
            if (['Sale', 'Deposit'].includes(t.type)) totalSales += amountPaid;
            else totalExpenses += amountPaid;
        }
        
        if (t.type === 'Sale') totalOutstandingAR += (parseFloat(t.amountDue) - parseFloat(t.amountPaid));
    });
    
    totalSalesEl.textContent = formatCurrency(totalSales);
    totalOutflowEl.textContent = formatCurrency(totalExpenses);
    totalOutstandingEl.textContent = formatCurrency(totalOutstandingAR);
    outstandingBalanceEl.textContent = formatCurrency(currentBalance);
    totalOutstandingEl.className = `amount ${totalOutstandingAR > 0.01 ? 'negative' : 'positive'}`;
    outstandingBalanceEl.className = `amount ${currentBalance >= 0 ? 'positive' : 'negative'}`;
    displaySmartInsights();
}

function renderFullTransactionList() {
    if (!fullTransactionList) return;
    const searchTerm = document.getElementById('transactionSearchInput').value.toLowerCase();
    const filterJobTypeValue = document.getElementById('filterJobType').value;
    const filterPaidStatusValue = document.getElementById('filterPaidStatus').value;
    const startDateValue = document.getElementById('filterStartDate').value;
    const endDateValue = document.getElementById('filterEndDate').value;
    fullTransactionList.innerHTML = '';
    
    const filtered = transactions.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm) || (t.jobNotes && t.jobNotes.toLowerCase().includes(searchTerm));
        const matchesJobType = !filterJobTypeValue || t.jobType === filterJobTypeValue;
        let matchesPaidStatus = true;
        if (filterPaidStatusValue === 'Outstanding') matchesPaidStatus = (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) > 0.01;
        else if (filterPaidStatusValue === 'Paid') matchesPaidStatus = (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) <= 0.01;
        const passesStartDate = !startDateValue || t.date >= startDateValue;
        const passesEndDate = !endDateValue || t.date <= endDateValue;
        return matchesSearch && matchesJobType && matchesPaidStatus && passesStartDate && passesEndDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        fullTransactionList.innerHTML = '<li>No transactions match your filters.</li>';
        return;
    }
    filtered.forEach(t => {
        const item = document.createElement('li');
        item.className = 'transaction-item';
        const outstanding = parseFloat(t.amountDue) - parseFloat(t.amountPaid);
        const isOutstandingSale = t.type === 'Sale' && outstanding > 0.01;
        let actionButtons = `<button class="action-btn edit-btn" data-id="${t.id}">Edit</button> <button class="action-btn delete-btn" data-id="${t.id}">Delete</button>`;
        if (isOutstandingSale) {
            actionButtons = `<button class="action-btn repay-btn" data-id="${t.id}">Record Full Payment</button>` + actionButtons;
        }

        item.innerHTML = `
            <div class="transaction-summary">
                <span class="transaction-name">${t.name}</span>
                <span class="transaction-amount" style="color: ${['Sale','Deposit'].includes(t.type) ? 'var(--positive-color)' : 'var(--negative-color)'};">${formatCurrency(parseFloat(t.amountDue))}</span>
                <span class="transaction-date">${t.date}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Type:</strong> ${t.type}</p><p><strong>Category:</strong> ${t.jobType}</p>
                <p><strong>Amount Paid:</strong> ${formatCurrency(parseFloat(t.amountPaid))}</p><p><strong>Outstanding:</strong> ${formatCurrency(outstanding)}</p>
                <p><strong>Notes:</strong> ${t.jobNotes || 'N/A'}</p>
                <div class="transaction-actions">${actionButtons}</div>
            </div>`;
        item.querySelector('.transaction-summary').addEventListener('click', e => {
            if (e.target.tagName !== 'BUTTON') {
                const details = item.querySelector('.transaction-details');
                details.style.display = details.style.display === 'block' ? 'none' : 'block';
            }
        });
        fullTransactionList.appendChild(item);
    });
}


// === INSIGHTS & ANALYTICS ===
function displaySmartInsights() {
    const insightsListEl = document.getElementById('insightsList');
    if (!insightsListEl) return;
    insightsListEl.innerHTML = '';
    let insights = [];
    if (sessionStorage.getItem('newRecurringGenerated') === 'true') {
        insights.push({ type: 'info', text: 'New recurring transactions have been automatically generated.' });
        sessionStorage.removeItem('newRecurringGenerated');
    }
    generateOverdueInsights(insights);
    generateAverageInsights(insights);
    generateQuoteInsight(insights);
    if (insights.length === 0) insights.push({ type: 'quote', text: 'No special insights at the moment.' });
    insights.forEach(insight => {
        const li = document.createElement('li');
        li.className = `insight-${insight.type}`;
        li.innerHTML = insight.text;
        insightsListEl.appendChild(li);
    });
}

function generateOverdueInsights(insights) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    let overdueAmount = 0, overdueCount = 0;
    transactions.forEach(t => {
        if (t.type === 'Sale' && (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) > 0 && new Date(t.date) < fourteenDaysAgo) {
            overdueAmount += (parseFloat(t.amountDue) - parseFloat(t.amountPaid));
            overdueCount++;
        }
    });
    if (overdueCount > 0) {
        insights.push({ type: 'warning', text: `⚠️ You have ${formatCurrency(overdueAmount)} from ${overdueCount} transaction(s) overdue by more than 14 days.` });
    }
}

function generateAverageInsights(insights) { /* Logic can be expanded here */ }

function generateQuoteInsight(insights) {
    const quotes = ["The secret of getting ahead is getting started.", "An investment in knowledge pays the best interest.", "Beware of little expenses. A small leak will sink a great ship."];
    insights.push({ type: 'quote', text: `💡 "${quotes[Math.floor(Math.random() * quotes.length)]}"` });
}

let monthlyChartInstance;
function renderAnalyticsPage(year) {
    const analyticsYearSelect = document.getElementById('analyticsYearSelect');
    if (!analyticsYearSelect) return;
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
    if (years.length === 0) years.push(new Date().getFullYear());
    analyticsYearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    const selectedYear = parseInt(year || analyticsYearSelect.value);
    const yearData = processDataForYear(selectedYear);
    document.getElementById('analyticsTotalRevenue').textContent = formatCurrency(yearData.totalRevenue);
    document.getElementById('analyticsTotalExpenses').textContent = formatCurrency(yearData.totalExpenses);
    const netProfitEl = document.getElementById('analyticsNetProfit');
    netProfitEl.textContent = formatCurrency(yearData.netProfit);
    netProfitEl.className = `amount ${yearData.netProfit >= 0 ? 'positive' : 'negative'}`;
    createMonthlyChart(yearData.monthlySales, yearData.monthlyExpenses);
}

function processDataForYear(year) {
    const monthlySales = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === year) {
            const amount = parseFloat(t.amountPaid);
            if (['Sale', 'Deposit'].includes(t.type)) monthlySales[d.getMonth()] += amount;
            else monthlyExpenses[d.getMonth()] += amount;
        }
    });
    const totalRevenue = monthlySales.reduce((s, v) => s + v, 0);
    const totalExpenses = monthlyExpenses.reduce((s, v) => s + v, 0);
    return { monthlySales, monthlyExpenses, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
}

function createMonthlyChart(salesData, expenseData) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    if (monthlyChartInstance) monthlyChartInstance.destroy();
    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                { label: 'Revenue', data: salesData, backgroundColor: 'rgba(76, 175, 80, 0.7)' },
                { label: 'Expenses', data: expenseData, backgroundColor: 'rgba(244, 67, 54, 0.7)' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value) } } } }
    });
}


// === INITIALIZATION & SETUP WIZARD ===
function initApp() {
    resetInactivityTimer();
    generateRecurringTransactions();
    if (localStorage.getItem('setupComplete') !== 'true') {
        showView('setupWizardView');
        showSetupStep(1);
        return;
    }
    userName = localStorage.getItem('userName') || 'User';
    businessName = localStorage.getItem('businessName') || 'ClearScape';
    currency = localStorage.getItem('currency') || 'GBP';
    appNameHeader.textContent = `${businessName} Dashboard`;
    document.title = `${businessName} Tracker`;
    categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
    updateJobTypeDropdown();
    showView('dashboardView');
    updateDashboard();
}

let currentSetupStep = 1;
function showSetupStep(stepNumber) {
    document.querySelectorAll('.setup-step').forEach(step => step.style.display = 'none');
    const stepName = getStepName(stepNumber);
    if (stepName) document.getElementById(`step${stepName}`).style.display = 'block';
}

function getStepName(stepNumber) {
    const steps = [null, 'Name', 'BusinessName', 'Currency', 'Password', 'Balance', 'Categories'];
    return steps[stepNumber] || null;
}

function renderWizardCategoryList() {
    const list = document.getElementById('categoryWizardList');
    if (!list) return;
    list.innerHTML = '';
    const uniqueCategories = [...new Set(Object.values(defaultCategories).flat())];
    uniqueCategories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat;
        li.style.cssText = 'background: #f4f4f4; padding: 5px; margin-bottom: 5px; border-radius: 3px;';
        list.appendChild(li);
    });
    document.getElementById('finishSetupBtn').disabled = false;
}


// === INITIAL LOAD & EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setInterval(triggerLogoAnimation, 6000);

    // Main Navigation
    document.getElementById('goToDashboardBtn').addEventListener('click', () => { showView('dashboardView'); updateDashboard(); });
    document.getElementById('goToTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('goToSettingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('goToInsightsBtn').addEventListener('click', () => { renderAnalyticsPage(); showView('analyticsView'); });
    document.getElementById('viewAllTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('settingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('viewSplashBtn').addEventListener('click', showSplashScreen);
    
    // Back Buttons
    ['backToDashboardBtn', 'backToDashboardFromSettingsBtn', 'backToDashboardFromCategoryBtn', 'backToDashboardFromAnalyticsBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => showView('dashboardView'));
    });
    
    // Transaction Form & Actions
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const transactionId = document.getElementById('transactionId').value;
        const isRecurring = document.getElementById('isRecurringCheckbox').checked;
        const transactionData = {
            date: document.getElementById('transactionDate').value, name: document.getElementById('transactionName').value.trim(),
            type: document.getElementById('transactionTypeSelect').value, jobType: document.getElementById('jobTypeSelect').value,
            amountDue: parseFloat(document.getElementById('amountDueInput').value) || 0, amountPaid: parseFloat(document.getElementById('amountPaidInput').value) || 0,
            jobNotes: document.getElementById('jobNotesInput').value.trim()
        };
        if (!transactionData.date || !transactionData.name || !transactionData.amountDue) return alert('Please fill out Date, Name, and Amount Due.');
        if (transactionId) {
            const index = transactions.findIndex(t => t.id === transactionId);
            if (index > -1) {
                transactions[index] = { ...transactions[index], ...transactionData };
                alert('Transaction updated!');
            }
        } else {
            transactionData.id = `t_${Date.now()}`;
            if (isRecurring) {
                const repetitionType = document.querySelector('input[name="repeatOption"]:checked').value;
                const template = {
                    id: `rt_${Date.now()}`, frequency: document.getElementById('recurringFrequency').value, repetitionType: repetitionType,
                    totalRepetitions: repetitionType === 'count' ? parseInt(document.getElementById('repetitionCount').value) : Infinity,
                    repetitionsMade: 1, lastGeneratedDate: transactionData.date, sourceTransaction: transactionData
                };
                recurringTemplates.push(template);
                saveRecurringTemplates();
                transactionData.templateId = template.id;
                transactions.push(transactionData);
                alert('Recurring template saved!');
            } else {
                transactions.push(transactionData);
                alert('Transaction saved!');
            }
        }
        saveTransactions();
        updateDashboard();
        renderFullTransactionList();
        this.reset();
        document.getElementById('transactionId').value = '';
        document.getElementById('addTransactionBtn').textContent = 'Add Transaction';
        updateJobTypeDropdown();
        document.getElementById('recurringOptions').style.display = 'none';
    });
    
    document.getElementById('transactionTypeSelect').addEventListener('change', updateJobTypeDropdown);
    
    document.getElementById('isRecurringCheckbox').addEventListener('change', (e) => {
        document.getElementById('recurringOptions').style.display = e.target.checked ? 'block' : 'none';
    });
    document.querySelectorAll('input[name="repeatOption"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('repetitionCount').disabled = e.target.value !== 'count';
        });
    });

    fullTransactionList.addEventListener('click', (e) => {
        const transactionId = e.target.dataset.id;
        if (!transactionId) return;
        const transactionIndex = transactions.findIndex(t => t.id === transactionId);
        if (transactionIndex === -1) return;
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this transaction?')) {
                transactions.splice(transactionIndex, 1);
                saveTransactions();
                updateDashboard();
                renderFullTransactionList();
            }
        } else if (e.target.classList.contains('repay-btn')) {
            const transaction = transactions[transactionIndex];
            if (confirm(`Record a full payment for "${transaction.name}"?`)) {
                transaction.amountPaid = transaction.amountDue;
                saveTransactions();
                updateDashboard();
                renderFullTransactionList();
            }
        } else if (e.target.classList.contains('edit-btn')) {
            const t = transactions[transactionIndex];
            document.getElementById('transactionId').value = t.id;
            document.getElementById('transactionDate').value = t.date;
            document.getElementById('transactionName').value = t.name;
            document.getElementById('transactionTypeSelect').value = t.type;
            document.getElementById('amountDueInput').value = t.amountDue;
            document.getElementById('amountPaidInput').value = t.amountPaid;
            document.getElementById('jobNotesInput').value = t.jobNotes;
            updateJobTypeDropdown();
            document.getElementById('jobTypeSelect').value = t.jobType;
            document.getElementById('addTransactionBtn').textContent = 'Update Transaction';
            showView('dashboardView');
            document.getElementById('transactionForm').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Other UI Listeners
    document.getElementById('unlockSettingsBtn').addEventListener('click', () => {
        const passwordInput = document.getElementById('settingsPasswordInput');
        if (passwordInput.value === (localStorage.getItem('settingsPassword') || '0000')) {
            document.getElementById('settingsUnlockView').style.display = 'none';
            document.getElementById('actualSettings').style.display = 'block';
        } else {
            alert('Incorrect password.');
            passwordInput.value = '';
        }
    });
    
    document.getElementById('forgotPasswordLink').addEventListener('click', e => {
        e.preventDefault();
        if (confirm("Reset password to default?")) {
            localStorage.removeItem('settingsPassword');
            alert("Password has been reset to: 0000");
            location.reload(); 
        }
    });

    document.getElementById('applyFiltersBtn').addEventListener('click', renderFullTransactionList);
    document.getElementById('transactionSearchInput').addEventListener('input', renderFullTransactionList);
    document.getElementById('resetFiltersBtn').addEventListener('click', () => {
        ['transactionSearchInput', 'filterJobType', 'filterPaidStatus', 'filterStartDate', 'filterEndDate'].forEach(id => document.getElementById(id).value = '');
        renderFullTransactionList();
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => {
        if (transactions.length === 0) return alert('No transactions to export.');
        const headers = ["ID", "Date", "Name", "Type", "Category", "Amount Due", "Amount Paid", "Notes"];
        const rows = transactions.map(t => [t.id, t.date, t.name, t.type, t.jobType, t.amountDue, t.amountPaid, t.jobNotes || '']);
        const processRow = row => row.map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(',');
        const csv = [headers.join(','), ...rows.map(processRow)].join('\n');
        const link = document.createElement("a");
        link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        link.download = `${businessName}_Transactions.csv`;
        link.click();
    });

    document.getElementById('analyticsYearSelect').addEventListener('change', e => renderAnalyticsPage(e.target.value));

    // Wizard Navigation
    const wizardNav = {
        nextStepName: { next: 2, validate: () => document.getElementById('userNameInput').value.trim() !== '', alert: 'Please enter your name.', save: () => localStorage.setItem('userName', document.getElementById('userNameInput').value.trim()) },
        backStepBusinessName: { next: 1 },
        nextStepBusinessName: { next: 3, validate: () => document.getElementById('businessNameInput').value.trim() !== '', alert: 'Please enter a business name.', save: () => localStorage.setItem('businessName', document.getElementById('businessNameInput').value.trim()) },
        backStepCurrency: { next: 2 },
        nextStepCurrency: { next: 4, save: () => localStorage.setItem('currency', document.getElementById('currencySetupSelect').value) },
        backStepPassword: { next: 3 },
        nextStepPassword: { next: 5, validate: () => document.getElementById('passwordSetupInput').value.trim() !== '', alert: 'Please create a password.', save: () => localStorage.setItem('settingsPassword', document.getElementById('passwordSetupInput').value) },
        backStepBalance: { next: 4 },
        nextStepBalance: { next: 6, validate: () => document.getElementById('balanceSetupInput').value !== '', alert: 'Please enter a starting balance (0 is okay).', save: () => localStorage.setItem('initialBalance', parseFloat(document.getElementById('balanceSetupInput').value)), action: renderWizardCategoryList },
        backStepCategories: { next: 5 }
    };
    for (const id in wizardNav) {
        document.getElementById(id).addEventListener('click', () => {
            const config = wizardNav[id];
            if (config.validate && !config.validate()) return alert(config.alert);
            if (config.save) config.save();
            if (config.action) config.action();
            showSetupStep(config.next);
        });
    }

    document.getElementById('addCategoryWizardBtn').addEventListener('click', () => {
        const input = document.getElementById('categorySetupInput');
        const newCat = input.value.trim();
        if (newCat) {
            const allCats = Object.values(defaultCategories).flat();
            if (!allCats.includes(newCat)) {
                defaultCategories.Other.push(newCat);
                renderWizardCategoryList();
                input.value = '';
            } else {
                alert('That category already exists.');
            }
        }
    });

    document.getElementById('finishSetupBtn').addEventListener('click', () => {
        const finalCategories = [...new Set(Object.values(defaultCategories).flat())];
        localStorage.setItem('jobCategories', JSON.stringify(finalCategories));
        localStorage.setItem('setupComplete', 'true');
        location.reload();
    });
});