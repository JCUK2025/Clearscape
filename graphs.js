document.addEventListener('DOMContentLoaded', () => {
  showCurrentDate();
  renderHistory();
});

function showCurrentDate() {
  const today = new Date();
  const formatted = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('current-date').textContent = formatted;
}

function renderHistory() {
  const container = document.getElementById('history-container');
  const data = JSON.parse(localStorage.getItem('transactions')) || [];

  const typeFilter = document.getElementById('filter-type').value;
  const showOutstanding = document.getElementById('filter-outstanding').checked;
  const monthFilter = document.getElementById('filter-month').value;

  container.innerHTML = '';

  data.forEach((tx, i) => {
    if (typeFilter && tx.type !== typeFilter) return;

    if (showOutstanding && tx.amountPaid >= tx.amountDue) return;

    if (monthFilter) {
      const txMonth = new Date(tx.transactionDate).toLocaleString('en-GB', { month: 'long' });
      if (txMonth !== monthFilter) return;
    }

    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.innerHTML = `
      <strong>${tx.customerName || 'Unnamed Client'}</strong> — ${tx.transactionDate || 'No Date'}<br>
      ${tx.type}: ${tx.jobType}<br>
      Due: £${tx.amountDue} | Paid: £${tx.amountPaid}<br>
      ${tx.notes ? '📝 ' + tx.notes : ''}
      <div class="entry-actions">
        <button onclick="editTransaction(${i})">✏️</button>
        <button onclick="deleteTransaction(${i})">🗑️</button>
        ${tx.amountPaid < tx.amountDue ? `<button onclick="markAsPaid(${i})">💳</button>` : ''}
      </div>
    `;
    container.appendChild(entry);
  });
}

function editTransaction(index) {
  const data = JSON.parse(localStorage.getItem('transactions')) || [];
  const tx = data[index];
  localStorage.setItem('editTransaction', JSON.stringify(tx));
  data.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(data));
  window.location.href = 'index.html';
}

function deleteTransaction(index) {
  const data = JSON.parse(localStorage.getItem('transactions')) || [];
  if (confirm("Delete this transaction?")) {
    data.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(data));
    renderHistory();
  }
}

function markAsPaid(index) {
  const data = JSON.parse(localStorage.getItem('transactions')) || [];
  data[index].amountPaid = data[index].amountDue;
  localStorage.setItem('transactions', JSON.stringify(data));
  renderHistory();
}

function clearAllTransactions() {
  if (confirm("Delete all transactions?")) {
    localStorage.removeItem('transactions');
    renderHistory();
  }
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

function goToDashboard() {
  window.location.href = "index.html";
}
