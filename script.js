// script.js

// === STATE & ELEMENT SELECTION ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
let settingsPassword = localStorage.getItem('settingsPassword') || '0000';
let businessName = localStorage.getItem('businessName') || 'ClearScape';
let userName = localStorage.getItem('userName') || 'User';
let currency = localStorage.getItem('currency') || 'GBP';
let recurringTemplates = JSON.parse(localStorage.getItem('recurringTemplates')) || [];

// Default categories for setup
const defaultCategories = {
    Sales: ["Lawn Maintenance", "Hedge Trimming / Maintenance", "Landscaping", "Tree surgery / Felling", "Servicing / Repair", "Fencing", "Decking / Paving", "Other"],
    Expenses: ["Fuel", "Utilities", "Rent", "Services", "Materials", "Equipment", "Petty Cash", "Uniform / Safety Equipment", "Other"],
    Deposit: ["Loan", "Cash Injection", "Rebate / Refund", "Other"],
    Withdrawal: ["Cash Withdrawal", "Other"],
    Refund: ["Goodwill Gesture", "Job Cancellation / Amendment", "Other"]
};


// === ELEMENT SELECTORS (Simplified for clarity) ===
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
const transactionSearchInput = document.getElementById('transactionSearchInput');
const filterJobType = document.getElementById('filterJobType');
const filterPaidStatus = document.getElementById('filterPaidStatus');


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

    // Determine which category list to use based on the transaction type
    if (selectedType === 'Sale') options = defaultCategories.Sales;
    else if (selectedType === 'Expense') options = defaultCategories.Expenses;
    else if (selectedType === 'Deposit') options = defaultCategories.Deposit;
    else if (selectedType === 'Withdrawal') options = defaultCategories.Withdrawal;
    else if (selectedType === 'Refund') options = defaultCategories.Refund;
    else {
        // Fallback to all unique categories if type is unknown
        const allCategories = [];
        for (const key in defaultCategories) {
            allCategories.push(...defaultCategories[key]);
        }
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
    document.querySelectorAll('body > section').forEach(section => {
        section.style.display = 'none';
    });
    appContainer.style.display = 'none';

    const element = document.getElementById(viewId);
    if (element) {
        element.style.display = (viewId === 'splashScreen' || viewId === 'setupWizardView') ? 'flex' : 'block';
    }
    
    if (viewId !== 'splashScreen' && viewId !== 'setupWizardView') {
        appContainer.style.display = 'block';
    }
}


// === SPLASH SCREEN ENHANCEMENTS ===
function triggerLogoAnimation() {
    const appLogo = document.getElementById('appLogo');
    if (!appLogo || appLogo.classList.contains('logo-spin') || appLogo.classList.contains('logo-bounce')) return;

    const animations = ['logo-spin', 'logo-bounce'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    
    appLogo.classList.add(randomAnimation);

    setTimeout(() => {
        appLogo.classList.remove(randomAnimation);
    }, 1000);
}

function applySeasonalTheme() {
    const splashScreenEl = document.getElementById('splashScreen');
    if (!splashScreenEl) return;

    splashScreenEl.className = '';
    const today = new Date();
    const month = today.getMonth(); // 0 = Jan, 11 = Dec
    const day = today.getDate();

    if (month === 11) { // December
        splashScreenEl.classList.add('theme-christmas');
    } else if (month === 9 && day >= 20) { // Late October
        splashScreenEl.classList.add('theme-halloween');
    }
}

function showSplashScreen() {
    showView('splashScreen');
    applySeasonalTheme();

    const greetings = [
        `Welcome back, ${userName}!`,
        "Let's get your finances in order.",
        "Ready to track your success?",
        `How's business, ${userName}?`
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    if(splashTitle) splashTitle.textContent = randomGreeting;

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


// === CORE FINANCIAL LOGIC ===
function generateRecurringTransactions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let newTransactionsCreated = false;

    recurringTemplates.forEach(template => {
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
            const newTransaction = {
                ...template.sourceTransaction,
                id: `t_${Date.now()}_${Math.random()}`,
                date: nextDate.toISOString().split('T')[0],
                templateId: template.id
            };
            transactions.push(newTransaction);
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

    transactions.forEach(t => {
        const amountPaid = parseFloat(t.amountPaid);
        if (t.type === 'Sale' || t.type === 'Deposit') {
            currentBalance += amountPaid;
        } else {
            currentBalance -= amountPaid;
        }
        
        if (new Date(t.date).getFullYear() === new Date().getFullYear()) {
            if (t.type === 'Sale' || t.type === 'Deposit') totalSales += amountPaid;
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
    const searchTerm = transactionSearchInput.value.toLowerCase();
    const filterJobTypeValue = filterJobType.value;
    const filterPaidStatusValue = filterPaidStatus.value;
    fullTransactionList.innerHTML = '';
    
    const filtered = transactions.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm) || (t.jobNotes && t.jobNotes.toLowerCase().includes(searchTerm));
        const matchesJobType = !filterJobTypeValue || t.jobType === filterJobTypeValue;
        let matchesPaidStatus = true;
        if (filterPaidStatusValue === 'Outstanding') matchesPaidStatus = (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) > 0.01;
        else if (filterPaidStatusValue === 'Paid') matchesPaidStatus = (parseFloat(t.amountDue) - parseFloat(t.amountPaid)) <= 0.01;
        return matchesSearch && matchesJobType && matchesPaidStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        fullTransactionList.innerHTML = '<li>No transactions found.</li>';
        return;
    }

    filtered.forEach(t => {
        const item = document.createElement('li');
        item.className = 'transaction-item';
        const outstanding = parseFloat(t.amountDue) - parseFloat(t.amountPaid);
        item.innerHTML = `
            <div class="transaction-summary">
                <span class="transaction-name">${t.name}</span>
                <span class="transaction-amount" style="color: ${['Sale','Deposit'].includes(t.type) ? 'var(--positive-color)' : 'var(--negative-color)'};">
                    ${formatCurrency(parseFloat(t.amountDue))}
                </span>
                <span class="transaction-date">${t.date}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Type:</strong> ${t.type}</p> <p><strong>Category:</strong> ${t.jobType}</p>
                <p><strong>Amount Paid:</strong> ${formatCurrency(parseFloat(t.amountPaid))}</p> <p><strong>Outstanding:</strong> ${formatCurrency(outstanding)}</p>
                <p><strong>Notes:</strong> ${t.jobNotes || 'N/A'}</p>
                <div class="transaction-actions">
                    <button class="action-btn edit-btn" data-id="${t.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${t.id}">Delete</button>
                </div>
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


// === SMART INSIGHTS GENERATION ===
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

function generateAverageInsights(insights) {
    // Simplified for brevity in this example
}

function generateQuoteInsight(insights) {
    const quotes = ["The secret of getting ahead is getting started.", "An investment in knowledge pays the best interest.", "Beware of little expenses. A small leak will sink a great ship."];
    insights.push({ type: 'quote', text: `💡 "${quotes[Math.floor(Math.random() * quotes.length)]}"` });
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
    
    updateJobTypeDropdown(); // Populate dropdown based on the default selected transaction type
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
        li.style.background = '#f4f4f4'; li.style.padding = '5px'; li.style.marginBottom = '5px';
        list.appendChild(li);
    });
    document.getElementById('finishSetupBtn').disabled = false;
}


// === INITIAL LOAD & EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setInterval(triggerLogoAnimation, 6000); // Trigger animation periodically

    // --- Main Navigation ---
    document.getElementById('goToDashboardBtn').addEventListener('click', () => { showView('dashboardView'); updateDashboard(); });
    document.getElementById('goToTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('goToSettingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('goToInsightsBtn').addEventListener('click', () => showView('insightsView'));
    document.getElementById('viewAllTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('settingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('viewSplashBtn').addEventListener('click', showSplashScreen);
    
    // --- Back Buttons ---
    ['backToDashboardBtn', 'backToDashboardFromSettingsBtn', 'backToDashboardFromCategoryBtn', 'backToDashboardFromInsightsBtn'].forEach(id => {
        document.getElementById(id).addEventListener('click', () => showView('dashboardView'));
    });
    
    // --- Forms and Actions ---
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const isRecurring = document.getElementById('isRecurringCheckbox').checked;
        const transactionData = {
            id: `t_${Date.now()}`, date: document.getElementById('transactionDate').value, name: document.getElementById('transactionName').value.trim(),
            type: document.getElementById('transactionTypeSelect').value, jobType: document.getElementById('jobTypeSelect').value,
            amountDue: parseFloat(document.getElementById('amountDueInput').value) || 0, amountPaid: parseFloat(document.getElementById('amountPaidInput').value) || 0,
            jobNotes: document.getElementById('jobNotesInput').value.trim()
        };
        if (!transactionData.date || !transactionData.name || !transactionData.amountDue) return alert('Please fill out Date, Name, and Amount Due.');

        if (isRecurring) {
            const template = { id: `rt_${Date.now()}`, frequency: document.getElementById('recurringFrequency').value, lastGeneratedDate: transactionData.date, sourceTransaction: transactionData };
            recurringTemplates.push(template);
            saveRecurringTemplates();
            transactionData.templateId = template.id;
            transactions.push(transactionData);
            alert('Recurring template saved!');
        } else {
            transactions.push(transactionData);
            alert('Transaction saved!');
        }
        saveTransactions();
        updateDashboard();
        this.reset();
        updateJobTypeDropdown(); // Reset dropdown to match default
    });
    
    document.getElementById('transactionTypeSelect').addEventListener('change', updateJobTypeDropdown);

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
        if (confirm("Are you sure you want to reset the settings password?")) {
            localStorage.removeItem('settingsPassword');
            alert("Password has been reset to the default: 0000");
            location.reload(); 
        }
    });

    document.getElementById('applyFiltersBtn').addEventListener('click', renderFullTransactionList);
    document.getElementById('transactionSearchInput').addEventListener('input', renderFullTransactionList);

    document.getElementById('exportCsvBtn').addEventListener('click', () => {
        if (transactions.length === 0) return alert('No transactions to export.');
        const headers = ["ID", "Date", "Name", "Type", "Category", "Amount Due", "Amount Paid", "Notes"];
        const rows = transactions.map(t => [t.id, t.date, t.name, t.type, t.jobType, t.amountDue, t.amountPaid, t.jobNotes || '']);
        const processRow = row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(',');
        const csv = [headers.join(','), ...rows.map(processRow)].join('\n');
        const link = document.createElement("a");
        link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        link.download = "ClearScape_Transactions.csv";
        link.click();
    });

    // --- Wizard Navigation ---
    const wizardNav = {
        nextStepName: { next: 2, validate: () => document.getElementById('userNameInput').value.trim() !== '', alert: 'Please enter your name.', save: () => localStorage.setItem('userName', document.getElementById('userNameInput').value.trim()) },
        backStepBusinessName: { next: 1 },
        nextStepBusinessName: { next: 3, validate: () => document.getElementById('businessNameInput').value.trim() !== '', alert: 'Please enter a business name.', save: () => localStorage.setItem('businessName', document.getElementById('businessNameInput').value.trim()) },
        backStepCurrency: { next: 2 },
        nextStepCurrency: { next: 4, save: () => localStorage.setItem('currency', document.getElementById('currencySetupSelect').value) },
        backStepPassword: { next: 3 },
        nextStepPassword: { next: 5, validate: () => document.getElementById('passwordSetupInput').value.trim() !== '', alert: 'Please create a password.', save: () => localStorage.setItem('settingsPassword', document.getElementById('passwordSetupInput').value) },
        backStepBalance: { next: 4 },
        nextStepBalance: { next: 6, validate: () => document.getElementById('balanceSetupInput').value !== '', alert: 'Please enter a starting balance (0 is okay).', save: () => localStorage.setItem('initialBalance', parseFloat(document.getElementById('balanceSetupInput').value)), action: () => renderWizardCategoryList() },
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
        if (input.value.trim()) {
            defaultCategories.Other.push(input.value.trim());
            renderWizardCategoryList();
            input.value = '';
        }
    });

    document.getElementById('finishSetupBtn').addEventListener('click', () => {
        const finalCategories = [...new Set(Object.values(defaultCategories).flat())];
        localStorage.setItem('jobCategories', JSON.stringify(finalCategories));
        localStorage.setItem('setupComplete', 'true');
        location.reload();
    });
});