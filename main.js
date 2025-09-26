console.log("Clearscape Tracker: main.js loaded");

let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

function formatCurrency(amount) {
  return "£" + parseFloat(amount).toFixed(2);
}

function updateDashboard() {
  const salesEl = document.getElementById("salesTotal");
  const expensesEl = document.getElementById("expensesTotal");
  const depositsEl = document.getElementById("depositTotal");
  const outstandingEl = document.getElementById("outstandingTotal");
  const balanceEl = document.getElementById("balance");

  if (!salesEl || !expensesEl || !depositsEl || !outstandingEl || !balanceEl) {
    console.log("Dashboard elements not found — skipping updateDashboard");
    return;
  }

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

  salesEl.textContent = formatCurrency(sales);
  expensesEl.textContent = formatCurrency(expenses);
  depositsEl.textContent = formatCurrency(deposits);
  outstandingEl.textContent = formatCurrency(outstanding);
  balanceEl.textContent = formatCurrency(balance);
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
      <br>
      <button onclick="editTransaction(${i})">✏️ Edit</button>
      <button onclick="deleteTransaction(${i})">🗑️ Delete</button>
    `;
    list.appendChild(div);
  });
}

function saveTransaction() {
  const index = document.getElementById("editIndex").value;
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
    recurring: type === "Sale" ? document.getElementById("recurring").value : null,
    repeatDate: type === "Sale" ? calculateNextFriday(document.getElementById("recurring").value) : null
  };

  if (index !== "") {
    transactions[index] = transaction;
    document.getElementById("editIndex").value = "";
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateDashboard();
  renderHistory();
  resetForm();
}

function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("date").value = t.date;
  document.getElementById("type").value = t.type;
  document.getElementById("name").value = t.name || "";
  document.getElementById("notes").value = t.notes || "";
  document.getElementById("category").value = t.category;
  document.getElementById("totalDue").value = t.totalDue || "";
  document.getElementById("amountPaid").value = t.amountPaid || "";
  document.getElementById("paymentMethod").value = t.paymentMethod || "";
  document.getElementById("recurring").value = t.recurring || "None";
  document.getElementById("repeatDate").value = t.repeatDate || "";
  document.getElementById("editIndex").value = index;
  updateFormFields();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHistory();
  updateDashboard();
}

function updateFormFields() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category");
  category.innerHTML = "";

  const saleCategories = [
    "Landscaping", "Lawn Maintenance", "Hedge Trimming/Care", "Tree Surgery/Felling",
    "Fencing", "Machinery Servicing/Repair", "Other"
  ];

  const expenseCategories = [
    "Fuel", "Wages", "Utilities", "Materials", "Equipment", "Uniform/Safety Equipment", "Other"
  ];

  const cats = type === "Sale" ? saleCategories :
               type === "Expense" ? expenseCategories : ["Deposit"];

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.textContent = c;
    category.appendChild(opt);
  });

  document.getElementById("totalDue").style.display = type === "Sale" ? "block" : "none";
  document.getElementById("recurring").style.display = type === "Sale" ? "block" : "none";
  document.getElementById("repeatDate").style.display = type === "Sale" ? "block" : "none";
}

function calculateNextFriday(frequency) {
  if (!frequency || frequency === "None") return "";

  const today = new Date();
  let next = new Date(today);

  switch (frequency) {
    case "Weekly": next.setDate(today.getDate() + 7); break;
    case "4-Weekly": next.setDate(today.getDate() + 28); break;
    case "Monthly": next.setMonth(today.getMonth() + 1); break;
    case "Quarterly": next.setMonth(today.getMonth() + 3); break;
    case "Yearly": next.setFullYear(today.getFullYear() + 1); break;
  }

  const offset = (5 - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + offset);

  return next.toISOString().split("T")[0];
}

function resetForm() {
  document.getElementById("date").value = "";
  document.getElementById("type").value = "Sale";
  document.getElementById("name").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("totalDue").value = "";
  document.getElementById("amountPaid").value = "";
  document.getElementById("paymentMethod").value = "Cash";
  document.getElementById("recurring").value = "None";
  document.getElementById("repeatDate").value = "";
  document.getElementById("editIndex").value = "";
  updateFormFields();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("type")) {
    document.getElementById("type").addEventListener("change", updateFormFields);
    updateFormFields();
  }
  updateDashboard();
  renderHistory();
});






