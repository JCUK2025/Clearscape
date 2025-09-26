// Splash screen exit via button
function enterApp() {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);
  }
}

// Initialize transactions from localStorage
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Save transaction
function saveTransaction() {
  const transaction = {
    date: document.getElementById("date").value,
    type: document.getElementById("type").value,
    name: document.getElementById("name").value,
    notes: document.getElementById("notes").value,
    category: document.getElementById("category").value,
    totalDue: parseFloat(document.getElementById("totalDue").value) || 0,
    amountPaid: parseFloat(document.getElementById("amountPaid").value) || 0,
    paymentMethod: document.getElementById("paymentMethod").value,
    recurring: document.getElementById("recurring").value,
    repeatDate: document.getElementById("repeatDate").value
  };

  const editIndex = document.getElementById("editIndex").value;
  if (editIndex) {
    transactions[editIndex] = transaction;
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  resetForm();
  updateDashboard();
  renderHistory();
}

// Reset form
function resetForm() {
  document.querySelector("form").reset();
  document.getElementById("editIndex").value = "";
  updateFormFields();
}

// Update form fields based on type
function updateFormFields() {
  const type = document.getElementById("type").value;
  const category = document.getElementById("category");
  category.innerHTML = "";

  const categories = {
    Sale: ["Landscaping", "Consulting", "Other"],
    Expense: ["Fuel", "Supplies", "Other"],
    Deposit: ["Deposit"]
  };

  categories[type].forEach(cat => {
    const option = document.createElement("option");
    option.textContent = cat;
    category.appendChild(option);
  });
}

// Update dashboard totals
function updateDashboard() {
  let sales = 0, expenses = 0, deposits = 0, outstanding = 0;

  transactions.forEach(t => {
    if (t.type === "Sale") {
      sales += t.amountPaid;
      outstanding += t.totalDue - t.amountPaid;
    } else if (t.type === "Expense") {
      expenses += t.amountPaid;
    } else if (t.type === "Deposit") {
      deposits += t.amountPaid;
    }
  });

  document.getElementById("salesTotal").textContent = `£${sales.toFixed(2)}`;
  document.getElementById("expensesTotal").textContent = `£${expenses.toFixed(2)}`;
  document.getElementById("depositTotal").textContent = `£${deposits.toFixed(2)}`;
  document.getElementById("outstandingTotal").textContent = `£${outstanding.toFixed(2)}`;
  document.getElementById("balance").textContent = `£${(sales + deposits - expenses).toFixed(2)}`;
}

// Render transaction history
function renderHistory() {
  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  transactions.forEach((t, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      🗓️ ${t.date} | 💰 ${t.type} | 🧾 ${t.category} | 👤 ${t.name || "—"} | £${t.amountPaid.toFixed(2)} paid | £${(t.totalDue - t.amountPaid).toFixed(2)} outstanding | 💳 ${t.paymentMethod}
      <br>📝 ${t.notes}
      ${t.recurring !== "None" ? `<br>🔁 ${t.recurring} → Next: ${t.repeatDate}` : ""}
      <br><button onclick="editTransaction(${i})">✏️ Edit</button>
      <button onclick="deleteTransaction(${i})">🗑️ Delete</button>
    `;
    list.appendChild(div);
  });
}

// Edit transaction
function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("editIndex").value = index;
  document.getElementById("date").value = t.date;
  document.getElementById("type").value = t.type;
  document.getElementById("name").value = t.name;
  document.getElementById("notes").value = t.notes;
  document.getElementById("category").value = t.category;
  document.getElementById("totalDue").value = t.totalDue;
  document.getElementById("amountPaid").value = t.amountPaid;
  document.getElementById("paymentMethod").value = t.paymentMethod;
  document.getElementById("recurring").value = t.recurring;
  document.getElementById("repeatDate").value = t.repeatDate;
  updateFormFields();
}

// Delete transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateDashboard();
  renderHistory();
}

// Apply seasonal theme to background (optional)
function applySeasonalTheme() {
  const month = new Date().getMonth();
  const body = document.body;

  if ([9, 10].includes(month)) {
    body.style.backgroundImage = "url('autumn.jpg')";
  } else if (month === 11) {
    body.style.backgroundImage = "url('snowman.jpg')";
  } else if (month === 0) {
    body.style.backgroundImage = "url('fireworks.jpg')";
  } else if (month === 3) {
    body.style.backgroundImage = "url('easter.jpg')";
  } else if (month === 11 || month === 0) {
    body.style.backgroundImage = "url('christmas.jpg')";
  } else {
    body.style.backgroundImage = "none";
  }

  body.style.backgroundSize = "cover";
  body.style.backgroundPosition = "center";
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  renderHistory();
  updateFormFields();
  applySeasonalTheme();

  const params = new URLSearchParams(window.location.search);
  const editIndex = params.get("edit");
  if (editIndex !== null) {
    editTransaction(parseInt(editIndex));
  }
});




