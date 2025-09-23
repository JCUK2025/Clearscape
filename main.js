let transactions = [];
let recurringEntries = [];

window.onload = () => {
  const saved = localStorage.getItem('clearscapeData');
  if (saved) transactions = JSON.parse(saved);
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
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('client').value = '';
  updateTable();
}

function deleteTransaction(index) {
  if (confirm("Delete this transaction?")) {
    transactions.splice(index, 1);
    localStorage.setItem('clearscapeData', JSON.stringify(transactions));
    updateTable();
  }
}

function editTransaction(index, field, value) {
  transactions[index][field] = value;
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
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

  let balance = 0, totalSales = 0, totalExpenses = 0;
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
      <td><input type="date" value="${t.date}" onchange="editTransaction(${index}, 'date', this.value)" /></td>
      <td>
        <select onchange="editTransaction(${index}, 'type', this.value)">
          <option value="Sale" ${t.type === 'Sale' ? 'selected' : ''}>Sale</option>
          <option value="Expense" ${t.type === 'Expense' ? 'selected' : ''}>Expense</option>
        </select>
      </td>
      <td>
        <select onchange="editTransaction(${index}, 'category', this.value)">
          ${[...document.getElementById('category').options].map(opt =>
            `<option value="${opt.value}" ${opt.value === t.category ? 'selected' : ''}>${opt.text}</option>`
          ).join('')}
        </select>
      </td>
      <td><input type="number" value="${t.amount}" onchange="editTransaction(${index}, 'amount', parseFloat(this.value))" /></td>
      <td><input type="text" value="${t.note}" onchange="editTransaction(${index}, 'note', this.value)" /></td>
      <td><input type="text" value="${t.client}" onchange="editTransaction(${index}, 'client', this.value)" /></td>
      <td><button onclick="deleteTransaction(${index})">🗑️</button></td>
    `;
    table.appendChild(row);

    const signed = t.type === 'Expense' ? -t.amount : t.amount;
    balance += signed;
    if (t.type === 'Sale') totalSales += t.amount;
    else totalExpenses += t.amount;

    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;

    const month = t.date.slice(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + signed;
  });

  document.getElementById('totalSales').textContent = totalSales.toFixed(2);
  document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
  document.getElementById('netBalance').textContent = (totalSales - totalExpenses).toFixed(2);

  const topCats = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)
    .join(', ');
  document.getElementById('topCategories').textContent = topCats || '—';

  drawCharts(categoryTotals, monthlyTotals);
}

function drawCharts(categoryTotals, monthlyTotals) {
  const pieCtx = document.getElementById('categoryChart').getContext('2d');
  const lineCtx = document.getElementById('monthlyChart').getContext('2d');

  if (window.pieChart) window.pieChart.destroy();
  if (window.lineChart) window.lineChart.destroy();

  const pieLabels = Object.keys(categoryTotals);
  const pieData = Object.values(categoryTotals);
  const pieColors = pieLabels.map(label => {
    const expenseCategories = ["Fuel", "Wages", "Materials", "Rent", "Insurance", "Machinery Servicing or Repair", "Other"];
    return expenseCategories.includes(label) ? "#e57373" : "#81c784";
  });

  window.pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: pieColors
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
  });

  const months = Object.keys(monthlyTotals).sort();
  const netValues = months.map(m => monthlyTotals[m]);
  const lineColors = netValues.map(v => v >= 0 ? "#388e3c" : "#d32f2f");

  window.lineChart = new Chart(lineCtx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Monthly Net (£)',
        data: netValues,
        backgroundColor: lineColors
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false } }
    }
  });
}

function exportCSV() {
  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = ["Date", "Type", "Category", "Amount (£)", "Note", "Client"];
  const rows = transactions.map(t => [t.date, t.type, t.category, t.amount.toFixed(2), `"${t.note || ''}"`, `"${t.client || ''}"`]);

  let csvContent = "data:text/csv;charset=utf-8," 
                 + headers.join(",") + "\n"
                 + rows.map(r => r.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "clearscape_transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadRecurring() {
  const saved = localStorage.getItem('clearscapeRecurring');
  if (saved) recurringEntries = JSON.parse(saved);
  renderRecurring();
}

function renderRecurring() {
  const container = document.getElementById('recurringList');
  container.innerHTML = recurringEntries.map((r, i) => `
    <div style="margin-bottom:10px; padding:10px; background:#fff; border-left:5px solid #66bb6a;">
      <strong>${r.type}</strong> – ${r.category} – £${r.amount} – ${r.note} (${r.frequency})
      <button onclick="deleteRecurring(${i})">🗑️</button>
    </div>
  `).join('');
}

function addRecurring() {
  const type = document.getElementById('recType').value;
  const category = document.getElementById('recCategory').value;
  const amount = parseFloat(document.getElementById('recAmount').value);
  const