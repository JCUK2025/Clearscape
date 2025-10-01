// script.js

// === STATE & SETUP ===
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || 0;
let settingsPassword = localStorage.getItem('settingsPassword') || '0000';
let businessName = localStorage.getItem('businessName') || 'ClearScape';
let userName = localStorage.getItem('userName') || 'User';
let currency = localStorage.getItem('currency') || 'GBP';
let recurringTemplates = JSON.parse(localStorage.getItem('recurringTemplates')) || [];
let securityQuestions = JSON.parse(localStorage.getItem('securityQA')) || [];
let inactivityTimer;

const defaultCategories = {
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
    const hour = new Date().getHours();
    let timeOfDayGreeting;
    if (hour < 12) timeOfDayGreeting = `Good morning, ${userName}!`;
    else if (hour < 18) timeOfDayGreeting = `Good afternoon, ${userName}!`;
    else timeOfDayGreeting = `Good evening, ${userName}!`;
    const genericGreetings = ["Let's get your finances in order.", "Ready to track your success?"];
    const greetings = [timeOfDayGreeting, ...genericGreetings];
    if (splashTitle) splashTitle.textContent = greetings[Math.floor(Math.random() * greetings.length)];
    const factElement = document.getElementById('factOfTheDay');
    if (factElement) {
        const facts = [
            "The oldest living tree, a bristlecone pine named Methuselah, is over 4,850 years old.",
            "Bamboo is the fastest-growing woody plant in the world; it can grow up to 35 inches in a single day.",
            "The Amazon Rainforest produces more than 20% of the world's oxygen.",
            "The gardens of Versailles in France are one of the most famous in the world, covering about 800 hectares.",
            "More than 85% of plant life is found in the ocean.",
            "A sunflower is not one single flower. Its head is made of thousands of tiny flowers called florets.",
            "Oak trees don't produce acorns until they are around 50 years old.",
            "The Ginkgo Biloba is one of the oldest living tree species, dating back about 270 million years.",
            "Broccoli is actually a flower.",
            "The 'corpse flower' smells like rotting flesh to attract flies for pollination.",
            "Strawberries are the only fruit with seeds on the outside.",
            "An average tree can absorb around 2,000 litres of water per year.",
            "The world's most dangerous plant is the Rosary Pea, which contains a highly toxic protein.",
            "Dandelions are edible from root to flower.",
            "A single tree can absorb as much as 48 pounds of carbon dioxide per year.",
            "The world's largest living organism is a grove of quaking Aspen trees in Utah, connected by a single root system.",
            "Caffeine is a natural pesticide produced by some plants to ward off insects.",
            "The first potatoes were grown in Peru over 7,000 years ago.",
            "More than 600 species of carnivorous plants eat insects and small animals.",
            "The study of trees is called dendrology.",
            "The sap from the 'dragon's blood' tree is dark red and was used as a dye and medicine.",
            "The Lost Gardens of Heligan in Cornwall were rediscovered after being neglected for 75 years following WWI.",
            "Vanilla flavouring comes from the pod of an orchid.",
            "The bark of a redwood tree is fire-resistant.",
            "Onions contain a mild antibiotic that can help fight infections.",
            "There are over 300,000 identified species of plants, and the list is constantly growing.",
            "The thorns on a rose bush are technically called 'prickles.'",
            "A single teaspoon of soil can contain billions of microbes.",
            "The Kew Gardens in London has the largest collection of living plants in the world.",
            "The fruit of the Osage orange tree is not edible but repels spiders.",
            "Pineapples are actually a collection of many individual berries fused together.",
            "Trees can 'communicate' and share nutrients through an underground network of fungi.",
            "The tulip was once so valuable in the Netherlands that its bulbs were worth more than gold.",
            "Bananas are technically berries, while raspberries are not.",
            "The Baobab tree can store up to 120,000 litres of water in its trunk.",
            "The first aspirin was derived from the bark of a willow tree.",
            "A single strand of moss has only one cell.",
            "The leaves of the 'sensitive plant' (Mimosa pudica) fold inward when touched.",
            "The Saguaro cactus can live for over 150 years and doesn't grow its first 'arm' until it's about 75.",
            "Apples, peaches, and apricots are all members of the rose family.",
            "The art of trimming shrubs into ornamental shapes is called topiary.",
            "The world's tallest trees are Coast Redwoods, which can exceed 370 feet in height.",
            "The smell of freshly cut grass is actually a plant distress call.",
            "The colour of a hydrangea's flower depends on the pH of the soil.",
            "The floating leaves of the giant water lily can be up to 3 meters in diameter.",
            "Carrots were originally purple, not orange.",
            "Some orchids are 'deceptive,' mimicking the appearance and scent of female insects to attract males for pollination.",
            "The 'rainbow eucalyptus' tree has bark that peels away to reveal streaks of green, orange, purple, and red.",
            "Peanuts are not nuts; they are legumes.",
            "The tradition of the Christmas tree started in Germany in the 16th century.",
            "The sap of the sugar maple tree is used to make maple syrup.",
            "The 'whistling thorn acacia' tree has hollow thorns that whistle when the wind blows.",
            "A bonsai tree is not a specific species; it is any tree or shrub grown in a way that keeps it small.",
            "The spice saffron comes from the tiny stigmas of the crocus flower.",
            "Some trees, like the manchineel, are so toxic that standing under them in the rain can cause blisters.",
            "The 'cannonball tree' grows fruit that looks like rusty cannonballs.",
            "The Titan Arum is the largest unbranched flower in the world.",
            "Cucumbers are technically a fruit, not a vegetable.",
            "The world's oldest known seed to be germinated was a 2,000-year-old date palm seed from Judea.",
            "The Japanese practice of 'forest bathing' (shinrin-yoku) involves simply being in and among trees.",
            "The Venus flytrap's 'trap' is actually a modified leaf.",
            "The white powder on grapes is a natural yeast called 'bloom.'",
            "Some ancient Yew trees in the UK are estimated to be over 2,000 years old.",
            "The 'dumb cane' plant (Dieffenbachia) can cause temporary speechlessness if ingested.",
            "Lavender oil has antiseptic and anti-inflammatory properties.",
            "A mature tree can add thousands of pounds to a property's value.",
            "The Welwitschia mirabilis plant, found in the Namib desert, can live for over 1,500 years and has only two leaves.",
            "The tea plant, Camellia sinensis, is an evergreen shrub.",
            "The world's largest flower, Rafflesia arnoldii, can grow to be 3 feet across.",
            "Avocados are a fruit and, more specifically, a single-seeded berry.",
            "The 'doll's eye' plant has white berries with black dots that look like eyeballs.",
            "The 'Angel Oak' in South Carolina is a Southern live oak tree estimated to be 400-500 years old.",
            "The bark of the cork oak tree is harvested to make corks without harming the tree.",
            "The 'pitcher plant' drowns its prey in a pool of digestive enzymes.",
            "The 'traveler's palm' stores water in its leaf bases, which could be an emergency source of drinking water.",
            "There are over 25,000 species of orchids.",
            "The practice of arranging cut flowers is called floristry.",
            "The 'monkey puzzle tree' gets its name because its sharp, spiky leaves would be a puzzle for a monkey to climb.",
            "The smell of Petrichor is the earthy scent produced when rain falls on dry soil.",
            "The 'ghost plant' is entirely white as it lacks chlorophyll and gets its energy from fungi.",
            "Some pine cones can remain closed for years, only opening to release seeds after the heat of a forest fire.",
            "The 'sausage tree' grows large, inedible fruits that resemble sausages.",
            "Artichokes are the unopened flower buds of a thistle plant.",
            "The study of fruits and fruit-growing is called pomology.",
            "The 'quiver tree' of southern Africa was used by bushmen to make quivers for their arrows.",
            "The 'lawn' as we know it became popular in 17th-century England.",
            "The 'strangler fig' starts life on another tree, eventually enveloping and 'strangling' its host.",
            "The 'living stones' (Lithops) are succulent plants that look exactly like pebbles.",
            "The 'monkey orchid' (Dracula simia) has a flower that uncannily resembles a monkey's face.",
            "The 'Major Oak' in Sherwood Forest, England, is famously associated with the legend of Robin Hood.",
            "A single dandelion seed can travel for several miles in the wind.",
            "The 'old man of the Andes' cactus is covered in what looks like shaggy white hair.",
            "The 'chocolate vine' has flowers that smell like chocolate.",
            "The 'lobster claw' plant (Heliconia) has brightly coloured bracts that resemble a lobster's claw.",
            "The Moringa tree is also known as the 'drumstick tree,' and its leaves are highly nutritious.",
            "California's 'Hyperion' is the world's tallest known living tree, standing at over 380 feet.",
            "Some plants are 'resurrection plants,' able to survive extreme dehydration for months or years.",
            "The Banyan tree sends down roots from its branches, which can grow into new trunks.",
            "Not all plants need soil to grow; some, called epiphytes, grow on other plants.",
            "The scent of a rose comes from microscopic perfume glands on its petals.",
            "The English Yew can live for more than 2,000 years and is often found in old churchyards.",
            "The first known depiction of a garden is from an Egyptian tomb painting from around 1500 BC.",
            "Hedge laying is a traditional countryside skill of weaving branches to form a thick, living barrier.",
            "The concept of a 'cottage garden' originated in Elizabethan times to grow herbs and vegetables.",
            "Lawns were originally maintained by grazing animals before the invention of the lawnmower in 1830.",
            "A 'ha-ha' is a sunken fence used in landscaping to keep livestock out without interrupting a scenic view.",
            "The Japanese art of 'kokedama' involves growing a plant in a ball of soil covered in moss.",
            "The bark of the White Willow tree contains salicin, the compound that led to the development of aspirin.",
            "The Wollemi Pine is a 'living fossil' that was thought to be extinct for millions of years until it was discovered in 1994.",
            "The rubber tree (Hevea brasiliensis) is the primary source of natural rubber.",
            "Moon gardens are designed with white or pale-coloured flowers that reflect moonlight.",
            "The seeds of the lotus flower can remain dormant for hundreds of years and still be viable.",
            "The Giant Sequoia is the world's largest single tree by volume.",
            "Some plants are allelopathic, meaning they release chemicals to inhibit the growth of nearby plants.",
            "The world's hottest chili, the 'Pepper X', is over 3 million Scoville Heat Units."
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
    clients = JSON.parse(localStorage.getItem('clients')) || [];
    categories = JSON.parse(localStorage.getItem('jobCategories')) || [];
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
    const steps = [null, 'Name', 'BusinessName', 'Currency', 'Password', 'Security', 'Balance', 'Categories'];
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
                resetInactivityTimer();
                showSplashScreen();
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
    document.getElementById('goToDashboardBtn').addEventListener('click', () => { if (initApp()) { showView('dashboardView'); updateDashboard(); } });
    document.getElementById('goToTransactionsBtn').addEventListener('click', () => { if (initApp()) { showView('transactionListView'); renderFullTransactionList(); } });
    document.getElementById('goToAnalyticsBtn').addEventListener('click', () => { if (initApp()) { renderAnalyticsPage(); showView('analyticsView'); } });
    document.getElementById('goToSettingsBtn').addEventListener('click', () => { if (initApp()) { showView('settingsView'); } });
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
                localStorage.setItem('jobCategories', JSON.stringify(importedData.jobCategories || []));
                localStorage.setItem('clients', JSON.stringify(importedData.clients || []));
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

    // --- Wizard Navigation ---
    function populateSecurityQuestionDropdowns() {
        const q1 = document.getElementById('securityQuestion1'), q2 = document.getElementById('securityQuestion2');
        if (!q1 || !q2) return;
        const optionsHTML = questionOptions.map(q => `<option value="${q}">${q}</option>`).join('');
        q1.innerHTML = optionsHTML;
        q2.innerHTML = optionsHTML;
        if(questionOptions.length > 1) q2.value = questionOptions[1];
    }
    const wizardNav = {
        nextStepName: { next: 2, validate: () => document.getElementById('userNameInput').value.trim() !== '', alert: 'Please enter your name.', save: () => localStorage.setItem('userName', document.getElementById('userNameInput').value.trim()) },
        backStepBusinessName: { next: 1 },
        nextStepBusinessName: { next: 3, validate: () => document.getElementById('businessNameInput').value.trim() !== '', alert: 'Please enter a business name.', save: () => localStorage.setItem('businessName', document.getElementById('businessNameInput').value.trim()) },
        backStepCurrency: { next: 2 },
        nextStepCurrency: { next: 4, save: () => localStorage.setItem('currency', document.getElementById('currencySetupSelect').value) },
        backStepPassword: { next: 3 },
        nextStepPassword: { next: 5, validate: () => document.getElementById('passwordSetupInput').value.trim() !== '', alert: 'Please create a password.', save: () => localStorage.setItem('settingsPassword', document.getElementById('passwordSetupInput').value), action: populateSecurityQuestionDropdowns },
        backStepSecurity: { next: 4 },
        nextStepSecurity: { next: 6, validate: () => document.getElementById('securityAnswer1').value.trim() && document.getElementById('securityAnswer2').value.trim(), alert: 'Please answer both security questions.', save: () => {
            const qa = [
                { q: document.getElementById('securityQuestion1').value, a: document.getElementById('securityAnswer1').value.trim().toLowerCase() },
                { q: document.getElementById('securityQuestion2').value, a: document.getElementById('securityAnswer2').value.trim().toLowerCase() }
            ];
            localStorage.setItem('securityQA', JSON.stringify(qa));
        }},
        backStepBalance: { next: 5 },
        nextStepBalance: { next: 7, validate: () => document.getElementById('balanceSetupInput').value !== '', alert: 'Please enter a starting balance (0 is okay).', save: () => localStorage.setItem('initialBalance', parseFloat(document.getElementById('balanceSetupInput').value)), action: renderWizardCategoryList },
        backStepCategories: { next: 6 }
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