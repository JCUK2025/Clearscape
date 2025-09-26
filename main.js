console.log("Clearscape Tracker: main.js loaded");

let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

function formatCurrency(amount) {
  return "£" + parseFloat(amount).toFixed(2);
}

function updateDashboard() {
  let sales = 0, expenses = 0, deposits = 0, outstanding = 0;

  transactions.forEach(t => {
    if (t.type === "Sale") {
      sales += t.amountPaid;
      outstanding += (t.totalDue || 0) - t.amountPaid;
    } else if (t.type === "Expense") {
      expenses += t.amountPaid;
    } else if (t.type === "Deposit") {
      deposits += t.amountPaid;
    }
  });

  const balance = deposits + sales - expenses;

  document.getElementById("salesTotal").textContent = formatCurrency(sales);
  document.getElementById("expensesTotal").textContent = formatCurrency(expenses);
  document.getElementById("depositTotal").textContent = formatCurrency(deposits);
  document.getElementById("outstandingTotal").textContent = formatCurrency(outstanding);
  document.getElementById("balance").textContent = formatCurrency(balance);
}

function renderHistory() {
  const list = document.getElementById("transactionList");
  if (!list) return;

  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = "<p>No transactions recorded yet.</p>";
    return;
  }

  transactions.forEach((t, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      🗓️ ${t.date} | 💰 ${t.type} | 🧾 ${t.category} | 👤 ${t.name || "—"} | ${formatCurrency(t.amountPaid)} paid
      ${t.totalDue ? ` | ${formatCurrency(t.totalDue - t.amountPaid)} outstanding` : ""}
      | 💳 ${t.paymentMethod}
      ${t.notes ? `<br>📝 ${t.notes}` : ""}
      ${t.recurring && t.recurring !== "None" ? `<br>🔁 ${t.recurring} → Next: ${t.repeatDate}` : ""}
    `;
    list.appendChild(div);
  });
}

function saveTransaction() {
  const type = document.getElementById("type").value;
  const transaction = {
    date: document.getElementById("date").value,
    type,
    name: document.getElementById("name").value,
    notes: document.getElementById("notes").value,
    category: document.getElementById("category").value,
    totalDue: type === "Sale" ? parseFloat(document.getElementById("totalDue").value) || 0 : null,
    amountPaid: parseFloat(document.getElementById("amountPaid").value) || 0,
    paymentMethod: document.getElementById("paymentMethod").value,
    recurring: document.getElementById("recurring").value,
    repeatDate: document.getElementById("repeatDate").value
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateDashboard();
  renderHistory(); // Update history if visible
  console.log("Transaction saved:", transaction);
}

document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  renderHistory(); // Run only if #transactionList exists
});




