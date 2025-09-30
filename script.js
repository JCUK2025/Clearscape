// script.js

// === STATE & ELEMENT SELECTION ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
let settingsPassword = localStorage.getItem('settingsPassword') || '0000';
let appName = localStorage.getItem('appName') || 'ClearScape';
let userName = localStorage.getItem('userName') || 'User';
let primaryColor = localStorage.getItem('primaryColor') || '#4CAF50';
let paleColor = localStorage.getItem('paleColor') || '#e8f5e9';
let budget = JSON.parse(localStorage.getItem('monthlyBudget')) || { category: '', limit: 0 };
let defaultCategoriesByTransactionType = JSON.parse(localStorage.getItem('defaultCategories')) || { Sale: '', Expense: '', Deposit: '', Withdrawal: '', Refund: '' };
let recurringTemplates = JSON.parse(localStorage.getItem('recurringTemplates')) || [];
let lastActiveYear = localStorage.getItem('lastActiveYear') || new Date().getFullYear().toString();


// === ELEMENT SELECTORS ===
const splashScreen = document.getElementById('splashScreen');
const appContainer = document.getElementById('appContainer');
const splashTitle = document.getElementById('splashTitle');
const dashboardView = document.getElementById('dashboardView');
const transactionForm = document.getElementById('transactionForm');
const transactionTypeSelect = document.getElementById('transactionTypeSelect');
const jobTypeSelect = document.getElementById('jobTypeSelect');
const amountDueInput = document.getElementById('amountDueInput');
const amountPaidInput = document.getElementById('amountPaidInput');
const isRecurringCheckbox = document.getElementById('isRecurringCheckbox');
const recurringFrequencyGroup = document.getElementById('recurringFrequencyGroup');
const recurringFrequency = document.getElementById('recurringFrequency');
const transactionIdInput = document.getElementById('transactionId');
const transactionDateInput = document.getElementById('transactionDate');
const appNameHeader = document.getElementById('appNameHeader');
const totalSalesEl = document.getElementById('totalSales');
const totalOutflowEl = document.getElementById('totalOutflow');
const outstandingBalanceEl = document.getElementById('outstandingBalance');
const totalOutstandingEl = document.getElementById('totalOutstanding');
const insightsList = document.getElementById('insightsList');
const budgetTrackerCard = document.getElementById('budgetTrackerCard');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const budgetSpentAmount = document.getElementById('budgetSpentAmount');
const budgetLimitAmount = document.getElementById('budgetLimitAmount');
const budgetCategoryName = document.getElementById('budgetCategoryName');
const transactionListView = document.getElementById('transactionListView');
const fullTransactionList = document.getElementById('fullTransactionList');
const transactionSearchInput = document.getElementById('transactionSearchInput');
const filterJobType = document.getElementById('filterJobType');
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterPaidStatus = document.getElementById('filterPaidStatus');
const settingsView = document.getElementById('settingsView');
const settingsUnlockView = document.getElementById('settingsUnlockView');
const actualSettings = document.getElementById('actualSettings');
const settingsPasswordInput = document.getElementById('settingsPasswordInput');


// === UTILITY & STATE MANAGEMENT ===
function formatCurrency(amount) { return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }
function saveTransactions() { localStorage.setItem('transactions', JSON.stringify(transactions)); }
function updateJobTypeDropdown() {
    const dropdowns = [jobTypeSelect, filterJobType];
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        const currentVal = dropdown.value;
        dropdown.innerHTML = dropdown.id === 'filterJobType' ? '<option value="">All Job Types</option>' : '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            dropdown.appendChild(option);
        });
        dropdown.value = currentVal;
    });
}


// === VIEW MANAGEMENT ===
function showView(viewId) {
    document.querySelectorAll('body > section').forEach(section => {
        section.style.display = 'none';
    });
    appContainer.style.display = 'none';

    if (viewId === 'splashScreen' || viewId === 'setupWizardView') {
        const element = document.getElementById(viewId);
        if (element) {
            element.style.display = 'flex';
        }
    } else {
        appContainer.style.display = 'block';
        document.querySelectorAll('#appContainer main > section').forEach(section => {
            section.style.display = 'none';
        });
        const element = document.getElementById(viewId);
        if (element) {
            element.style.display = 'block';
        }
    }
}

function showSplashScreen() {
    showView('splashScreen');
    const greeting = `Welcome back, ${userName}!`;
    splashTitle.textContent = greeting;
}


// === INACTIVITY TIMER ===
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showSplashScreen, INACTIVITY_TIMEOUT_MS);
}
['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});


// === CORE FINANCIAL LOGIC ===
function updateDashboard() {
    const today = new Date();
    const currentYear = today.getFullYear();
    initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;

    let totalSales = 0;
    let totalExpenses = 0;
    let totalOutstandingAR = 0;
    let currentBalance = initialBalance;

    transactions.forEach(t => {
        const amountPaid = parseFloat(t.amountPaid);
        if (t.type === 'Sale' || t.type === 'Deposit') {
            currentBalance += amountPaid;
        } else if (t.type === 'Expense' || t.type === 'Withdrawal' || t.type === 'Refund') {
            currentBalance -= amountPaid;
        }

        if (new Date(t.date).getFullYear() === currentYear) {
            if (t.type === 'Sale' || t.type === 'Deposit') {
                totalSales += amountPaid;
            } else if (t.type === 'Expense' || t.type === 'Withdrawal' || t.type === 'Refund') {
                totalExpenses += amountPaid;
            }
        }
        
        if (t.type === 'Sale') {
             totalOutstandingAR += (parseFloat(t.amountDue) - parseFloat(t.amountPaid));
        }
    });
    
    totalSalesEl.textContent = formatCurrency(totalSales);
    totalOutflowEl.textContent = formatCurrency(totalExpenses);
    totalOutstandingEl.textContent = formatCurrency(totalOutstandingAR);
    outstandingBalanceEl.textContent = formatCurrency(currentBalance);
    
    totalOutstandingEl.className = `amount ${totalOutstandingAR > 0.01 ? 'negative' : 'positive'}`;
    outstandingBalanceEl.className = `amount ${currentBalance >= 0 ? 'positive' : 'negative'}`;
}

// Dummy function for now
function renderFullTransactionList() {
    if (fullTransactionList) {
        fullTransactionList.innerHTML = '<li>Transaction list will appear here.</li>';
    }
}

// === INITIALIZATION ===
function initApp() {
    resetInactivityTimer();
    
    if (localStorage.getItem('setupComplete') !== 'true') {
        showView('setupWizardView');
        showSetupStep(1);
        return;
    }

    userName = localStorage.getItem('userName') || 'User';
    appNameHeader.textContent = `${userName}'s Dashboard`;
    categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
    updateJobTypeDropdown();
    showView('dashboardView');
    updateDashboard();
}

// --- WIZARD LOGIC (Needed for initialization) ---
let currentSetupStep = 1;
const totalSetupSteps = 4;

function showSetupStep(stepNumber) {
    document.querySelectorAll('.setup-step').forEach(step => {
        step.style.display = 'none';
    });
    const stepName = getStepName(stepNumber);
    if (stepName) {
        document.getElementById(`step${stepName}`).style.display = 'block';
    }
}

function getStepName(stepNumber) {
    if (stepNumber === 1) return 'Name';
    if (stepNumber === 2) return 'Password';
    if (stepNumber === 3) return 'Balance';
    if (stepNumber === 4) return 'Categories';
    return null;
}

function renderWizardCategoryList() {
    const list = document.getElementById('categoryWizardList');
    const finishBtn = document.getElementById('finishSetupBtn');
    if (!list || !finishBtn) return;
    
    list.innerHTML = '';
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat;
        li.style.background = '#f4f4f4'; li.style.padding = '5px'; li.style.marginBottom = '5px'; li.style.borderRadius = '3px';
        list.appendChild(li);
    });
    finishBtn.disabled = categories.length === 0;
}


// === INITIAL LOAD & EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    // Run the app initialization first
    initApp();

    // --- All event listeners go here to prevent loading errors ---
    
    // Splash Screen Navigation
    document.getElementById('goToDashboardBtn').addEventListener('click', () => {
        showView('dashboardView');
        updateDashboard();
    });
    document.getElementById('goToTransactionsBtn').addEventListener('click', () => {
        showView('transactionListView');
        renderFullTransactionList();
    });
    document.getElementById('goToSettingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('goToInsightsBtn').addEventListener('click', () => showView('insightsView'));

    // Main App Navigation
    document.getElementById('viewAllTransactionsBtn').addEventListener('click', () => {
        showView('transactionListView');
        renderFullTransactionList();
    });
    document.getElementById('settingsBtn').addEventListener('click', () => showView('settingsView'));
    document.getElementById('viewSplashBtn').addEventListener('click', showSplashScreen);

    // Back Buttons
    document.getElementById('backToDashboardBtn').addEventListener('click', () => showView('dashboardView'));
    document.getElementById('backToDashboardFromSettingsBtn').addEventListener('click', () => showView('dashboardView'));
    document.getElementById('backToDashboardFromCategoryBtn').addEventListener('click', () => showView('dashboardView'));
    document.getElementById('backToDashboardFromInsightsBtn').addEventListener('click', () => showView('dashboardView'));

    // Password Reset
    document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
        event.preventDefault();
        const confirmReset = confirm("Are you sure you want to reset the settings password?\n\nThis will restore the default.");
        if (confirmReset) {
            localStorage.removeItem('settingsPassword');
            alert("Password has been reset to the default: 0000");
            location.reload(); 
        }
    });

    // --- Wizard Navigation Event Listeners ---

    // Step 1 -> 2
    document.getElementById('nextStepName').addEventListener('click', () => {
        const nameInput = document.getElementById('userNameInput');
        if (nameInput.value.trim() === '') {
            alert('Please enter your name.');
            return;
        }
        localStorage.setItem('userName', nameInput.value.trim());
        currentSetupStep = 2;
        showSetupStep(currentSetupStep);
    });

    // Step 2 -> 1 (Back)
    document.getElementById('backStepPassword').addEventListener('click', () => {
        currentSetupStep = 1;
        showSetupStep(currentSetupStep);
    });

    // Step 2 -> 3
    document.getElementById('nextStepPassword').addEventListener('click', () => {
        const passwordInput = document.getElementById('passwordSetupInput');
        if (passwordInput.value.trim() === '') {
            alert('Please create a password.');
            return;
        }
        localStorage.setItem('settingsPassword', passwordInput.value);
        currentSetupStep = 3;
        showSetupStep(currentSetupStep);
    });

    // Step 3 -> 2 (Back)
    document.getElementById('backStepBalance').addEventListener('click', () => {
        currentSetupStep = 2;
        showSetupStep(currentSetupStep);
    });

    // Step 3 -> 4
    document.getElementById('nextStepBalance').addEventListener('click', () => {
        const balanceInput = document.getElementById('balanceSetupInput');
        if (balanceInput.value === '') {
            alert('Please enter a starting balance (you can enter 0).');
            return;
        }
        localStorage.setItem('initialBalance', parseFloat(balanceInput.value));
        currentSetupStep = 4;
        showSetupStep(currentSetupStep);
    });

    // Step 4 -> 3 (Back)
    document.getElementById('backStepCategories').addEventListener('click', () => {
        currentSetupStep = 3;
        showSetupStep(currentSetupStep);
    });

    // --- Wizard Category Logic ---

    document.getElementById('addCategoryWizardBtn').addEventListener('click', () => {
        const input = document.getElementById('categorySetupInput');
        const newCategory = input.value.trim();
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            renderWizardCategoryList();
            input.value = '';
            input.focus();
        }
    });

    // --- Finish Setup ---

    document.getElementById('finishSetupBtn').addEventListener('click', () => {
        if (categories.length === 0) {
            alert('Please add at least one category before finishing.');
            return;
        }
        localStorage.setItem('jobCategories', JSON.stringify(categories));
        localStorage.setItem('setupComplete', 'true');
        location.reload();
    });
});