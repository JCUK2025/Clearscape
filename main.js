console.log("Clearscape Tracker: main.js loaded");

let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

const saleCategories = [
  "Landscaping", "Lawn Maintenance", "Hedge Trimming/Care", "Tree Surgery/Felling",
  "Fencing", "Machinery Servicing/Repair", "Other"
];

const expenseCategories = [
  "Fuel", "Wages", "Utilities", "Materials", "Equipment", "Uniform/Safety Equipment", "Other"
];

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

  const update = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatCurrency(val);
  };

  update("salesTotal", sales);
  update("expensesTotal", expenses);
  update("depositTotal", deposits);
  update("outstandingTotal", outstanding);
  update("balance", balance);
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

  updateDashboard();
}

function saveTransaction() {
  const type = get("type").value;

  const transaction = {
    date: get("date").value,
    type,
    name: get("name").value,
    notes: get("notes").value,
    category: get("category").value,
    totalDue: type === "Sale" ? parseFloat(get("totalDue").value) || 0 : null,
    amountPaid: parseFloat(get("amountPaid").value) || 0,
    paymentMethod: get("paymentMethod").value,
    recurring: type === "Sale" ? get("recurring").value : null,
    repeatDate: type === "Sale" ? calculateNextFriday(get("recurring").value) : null
  };

  const index = get("editIndex").value;
  if (index !== "") {
    transactions[index] = transaction;
    get("editIndex").value = "";
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHistory();
  resetForm();
}

function editTransaction(index) {
  const t = transactions[index];
  get("date").value = t.date;
  get("type").value = t.type;
  get("name").value = t.name || "";
  get("notes").value = t.notes || "";
  get("category").value = t.category;
  get("totalDue").value = t.totalDue || "";
  get("amountPaid").value = t.amountPaid || "";
  get("paymentMethod").value = t.paymentMethod || "";
  get("recurring").value = t.recurring || "None";
  get("repeatDate").value = t.repeatDate || "";
  get("editIndex").value = index;
  updateFormFields();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHistory();
}

function updateFormFields() {
  const type = get("type").value;
  const category = get("category");
  category.innerHTML = "";

  const cats = type === "Sale" ? saleCategories :
               type === "Expense" ? expenseCategories : ["Deposit"];

  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.textContent = c;
    category.appendChild(opt);
  });

  get("totalDue").style.display = type === "Sale" ? "block" : "none";
  get("recurring").style.display = type === "Sale" ? "block" : "none";
  get("repeatDate").style.display = type === "Sale" ? "block" : "none";
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
  get("date").value = "";
  get("type").value = "Sale";
  get("name").value = "";
  get("notes").value = "";
  get("totalDue").value = "";
  get("amountPaid").value = "";
  get("paymentMethod").value = "Cash";
  get("recurring").value = "None";
  get("repeatDate").value = "";
  get("editIndex").value = "";
  updateFormFields();
}

function get(id) {
  return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", () => {
  if (get("type")) get("type").addEventListener("change", updateFormFields);
  updateFormFields();
  renderHistory();
});



