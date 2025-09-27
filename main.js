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
    totalDue: parseFloat(document.getElementById("totalDue").value) || 0,
    amountPaid: parseFloat(document.getElementById("amountPaid").value) || 0,
    paymentMethod: document.getElementById("paymentMethod").value,
    recurring: document.getElementById("recurring").value
  };

  const editIndex = document.getElementById("editIndex").value;
  if (editIndex) {
    transactions[editIndex] = transaction;
  } else {
    transactions.push(transaction);
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  document.querySelector("form").reset();
  document.getElementById("editIndex").value = "";
  document.getElementById("paymentHint").textContent = "";

  updateDashboard();
  updateHelpBox();
  resetInactivityTimer();

  document.body.classList.add("flash-confirm");
  setTimeout(() => document.body.classList.remove("flash-confirm"), 300);
}

function updateDashboard() {
  let sales = 0, expenses = 0, deposits = 0, outstanding = 0;
  const currentMonth = new Date().toISOString().slice(0, 7);

  transactions.forEach(t => {
    if (!t.date.startsWith(currentMonth)) return;

    if (t.type === "Sale") {
      sales += t.amountPaid;
      outstanding += t.totalDue - t.amountPaid;
    } else if (t.type === "Expense") {
      expenses += t.amountPaid;
    } else if (t.type === "Deposit") {
      deposits += t.amountPaid;
    }
  });

  const balance = sales + deposits - expenses;

  document.getElementById("salesTotal").textContent = `£${sales.toFixed(2)}`;
  document.getElementById("expensesTotal").textContent = `£${expenses.toFixed(2)}`;
  document.getElementById("depositTotal").textContent = `£${deposits.toFixed(2)}`;
  document.getElementById("outstandingTotal").textContent = `£${outstanding.toFixed(2)}`;
  document.getElementById("outstandingTotal").style.color = "red";

  const balanceEl = document.getElementById("balance");
  balanceEl.textContent = `£${balance.toFixed(2)}`;
  balanceEl.className = balance < 0 ? "negative" : "";
}

function updateHelpBox() {
  const reminderList = document.getElementById("reminderList");
  const currentMonth = new Date().toISOString().slice(0, 7);

  const outstandingClients = transactions.filter(t =>
    t.date.startsWith(currentMonth) &&
    t.type === "Sale" &&
    t.totalDue > t.amountPaid
  );

  reminderList.innerHTML = `
    <li>✅ Complete expenses before month-end</li>
    <li>📌 Chase outstanding balances:</li>
  `;

  outstandingClients.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `➡️ ${t.name} owes £${(t.totalDue - t.amountPaid).toFixed(2)}`;
    li.style.color = "red";
    reminderList.appendChild(li);
  });

  const tips = [
    "🌿 A tidy hedge is a tidy mind.",
    "💡 Track it today, save it tomorrow.",
    "📆 Weekly reviews keep surprises away.",
    "🧠 Clear records build clear decisions.",
    "📈 Every entry is a step forward.",
    "🔁 Recurring jobs deserve recurring attention.",
    "💬 Notes are memory insurance.",
    "🪴 Small jobs, big impact — log them all."
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  const tipItem = document.createElement("li");
  tipItem.textContent = randomTip;
  tipItem.style.fontStyle = "italic";
  reminderList.appendChild(tipItem);
}

function editTransaction(index) {
  const t = transactions[index];
  document.getElementById("editIndex").value = index;
  document.getElementById("date").value = t.date;
  document.getElementById("type").value = t.type;
  document.getElementById("name").value = t.name;
  document.getElementById("notes").value = t.notes;
  document.getElementById("totalDue").value = t.totalDue;
  document.getElementById("amountPaid").value = t.amountPaid;
  document.getElementById("paymentMethod").value = t.paymentMethod;
  document.getElementById("recurring").value = t.recurring;
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

// Dynamic hint for part payments
document.addEventListener("DOMContentLoaded", () => {
  const hint = document.getElementById("paymentHint");
  const totalInput = document.getElementById("totalDue");
  const paidInput = document.getElementById("amountPaid");

  function updateHint() {
    const due = parseFloat(totalInput.value) || 0;
    const paid = parseFloat(paidInput.value) || 0;

    if (paid < due) {
      hint.textContent = `Partial payment recorded. £${(due - paid).toFixed(2)} still outstanding.`;
      hint.style.color = "red";
    } else {
      hint.textContent = paid > due ? "Overpayment recorded." : "Payment complete.";
      hint.style.color = "#2e5d2e";
    }
  }

  totalInput.addEventListener("input", updateHint);
  paidInput.addEventListener("input", updateHint);

  const params = new URLSearchParams(window.location.search);
  const skipSplash = params.get("skipSplash");
  const splash = document.getElementById("splash");

  if (splash && skipSplash === "true") {
    splash.style.display = "none";
    splash.style.opacity = "0";
    document.body.style.opacity = "0";
    setTimeout(() => {
      document.body.style.transition = "opacity 1s ease";
      document.body.style.opacity = "1";
    }, 50);
  }

  updateDashboard?.();
  updateHelpBox?.();
  applySeasonalTheme?.();
  resetInactivityTimer


