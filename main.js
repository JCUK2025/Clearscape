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
  recurringEntries.push({ type, category, amount, note, frequency });
  localStorage.setItem('clearscapeRecurring', JSON.stringify(recurringEntries));
  document.getElementById('recAmount').value = '';
  document.getElementById('recNote').value = '';
  renderRecurring();


function deleteRecurring(index) {
  if (confirm("Delete this recurring entry?")) {
    recurringEntries.splice(index, 1);
    localStorage.setItem('clearscapeRecurring', JSON.stringify(recurringEntries));
    renderRecurring();
  }
}

function addRecurringEntries() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  recurringEntries.forEach(r => {
    const match = r.frequency === 'daily' ? today : month;
    const already = transactions.some(t =>
      (r.frequency === 'daily' ? t.date === today : t.date.startsWith(month)) &&
      t.note === r.note && t.category === r.category
    );
    if (!already) {
      transactions.push({ date: today, ...r, client: "" });
    }
  });

  localStorage.setItem('clearscapeData', JSON.stringify(transactions));
}

