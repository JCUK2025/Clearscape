// Splash screen logic
function enterApp() {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

// Idle timeout: reload after 5 minutes of inactivity
let idleTimer;
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => location.reload(), 300000); // 5 minutes
}
['click', 'mousemove', 'keydown'].forEach(evt =>
  document.addEventListener(evt, resetIdleTimer)
);
resetIdleTimer();

// Transaction form logic
const form = document.getElementById('tx-form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const desc = document.getElementById('desc').value;
  const amt = parseFloat(document.getElementById('amt').value);
  const type = document.getElementById('type').value;
  const tx = {
    description: desc,
    amount: amt,
    type,
    date: new Date().toISOString()
  };

  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  data.push(tx);
  localStorage.setItem('clearscape-data', JSON.stringify(data));
  form.reset();
  updateSummary();
});

// Business summary logic
function updateSummary() {
  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  let sales = 0, expenses = 0, repayments = 0;

  data.forEach(tx => {
    if (tx.type === 'sale') sales += tx.amount;
    if (tx.type === 'expense') expenses += tx.amount;
    if (tx.type === 'repayment') repayments += tx.amount;
  });

  document.getElementById('sales').textContent = sales.toFixed(2);
  document.getElementById('expenses').textContent = expenses.toFixed(2);
  document.getElementById('repayments').textContent = repayments.toFixed(2);
  document.getElementById('profit').textContent = (sales - expenses - repayments).toFixed(2);
}
updateSummary();

// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
