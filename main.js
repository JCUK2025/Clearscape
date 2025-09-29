document.addEventListener('DOMContentLoaded', () => {
  applySeasonTheme();
  applySplashTheme();
  document.getElementById('current-date').textContent = new Date().toDateString();
  document.getElementById('tx-form').addEventListener('submit', saveTransaction);
  document.getElementById('type').addEventListener('change', updateJobType);
  loadData();
});

function enterApp() {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

function applySeasonTheme() {
  const month = new Date().getMonth();
  let season = 'spring';
  if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else if (month >= 8 && month <= 10) season = 'autumn';
  else season = 'winter';
  document.body.classList.add(`season-${season}`);
}

function applySplashTheme() {
  const month = new Date().getMonth();
  const splash = document.querySelector('#splash-content');
  if (!splash) return;
  if (month >= 2 && month <= 4) splash.classList.add('spring');
  else if (month >= 5 && month <= 7) splash.classList.add('summer');
  else if (month >= 8 && month <= 10) splash.classList.add('autumn');
  else splash.classList.add('winter');
}

function updateJobType() {
  const selected = document.getElementById('type').value;
  const jobType = document.getElementById('job-type');
  let options = [];

  if (selected === 'sale') options = ['Consultation', 'Design', 'Development', 'Other'];
  else if (selected === 'expense') options = ['Software', 'Hardware', 'Marketing', 'Other'];
  else if (selected === 'deposit') options = ['Client Advance', 'Investment', 'Other'];
  else if (selected === 'refund') options = ['Client Refund', 'Service Issue', 'Other'];
  else if (selected === 'withdrawal') options = ['ATM', 'Petty Cash', 'Float', 'Other'];

  jobType.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
}

function saveTransaction(e) {
  e.preventDefault();
  const tx = {
    date: document.getElementById('date').value,
    type: document.getElementById('type').value,
    jobType: document.getElementById('job-type').value,
    name: document.getElementById('desc').value,
    amountDue: parseFloat(document.getElementById('amt-due').value),
    amountPaid: parseFloat(document.getElementById('amt-paid').value) || 0,
    notes: document.getElementById('notes').value,
    recurrence: document.getElementById('recurrence').value,
    paymentMethod: document.getElementById('payment-method').value
  };

  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  data.push(tx);
  localStorage.setItem('clearscape-data', JSON.stringify(data));
  document.getElementById('tx-form').reset();
  loadData();
}

function loadData() {
  const data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
  updateSummary(data);
  updateReminders(data, data.filter(tx => tx.amountDue > tx.amountPaid).length);
}

function updateSummary(data) {
  let sales = 0, expenses = 0, deposits = 0, refunds = 0, withdrawals = 0, outstanding = 0;

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
    if (tx.type === 'withdrawal') withdrawals += amt;
  });

  const balance = (sales - refunds) + deposits - expenses - withdrawals;

  highlightMetric('sales', sales);
  highlightMetric('expenses', expenses);
  highlightMetric('deposits', deposits);
  highlightMetric('refunds', refunds);
  highlightMetric('withdrawals', withdrawals);
  highlightMetric('outstanding', outstanding);
  highlightMetric('balance', balance);
}

function highlightMetric(id, value) {
  document.getElementById(id).textContent = `£${value.toFixed(2)}`;
}

function updateReminders(data, count) {
  const reminders = [];

  if (count > 0) reminders.push(`📌 You have ${count} unpaid transactions.`);
  if (data.some(tx => tx.recurrence)) reminders.push(`📌 Review your recurring transactions.`);
  if (data.some(tx => tx.type === 'refund')) reminders.push(`📌 Check refund reasons for clarity.`);
  if (data.length >= 10) reminders.push(`📌 Consider exporting your history for backup.`);

  const withdrawalTotal = data.filter(tx => tx.type === 'withdrawal')
                              .reduce((sum, tx) => sum + (tx.amountDue || 0), 0);
  if (withdrawalTotal > 500) reminders.push(`⚠️ High cash withdrawal activity (£${withdrawalTotal.toFixed(2)}).`);

  const selected = reminders.sort(() => 0.5 - Math.random()).slice(0, 3);
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



