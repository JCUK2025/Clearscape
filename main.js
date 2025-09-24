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
};

function addTransaction() {
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
    return;
  }

  const transaction = {
    date,
    type,
    category,
    amount,
    note,
    person
  };

  if (isRecurring) {
    transaction.recurring = {
      frequency,
      nextDate: calculateNextDate(date, frequency)
    };
  }

  transactions.push(transaction);
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));

  document.getElementById('amount').value = '';
  document.getElementById('note').value = '';
  document.getElementById('person').value = '';
  if (document.getElementById('recurringToggle')) {
    document.getElementById('recurringToggle').checked = false;
    document.getElementById('recurringFrequency').style.display = 'none';
    document.getElementById('recurringLabel').style.display = 'none';
  }

  updateDashboard();
}

function calculateNextDate(currentDate, frequency) {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case '4-weekly':
      date.setDate(date.getDate() + 28);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.toISOString().split('T')[0];
}

function generateRecurringTransactions() {
  const today = new Date().toISOString().split('T')[0];
  let newEntries = [];

  transactions.forEach(t => {
    if (
      t.recurring &&
      typeof t.recurring.frequency === 'string' &&
      typeof t.recurring.nextDate === 'string' &&
      t.recurring.nextDate <= today
    ) {
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
    localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  }
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
  updateTable();
  updateDashboard();
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
    const row = document.createElement('tr');
    const recurTag = t.recurring ? `<span style="color:green;">🔁</span>` : '';
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.category}</td>
      <td>£${t.amount.toFixed(2)}</td>
      <td>${t.note} ${recurTag}</td>
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
