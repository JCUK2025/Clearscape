// script.js

// === STATE & SETUP ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
let settingsPassword = localStorage.getItem('settingsPassword') || '0000';
let businessName = localStorage.getItem('businessName') || 'ClearScape';
let userName = localStorage.getItem('userName') || 'User';
let userTitle = localStorage.getItem('userTitle') || '';
let currency = localStorage.getItem('currency') || 'GBP';
let recurringTemplates = JSON.parse(localStorage.getItem('recurringTemplates')) || [];
let securityQuestions = JSON.parse(localStorage.getItem('securityQA')) || [];
let inactivityTimer;

let structuredCategories = JSON.parse(localStorage.getItem('structuredCategories')) || {
    Sales: ["Lawn Maintenance", "Hedge Trimming / Maintenance", "Landscaping", "Tree surgery / Felling", "Servicing / Repair", "Fencing", "Decking / Paving", "Other"],
    Expenses: ["Fuel", "Utilities", "Rent", "Services", "Materials", "Equipment", "Petty Cash", "Uniform / Safety Equipment", "Other"],
    Deposit: ["Loan", "Cash Injection", "Rebate / Refund", "Other"],
    Withdrawal: ["Cash Withdrawal", "Other"],
    Refund: ["Goodwill Gesture", "Job Cancellation / Amendment", "Other"],
    Other: []
};

const questionOptions = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "In what city were you born?",
    "What is your favorite book?"
];


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
function saveClients() { localStorage.setItem('clients', JSON.stringify(clients)); }
function saveCategories() { localStorage.setItem('structuredCategories', JSON.stringify(structuredCategories)); }

function populateClientDatalist() {
    const datalist = document.getElementById('clientDatalist');
    if (!datalist) return;
    datalist.innerHTML = '';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.name;
        datalist.appendChild(option);
    });
}

function updateJobTypeDropdown() {
    if (!jobTypeSelect || !transactionTypeSelect) return;
    const selectedType = transactionTypeSelect.value;
    let options = [];
    if (selectedType === 'Sale') options = structuredCategories.Sales;
    else if (selectedType === 'Expense') options = structuredCategories.Expenses;
    else if (selectedType === 'Deposit') options = structuredCategories.Deposit;
    else if (selectedType === 'Withdrawal') options = structuredCategories.Withdrawal;
    else if (selectedType === 'Refund') options = structuredCategories.Refund;
    else {
        options = [...new Set([].concat.apply([], Object.values(structuredCategories)))];
    }
    jobTypeSelect.innerHTML = '';
    if (options) {
        options.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            jobTypeSelect.appendChild(option);
        });
    }
}


// === VIEW MANAGEMENT & AUTH ===
function showView(viewId) {
    ['passwordLockView', 'resetPasswordView', 'splashScreen', 'setupWizardView', 'appContainer'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const element = document.getElementById(viewId);
    if (element) {
        element.style.display = ['splashScreen', 'setupWizardView', 'passwordLockView', 'resetPasswordView'].includes(viewId) ? 'flex' : 'block';
        if (!['splashScreen', 'setupWizardView', 'passwordLockView', 'resetPasswordView'].includes(viewId)) {
            appContainer.style.display = 'block';
            document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
            element.style.display = 'block';
        }
    }
}

function showLockScreen() {
    const lockView = document.getElementById('passwordLockView');
    if (lockView) {
        lockView.classList.remove('fade-out');
        showView('passwordLockView');
    }
}

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(showLockScreen, 5 * 60 * 1000);
}


// === SPLASH SCREEN & ANIMATIONS ===
function triggerLogoAnimation() {
    const appLogo = document.getElementById('appLogo') || document.getElementById('lockScreenLogo');
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
    const displayName = userTitle || userName;
    const hour = new Date().getHours();
    let timeOfDayGreeting;
    if (hour < 12) timeOfDayGreeting = `Good morning, ${displayName}!`;
    else if (hour < 18) timeOfDayGreeting = `Good afternoon, ${displayName}!`;
    else timeOfDayGreeting = `Good evening, ${displayName}!`;
    const genericGreetings = ["Let's get your finances in order.", "Ready to track your success?"];
    const greetings = [timeOfDayGreeting, ...genericGreetings];
    if (splashTitle) splashTitle.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    const factElement = document.getElementById('factOfTheDay');
    if (factElement) {
        const facts = [
            "The oldest living tree, a bristlecone pine named Methuselah, is over 4,850 years old.",
            "Bamboo is the fastest-growing woody plant in the world; it can grow up to 35 inches in a single day.",
            "The Amazon Rainforest produces more than 20% of the world's oxygen.",
            "A sunflower is not one single flower. Its head is made of thousands of tiny flowers called florets.",
            "Oak trees don't produce acorns until they are around 50 years old.",
            "The Ginkgo Biloba is one of the oldest living tree species, dating back about 270 million years.",
            "Broccoli is actually a flower.",
            "Strawberries are the only fruit with seeds on the outside.",
            "Caffeine is a natural pesticide produced by some plants to ward off insects.",
            "More than 600 species of carnivorous plants eat insects and small animals.",
            "The art of trimming shrubs into ornamental shapes is called topiary.",
            "The smell of freshly cut grass is actually a plant distress call.",
            "The 'rainbow eucalyptus' tree has bark that peels away to reveal streaks of green, orange, purple, and red.",
            "Peanuts are not nuts; they are legumes.",
            "A bonsai tree is not a specific species; it is any tree or shrub grown in a way that keeps it small.",
            "The Japanese practice of 'forest bathing' (shinrin-yoku) involves simply being in and among trees."
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        factElement.textContent = randomFact;
    }
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
        const isOutstandingSale = ['Sale', 'Deposit'].includes(t.type) && outstanding > 0.01;
        let indicatorSymbols = '';
        if (t.templateId) {
            indicatorSymbols += ` <span title="Recurring Transaction">🔁</span>`;
        }
        if (isOutstandingSale) {
            indicatorSymbols += ` <span title="Outstanding Balance">⚠️</span>`;
        }
        let actionButtons = `<button class="action-btn edit-btn" data-id="${t.id}">Edit</button> <button class="action-btn delete-btn" data-id="${t.id}">Delete</button>`;
        if (isOutstandingSale) {
            actionButtons = `<button class="action-btn repay-btn" data-id="${t.id}">Record Full Payment</button>` + actionButtons;
        }
        item.innerHTML = `
            <div class="transaction-summary">
                <span class="transaction-name">${t.name}${indicatorSymbols}</span>
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
    generateRecurringTransactions();
    if (localStorage.getItem('setupComplete') !== 'true') {
        showView('setupWizardView');
        showSetupStep(1);
        return false;
    }
    userName = localStorage.getItem('userName') || 'User';
    userTitle = localStorage.getItem('userTitle') || '';
    businessName = localStorage.getItem('businessName') || 'ClearScape';
    currency = localStorage.getItem('currency') || 'GBP';
    appNameHeader.textContent = `${businessName} Dashboard`;
    document.title = `${businessName} Tracker`;
    clients = JSON.parse(localStorage.getItem('clients')) || [];
    structuredCategories = JSON.parse(localStorage.getItem('structuredCategories')) || structuredCategories;
    securityQuestions = JSON.parse(localStorage.getItem('securityQA')) || [];
    updateJobTypeDropdown();
    populateClientDatalist();
    return true;
}

let currentSetupStep = 1;
function showSetupStep(stepNumber) {
    document.querySelectorAll('.setup-step').forEach(step => step.style.display = 'none');
    const stepName = getStepName(stepNumber);
    if (stepName) document.getElementById(`step${stepName}`).style.display = 'block';
}

function getStepName(stepNumber) {
    const steps = [null, 'Name', 'UserTitle', 'BusinessName', 'Currency', 'Password', 'Security', 'Balance', 'Categories'];
    return steps[stepNumber] || null;
}

function renderWizardCategoryList() {
    const list = document.getElementById('categoryWizardList');
    if (!list) return;
    list.innerHTML = '';
    const uniqueCategories = [...new Set([].concat.apply([], Object.values(structuredCategories)))];
    uniqueCategories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat;
        li.style.cssText = 'background: #f4f4f4; padding: 5px; margin-bottom: 5px; border-radius: 3px;';
        list.appendChild(li);
    });
    document.getElementById('finishSetupBtn').disabled = false;
}

function populateSecurityQuestionDropdowns() {
    const q1 = document.getElementById('securityQuestion1');
    const q2 = document.getElementById('securityQuestion2');
    if (!q1 || !q2) return;
    const optionsHTML = questionOptions.map(q => `<option value="${q}">${q}</option>`).join('');
    q1.innerHTML = optionsHTML;
    q2.innerHTML = optionsHTML;
    if(questionOptions.length > 1) q2.value = questionOptions[1];
}


// === INITIAL LOAD & EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    showLockScreen();
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => document.addEventListener(event, resetInactivityTimer));
    setInterval(triggerLogoAnimation, 6000);

    // Main App Unlock
    document.getElementById('unlockAppBtn').addEventListener('click', () => {
        const passwordInput = document.getElementById('mainPasswordInput');
        const savedPassword = localStorage.getItem('settingsPassword') || '0000';
        if (passwordInput.value === savedPassword) {
            const lockView = document.getElementById('passwordLockView');
            lockView.classList.add('fade-out');
            setTimeout(() => {
                passwordInput.value = '';
                const isSetupComplete = initApp();
                if (isSetupComplete) {
                    resetInactivityTimer();
                    showSplashScreen();
                }
            }, 500);
        } else {
            alert('Incorrect password.');
            passwordInput.value = '';
        }
    });

    // Password Reset Logic
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    let chosenQuestion = {};
    function initiatePasswordReset() {
        securityQuestions = JSON.parse(localStorage.getItem('securityQA')) || [];
        if (securityQuestions.length < 2) {
            alert("Password reset is not set up. Please reset app data if you cannot log in.");
            return;
        }
        chosenQuestion = securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
        document.getElementById('securityQuestionText').textContent = chosenQuestion.q;
        showView('resetPasswordView');
        document.getElementById('securityQuestionStep').style.display = 'block';
        document.getElementById('createNewPasswordStep').style.display = 'none';
    }
    forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); initiatePasswordReset(); });
    document.getElementById('submitAnswerBtn').addEventListener('click', () => {
        const answerInput = document.getElementById('securityAnswerInput');
        if (answerInput.value.trim().toLowerCase() === chosenQuestion.a) {
            document.getElementById('securityQuestionStep').style.display = 'none';
            document.getElementById('createNewPasswordStep').style.display = 'block';
            answerInput.value = '';
        } else {
            alert('Incorrect answer.');
        }
    });
    document.getElementById('saveNewPasswordBtn').addEventListener('click', () => {
        const newPass = document.getElementById('newPasswordResetInput');
        const confirmPass = document.getElementById('confirmNewPasswordResetInput');
        if (newPass.value.length < 4) return alert('Password must be at least 4 characters long.');
        if (newPass.value !== confirmPass.value) return alert('Passwords do not match.');
        localStorage.setItem('settingsPassword', newPass.value);
        alert('Password successfully reset! Please log in with your new password.');
        newPass.value = ''; confirmPass.value = '';
        showLockScreen();
    });
    document.getElementById('backToLockScreenBtn').addEventListener('click', showLockScreen);

    // Main Navigation
    document.getElementById('goToDashboardBtn').addEventListener('click', () => { showView('dashboardView'); updateDashboard(); });
    document.getElementById('goToTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('goToAnalyticsBtn').addEventListener('click', () => { renderAnalyticsPage(); showView('analyticsView'); });
    document.getElementById('goToSettingsBtn').addEventListener('click', () => { showView('settingsView'); });
    document.getElementById('headerDashboardBtn').addEventListener('click', () => { showView('dashboardView'); updateDashboard(); });
    document.getElementById('headerTransactionsBtn').addEventListener('click', () => { showView('transactionListView'); renderFullTransactionList(); });
    document.getElementById('headerAnalyticsBtn').addEventListener('click', () => { renderAnalyticsPage(); showView('analyticsView'); });
    document.getElementById('headerSettingsBtn').addEventListener('click', () => showView('settingsView'));
    
    // Back Buttons
    ['backToDashboardBtn', 'backToDashboardFromSettingsBtn', 'backToDashboardFromCategoryBtn', 'backToDashboardFromAnalyticsBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.addEventListener('click', () => showView('dashboardView'));
    });
    
    // Interactive Dashboard Card
    document.getElementById('arCard').addEventListener('click', () => {
        document.getElementById('filterPaidStatus').value = 'Outstanding';
        renderFullTransactionList();
        showView('transactionListView');
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
            date: document.getElementById('transactionDate').value,
            name: document.getElementById('transactionName').value.trim(),
            type: document.getElementById('transactionTypeSelect').value,
            jobType: document.getElementById('jobTypeSelect').value,
            amountDue: parseFloat(document.getElementById('amountDueInput').value) || 0,
            jobNotes: document.getElementById('jobNotesInput').value.trim()
        };
        if (transactionData.type === 'Sale') {
            transactionData.amountPaid = parseFloat(document.getElementById('amountPaidInput').value) || 0;
        } else {
            transactionData.amountPaid = transactionData.amountDue;
        }
        if (!transactionData.date || !transactionData.name || !transactionData.amountDue) return alert('Please fill out Date, Name, and Amount Due.');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        setTimeout(() => {
            if (transactionId) {
                const index = transactions.findIndex(t => t.id === transactionId);
                if (index > -1) transactions[index] = { ...transactions[index], ...transactionData };
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
                }
                transactions.push(transactionData);
            }
            saveTransactions();
            updateDashboard();
            renderFullTransactionList();
            submitBtn.style.backgroundColor = 'var(--positive-color)';
            submitBtn.textContent = '✓ Saved!';
            setTimeout(() => {
                this.reset();
                document.getElementById('transactionId').value = '';
                submitBtn.textContent = 'Add Transaction';
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
                updateJobTypeDropdown();
                toggleAmountPaidVisibility();
                document.getElementById('recurringOptions').style.display = 'none';
            }, 1500);
        }, 300);
    });
    
    // Transaction List Actions
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
            toggleAmountPaidVisibility();
            document.getElementById('addTransactionBtn').textContent = 'Update Transaction';
            showView('dashboardView');
            document.getElementById('transactionForm').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Filter Listeners
    document.getElementById('applyFiltersBtn').addEventListener('click', renderFullTransactionList);
    document.getElementById('transactionSearchInput').addEventListener('input', renderFullTransactionList);
    document.getElementById('resetFiltersBtn').addEventListener('click', () => {
        ['transactionSearchInput', 'filterTransactionType', 'filterJobType', 'filterPaidStatus', 'filterStartDate', 'filterEndDate'].forEach(id => document.getElementById(id).value = '');
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
        link.remove();
    });
    document.getElementById('analyticsYearSelect').addEventListener('change', e => renderAnalyticsPage(e.target.value));

    // Settings Page Listeners
    function populateSettingsPage() {
        document.getElementById('businessNameSetting').value = localStorage.getItem('businessName') || 'ClearScape';
        renderClientList();
        renderSettingsCategoryList();
    }
    document.getElementById('saveBusinessNameBtn').addEventListener('click', () => {
        const newName = document.getElementById('businessNameSetting').value.trim();
        if (newName) {
            localStorage.setItem('businessName', newName);
            businessName = newName;
            appNameHeader.textContent = `${businessName} Dashboard`;
            document.title = `${businessName} Tracker`;
            alert('Business name updated!');
        }
    });
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        const dataToExport = {
            transactions: JSON.parse(localStorage.getItem('transactions')) || [],
            recurringTemplates: JSON.parse(localStorage.getItem('recurringTemplates')) || [],
            clients: JSON.parse(localStorage.getItem('clients')) || [],
            structuredCategories: JSON.parse(localStorage.getItem('structuredCategories')) || structuredCategories,
            settings: {
                userName: localStorage.getItem('userName'), userTitle: localStorage.getItem('userTitle'),
                businessName: localStorage.getItem('businessName'), currency: localStorage.getItem('currency'),
                initialBalance: localStorage.getItem('initialBalance'), setupComplete: localStorage.getItem('setupComplete')
            }
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${businessName}_Backup.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        alert('Data exported successfully!');
    });
    const importFileInput = document.getElementById('importFileInput');
    document.getElementById('importDataBtn').addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file || !confirm("WARNING: Importing data will overwrite ALL existing data. Continue?")) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                localStorage.setItem('transactions', JSON.stringify(importedData.transactions || []));
                localStorage.setItem('recurringTemplates', JSON.stringify(importedData.recurringTemplates || []));
                localStorage.setItem('clients', JSON.stringify(importedData.clients || []));
                localStorage.setItem('structuredCategories', JSON.stringify(importedData.structuredCategories || {}));
                if (importedData.settings) {
                    for (const key in importedData.settings) { localStorage.setItem(key, importedData.settings[key]); }
                }
                alert('Data imported successfully! The application will now reload.');
                location.reload();
            } catch (error) { alert('Error reading the backup file.'); }
        };
        reader.readAsText(file);
    });
    document.getElementById('updatePasswordBtn').addEventListener('click', () => {
        const newPasswordInput = document.getElementById('updatePasswordInput');
        const confirmPasswordInput = document.getElementById('confirmPasswordInput');
        const newPassword = newPasswordInput.value;
        if (newPassword.length < 4) return alert('Password must be at least 4 characters long.');
        if (newPassword !== confirmPasswordInput.value) return alert('Passwords do not match. Please try again.');
        localStorage.setItem('settingsPassword', newPassword);
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        alert('Password updated successfully!');
    });
    document.getElementById('resetAppBtn').addEventListener('click', () => {
        if (confirm("DANGER: Are you absolutely sure?") && confirm("This will delete ALL data permanently. Continue?")) {
            localStorage.clear();
            alert('Application has been reset.');
            location.reload();
        }
    });

    // Client Management Logic
    const clientList = document.getElementById('clientList');
    function renderClientList() {
        if (!clientList) return;
        clientList.innerHTML = '';
        if (clients.length === 0) {
            clientList.innerHTML = '<li>No clients saved yet.</li>';
        } else {
            clients.forEach(client => {
                const li = document.createElement('li');
                li.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ddd;';
                li.innerHTML = `<span>${client.name}</span><button class="delete-btn" data-client-id="${client.id}" style="padding: 3px 8px;">Delete</button>`;
                clientList.appendChild(li);
            });
        }
    }
    document.getElementById('addClientBtn').addEventListener('click', () => {
        const clientNameInput = document.getElementById('clientNameInput');
        const newName = clientNameInput.value.trim();
        if (newName && !clients.some(c => c.name === newName)) {
            clients.push({ id: `c_${Date.now()}`, name: newName });
            saveClients();
            renderClientList();
            populateClientDatalist();
            clientNameInput.value = '';
        } else if (!newName) {
            alert('Please enter a client name.');
        } else {
            alert('A client with this name already exists.');
        }
    });
    clientList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const clientId = e.target.dataset.clientId;
            clients = clients.filter(c => c.id !== clientId);
            saveClients();
            renderClientList();
            populateClientDatalist();
        }
    });

    // Category Management Logic
    function renderSettingsCategoryList() {
        const container = document.getElementById('settingsCategoryList');
        if (!container) return;
        container.innerHTML = '';
        for (const type in structuredCategories) {
            if (structuredCategories.hasOwnProperty(type)) {
                const typeContainer = document.createElement('div');
                let listItems = structuredCategories[type].map(cat => `<li>${cat}</li>`).join('');
                typeContainer.innerHTML = `<h5>For ${type}</h5><ul style="font-size: 0.9em;">${listItems}</ul>`;
                container.appendChild(typeContainer);
            }
        }
    }
    document.getElementById('addCategorySettingBtn').addEventListener('click', () => {
        const nameInput = document.getElementById('newCategoryNameSetting');
        const typeSelect = document.getElementById('newCategoryTypeSetting');
        const newName = nameInput.value.trim();
        const catType = typeSelect.value;
        if (newName && !structuredCategories[catType].includes(newName)) {
            structuredCategories[catType].push(newName);
            saveCategories();
            renderSettingsCategoryList();
            updateJobTypeDropdown();
            nameInput.value = '';
            alert(`Category "${newName}" added to ${catType}.`);
        } else if (!newName) {
            alert('Please enter a category name.');
        } else {
            alert('That category already exists for the selected type.');
        }
    });

    // --- Wizard Navigation ---
    const wizardNav = {
        nextStepName: { next: 2, validate: () => document.getElementById('userNameInput').value.trim() !== '', alert: 'Please enter your name.', save: () => localStorage.setItem('userName', document.getElementById('userNameInput').value.trim()) },
        backStepUserTitle: { next: 1 },
        nextStepUserTitle: { next: 3, validate: () => document.getElementById('userTitleInput').value.trim() !== '', alert: 'Please enter a title.', save: () => localStorage.setItem('userTitle', document.getElementById('userTitleInput').value.trim()) },
        backStepBusinessName: { next: 2 },
        nextStepBusinessName: { next: 4, validate: () => document.getElementById('businessNameInput').value.trim() !== '', alert: 'Please enter a business name.', save: () => localStorage.setItem('businessName', document.getElementById('businessNameInput').value.trim()) },
        backStepCurrency: { next: 3 },
        nextStepCurrency: { next: 5, save: () => localStorage.setItem('currency', document.getElementById('currencySetupSelect').value) },
        backStepPassword: { next: 4 },
        nextStepPassword: { next: 6, validate: () => document.getElementById('passwordSetupInput').value.trim().length >= 4, alert: 'Password must be at least 4 characters.', save: () => localStorage.setItem('settingsPassword', document.getElementById('passwordSetupInput').value), action: populateSecurityQuestionDropdowns },
        backStepSecurity: { next: 5 },
        nextStepSecurity: { next: 7, validate: () => {
            if (!document.getElementById('securityAnswer1').value.trim() || !document.getElementById('securityAnswer2').value.trim()) {
                alert('Please answer both security questions.'); return false;
            }
            if (document.getElementById('securityQuestion1').value === document.getElementById('securityQuestion2').value) {
                alert('Please select two different security questions.'); return false;
            }
            return true;
        }, save: () => {
            const qa = [
                { q: document.getElementById('securityQuestion1').value, a: document.getElementById('securityAnswer1').value.trim().toLowerCase() },
                { q: document.getElementById('securityQuestion2').value, a: document.getElementById('securityAnswer2').value.trim().toLowerCase() }
            ];
            localStorage.setItem('securityQA', JSON.stringify(qa));
        }},
        backStepBalance: { next: 6 },
        nextStepBalance: { next: 8, validate: () => document.getElementById('balanceSetupInput').value !== '', alert: 'Please enter a starting balance (0 is okay).', save: () => localStorage.setItem('initialBalance', parseFloat(document.getElementById('balanceSetupInput').value)), action: renderWizardCategoryList },
        backStepCategories: { next: 7 }
    };
    for (const id in wizardNav) {
        document.getElementById(id).addEventListener('click', () => {
            const config = wizardNav[id];
            if (config.validate && !config.validate()) return;
            if (config.save) config.save();
            if (config.action) config.action();
            showSetupStep(config.next);
        });
    }
    document.getElementById('addCategoryWizardBtn').addEventListener('click', () => {
        const input = document.getElementById('categorySetupInput');
        const typeSelect = document.getElementById('categoryTypeSetupSelect');
        const newCat = input.value.trim();
        const catType = typeSelect.value;
        if (newCat) {
            const allCats = [...new Set([].concat.apply([], Object.values(structuredCategories)))];
            if (!allCats.includes(newCat)) {
                structuredCategories[catType].push(newCat);
                renderWizardCategoryList();
                input.value = '';
            } else {
                alert('That category already exists.');
            }
        }
    });
    document.getElementById('finishSetupBtn').addEventListener('click', () => {
        saveCategories();
        localStorage.setItem('setupComplete', 'true');
        location.reload();
    });
});