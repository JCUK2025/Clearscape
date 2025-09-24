let transactions = [];

window.onload = () => {
  const saved = localStorage.getItem('clearscapeData');
  if (saved) transactions = JSON.parse(saved);

  if (transactions.length > 0) {
    generateRecurringTransactions();
  }

  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  if (document.getElementById('transactionTable')) updateTable();
  if (document.getElementById('totalSales')) updateDashboard();

  const editIndex = localStorage.getItem('editIndex');
  if (editIndex !== null) {
    editTransaction(parseInt(editIndex));
    localStorage.removeItem('editIndex');
  }
};

function addTransaction() {
  const transaction = buildTransactionFromForm();
  if (!transaction) return;

  transactions.push(transaction);
  saveTransactions();
  resetForm();
  updateDashboard();
}

function updateTransaction() {
  const index = parseInt(document.getElementById('updateButton').dataset.index);
  const transaction = buildTransactionFromForm();
  if (!transaction) return;

  transactions[index] = transaction;
  saveTransactions();
  resetForm();
  updateDashboard();
  updateTable();
}

function buildTransactionFromForm() {
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const note = document.getElementById('note').value.trim();
  const person = document.getElementById('person').value.trim();
  const isRecurring = document.getElementById('recurringToggle')?.checked;
  const frequency = document.getElementById('recurringFrequency')?.value;

  if (!date || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid date and amount.");
    return null;
  }

  const transaction = { date, type, category, amount, note, person };

  if (isRecurring) {
    transaction.recurring = {
      frequency,
      nextDate: calculateNextDate(date, frequency)
    };
  }

  return transaction;
}

function resetForm() {
  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('person').value = '';
  document.getElementById('recurringToggle').checked = false;
  document.getElementById('recurringFrequency').style.display = 'none';
  document.getElementById('recurringLabel').style.display = 'none';
  document.getElementById('updateButton').style.display = 'none';
  document.getElementById('addButton').style.display = 'inline';
}

function saveTransactions() {
  try {
    localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  } catch (e) {
    console.error("Failed to save transactions:", e);
    alert("Unable to save. Try using a browser or server that supports localStorage.");
  }
}

function calculateNextDate(currentDate, frequency) {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'weekly': date.setDate(date.getDate() + 7); break;
    case '4-weekly': date.setDate(date.getDate() + 28); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'quarterly': date.setMonth(date.getMonth() + 3); break;
    case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
  }
  return date.toISOString().split('T')[0];
}

function generateRecurringTransactions() {
  const today = new Date().toISOString().split('T')[0];
  let newEntries = [];

  transactions.forEach(t => {
    if (t.recurring && t.recurring.nextDate <= today) {
      const newTransaction = {
        ...t,
        date: t.recurring.nextDate,
        recurring: {
          frequency: t.recurring.frequency,
          nextDate: calculateNextDate(t.recurring.nextDate, t.recurring.frequency)
        }
      };
      newEntries.push(newTransaction);
    }
  });

  if (newEntries.length > 0) {
    transactions = transactions.concat(newEntries);
    saveTransactions();
  }
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveTransactions();
  updateTable();
  updateDashboard();
}

function editTransaction(index) {
  const t = transactions[index];
  document.getElementById('date').value = t.date;
  document.getElementById('type').value = t.type;
  document.getElementById('category').value = t.category;
  document.getElementById('amount').value = t.amount;
  document.getElementById('note').value = t.note;
  document.getElementById('person').value = t.person;

  if (t.recurring) {
    document.getElementById('recurringToggle').checked = true;
    document.getElementById('recurringFrequency').style.display = 'block';
    document.getElementById('recurringLabel').style.display = 'block';
    document.getElementById('recurringFrequency').value = t.recurring.frequency;
  } else {
    document.getElementById('recurringToggle').checked = false;
    document.getElementById('recurringFrequency').style.display = 'none';
    document.getElementById('recurringLabel').style.display = 'none';
  }

  document.getElementById('addButton').style.display = 'none';
  document.getElementById('updateButton').style.display = 'inline';
  document.getElementById('updateButton').dataset.index = index;
}

function startEdit(index) {
  localStorage.setItem('editIndex', index);
  window.location.href = 'index.html';
}

function exportCSV() {
  let csv = "Date,Type,Category,Amount,Note,Person,Recurring\n";
  transactions.forEach(t => {
    const recur = t.recurring ? `${t.recurring.frequency} (next: ${t.recurring.nextDate})` : "";
    csv += `${t.date},${t.type},${t.category},${t.amount},${t.note},${t.person},${recur}\n`;
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
    const recurTag = t.recurring ? `<span style="color:green;">🔁</span>` : '';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>£${t.amount.toFixed(2)}</td>
      <td>${t.note} ${recurTag}</td>
      <td>${t.person}</td>
      <td>
        <button onclick="startEdit(${index})">Edit</button>
        <button onclick="deleteTransaction(${index})">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function updateDashboard() {
  const totalSalesEl = document.getElementById('totalSales');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const netBalanceEl = document.getElementById('netBalance');
  const monthlySalesEl = document.getElementById('monthlySales');
  const monthlyExpensesEl = document.getElementById('monthlyExpenses');
  const monthlyNetEl = document.getElementById('monthlyNet');

  let totalSales = 0, totalExpenses = 0, totalDeposits = 0;
  let monthlySales = 0, monthlyExpenses = 0, monthlyDeposits = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const isThisMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

    if (t.type === 'Sale') {
      totalSales += t.amount;
      if (isThisMonth) monthlySales += t.amount;
    } else if (t.type === 'Deposit') {
      totalDeposits += t.amount;
      if (isThisMonth) monthlyDeposits += t.amount;
    } else {
      totalExpenses += t.amount;
      if (isThisMonth) monthlyExpenses += t.amount;
    }
  });

  if (totalSalesEl) totalSalesEl.textContent = totalSales.toFixed(2);
  if (totalExpensesEl) totalExpensesEl.textContent = totalExpenses.toFixed(2);
  if (netBalanceEl) netBalanceEl.textContent = (totalSales + totalDeposits - totalExpenses).toFixed(2);

  if (monthlySalesEl) monthlySalesEl.textContent = monthlySales.toFixed(2);
  if (monthlyExpensesEl) monthlyExpensesEl.textContent = monthlyExpenses.to