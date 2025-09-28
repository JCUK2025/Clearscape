// Splash screen logic
function enterApp() {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

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

  const tx = {
    date: document.getElementById('date').value,
    name: document.getElementById('desc').value,
    type: type.value,
    jobType: jobType.value,
    amountDue: parseFloat(document.getElementById('amt-due').value),
    amountPaid: type.value === 'sale' ? parseFloat(document.getElementById('amt-paid').value || 0) : null,
    notes: document.getElementById('notes').value,
    recurrence: document.getElementById('recurrence').value,
    paymentMethod: document.getElementById('payment-method').value
  };

  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  data.push(tx);
  localStorage.setItem('clearscape-data', JSON.stringify(data));
  form.reset();
  updateSummary();
});

// Dashboard logic
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

  updateReminders(data);
}

// Highlight metric with red ink if negative
function highlightMetric(id, value) {
  const el = document.getElementById(id);
  el.textContent = value.toFixed(2);
  el.parentElement.classList.toggle('negative', (id === 'balance' && value < 0) || (id === 'outstanding' && value > 0) || (id === 'refunds' && value > 0));
}

// Animate balance with pulse and tick
function animateBalance(balance) {
  const balanceEl = document.getElementById('balance');
  const balanceBox = balanceEl.parentElement;
  const sound = document.getElementById('positive-sound');

  balanceEl.textContent = balance.toFixed(2);
  balanceEl.classList.remove('pulse-green', 'pulse-red');
  balanceBox.classList.remove('show-tick');

  if (balance < 0) {
    balanceEl.classList.add('pulse-red');
    balanceBox.classList.add('negative');
  } else {
    balanceEl.classList.add('pulse-green');
    balanceBox.classList.remove('negative');
    balanceBox.classList.add('show-tick');
    sound.play();
  }
}

// Reminders and quotes
function updateReminders(data) {
  const outstandingCount = data.filter(tx =>
    tx.type === 'sale' && (tx.amountDue - tx.amountPaid) > 0
  ).length;

  document.getElementById('outstanding-count').textContent = outstandingCount;

  // Placeholder logic for recurring and annual alerts
  document.getElementById('next-recurring').textContent = '0.00';
  document.getElementById('annual-alert').textContent = 'None';

  // Rotate quotes
  const quotes = [
    "Consistency compounds. Keep logging, keep growing.",
    "Small steps lead to big results.",
    "Track it today, master it tomorrow.",
    "Every entry is a step toward clarity."
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quote').textContent = `“${quote}”`;
}

// Service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}


