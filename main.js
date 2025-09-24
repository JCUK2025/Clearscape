let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let editingIndex = null;

// Auto-fill today's date on load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  updateDashboard();
});

function formatCurrency(amount) {
  return '£' + amount.toLocaleString('en-GB', { minimumFractionDigits: 2 });
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransaction() {
  const tx = {
    date: document.getElementById('date').value,
    type: document.getElementById('type').value,
    category: document.getElementById('category').value,
    amount: parseFloat(document.getElementById('amount').value),
    note: document.getElementById('note').value,
    person: document.getElementById('person').value,
    recurring: document.getElementById('recurringToggle').checked,
    frequency: document.getElementById('recurringFrequency').value
  };

  if (editingIndex !== null) {
    transactions[editingIndex] = tx;
    editingIndex = null;
    document.getElementById('updateButton').style.display = 'none';
    document.getElementById('addButton').style.display = 'inline-block';
  } else {
    transactions.push(tx);
  }

  saveTransactions();
  clearForm();
  updateDashboard();
}

function updateTransaction() {
  addTransaction(); // reuse logic
}

function clearForm() {
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  document.getElementById('type').value = 'Sale';
  document.getElementById('category').value = 'Other';
  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('person').value = '';
  document.getElementById('recurringToggle').checked = false;
  document.getElementById('recurringFrequency').style.display = 'none';
  document.getElementById('recurringLabel').style.display = 'none';
}

function updateDashboard() {
  let totalSales = 0;
  let totalExpenses = 0;
  let monthlySales = 0;
  let monthlyExpenses = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    const amount = parseFloat(tx.amount);
    if (tx.type === 'Sale' || tx.type === 'Deposit') {
      totalSales += amount;
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        monthlySales += amount;
      }
    } else {
      totalExpenses += amount;
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        monthlyExpenses += amount;
      }
    }
  });

  document.getElementById('totalSales').textContent = formatCurrency(totalSales);
  document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('netBalance').textContent = formatCurrency(totalSales - totalExpenses);
  document.getElementById('monthlySales').textContent = formatCurrency(monthlySales);
  document.getElementById('monthlyExpenses').textContent = formatCurrency(monthlyExpenses);
  document.getElementById('monthlyNet').textContent = formatCurrency(monthlySales - monthlyExpenses);
}

function loadTransaction(index) {
  const tx = transactions[index];
  document.getElementById('date').value = tx.date;
  document.getElementById('type').value = tx.type;
  document.getElementById('category').value = tx.category;
  document.getElementById('amount').value = tx.amount;
  document.getElementById('note').value = tx.note;
  document.getElementById('person').value = tx.person;
  document.getElementById('recurringToggle').checked = tx.recurring;
  document.getElementById('recurringFrequency').value = tx.frequency || 'monthly';
  document.getElementById('recurringFrequency').style.display = tx.recurring ? 'block' : 'none';
  document.getElementById('recurringLabel').style.display = tx.recurring ? 'block' : 'none';

  editingIndex = index;
  document.getElementById('addButton').style.display = 'none';
  document.getElementById('updateButton').style.display = 'inline-block';
}

function clearAllTransactions() {
  if (confirm("Are you sure you want to delete all transactions?")) {
    transactions = [];
    saveTransactions();
    updateDashboard();
  }
}

