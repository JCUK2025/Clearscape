let transactions = [];

window.onload = () => {
  const saved = localStorage.getItem('clearscapeData');
  if (saved) transactions = JSON.parse(saved);

  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  const table = document.getElementById('transactionTable');
  if (table) updateTable();

  const dashboard = document.getElementById('totalSales');
  if (dashboard) updateDashboard();
};

function addTransaction() {
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const note = document.getElementById('note').value.trim();
  const person = document.getElementById('person').value.trim();

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid date and amount.");
    return;
  }

  transactions.push({ date, type, category, amount, note, person });
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));

  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('person').value = '';

  updateDashboard();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  updateTable();
  updateDashboard();
}

function exportCSV() {
  let csv = "Date,Type,Category,Amount,Note,Person\n";
  transactions.forEach(t => {
    csv += `${t.date},${t.type},${t.category},${t.amount},${t.note},${t.person}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clearscape-transactions.csv";
  link.click();
}

function updateTable() {
  const table = document.getElementById('transactionTable');
  if (!table) return;

  table.innerHTML = '';
  transactions.forEach((t, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>£${t.amount.toFixed(2)}</td>
      <td>${t.note}</td>
      <td>${t.person}</td>
      <td><button onclick="deleteTransaction(${index})">Delete</button></td>
    `;
    table.appendChild(row);
  });
}

function updateDashboard() {
  const totalSalesEl = document.getElementById('totalSales');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const netBalanceEl = document.getElementById('netBalance');

  if (!totalSalesEl || !totalExpensesEl || !netBalanceEl) return;

  let totalSales = 0;
  let totalExpenses = 0;

  transactions.forEach(t => {
    if (t.type === 'Sale') totalSales += t.amount;
    else totalExpenses += t.amount;
  });

  totalSalesEl.textContent = totalSales.toFixed(2);
  totalExpensesEl.textContent = totalExpenses.toFixed(2);
  netBalanceEl.textContent = (totalSales - totalExpenses).toFixed(2);
}


