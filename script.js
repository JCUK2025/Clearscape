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
let inactivityTimer;

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


// === SPLASH SCREEN & INACTIVITY ===
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        showSplashScreen();
    }, 5 * 60 * 1000);
}

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
    const hour = new Date().getHours();
    let timeOfDayGreeting;
    if (hour < 12) timeOfDayGreeting = `Good morning, ${userName}!`;
    else if (hour < 18) timeOfDayGreeting = `Good afternoon, ${userName}!`;
    else timeOfDayGreeting = `Good evening, ${userName}!`;
    const genericGreetings = ["Let's get your finances in order.", "Ready to track your success?"];
    const greetings = [timeOfDayGreeting, ...genericGreetings];
    if (splashTitle) splashTitle.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    triggerLogoAnimation();
}


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
    const filterTypeValue = document.getElementById('filterTransactionType').value;
    const filterJobTypeValue = document.getElementById('filterJobType').value;
    const filterPaidStatusValue = document.getElementById('filterPaidStatus').value;
    const startDateValue = document.getElementById('filterStartDate').value;
    const endDateValue = document.getElementById('filterEndDate').value;
    fullTransactionList.innerHTML = '';
    const filtered = transactions.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm) || (t.jobNotes && t.jobNotes.toLowerCase().includes(searchTerm));
        const matchesType = !filterTypeValue || t.type === filterTypeValue;
        const matchesJobType = !filterJobTypeValue || t.jobType === filterJobTypeValue;
        let matchesPaidStatus = true;
        if (filterPaidStatusValue === 'Outstanding') matchesPaidStatus = (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) > 0.01;
        else if (filterPaidStatusValue === 'Paid') matchesPaidStatus = (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) <= 0.01;
        const passesStartDate = !startDateValue || t.date >= startDateValue;
        const passesEndDate = !endDateValue || t.date <= endDateValue;
        return matchesSearch && matchesType && matchesJobType && matchesPaidStatus && passesStartDate && passesEndDate;
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
    generateOverdueInsights(insights);
    const informationalInsightFunctions = [generateUpcomingRecurringInsights, generateSpendingInsights];
    if (informationalInsightFunctions.length > 0) {
        const randomIndex = Math.floor(Math.random() * informationalInsightFunctions.length);
        informationalInsightFunctions[randomIndex](insights);
    }
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

function generateUpcomingRecurringInsights(insights) {
    const today = new Date(), nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    recurringTemplates.forEach(template => {
        if (template.repetitionType === 'count' && template.repetitionsMade >= template.totalRepetitions) return;
        let nextDueDate = new Date(template.lastGeneratedDate);
        if (template.frequency === 'Weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
        else if (template.frequency === 'Monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        else if (template.frequency === 'Quarterly') nextDueDate.setMonth(nextDueDate.getMonth() + 3);
        else if (template.frequency === 'Yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        if (nextDueDate > today && nextDueDate <= nextWeek) {
            insights.push({ type: 'info', text: `🗓️ Reminder: A recurring transaction for "${template.sourceTransaction.name}" is due soon.` });
        }
    });
}

function generateSpendingInsights(insights) {
    const today = new Date(), currentMonth = today.getMonth(), currentYear = today.getFullYear();
    const expenseByCategory = {};
    transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (['Expense', 'Withdrawal', 'Refund'].includes(t.type) && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            const category = t.jobType;
            if (!expenseByCategory[category]) expenseByCategory[category] = 0;
            expenseByCategory[category] += parseFloat(t.amountPaid);
        }
    });
    let topCategory = '', topAmount = 0;
    for (const category in expenseByCategory) {
        if (expenseByCategory[category] > topAmount) {
            topAmount = expenseByCategory[category];
            topCategory = category;
        }
    }
    if (topCategory) {
        insights.push({ type: 'info', text: `💸 Your top expense category this month is "${topCategory}" with ${formatCurrency(topAmount)} spent.` });
    }
}

function generateQuoteInsight(insights) {
    const quotes = ["The secret of getting ahead is getting started.", "An investment in knowledge pays the best interest.", "Beware of little expenses. A small leak will sink a great ship.", "Success is not final; failure is not fatal: It is the courage to continue that counts."];
    insights.push({ type: 'quote', text: `💡 "${quotes[Math.floor(Math.random() * quotes.length)]}"` });
}

let monthlyChartInstance;
function renderAnalyticsPage(year) {
    const analyticsYearSelect = document.getElementById('analyticsYearSelect');
    if (!analyticsYearSelect) return;
    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
    if (years.length === 0) years.push(new Date().getFullYear());
    analyticsYearSelect.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (year) analyticsYearSelect.value = year;
    const selectedYear = parseInt(year || analyticsYearSelect.value);
    const yearData = processDataForYear(selectedYear);
    document.getElementById('analyticsTotalRevenue').textContent = formatCurrency(yearData.totalRevenue);
    document.getElementById('analyticsTotalExpenses').textContent = formatCurrency(yearData.totalExpenses);
    const netProfitEl = document.getElementById('analyticsNetProfit');
    netProfitEl.textContent = formatCurrency(yearData.netProfit);
    netProfitEl.className = `amount ${yearData.netProfit >= 0 ? 'positive' : 'negative'}`;
    createMonthlyChart(yearData.actualSales, yearData.actualExpenses, yearData.projectedSales, yearData.projectedExpenses);
}

function processDataForYear(year) {
    const actualSales = Array(12).fill(0), actualExpenses = Array(12).fill(0);
    const projectedSales = Array(12).fill(0), projectedExpenses = Array(12).fill(0);
    const today = new Date();
    transactions.forEach(t => {
        const transactionDate = new Date(t.date);
        if (transactionDate.getFullYear() === year) {
            const month = transactionDate.getMonth();
            const amount = parseFloat(t.amountPaid);
            if (['Sale', 'Deposit'].includes(t.type)) actualSales[month] += amount;
            else if (['Expense', 'Withdrawal', 'Refund'].includes(t.type)) actualExpenses[month] += amount;
        }
    });
    recurringTemplates.forEach(template => {
        let nextDate = new Date(template.lastGeneratedDate);
        let repsMade = template.repetitionsMade;
        while (nextDate.getFullYear() <= year) {
            if (template.frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (template.frequency === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (template.frequency === 'Quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
            else if (template.frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
            if (nextDate > today && nextDate.getFullYear() === year && (template.repetitionType === 'forever' || repsMade < template.totalRepetitions)) {
                const month = nextDate.getMonth();
                const amount = parseFloat(template.sourceTransaction.amountDue);
                if (['Sale', 'Deposit'].includes(template.sourceTransaction.type)) projectedSales[month] += amount;
                else if (['Expense', 'Withdrawal', 'Refund'].includes(template.sourceTransaction.type)) projectedExpenses[month] += amount;
                repsMade++;
            }
        }
    });
    const totalRevenue = actualSales.reduce((s, v) => s + v, 0);
    const totalExpenses = actualExpenses.reduce((s, v) => s + v, 0);
    return { actualSales, actualExpenses, projectedSales, projectedExpenses, totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
}

function createMonthlyChart(actualSalesData, actualExpenseData, projectedSalesData, projectedExpenseData) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    if (monthlyChartInstance) monthlyChartInstance.destroy();
    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                { label: 'Actual Revenue', data: actualSalesData, backgroundColor: 'rgba(76, 175, 80, 0.8)', stack: 'revenue' },
                { label: 'Projected Revenue', data: projectedSalesData, backgroundColor: 'rgba(76, 175, 80, 0.4)', stack: 'revenue' },
                { label: 'Actual Expenses', data: actualExpenseData, backgroundColor: 'rgba(244, 67, 54, 0.8)', stack: 'expenses' },
                { label: 'Projected Expenses', data: projectedExpenseData, backgroundColor: 'rgba(244, 67, 54, 0.4)', stack: 'expenses' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, ticks: { callback: value => formatCurrency(value) } } },
            plugins: { tooltip: { mode: 'index' } }
        }
    });
}


// === INITIALIZATION & SETUP WIZARD ===
function initApp() {
    resetInactivityTimer();
    generateRecurringTransactions();
    if (localStorage.getItem('setupComplete') !== 'true') {
        showView('setupWizardView');
        showSetupStep(1);
        return false;
    }
    userName = localStorage.getItem('userName') || 'User';
    businessName = localStorage.getItem('businessName') || 'ClearScape';
    currency = localStorage.getItem('currency') || 'GBP';
    appNameHeader.textContent = `${businessName} Dashboard`;
    document.title = `${businessName} Tracker`;
    categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
    updateJobTypeDropdown();
    return true;
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
    showSplashScreen();
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => document.addEventListener(event, resetInactivityTimer));
    setInterval(triggerLogoAnimation, 6000);

    // Main Navigation
    document.getElementById('goToDashboardBtn').addEventListener('click', () => { if (initApp()) { showView('dashboardView'); updateDashboard(); } });
    document.getElementById('goToTransactionsBtn').addEventListener('click', () => { if (initApp()) { showView('transactionListView'); renderFullTransactionList(); } });
    document.getElementById('goToAnalyticsBtn').addEventListener('click', () => { if (initApp()) { renderAnalyticsPage(); showView('analyticsView'); } });
    document.getElementById('goToSettingsBtn').addEventListener('click', () => { if (initApp()) { showView('settingsView'); } });
    document.getElementById('headerTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('headerAnalyticsBtn').addEventListener('click', () => { renderAnalyticsPage(); showView('analyticsView'); });
    document.getElementById('headerSettingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('viewSplashBtn').addEventListener('click', showSplashScreen);
    
    // Back Buttons
    ['backToDashboardBtn', 'backToDashboardFromSettingsBtn', 'backToDashboardFromCategoryBtn', 'backToDashboardFromAnalyticsBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => showView('dashboardView'));
    });
    
    // Transaction Form UI
    document.getElementById('amountDueInput').addEventListener('input', (e) => { document.getElementById('amountPaidInput').value = e.target.value; });
    document.getElementById('transactionTypeSelect').addEventListener('change', () => { updateJobTypeDropdown(); toggleAmountPaidVisibility(); });
    document.getElementById('isRecurringCheckbox').addEventListener('change', (e) => { document.getElementById('recurringOptions').style.display = e.target.checked ? 'block' : 'none'; });
    document.querySelectorAll('input[name="repeatOption"]').forEach(radio => { radio.addEventListener('change', (e) => { document.getElementById('repetitionCount').disabled = e.target.value !== 'count'; }); });

    function toggleAmountPaidVisibility() {
        const transactionType = document.getElementById('transactionTypeSelect').value;
        document.getElementById('amountPaidGroup').style.display = transactionType === 'Sale' ? 'block' : 'none';
    }

    // Main Transaction Form Submit
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const transactionId = document.getElementById('transactionId').value;
        const submitBtn = document.getElementById('addTransactionBtn');
        const isRecurring = document.getElementById('isRecurringCheckbox').checked;
        const transactionData = {
            date: document.getElementById