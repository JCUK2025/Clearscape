let transactions = [];
let recurringEntries = [];

navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

window.onload = () => {
  try {
    const saved = localStorage.getItem('clearscapeData');
    if (saved) transactions = JSON.parse(saved);
  } catch (e) {
    console.warn("LocalStorage read failed:", e);
  }

  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  loadRecurring();
  updateTable();
  addRecurringEntries();
};

function addTransaction() {
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const note = document.getElementById('note').value.trim();
  const client = document.getElementById('client').value.trim();

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid date and amount.");
    return;
  }

  transactions.push({ date, type, category, amount, note, client });

  try {
    localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  } catch (e) {
    console.warn("LocalStorage write failed:", e);
  }

  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('client').value = '';
  updateTable();
}

function updateTable() {
  const table = document.getElementById('transactionTable');
  table.innerHTML = '';
  const start = document.getElementById('filterStart').value;
  const end = document.getElementById('filterEnd').value;
  const type = document.getElementById('filterType').value;
  const category = document.getElementById('filterCategory').value;
  const keyword = document.getElementById('filterKeyword').value.toLowerCase();

  let totalSales = 0, totalExpenses = 0;
  const categoryTotals = {};
  const monthlyTotals = {};

  transactions.forEach((t, index) => {
    if (start && t.date < start) return;
    if (end && t.date > end) return;
    if (type && t.type !== type) return;
    if (category && t.category !== category) return;
    if (keyword && !`${t.note} ${t.client}`.toLowerCase().includes(keyword)) return;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>£${t.amount.toFixed(2)}</td>
      <td>${t.note}</td>
      <td>${t.client}</td>
    `;
    table.appendChild(row);

    const signed = t.type === 'Expense' ? -t.amount : t.amount;
    if (t.type === 'Sale') totalSales += t.amount;
    else totalExpenses += t.amount;

    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    const month = t.date.slice(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + signed;
  });

  document.getElementById('totalSales').textContent = totalSales.toFixed(2);
  document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
  document.getElementById('netBalance').textContent = (totalSales - totalExpenses).toFixed(2);

  renderClientDashboard(generateClientStats());
}

function generateClientStats() {
  const stats = {};
  transactions.forEach(t => {
    if (!t.client) return;
    if (!stats[t.client]) {
      stats[t.client] = { total: 0, count: 0, lastDate: t.date };
    }
    stats[t.client].total += t.amount;
    stats[t.client].count += 1;
    if (t.date > stats[t.client].lastDate) stats[t.client].lastDate = t.date;
  });
  return stats;
}

function renderClientDashboard(stats) {
  const container = document.getElementById('clientDashboard');
  container.innerHTML = Object.entries(stats).map(([name, data]) => {
    const avg = (data.total / data.count).toFixed(2);
    return `
      <div style="margin-bottom:10px; padding:10px; background:#f9f9f9; border-left:5px solid #2196f3;">
        <strong>${name}</strong><br>
        Total: £${data.total.toFixed(2)}<br>
        Transactions: ${data.count}<br>
        Avg Sale: £${avg}<br>
        Last: ${data.lastDate}
      </div>
    `;
  }).join('');
}

function loadRecurring() {
  try {
    const saved = localStorage.getItem('clearscapeRecurring');
    if (saved) recurringEntries = JSON.parse(saved);
  } catch (e) {
    console.warn("LocalStorage read failed:", e);
  }
}

function addRecurringEntries() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  recurringEntries.forEach(r => {
    const match = r.frequency === 'daily' ? today : month;
    const already = transactions.some(t =>
      (r.frequency === 'daily' ? t.date === today : t.date.startsWith(month)) &&
      t.note === r.note && t.category === r.category
    );
    if (!already) {
      transactions.push({ date: today, ...r, client: "" });
    }
  });

  try {
    localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  } catch (e) {
    console.warn("LocalStorage write failed:", e);
  }
