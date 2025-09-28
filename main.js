// Splash screen logic
function enterApp() {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  resetInactivityTimer();
}

// Inactivity reset (5 minutes)
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    location.reload(); // Returns to splash
  }, 300000); // 5 minutes
}
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);

// Transaction form logic
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('desc').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!desc || isNaN(amount)) return;

    const transaction = {
      description: desc,
      amount: amount,
      type: type,
      date: new Date().toISOString()
    };

    saveTransaction(transaction);
    form.reset();
    updateSummary();
  });

  updateSummary();
});

// Save transaction to localStorage
function saveTransaction(tx) {
  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  data.push(tx);
  localStorage.setItem('clearscape-data', JSON.stringify(data));
}

// Update monthly summary
function updateSummary() {
  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let sales = 0, expenses = 0, repayments = 0;

  data.forEach(tx => {
    const txDate = new Date(tx.date);
    if (txDate.getMonth() === month && txDate.getFullYear() === year) {
      if (tx.type === 'sale') sales += tx.amount;
      if (tx.type === 'expense') expenses += tx.amount;
      if (tx.type === 'repayment') repayments += tx.amount;
    }
  });

  const profit = sales - expenses;
  document.getElementById('summary').textContent =
    `Sales: £${sales.toFixed(2)} | Expenses: £${expenses.toFixed(2)} | Repayments: £${repayments.toFixed(2)} | Profit: £${profit.toFixed(2)}`;
}
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
