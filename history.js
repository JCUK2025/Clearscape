let data = JSON.parse(localStorage.getItem('clearscape-data') || '[]');
let filtered = [...data];

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});

function renderHistory() {
  const container = document.getElementById('tx-history');
  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<p>No transactions found.</p>';
    return;
  }

  filtered.forEach((tx, index) => {
    const div = document.createElement('div');
    div.className = 'tx-entry';
    div.innerHTML = `
      <p><strong>${tx.date}</strong> — ${tx.name} (${tx.type})</p>
      <p>Job: ${tx.jobType} | Due: £${tx.amountDue.toFixed(2)} | Paid: £${tx.amountPaid?.toFixed(2) || '0.00'}</p>
      <p>${tx.notes || ''}</p>
      <p>${tx.recurrence ? '🔁 Recurring' : ''}</p>
      <button onclick="markPaid(${index})">💰</button>
      <button onclick="editTx(${index})">✏️</button>
      <button onclick="deleteTx(${index})">🗑️</button>
    `;
    container.appendChild(div);
  });
}

function applyFilters() {
  const type = document.getElementById('filter-type').value;
  const recurrence = document.getElementById('filter-recurrence').value;
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;

  filtered = data.filter(tx => {
    const matchType = type ? tx.type === type : true;
    const matchRecurrence = recurrence === 'recurring' ? tx.recurrence :
                            recurrence === 'one-time' ? !tx.recurrence : true;
    const matchFrom = from ? tx.date >= from : true;
    const matchTo = to ? tx.date <= to : true;
    return matchType && matchRecurrence && matchFrom && matchTo;
  });

  renderHistory();
}

function clearFilters() {
  document.getElementById('filter-type').value = '';
  document.getElementById('filter-recurrence').value = '';
  document.getElementById('filter-from').value = '';
  document.getElementById('filter-to').value = '';
  filtered = [...data];
  renderHistory();
}

function markPaid(index) {
  data[index].amountPaid = data[index].amountDue;
  localStorage.setItem('clearscape-data', JSON.stringify(data));
  filtered = [...data];
  renderHistory();
}

function editTx(index) {
  alert('Edit feature coming soon!');
}

function deleteTx(index) {
  if (confirm('Delete this transaction?')) {
    data.splice(index, 1);
    localStorage.setItem('clearscape-data', JSON.stringify(data));
    filtered = [...data];
    renderHistory();
  }
}

function exportCSV() {
  const range = document.getElementById('export-range').value;
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;
  const selectedMonth = document.getElementById('export-month').value;
  const selectedYear = document.getElementById('export-year').value;

  let source = data;

  if (range === 'filtered') {
    source = filtered;
  }
  if (range === 'last30') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    source = data.filter(tx => new Date(tx.date) >= cutoff);
  }
  if (range === 'thisMonth') {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    source = data.filter(tx => {
      const d = new Date(tx.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }
  if (selectedMonth && selectedYear) {
    source = source.filter(tx => {
      const d = new Date(tx.date);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const y = String(d.getFullYear());
      return m === selectedMonth && y === selectedYear;
    });
  }

  const rows = [
    ['Date', 'Name', 'Type', 'Job Type', 'Amount Due', 'Amount Paid', 'Notes', 'Recurrence', 'End Date', 'Payment Method']
  ];

  let totalDue = 0, totalPaid = 0;
  let typeTotals = { sale: 0, expense: 0, deposit: 0, refund: 0, withdrawal: 0 };

  source.forEach(tx => {
    const due = tx.amountDue || 0;
    const paid = tx.amountPaid || 0;
    totalDue += due;
    totalPaid += paid;
    if (typeTotals[tx.type] !== undefined) typeTotals[tx.type] += due;

    rows.push([
      tx.date,
      tx.name,
      tx.type,
      tx.jobType,
      due,
      paid || '',
      tx.notes || '',
      tx.recurrence || '',
      tx.endDate || '',
      tx.paymentMethod || ''
    ]);
  });

  rows.push([]);
  rows.push(['Totals', '', '', '', totalDue.toFixed(2), totalPaid.toFixed(2)]);
  rows.push(['Sales Total', '', '', '', typeTotals.sale.toFixed(2), '']);
  rows.push(['Expenses Total', '', '', '', typeTotals.expense.toFixed(2), '']);
  rows.push(['Deposits Total', '', '', '', typeTotals.deposit.toFixed(2), '']);
  rows.push(['Refunds Total', '', '', '', typeTotals.refund.toFixed(2), '']);
  rows.push(['Withdrawals Total', '', '', '', typeTotals.withdrawal.toFixed(2), '']);

  const csv = rows.map(r => r.join(',')).join('\n');
  document.getElementById('csv-content').textContent = csv;
  document.getElementById('csv-preview').style.display = 'flex';
}

function downloadCSV() {
  const content = document.getElementById('csv-content').textContent;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `clearscape-history-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  closePreview();
}

function copyCSV() {
  const content = document.getElementById('csv-content').textContent;
  navigator.clipboard.writeText(content).then(() => {
    alert('CSV copied to clipboard!');
  });
}

function closePreview() {
  document.getElementById('csv-preview').style.display = 'none';
}

function scrollToLatest() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function goHome() {
  window.location.href = 'index.html';
}


