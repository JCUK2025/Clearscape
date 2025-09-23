let transactions = [];

window.onload = () => {
  const saved = localStorage.getItem('clearscapeData');
  if (saved) transactions = JSON.parse(saved);
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  updateTable();
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
  updateTable();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  updateTable();
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
  table.innerHTML = '';

  let totalSales = 0;
  let totalExpenses = 0;

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

    if (t.type === 'Sale') totalSales += t.amount;
    else totalExpenses += t.amount;
  });

  document.getElementById('totalSales').textContent = totalSales.toFixed(2);
  document.getElementById('totalExpenses').textContent = totalExpenses.toFixed(2);
  document.getElementById('netBalance').textContent = (totalSales - totalExpenses).toFixed(2);
}

