// Splash screen logic
function enterApp() {
  const splash = document.getElementById("splash");
  const sound = document.getElementById("splashSound");

  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
    }, 1000);
  }

  if (sound && !sound.played.length) {
    sound.volume = 0.3;
    sound.play();
  }
}

// Inactivity timer
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.style.display = "flex";
      splash.style.opacity = "1";
    }
  }, 300000); // 5 minutes
}

["click", "mousemove", "keydown", "touchstart"].forEach(event =>
  document.addEventListener(event, resetInactivityTimer)
);

// Transactions
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

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
  updateHelpBox();

  // Confirmation flash
  document.body.classList.add("flash-confirm");
  setTimeout(() => document.body.classList.remove("flash-confirm"), 300);
}

function resetForm() {
  document.querySelector("form").reset();
  document.getElementById("editIndex").value = "";
  updateFormFields();
}

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

function updateHelpBox() {
  const reminderList = document.getElementById("reminderList");
  const outstandingClients = transactions.filter(t => t.type === "Sale" && t.totalDue > t.amountPaid);

  reminderList.innerHTML = `
    <li>✅ Don’t forget to complete all expenses before the end of the month.</li>
    <li>📌 Chase up any outstanding balances:</li>
  `;

  outstandingClients.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `➡️ ${t.name} owes £${(t.totalDue - t.amountPaid).toFixed(2)}`;
    reminderList.appendChild(li);
  });
}

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

function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateDashboard();
  updateHelpBox();
}

function repayTransaction(index) {
  const t = transactions[index];
  const remaining = t.totalDue - t.amountPaid;
  const amount = prompt(`Enter repayment amount for ${t.name} (max £${remaining.toFixed(2)}):`, remaining.toFixed(2));
  const value = parseFloat(amount);

  if (!isNaN(value) && value > 0 && value <= remaining) {
    t.amountPaid += value;
    localStorage.setItem("transactions", JSON.stringify(transactions));
    updateDashboard();
    updateHelpBox();
  } else {
    alert("Invalid repayment amount.");
  }
}

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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const skipSplash = params.get("skipSplash");
  const splash = document.getElementById("splash");

  if (skipSplash === "true" && splash) {
    splash.style.display = "none";
  }

  updateDashboard();
  updateHelpBox();
  updateFormFields();
  applySeasonalTheme();
  resetInactivityTimer();

  const editIndex = params.get("edit");
  if (editIndex !== null) {
    editTransaction(parseInt(editIndex));
  }
});



