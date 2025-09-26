const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

const saleCategories = [
  "Landscaping",
  "Lawn Maintenance",
  "Hedge Trimming/Care",
  "Tree Surgery/Felling",
  "Fencing",
  "Machinery Servicing/Repair",
  "Other"
];

const expenseCategories = [
  "Fuel",
  "Wages",
  "Utilities",
  "Materials",
  "Equipment",
  "Uniform/Safety Equipment",
  "Other"
];

function formatCurrency(amount) {
  return "£" + parseFloat(amount).toFixed(2);
}

function updateDashboard() {
  let salesTotal = 0;
  let expenseTotal = 0;
  let depositTotal = 0;
  let outstandingTotal = 0;

  transactions.forEach(t => {
    if (t.type === "Sale") {
      salesTotal += t.amountPaid;
      outstandingTotal += (t.totalDue || 0) - t.amountPaid;
    } else if (t.type === "Expense") {
      expenseTotal += t.amountPaid;
    } else if (t.type === "Deposit") {
      depositTotal += t.amountPaid;
    }
  });

  const balance = depositTotal + salesTotal - expenseTotal;

  document.getElementById("salesTotal").textContent = formatCurrency(salesTotal);
  document.getElementById("expensesTotal").textContent = formatCurrency(expenseTotal);
  document.getElementById("depositTotal").textContent = formatCurrency(depositTotal);
  document.getElementById("outstandingTotal").textContent = formatCurrency(outstandingTotal);
  document.getElementById("balance").textContent = formatCurrency(balance);
}

function renderHistory() {
  const list = document.getElementById("transactionList");
  if (!list) return; // Only run if history section exists
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = "<p>No transactions recorded yet.</p>";
    return;
  }

  transactions.forEach((t, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      🗓️ ${t.date} | 💰 ${t.type} | 🧾 ${t.category} | 👤 ${t.name || "—"} | ${formatCurrency(t.amountPaid)} paid
      ${t.totalDue ? ` | ${formatCurrency(t.totalDue - t.amountPaid)} outstanding` : ""}
      | 💳 ${t.paymentMethod}
      ${t.notes ? `<br>📝 ${t.notes}` : ""}
      ${t.recurring && t.recurring !== "None" ? `<br>🔁 ${t.recurring} → Next: ${t.repeatDate}` : ""}
      <br>
      <button onclick="editTransaction(${index})">✏️ Edit</button>
      <button onclick="deleteTransaction(${index})">🗑️ Delete</button>
    `;
    list.appendChild(div);
  });

  updateDashboard();
}

function saveTransaction() {
  const index = document.getElementById("editIndex").value;
  const type = document.getElementById("type").value;

  const newTransaction = {
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
    transactions[index] = newTransaction;
    document.getElementById("editIndex").value = "";
  } else {
    transactions.push(newTransaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
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
}

function updateFormFields() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category");
  const totalDue = document.getElementById("totalDue");
  const amountPaid = document.getElementById("amountPaid");
  const recurring = document.getElementById("recurring");
  const repeatDate = document.getElementById("repeatDate");

  category.innerHTML = "";

  if (type === "Sale") {
    saleCategories.forEach(cat => {
      const option = document.createElement("option");
      option.textContent = cat;
      category.appendChild(option);
    });
    totalDue.style.display = "block";
    amountPaid.style.display = "block";
    recurring.style.display = "block";
    repeatDate.style.display = "block";
  } else if (type === "Expense") {
    expenseCategories.forEach(cat => {
      const option = document.createElement("option");
      option.textContent = cat;
      category.appendChild(option);
    });
    totalDue.style.display = "none";
    amountPaid.style.display = "block";
    recurring.style.display = "none";
    repeatDate.style.display = "none";
  } else {
    const option = document.createElement("option");
    option.textContent = "Deposit";
    category.appendChild(option);
    totalDue.style.display = "none";
    amountPaid.style.display = "block";
    recurring.style.display = "none";
    repeatDate.style.display = "none";
  }
}

function calculateNextFriday(frequency) {
  if (!frequency || frequency === "None") return "";

  const today = new Date();
  let nextDate = new Date(today);

  switch (frequency) {
    case "Weekly":
      nextDate.setDate(today.getDate() + 7);
      break;
    case "4-Weekly":
      nextDate.setDate(today.getDate() + 28);
      break;
    case "Monthly":
      nextDate.setMonth(today.getMonth() + 1);
      break;
    case "Quarterly":
      nextDate.setMonth(today.getMonth() + 3);
      break;
    case "Yearly":
      nextDate.setFullYear(today.getFullYear() + 1);
      break;
  }

  // Adjust to next Friday
  const day = nextDate.getDay();
  const offset = (5 - day + 7) % 7;
  nextDate.setDate(nextDate.getDate() + offset);

  return nextDate.toISOString().split("T")[0];
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
  document.getElementById("type").addEventListener("change", updateFormFields);
  updateFormFields();
  renderHistory();
});



