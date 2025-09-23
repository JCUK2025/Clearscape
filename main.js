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
  const amount = parseFloat(document.getElementById('amount').value);
  const note = document.getElementById('note').value.trim();

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid date and amount.");
    return;
  }

  transactions.push({ date, type, amount, note });
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  updateTable();
}

function updateTable() {
  const table = document.getElementById('transactionTable');
  table.innerHTML = '';
  transactions.forEach(t => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>£${t.amount.toFixed(2)}</td>
      <td>${t.note}</td>
    `;
    table.appendChild(row);
  });
}

