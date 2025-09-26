const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

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
  list.innerHTML = "";
  transactions.forEach((t, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      🗓️ ${t.date} | 💰 ${t.type} | 🧾 ${t.category} | ${formatCurrency(t.amountPaid)} paid
      ${t.totalDue ? ` | ${formatCurrency(t.totalDue - t.amountPaid)} outstanding` : ""}
      | 💳 ${t.paymentMethod}
      <button onclick="editTransaction(${index})">✏️</button>
      <button onclick="deleteTransaction(${index})">🗑️</button>
    `;
    list.appendChild(div);
  });
  updateDashboard();
}

function saveTransaction() {
  const index = document.getElementById("editIndex").value;
  const newTransaction = {
    date: document.getElementById("date").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    totalDue: parseFloat(document.getElementById("totalDue").value) || 0,
    amountPaid: parseFloat(document.getElementById("amountPaid").value) || 0,
    paymentMethod: document.getElementById("paymentMethod").value,
    recurring: document.getElementById("recurring").value,
    repeatDate: document.getElementById("repeatDate").value
  };

  if (index !== "") {
    transactions[index] = newTransaction;
    document.getElementById("editIndex").value = "";
  } else {
    transactions.push(newTransaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHistory();
}

function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("date").value = t.date;
  document.getElementById("type").value = t.type;
  document.getElementById("category").value = t.category;
  document.getElementById("totalDue").value = t.totalDue || "";
  document.getElementById("amountPaid").value = t.amountPaid || "";
  document.getElementById("paymentMethod").value = t.paymentMethod || "";
  document.getElementById("recurring").value = t.recurring || "None";
  document.getElementById("repeatDate").value = t.repeatDate || "";
  document.getElementById("editIndex").value = index;
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderHistory();
}

function getSeasonalImage() {
  const today = new Date();
  const month = today.getMonth();
  const date = today.getDate();
  const day = today.getDay();

  if (month === 11 && date >= 18 && date <= 31) return "snowman.jpg"; // Christmas
  if (month === 0 && date <= 1) return "fireworks.jpg"; // New Year
  if (month === 3 && date >= 18 && date <= 21) return "easter.jpg"; // Easter
  if (month === 3 && date === 23) return "st-george.jpg";
  if (month === 9 && [26, 27, 28].includes(date)) return "birthday-cake.jpg";
  if (month === 9 && [29, 30, 31].includes(date)) return "halloween.jpg";
  if (month === 10 && date === 5) return "bonfire.jpg";
  if (month === 5 && date === 21) return "solstice.jpg";
  if (month === 10 && day === 0 && date >= 8 && date <= 14) return "remembrance.jpg";

  return "default.jpg";
}

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();

  const quotes = [
    "Success is built one entry at a time.",
    "Matt, every small step builds your legacy.",
    "Consistency is your competitive edge.",
    "Track. Reflect. Grow.",
    "You’ve got this, Matt.",
    "Business clarity starts here.",
    "Focus fuels progress.",
    "Welcome back, Matt — let’s make today count.",
    "Every entry is a step toward mastery.",
    "Small wins build big results."
  ];

  const splashMessage = document.getElementById("splashMessage");
  if (splashMessage) {
    splashMessage.textContent = quotes[Math.floor(Math.random() * quotes.length)];
  }

  const seasonalImage = document.getElementById("seasonalImage");
  if (seasonalImage) {
    seasonalImage.src = getSeasonalImage();
  }

  setInterval(() => {
    const effects = ["spin", "stretch"];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    document.getElementById("logo").style.animation = `${effect} 1s ease`;
  }, 8000);
});


