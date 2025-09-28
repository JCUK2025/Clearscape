// Entry from splash screen
function enterApp() {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  updateSummary();
  document.getElementById('date').valueAsDate = new Date();

  const today = new Date();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('current-date').textContent = `– ${today.toLocaleDateString('en-GB', options)}`;
}

// Seasonal greeting
function seasonalGreeting() {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  const greetings = [
    "Welcome back!",
    "Hello again!",
    "Nice to see you!",
    "Ready to grow?",
    "Let’s make today count.",
    "Your garden of clarity awaits.",
    "Let’s plant some progress.",
    "Time to tidy your transactions.",
    "Let’s clear the path ahead."
  ];

  if (month === 9 && day >= 25) greetings.unshift("🎃 Happy Halloween!");
  if (month === 11 && day >= 20) greetings.unshift("🎄 Merry Christmas!");
  if (month === 0 && day <= 7) greetings.unshift("🎉 Happy New Year!");
  if (month === 1 && day === 14) greetings.unshift("❤️ Happy Valentine’s Day!");
  if (month === 3 && day >= 1 && day <= 7) greetings.unshift("🌸 Welcome Spring!");
  if (month === 5 && day >= 1 && day <= 7) greetings.unshift("☀️ Summer’s here!");
  if (month === 8 && day >= 1 && day <= 7) greetings.unshift("🍂 Autumn vibes incoming!");

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const subGreeting = document.getElementById('sub-greeting');
  if (subGreeting) subGreeting.textContent = greeting;
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  const returning = location.hash === '#dashboard';

  if (returning && data.length > 0) {
    enterApp();
  } else {
    document.getElementById('splash-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    seasonalGreeting();
  }
});

// Idle timeout
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => location.reload(), 300000);
}
['click', 'mousemove', 'keydown'].forEach(evt =>
  document.addEventListener(evt, resetIdleTimer)
);
resetIdleTimer();

// Dynamic job type dropdown
const type = document.getElementById('type');
const jobType = document.getElementById('job-type');
const amtPaid = document.getElementById('amt-paid');

type.addEventListener('change', () => {
  const selected = type.value;
  jobType.innerHTML = '';
  amtPaid.style.display = selected === 'sale' ? 'block' : 'none';

  let options = [];
  if (selected === 'sale') {
    options = ['Lawn Maintenance', 'Hedge Maintenance', 'Landscaping', 'Fencing', 'Decking/Paving', 'Servicing/Repair', 'Other'];
  } else if (selected === 'expense') {
    options = ['Fuel', 'Utilities', 'Services', 'Materials', 'Equipment', 'Uniform/Safety Equipment', 'Loan Repayment', 'Other'];
  } else if (selected === 'deposit') {
    options = ['Loan', 'Cash Injection', 'Tax Rebate', 'Supplier Refund', 'Other'];
  } else if (selected === 'refund') {
    options = ['Goodwill', 'Job Cancellation', 'Other'];
  }

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select Job Type';
  jobType.appendChild(defaultOption);

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.toLowerCase().replace(/[\s/]/g, '-');
    option.textContent = opt;
    jobType.appendChild(option);
  });
});

// Transaction form logic
const form = document.getElementById('tx-form');
form.addEventListener('submit', e => {
  e.preventDefault();

  const txType = type.value;
  const nameField = document.getElementById('desc');
  if ((txType === 'sale' || txType === 'refund') && nameField.value.trim() === '') {
    alert('Customer name is required for sales and refunds.');
    return;
  }

  const tx = {
    date: document.getElementById('date').value,
    name: nameField.value,
    type: txType,
    jobType: jobType.value,
    amountDue: parseFloat(document.getElementById('amt-due').value),
    amountPaid: txType === 'sale' ? parseFloat(document.getElementById('amt-paid').value || 0) : null,
    notes: document.getElementById('notes').value,
    recurrence: document.getElementById('recurrence').value,
    paymentMethod: document.getElementById('payment-method').value
  };

  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  data.push(tx);
  localStorage.setItem('clearscape-data', JSON.stringify(data));
  form.reset();
  document.getElementById('date').valueAsDate = new Date();
  updateSummary();
});

// Dashboard summary
function updateSummary() {
  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  let sales = 0, expenses = 0, deposits = 0, refunds = 0, outstanding = 0;

  data.forEach(tx => {
    const amt = tx.amountDue || 0;
    const paid = tx.amountPaid || 0;

    if (tx.type === 'sale') {
      sales += amt;
      outstanding += amt - paid;
    }
    if (tx.type === 'expense') expenses += amt;
    if (tx.type === 'deposit') deposits += amt;
    if (tx.type === 'refund') refunds += amt;
  });

  const balance = (sales - refunds) + deposits - expenses;

  highlightMetric('sales', sales - refunds);
  highlightMetric('expenses', expenses);
  highlightMetric('deposits', deposits);
  highlightMetric('refunds', refunds);
  highlightMetric('outstanding', outstanding);
  animateBalance(balance);

  updateReminders(data, outstandingCount(data));
}

// Metric styling
function highlightMetric(id, value) {
  const el = document.getElementById(id);
  el.textContent = `£${value.toFixed(2)}`;
  el.parentElement.classList.toggle('negative',
    (id === 'balance' && value < 0) ||
    (id === 'outstanding' && value > 0) ||
    (id === 'refunds' && value > 0)
  );
}

// Balance animation
function animateBalance(balance) {
  const balanceEl = document.getElementById('balance');
  const balanceBox = balanceEl.parentElement;

  balanceEl.textContent = `£${balance.toFixed(2)}`;
  balanceEl.classList.remove('pulse-green', 'pulse-red');
  balanceBox.classList.remove('show-tick');

  if (balance < 0) {
    balanceEl.classList.add('pulse-red');
    balanceBox.classList.add('negative');
  } else {
    balanceEl.classList.add('pulse-green');
    balanceBox.classList.remove('negative');
    balanceBox.classList.add('show-tick');
  }
}

// Outstanding count
function outstandingCount(data) {
  return data.filter(tx =>
    tx.type === 'sale' && (tx.amountDue - tx.amountPaid) > 0
  ).length;
}

// Reminders and quote
function updateReminders(data, count) {
  const allReminders = [
    `📌 Don’t forget to enter all transactions before month end.`,
    `📌 Outstanding customers: ${count}`,
    `📌 Next month’s recurring expenses: £0.00`,
    `📌 Upcoming annual expenses: None`,
    `📌 Review your deposits for accuracy.`,
    `📌 Check for overdue payments.`,
    `📌 Keep your notes clear and concise.`
  ];

  const selected = allReminders.sort(() => 0.5 - Math.random()).slice(0, 3);
  document.getElementById('reminders').innerHTML = selected.map(r => `<p>${r}</p>`).join('');

  const quotes = [
    "Consistency compounds. Keep logging, keep growing.",
    "Small steps lead to big results.",
    "Track it today, master it tomorrow.",
    "Every entry is a step toward clarity."
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quote').textContent = `“${quote}”`;
}


