document.addEventListener("DOMContentLoaded", () => {
  // Save Transaction (index.html)
  const saveButton = document.querySelector(".clearscape-button");
  if (saveButton && document.getElementById("type")) {
    saveButton.addEventListener("click", () => {
      const transaction = {
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        subtype: document.getElementById("subtype").value,
        name: document.getElementById("name").value,
        notes: document.getElementById("notes").value,
        total: parseFloat(document.getElementById("total").value) || 0,
        paid: parseFloat(document.getElementById("paid").value) || 0,
        method: document.getElementById("method").value,
        recurring: document.getElementById("recurring").checked
      };

      const existing = JSON.parse(localStorage.getItem("transactions")) || [];
      existing.push(transaction);
      localStorage.setItem("transactions", JSON.stringify(existing));
      alert("Transaction saved!");

      document.querySelectorAll("input, select").forEach(el => {
        if (el.type === "checkbox") el.checked = false;
        else el.value = "";
      });
    });
  }

  // History Page Logic
  const historyList = document.getElementById("historyList");
  const paginationControls = document.getElementById("paginationControls");
  const exportButton = document.getElementById("exportCSV");
  const applyFilters = document.getElementById("applyFilters");
  const clearFilters = document.getElementById("clearFilters");

  if (historyList) {
    let currentPage = 1;
    const itemsPerPage = 8;

    function getFilteredTransactions() {
      const all = JSON.parse(localStorage.getItem("transactions")) || [];
      const type = document.getElementById("filterType").value;
      const date = document.getElementById("filterDate").value;

      return all.filter(tx => {
        const matchType = type ? tx.type === type : true;
        const matchDate = date ? tx.date === formatDate(date) : true;
        return matchType && matchDate;
      });
    }

    function formatDate(input) {
      const d = new Date(input);
      return d.toLocaleDateString("en-GB");
    }

    function renderTransactions(page = 1) {
      const filtered = getFilteredTransactions();
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = filtered.slice(start, end);

      historyList.innerHTML = pageItems.map(tx => `
        <div class="transaction-entry">
          <strong>${tx.date}</strong> — ${tx.type} (${tx.subtype})<br>
          <em>${tx.name}</em> — £${tx.paid} of £${tx.total}<br>
          Method: ${tx.method} ${tx.recurring ? "(Recurring)" : ""}<br>
          Notes: ${tx.notes || "—"}
        </div>
      `).join("");

      renderPagination(filtered.length, page);
    }

    function renderPagination(totalItems, currentPage) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      paginationControls.innerHTML = "";

      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = "clearscape-button";
        btn.onclick = () => {
          currentPage = i;
          renderTransactions(currentPage);
        };
        paginationControls.appendChild(btn);
      }
    }

    if (applyFilters) applyFilters.onclick = () => renderTransactions(1);
    if (clearFilters) clearFilters.onclick = () => {
      document.getElementById("filterType").value = "";
      document.getElementById("filterDate").value = "";
      renderTransactions(1);
    };

    if (exportButton) exportButton.onclick = () => {
      const data = getFilteredTransactions();
      const csv = [
        ["Date", "Type", "Subtype", "Name", "Notes", "Total", "Paid", "Method", "Recurring"],
        ...data.map(tx => [
          tx.date, tx.type, tx.subtype, tx.name, tx.notes,
          tx.total, tx.paid, tx.method, tx.recurring ? "Yes" : "No"
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "clearscape-transactions.csv";
      link.click();
    };

    renderTransactions(currentPage);
  }
});

