document.addEventListener('DOMContentLoaded', () => {
  showCurrentDate();
  generateSmartInfo();
  updateDashboardSummary();
});

function showCurrentDate() {
  const today = new Date();
  const formatted = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('current-date').textContent = formatted;
}

function generateSmartInfo() {
  const infoList = document.getElementById('info-list');
  const messages = [
    "Track every penny — clarity builds confidence.",
    "Consistency beats intensity — log your day.",
    "Emotionally intelligent reminders foster loyalty."
  ];
  infoList.innerHTML = messages.map(msg => `<li>${msg}</li>`).join('');
}

function updateJobTypes() {
  const type = document.getElementById('type').value;
  const jobType = document.getElementById('jobType');
  jobType.innerHTML = '';

  let options = [];

  if (type === 'Sale') {
    options = ['Lawn Maintenance', 'Hedge Trimming', 'Landscaping', 'Fencing', 'Patio / Decking', 'Tree Surgery', 'Servicing / Repair', 'Other'];
  } else if (type === 'Expense') {
    options = ['Wages', 'Utilities', 'Services', 'Fuel', 'Petty Cash', 'Materials', 'Rent', 'Equipment', 'Uniform / Safety Equipment', 'Other'];
  } else if (type === 'Deposit') {
    options = ['Cash Injection', 'Loan', 'Tax Rebate', 'Other'];
  } else if (type === 'Refund') {
    options = ['Goodwill Gesture', 'Job Cancellation', 'Other'];
  } else if (type === 'Withdrawal') {
    options = ['Cash Withdrawal', 'Other'];
  }

  jobType.innerHTML = `<option value="">Select Job Type</option>` + options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
}

function applyPartPayment() {
  const due = parseFloat(document.getElementById('amountDue').value);
  if (!isNaN(due)) {
    const part = Math.round(due * 0.5);
    document.getElementById('amountPaid').value = part;
  }
}

function saveTransaction() {
  const transaction = {
    customerName: document.getElementById('customerName').value.trim(),
    transactionDate: document.getElementById('transactionDate').value,
    jobType: document.getElementById('jobType').value,
    type: document.getElementById('type').value,
    amountDue: parseFloat(document.getElementById('amountDue').value) || 0,
    amountPaid: parseFloat(document.getElementById('amountPaid').value) || 0,
    recurrence: document.getElementById('recurrence').value,
    recurrenceEnd: document.getElementById('recurrenceEnd').value,
    paymentMethod: document.getElementById('paymentMethod').value,
    notes: document.getElementById('notes').value.trim()
  };

  const data = JSON.parse(localStorage.getItem('transactions')) || [];
  data.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(data));

  updateDashboardSummary();
  generateSmartInfo();
  alert("Transaction saved!");
}

function updateDashboardSummary() {
  const data = JSON.parse(localStorage.getItem('transactions')) || [];
  let income = 0, expense = 0, outstanding = 0;

  data.forEach(tx => {
    if (tx.type === 'Sale' || tx.type === 'Deposit') {
      income += tx.amountPaid;
    } else if (tx.type === 'Expense' || tx.type === 'Withdrawal' || tx.type === 'Refund') {
      expense += tx.amountPaid;
    }

    if (tx.amountPaid < tx.amountDue) {
      outstanding += (tx.amountDue - tx.amountPaid);
    }
  });

  document.getElementById('total-income').textContent = `💰 Income: £${income}`;
  document.getElementById('total-expense').textContent = `📉 Expenses: £${expense}`;
  document.getElementById('total-outstanding').textContent = `🧾 Outstanding: £${outstanding}`;
  document.getElementById('net-balance').textContent = `⚖️ Balance: £${income - expense}`;
}

function downloadCSV() {
  const data = JSON.parse(localStorage.getItem('transactions')) || [];
  if (data.length === 0) return alert("No transactions to export.");

  const rows = [
    ["Customer Name", "Date", "Type", "Job", "Due", "Paid", "Recurrence", "End Date", "Method", "Notes"]
  ];

  data.forEach(tx => {
    rows.push([
      tx.customerName, tx.transactionDate, tx.type, tx.jobType,
      tx.amountDue, tx.amountPaid, tx.recurrence, tx.recurrenceEnd,
      tx.paymentMethod, tx.notes
    ]);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "clearscape_transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearAllTransactions() {
  if (confirm("Are you sure you want to delete all transactions?")) {
    localStorage.removeItem('transactions');
    updateDashboardSummary();
    alert("All transactions cleared.");
  }
}

function goToDashboard() {
  window.location.href = "index.html";
}



