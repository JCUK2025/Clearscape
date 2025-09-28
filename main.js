function enterApp() {
  const splash = document.getElementById("splash");
  const sound = document.getElementById("splashSound");
  const main = document.getElementById("mainContent");

  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => {
      splash.style.display = "none";
      if (main) main.style.display = "block";
    }, 1000);
  }

  if (sound && !sound.played.length) {
    sound.volume = 0.3;
    sound.play();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("logo");
  if (logo) {
    const animations = ["bounceLogo", "spinLogo", "stretchLogo"];
    const chosen = animations[Math.floor(Math.random() * animations.length)];
    const duration = (Math.random() * 2 + 1.5).toFixed(2);
    const delay = (Math.random() * 2).toFixed(2);
    const timing = Math.random() < 0.5 ? "ease-in-out" : "linear";

    logo.style.animation = `${chosen} ${duration}s ${timing} ${delay}s infinite`;
  }

  updateHistoryQuote();
  resetInactivityTimer();
  if (document.getElementById("historyResults")) applyFilters();
});

let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    const splash = document.getElementById("splash");
    const main = document.getElementById("mainContent");
    if (splash) {
      splash.style.display = "flex";
      splash.style.opacity = "1";
    }
    if (main) {
      main.style.display = "none";
    }
  }, 300000);
}

["click", "mousemove", "keydown", "touchstart"].forEach(event =>
  document.addEventListener(event, resetInactivityTimer)
);

function updateHistoryQuote() {
  const quoteBox = document.getElementById("historyQuote");
  if (!quoteBox) return;
  const quotes = [
    "💼 Success is built on small, consistent entries.",
    "📊 What gets measured gets managed.",
    "🧠 Clear records lead to clear decisions.",
    "📆 History is your business memory.",
    "🔍 Filtered facts lead to focused action.",
    "🎃 October’s here — carve out clarity.",
    "🎄 Log it before the lights go up!",
    "🌸 Spring into tidy records.",
    "🎆 Fireworks fade, but good data lasts.",
    "🐣 Hatch new habits this Easter.",
    "🧾 Logging transactions: cheaper than therapy.",
    "📚 Your future self says thanks for this entry.",
    "🪴 Small jobs, big insights.",
    "💬 Notes today, fewer headaches tomorrow.",
    "📈 Logging: the only habit that pays you back."
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteBox.textContent = randomQuote;
}

function applyFilters() {
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;
  const type = document.getElementById("filterType").value;
  const name = document.getElementById("filterName").value.toLowerCase();

  const results = document.getElementById("historyResults");
  results.innerHTML = "";

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const filtered = transactions.filter(t => {
    const matchDate =
      (!from || t.date >= from) &&
      (!to || t.date <= to);
    const matchType = !type || t.type === type;
    const matchName = !name || t.name.toLowerCase().includes(name);
    return matchDate && matchType && matchName;
  });

  if (filtered.length === 0) {
    results.innerHTML = "<p>No matching transactions found.</p>";
    return;
  }

  filtered.forEach(t => {
    const card = document.createElement("div");
    card.className = "transaction-card";
    if (t.type === "Refund") {
      card.classList.add("refund-card");
    }

    card.innerHTML = `
      <p><strong>${t.type}</strong> — ${t.category}</p>
      <p>Client: ${t.name}</p>
      <p>Date: ${t.date}</p>
      <p>Amount Paid: £${t.amountPaid.toFixed(2)}</p>
      <p>Total Due: £${t.totalDue.toFixed(2)}</p>
      <p>Method: ${t.paymentMethod}</p>
      <p>Recurring: ${t.recurring}</p>
      <p>Notes: ${t.notes || "None"}</p>
    `;

    results.appendChild(card);
  });
}

function clearFilters() {
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterName").value = "";
  applyFilters();
}

function downloadCSV() {
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;
  const type = document.getElementById("filterType").value;
  const name = document.getElementById("filterName").value.toLowerCase();

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const filtered = transactions.filter(t => {
    const matchDate =
      (!from || t.date >= from) &&
      (!to || t.date <= to);
    const matchType = !type || t.type === type;
    const matchName = !name || t.name.toLowerCase().includes(name);
    return matchDate && matchType && matchName;
  });

  if (filtered.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = ["Date", "Type", "Name", "Category", "Notes", "Total Due", "Amount Paid", "Method", "Recurring"];
  const rows = filtered.map(t => [
    t.date,
    t.type,
    t.name,
    t.category,
    `"${t.notes || ""}"`,
    t.totalDue.toFixed(2),
    t.amountPaid.toFixed(2),
    t.paymentMethod,
    t.recurring
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clearscape-history.csv";
  link.click();
}

function downloadAllCSV() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = ["Date", "Type", "Name", "Category", "Notes", "Total Due", "Amount Paid", "Method", "Recurring"];
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.name,
    t.category,
    `"${t.notes || ""}"`,
    t.totalDue.toFixed(2),
    t.amountPaid.toFixed(2),
    t.paymentMethod,
    t.recurring
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "clearscape-all-transactions.csv";
  link.click();
}

