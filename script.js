// script.js

// === STATE & ELEMENT SELECTION ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categories = JSON.parse(localStorage.getItem('jobCategories')) || ['Consulting Fees', 'Supplies', 'Rent', 'Utilities', 'Salary', 'Personal Draw'];
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
let settingsPassword = localStorage.getItem('settingsPassword') || 'admin123';
let appName = localStorage.getItem('appName') || 'ClearScape';
let primaryColor = localStorage.getItem('primaryColor') || '#4CAF50';
let paleColor = localStorage.getItem('paleColor') || '#e8f5e9';
let budget = JSON.parse(localStorage.getItem('monthlyBudget')) || { category: '', limit: 0 };
let defaultCategoriesByTransactionType = JSON.parse(localStorage.getItem('defaultCategories')) || { Sale: '', Expense: '', Deposit: '', Withdrawal: '' };
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
const initialBalanceInput = document.getElementById('initialBalanceInput');
const setInitialBalanceBtn = document.getElementById('setInitialBalanceBtn');

// === UTILITY & STATE MANAGEMENT ===
function formatCurrency(amount) { return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }); }
function saveTransactions() { localStorage.setItem('transactions', JSON.stringify(transactions)); }

// === VIEW MANAGEMENT ===
function showView(viewId) {
    // Hide all major sections/views
    splashScreen.style.display = 'none';
    appContainer.style.display = 'none';
    document.getElementById('startingBalanceView').style.display = 'none';

    if (viewId === 'splashScreen') {
        splashScreen.style.display = 'flex';
    } else if (viewId === 'startingBalanceView') {
        document.getElementById('startingBalanceView').style.display = 'block';
    } else {
        appContainer.style.display = 'block';
        // Hide all sub-views within the app container
        document.querySelectorAll('#appContainer main > section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById(viewId).style.display = 'block';
    }
}

function showSplashScreen() {
    showView('splashScreen');
    const greeting = `Welcome back to ${appName}!`;
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

    let totalSales = 0;
    let totalExpenses = 0;
    let totalOutstandingAR = 0;
    let currentBalance = initialBalance;

    transactions.forEach(t => {
        const amountPaid = parseFloat(t.amountPaid);
        if (t.type === 'Sale' || t.type === 'Deposit') {
            currentBalance += amountPaid;
        } else {
            currentBalance -= amountPaid;
        }

        if (new Date(t.date).getFullYear() === currentYear) {
            if (t.type === 'Sale' || t.type === 'Deposit') {
                totalSales += amountPaid;
            } else {
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
    fullTransactionList.innerHTML = '<li>Transaction list will appear here.</li>';
}

// === INITIALIZATION ===
function initApp() {
    resetInactivityTimer();
    if (localStorage.getItem('initialBalance') === null) {
        showView('startingBalanceView');
    } else {
        showView('dashboardView');
        updateDashboard();
    }
}

// === EVENT LISTENERS ===
document.getElementById('setInitialBalanceBtn').addEventListener('click', () => {
    const balanceValue = parseFloat(initialBalanceInput.value);
    if (!isNaN(balanceValue)) {
        initialBalance = balanceValue;
        localStorage.setItem('initialBalance', initialBalance);
        initApp();
    } else {
        alert('Please enter a valid number for the starting balance.');
    }
});

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
document.getElementById('backToDashboardBtn').addEventListener('click', () => showView('dashboardView'));

// Initial Load
document.addEventListener('DOMContentLoaded', showSplashScreen);