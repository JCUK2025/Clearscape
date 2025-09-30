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

// Dashboard elements
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

// Transaction List elements
const transactionListView = document.getElementById('transactionListView');
const fullTransactionList = document.getElementById('fullTransactionList');
const transactionSearchInput = document.getElementById('transactionSearchInput');
const filterJobType = document.getElementById('filterJobType');
const filterStartDate = document.getElementById('filterStartDate');
const filterEndDate = document.getElementById('filterEndDate');
const filterPaidStatus = document.getElementById('filterPaidStatus');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');

// Settings elements
const settingsView = document.getElementById('settingsView');
const settingsUnlockView = document.getElementById('settingsUnlockView');
const actualSettings = document.getElementById('actualSettings');
const settingsPasswordInput = document.getElementById('settingsPasswordInput');
const unlockSettingsBtn = document.getElementById('unlockSettingsBtn');
const appNameInput = document.getElementById('appNameInput');
const themeColorInput = document.getElementById('themeColorInput');
const exportBackupBtn = document.getElementById('exportBackupBtn');
const importFile = document.getElementById('importFile');
const triggerImportBtn = document.getElementById('triggerImportBtn');
const resetAppBtn = document.getElementById('resetAppBtn');
const newPasswordInput = document.getElementById('newPasswordInput');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const initialBalanceInput = document.getElementById('initialBalanceInput');
const setInitialBalanceBtn = document.getElementById('setInitialBalanceBtn');

// Settings - Configuration Actions
const budgetCategorySelect = document.getElementById('budgetCategorySelect');
const budgetLimitInput = document.getElementById('budgetLimitInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const defaultSettingsContainer = document.getElementById('defaultSettingsContainer');
const saveDefaultsBtn = document.getElementById('saveDefaultsBtn');


// === UTILITY & STATE MANAGEMENT ===

/**
 * Formats a number as currency.
 */
function formatCurrency(amount) {
    return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function saveTransactions() { localStorage.setItem('transactions', JSON.stringify(transactions)); }
function saveCategories() { localStorage.setItem('jobCategories', JSON.stringify(categories)); }
function saveRecurringTemplates() { localStorage.setItem('recurringTemplates', JSON.stringify(recurringTemplates)); }
function saveBudget() { localStorage.setItem('monthlyBudget', JSON.stringify(budget)); }
function saveDefaults() { localStorage.setItem('defaultCategories', JSON.stringify(defaultCategoriesByTransactionType)); }


// === THEME & BRANDING ===

/**
 * Applies the saved name and colors to the document's CSS variables.
 */
function applyAppThemeAndBranding() {
    const savedAppName = localStorage.getItem('appName') || 'ClearScape';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || '#4CAF50';
    const savedPaleColor = localStorage.getItem('paleColor') || '#e8f5e9';

    appName = savedAppName;
    primaryColor = savedPrimaryColor;

    // 1. Update Document Title/Header
    document.title = `${appName} Financial Tracker`;
    if (appNameHeader) appNameHeader.textContent = `${appName} Dashboard`;
    
    // 2. Update CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--pale-green', savedPaleColor);

    // 3. Update Inputs on Settings Page
    if (appNameInput) appNameInput.value = appName;
    if (themeColorInput) themeColorInput.value = primaryColor;
}

// === INACTIVITY TIMER ===
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showSplashScreen, INACTIVITY_TIMEOUT_MS);
}

// Attach event listeners for user activity
['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});


// === RECURRING TRANSACTION LOGIC ===

/**
 * Generates future transactions based on recurring templates.
 */
function generateRecurringTransactions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastRunDate = new Date(localStorage.getItem('lastRecurringRunDate') || '1970-01-01');

    recurringTemplates.forEach(template => {
        let nextDate = new Date(template.lastGeneratedDate || template.date);
        nextDate.setDate(nextDate.getDate() + 1); // Start checking from day after last instance

        // Loop until the next date is in the future
        while (nextDate <= today) {
            let shouldGenerate = false;
            
            // Increment the date based on frequency
            if (template.frequency === 'Monthly') {
                nextDate.setMonth(nextDate.getMonth() + 1);
                shouldGenerate = true;
            } else if (template.frequency === 'Weekly') {
                nextDate.setDate(nextDate.getDate() + 7);
                shouldGenerate = true;
            } else if (template.frequency === 'Yearly') {
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                shouldGenerate = true;
            }

            if (shouldGenerate && nextDate <= today) {
                const newTransaction = {
                    id: Date.now() + Math.random().toString(36).substring(2, 9),
                    date: nextDate.toISOString().substring(0, 10),
                    name: template.name,
                    type: template.type,
                    jobType: template.jobType,
                    amountDue: template.amountDue,
                    amountPaid: template.amountPaid, 
                    jobNotes: template.jobNotes || 'Generated recurring transaction.',
                    locked: false,
                    templateId: template.id // Link to the template
                };
                
                transactions.push(newTransaction);
            }
            
            if (!shouldGenerate) break;
        }
        
        // Update the last generated date for the template
        if (nextDate > new Date(template.lastGeneratedDate)) {
            template.lastGeneratedDate = today.toISOString().substring(0, 10);
            saveRecurringTemplates();
        }
    });

    localStorage.setItem('lastRecurringRunDate', today.toISOString().substring(0, 10));
    saveTransactions();
}


// === CORE FINANCIAL LOGIC ===

/**
 * Calculates current month's totals and updates the dashboard.
 */
function updateDashboard() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let totalSales = 0; // Total cash IN (Paid)
    let totalExpenses = 0; // Total cash OUT (Paid)
    let totalOutstandingAR = 0; // Total money DUE from sales
    let balanceNetFlow = 0; // Net flow for current month
    let currentBalance = initialBalance; // Starts with rolled-over balance

    transactions.forEach(t => {
        const amountDue = parseFloat(t.amountDue);
        const amountPaid = parseFloat(t.amountPaid);
        const transactionDate = new Date(t.date);

        // All transactions affect the running total (currentBalance)
        if (t.type === 'Sale' || t.type === 'Deposit') {
            currentBalance += amountPaid;
        } else if (t.type === 'Expense' || t.type === 'Withdrawal' || t.type === 'Refund') {
            currentBalance -= amountPaid;
        }

        // Only current year/month transactions affect dashboard totals
        if (transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth) {
            
            if (t.type === 'Sale' || t.type === 'Deposit') {
                totalSales += amountPaid;
            } else if (t.type === 'Expense' || t.type === 'Withdrawal' || t.type === 'Refund') {
                totalExpenses += amountPaid;
            }
        }
        
        // Calculate total outstanding (all time)
        if (t.type === 'Sale' || t.type === 'Deposit') {
             totalOutstandingAR += (amountDue - amountPaid);
        }
    });
    
    // Update Dashboard Elements
    totalSalesEl.textContent = formatCurrency(totalSales);
    totalOutflowEl.textContent = formatCurrency(totalExpenses);
    totalOutstandingEl.textContent = formatCurrency(totalOutstandingAR);
    outstandingBalanceEl.textContent = formatCurrency(currentBalance);
    
    // Apply color themes
    totalOutstandingEl.className = `amount ${totalOutstandingAR > 0 ? 'negative' : 'positive'}`;
    outstandingBalanceEl.className = `amount ${currentBalance >= 0 ? 'positive' : 'negative'}`;

    // Update Insights and Budget
    updateBudgetTracker();
    displaySmartInsightsFull();
}

/**
 * Renders the full list of transactions with filtering, searching, and new features.
 */
function renderFullTransactionList() {
    const list = document.getElementById('fullTransactionList');
    list.innerHTML = '';
    
    const searchTerm = transactionSearchInput.value.toLowerCase().trim(); 
    const filterJobTypeValue = filterJobType.value;
    const filterStartDateValue = filterStartDate.value ? new Date(filterStartDate.value) : null;
    const filterEndDateValue = filterEndDate.value ? new Date(filterEndDate.value) : null;
    const filterPaidStatusValue = filterPaidStatus.value;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredTransactions = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).filter(t => {
        const transactionDate = new Date(t.date);
        const amountDue = parseFloat(t.amountDue);
        const amountPaid = parseFloat(t.amountPaid);
        const outstanding = amountDue - amountPaid;
        const isSale = t.type === 'Sale' || t.type === 'Deposit';

        // 1. Search Filter
        const matchesSearch = searchTerm === '' || t.name.toLowerCase().includes(searchTerm) || t.jobNotes.toLowerCase().includes(searchTerm);
                              
        // 2. Job Type Filter
        const passesJobTypeFilter = filterJobTypeValue === '' || t.jobType === filterJobTypeValue;

        // 3. Date Filter
        const passesDateFilter = (!filterStartDateValue || transactionDate >= filterStartDateValue) &&
                                 (!filterEndDateValue || transactionDate <= filterEndDateValue);

        // 4. Paid Status Filter
        let passesPaidStatusFilter = true;
        if (filterPaidStatusValue === 'Outstanding') {
            passesPaidStatusFilter = isSale && outstanding > 0.01;
        } else if (filterPaidStatusValue === 'Paid') {
            passesPaidStatusFilter = outstanding <= 0.01;
        } else if (filterPaidStatusValue === 'Overdue') {
            passesPaidStatusFilter = isSale && outstanding > 0.01 && transactionDate < today;
        }

        return matchesSearch && passesJobTypeFilter && passesDateFilter && passesPaidStatusFilter;
    });

    // 5. Render filtered transactions
    filteredTransactions.forEach(t => {
        const item = document.createElement('li');
        item.className = 'transaction-item';

        const outstanding = parseFloat(t.amountDue) - parseFloat(t.amountPaid);
        const isOutstandingSale = (t.type === 'Sale' || t.type === 'Deposit') && outstanding > 0.01;
        const isRecurring = t.templateId; 
        const recurringSymbol = isRecurring ? '<span title="Recurring Transaction" style="margin-left: 5px; color: var(--balance-color); font-size: 1.2em;">&#x21BA;</span>' : ''; 
        
        const lockIcon = t.locked ? '🔒' : '🔓';
        const lockClass = t.locked ? 'locked' : 'unlocked';
        
        let actionButtons = '';
        
        if (t.locked) {
            actionButtons = `<button class="action-btn unlock-btn" data-id="${t.id}">${lockIcon} Unlock</button>`;
        } else {
            // Manage Template Button
            if (isRecurring) {
                actionButtons += `<button class="action-btn manage-template-btn" data-template-id="${t.templateId}" style="background-color: #007bff; color: white; margin-right: 10px;">🔁 Manage Template</button>`;
            }

            // Pay Off Button
            if (isOutstandingSale) {
                actionButtons += `<button class="action-btn payment-btn" data-id="${t.id}" style="background-color: var(--balance-color); color: white; margin-right: 10px;">💵 Pay Off</button>`;
            }

            // Standard Edit and Delete buttons
            actionButtons += `<button class="action-btn edit-btn" data-id="${t.id}">Edit</button>
                              <button class="action-btn delete-btn" data-id="${t.id}">Delete</button>`;
        }

        item.innerHTML = `
            <div class="transaction-summary">
                <span class="transaction-type type-${t.type.toLowerCase()}">${t.type}</span>
                <span class="transaction-name">${t.name}${recurringSymbol}</span>
                <span class="transaction-date">${t.date}</span>
                <span class="transaction-amount">${formatCurrency(amountDue)}</span>
                <span class="lock-status ${lockClass}">${lockIcon}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Category:</strong> ${t.jobType}</p>
                <p><strong>Amount Paid:</strong> ${formatCurrency(amountPaid)}</p>
                <p><strong>Outstanding:</strong> <span style="color:${outstanding > 0 ? 'var(--negative-color)' : 'var(--positive-color)'}">${formatCurrency(outstanding)}</span></p>
                <p><strong>Notes:</strong> ${t.jobNotes}</p>
                <div class="transaction-actions">
                    ${actionButtons}
                </div>
            </div>
        `;
        list.appendChild(item);
        
        // NEW: Collapsible Details Logic
        item.querySelector('.transaction-summary').addEventListener('click', (e) => {
            if (e.target.closest('.transaction-actions') || e.target.closest('button')) return; 
            const details = item.querySelector('.transaction-details');
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Add listeners for new buttons
    list.querySelectorAll('.payment-btn').forEach(button => {
        button.addEventListener('click', (e) => recordPayment(e.target.dataset.id));
    });
    list.querySelectorAll('.manage-template-btn').forEach(button => {
        button.addEventListener('click', (e) => openTemplateManagementPrompt(e.target.dataset.templateId));
    });

    // Add listeners for existing actions (placeholders for full logic)
    list.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); 
            alert('Edit functionality not fully implemented. Edit: ' + e.target.dataset.id);
        });
    });
    list.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this transaction?')) { /* deleteTransaction(e.target.dataset.id); */ }
        });
    });
    list.querySelectorAll('.unlock-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // toggleTransactionLock(e.target.dataset.id); // Logic to toggle lock
        });
    });
}


// ... (The remainder of helper functions and event handlers would be placed here to complete the file) ...