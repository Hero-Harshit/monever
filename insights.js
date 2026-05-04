// Logic specific to data.html (Insights page)

function renderSummary() {
  calculateSummaryStats();
}

function attachDataTabEvents() {
  let dataTabs = document.getElementById('dataTabs');
  if (!dataTabs) return;

  dataTabs.addEventListener('shown.bs.tab', function (event) {
    if (!event.target) return;
    switch (event.target.id) {
      case 'expenses-tab':
        renderExpenses();
        break;
      case 'emis-tab':
        renderEMI();
        break;
      case 'people-tab':
        renderPeople();
        break;
      case 'summary-tab':
        renderSummary();
        break;
    }
  });
}

function initUpcomingFeaturesToggle() {
  let featureCollapse = document.getElementById('upcomingFeaturesCollapse');
  if (!featureCollapse) return;

  featureCollapse.addEventListener('shown.bs.collapse', function () {
    featureCollapse.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function savePreferences() {
  let currencyInput = document.getElementById('currencySymbol');
  let defaultCategoryInput = document.getElementById('defaultCategory');
  let dateFormatInput = document.getElementById('dateFormat');

  if (currencyInput) currencySymbol = currencyInput.value.trim() || '₹';
  if (defaultCategoryInput) defaultCategory = defaultCategoryInput.value.trim() || 'General';
  if (dateFormatInput) dateFormat = dateFormatInput.value;

  save();
  let currencyPrefixes = document.querySelectorAll('.currency-prefix');
  currencyPrefixes.forEach(prefix => prefix.textContent = currencySymbol);
  showToast('Preferences saved successfully', 'success');
  renderExpenses();
  renderEMI();
  renderPeople();
  renderHistory();
  renderSummary();
}

function saveAppearance() {
  let bgStyleInput = document.getElementById('bgStyle');
  if (bgStyleInput) bgStyle = bgStyleInput.value || 'Soft Gradient';
  applyAppearance();
  save();
  showToast('Appearance saved successfully', 'success');
}

function renderExpenses() {
  let list = document.getElementById("expenseList");
  if (!list) return;

  list.innerHTML = "";
  let month = selectedMonth || new Date().toISOString().slice(0, 7);
  let filtered = expenses.filter(e => e.date.startsWith(month));

  filtered.forEach((e) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    let desc = e.description ? `<div class="small text-muted">${e.description}</div>` : "";
    li.innerHTML = `<div>
        <span class="fw-bold">${e.category}</span> - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)})
        ${desc}
      </div>
      <div>
        <button class="btn btn-warning btn-sm me-2" onclick="editExpenseById('${e.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteExpenseById('${e.id}')">Delete</button>
      </div>`;
    list.appendChild(li);
  });

  if (expenses.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3"><i class="bi bi-receipt-cutoff" style="font-size: 3rem;"></i></div>
      <h5>No Expenses Yet</h5>
      <p>Add your first expense to start tracking your spending.</p>
      <button class="btn btn-primary btn-sm" onclick="location.href='index.html'">Add Expense</button>
    `;
    list.appendChild(li);
  } else if (filtered.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3"><i class="bi bi-calendar-x" style="font-size: 3rem;"></i></div>
      <h5>No Expenses This Month</h5>
      <p>No expenses found for the selected month.</p>
    `;
    list.appendChild(li);
  }
  animateListItems(list);
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  save();
  showToast("Expense deleted", "success");
  renderExpenses();
  if (typeof renderRecentExpenses === 'function') renderRecentExpenses();
  calculateStats();
}

function deleteExpenseById(id) {
  const index = expenses.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    deleteExpense(index);
  }
}

function renderEMI() {
  let list = document.getElementById("emiList");
  if (!list) return;

  list.innerHTML = "";
  emis.forEach((e, idx) => {
    let due = new Date(e.date);
    let today = new Date();
    let badge = '';
    if (!isNaN(due.getTime())) {
      let diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) badge = '<span class="badge bg-danger ms-2">Overdue</span>';
      else if (diff <= 7) badge = '<span class="badge bg-warning text-dark ms-2">Due Soon</span>';
    }

    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${e.name} - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)}) ${badge}</span>
      <div>
        <button class="btn btn-success btn-sm me-2" onclick="markEMIPaid(${idx})">Mark Paid</button>
        <button class="btn btn-warning btn-sm me-2" onclick="editEMI(${idx})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteEMI(${idx})">Delete</button>
      </div>`;
    list.appendChild(li);
  });
  if (emis.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3"><i class="bi bi-calendar-event" style="font-size: 3rem;"></i></div>
      <h5>No EMIs Yet</h5>
      <p>Add your recurring payments to stay on top of them.</p>
      <button class="btn btn-warning btn-sm" onclick="location.href='index.html'">Add EMI</button>
    `;
    list.appendChild(li);
  }
}

function deleteEMI(index) {
  emis.splice(index, 1);
  save();
  showToast("EMI deleted", "success");
  renderEMI();
}

function markEMIPaid(index) {
  let emi = emis[index];
  let today = new Date().toISOString().split('T')[0];
  expenses.push({ id: Date.now() + Math.random(), amount: emi.amount, category: `EMI - ${emi.name}`, date: today, description: "" });
  emis.splice(index, 1);
  save();
  renderExpenses();
  if (typeof renderRecentExpenses === 'function') renderRecentExpenses();
  renderEMI();
  calculateStats();
  showToast(`${emi.name} payment recorded and removed from schedule`, "success");
}

function renderPeople() {
  let list = document.getElementById("peopleList");
  if (!list) return;

  list.innerHTML = "";
  let netBalance = people.filter(p => p.status === 'open').reduce((sum, p) => {
    return sum + (p.type === 'lent' ? p.amount : -p.amount);
  }, 0);

  let netItem = document.createElement('li');
  netItem.className = 'list-group-item d-flex justify-content-between align-items-center';
  if (netBalance > 0) netItem.innerHTML = `<span>You are owed ${getCurrency()}${formatMoney(netBalance)} net</span>`;
  else if (netBalance < 0) netItem.innerHTML = `<span>You owe ${getCurrency()}${formatMoney(Math.abs(netBalance))} net</span>`;
  else netItem.innerHTML = `<span class="text-muted">You are settled with your open ledger</span>`;
  list.appendChild(netItem);

  people.forEach((p, i) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    let text = p.type === "lent" ? `You gave ${getCurrency()}${formatMoney(p.amount)} to ${p.name}` : `You took ${getCurrency()}${formatMoney(p.amount)} from ${p.name}`;
    if (p.description) text += ` (${p.description})`;

    li.innerHTML = `<span>${text} - ${p.status}</span>
      <div>
        ${p.status === "open" ? `<button class="btn btn-warning btn-sm me-2" onclick="closeTxn(${i})">Close</button>` : ""}
        <button class="btn btn-warning btn-sm me-2" onclick="editPerson(${i})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePerson(${i})">Delete</button>
      </div>`;
    list.appendChild(li);
  });

  if (people.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3"><i class="bi bi-people" style="font-size: 3rem;"></i></div>
      <h5>No Ledger Entries Yet</h5>
      <p>Track who owes you or whom you owe money to.</p>
      <button class="btn btn-info btn-sm" onclick="location.href='index.html'">Add Record</button>
    `;
    list.appendChild(li);
  }
  animateListItems(list);
}

function closeTxn(index) {
  people[index].status = "closed";
  save();
  showToast("Person transaction marked as closed", "success");
  renderPeople();
}

function deletePerson(index) {
  people.splice(index, 1);
  save();
  showToast("Person record deleted", "success");
  renderPeople();
}

function calculateStats() {
  if (typeof Chart === 'undefined') return;
  let totalEl = document.getElementById("totalExpense");
  let avgEl = document.getElementById("avgDaily");
  let projectedEl = document.getElementById("projected");
  let chartEl = document.getElementById('expenseChart');
  if (!totalEl || !avgEl || !projectedEl || !chartEl) return;

  let month = selectedMonth || new Date().toISOString().slice(0, 7);
  let [year, mon] = month.split('-');
  let monthNum = parseInt(mon, 10) - 1;
  let yearNum = parseInt(year, 10);

  let daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
  let today = new Date();
  let currentDay = (yearNum === today.getFullYear() && monthNum === today.getMonth()) ? today.getDate() : daysInMonth;

  let monthlyExpenses = expenses.filter(e => {
    let d = new Date(e.date);
    return d.getMonth() === monthNum && d.getFullYear() === yearNum;
  });

  let total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  let avgDaily = currentDay > 0 ? total / currentDay : 0;
  let projected = avgDaily * daysInMonth;

  calculateStatsDirect("totalExpense", total);
  calculateStatsDirect("avgDaily", avgDaily);
  calculateStatsDirect("projected", projected);

  // Savings Rate
  let savingsRateEl = document.getElementById("savingsRate");
  if (savingsRateEl) {
    if (monthlyIncome > 0) {
      let rate = ((monthlyIncome - total) / monthlyIncome * 100);
      savingsRateEl.textContent = rate.toFixed(1) + '%';
      savingsRateEl.classList.remove('text-success', 'text-danger');
      savingsRateEl.classList.add(rate >= 0 ? 'text-success' : 'text-danger');
    } else {
      savingsRateEl.textContent = "—";
      savingsRateEl.classList.remove('text-success', 'text-danger');
    }
  }

  let alertEl = document.getElementById("budgetAlert");
  if (alertEl) {
    alertEl.innerHTML = "";
    if (monthlyBudget > 0) {
      if (total > monthlyBudget) alertEl.innerHTML = `<div class="alert alert-danger">⚠️ Warning: Exceeded budget by ${getCurrency()}${formatMoney(total - monthlyBudget)}!</div>`;
      else alertEl.innerHTML = `<div class="alert alert-success">✅ Within budget! Remaining: ${getCurrency()}${formatMoney(monthlyBudget - total)}</div>`;
    }
  }

  let categories = {};
  monthlyExpenses.forEach(e => { categories[e.category] = (categories[e.category] || 0) + e.amount; });

  // Category Budget Alerts
  let categoryAlertsEl = document.getElementById("categoryAlerts");
  if (categoryAlertsEl) {
    categoryAlertsEl.innerHTML = "";
    Object.entries(categories).forEach(([cat, spent]) => {
      if (categoryBudgets[cat] && spent > categoryBudgets[cat]) {
        let div = document.createElement("div");
        div.className = "alert alert-warning py-2 mb-1 small";
        div.innerHTML = `⚠️ <strong>${cat}:</strong> ${getCurrency()}${formatMoney(spent)} / ${getCurrency()}${formatMoney(categoryBudgets[cat])} limit exceeded.`;
        categoryAlertsEl.appendChild(div);
      }
    });
  }

  if (Object.keys(categories).length === 0) {
    chartEl.style.display = 'none';
    let existingMsg = chartEl.parentNode.querySelector('.text-center.text-muted');
    if (!existingMsg) {
      let noDataMsg = document.createElement('div');
      noDataMsg.className = 'text-center text-muted py-5';
      noDataMsg.innerHTML = `<div class="mb-3"><i class="bi bi-pie-chart" style="font-size: 3rem;"></i></div><h5>No Expenses This Month</h5>`;
      chartEl.parentNode.appendChild(noDataMsg);
    }
    return;
  } else {
    let existingMsg = chartEl.parentNode.querySelector('.text-center.text-muted');
    if (existingMsg) existingMsg.remove();
    chartEl.style.display = 'block';
  }

  let ctx = chartEl.getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{ data: Object.values(categories), backgroundColor: CHART_COLORS, borderWidth: 1, borderColor: '#ffffff' }]
    },
    options: { responsive: true, cutout: '60%', plugins: { legend: { position: 'right', labels: { color: '#333', font: { weight: '600', size: 11 } } } }, animation: false }
  });
}

function showEraseModal() {
  let modal = new bootstrap.Modal(document.getElementById('eraseModal'));
  modal.show();
}

function eraseAllData() {
  expenses = []; emis = []; people = []; save();
  renderExpenses(); renderEMI(); renderPeople(); calculateStats();
  let modal = bootstrap.Modal.getInstance(document.getElementById('eraseModal'));
  if (modal) modal.hide();
  showToast("All data has been erased", "warning");
}

function saveBudget() {
  let budgetEl = document.getElementById("monthlyBudget");
  if (!budgetEl) return;
  let budgetValue = Number(budgetEl.value);
  if (isNaN(budgetValue) || budgetValue < 0) { showToast("Enter a valid budget amount", "danger"); return; }
  monthlyBudget = budgetValue;
  localStorage.setItem("monthlyBudget", String(monthlyBudget));
  showToast("Budget saved successfully", "success");
  calculateStats();
}

function saveIncome() {
  let incomeEl = document.getElementById("monthlyIncome");
  if (!incomeEl) return;
  let incomeValue = Number(incomeEl.value);
  if (isNaN(incomeValue) || incomeValue < 0) { showToast("Enter a valid income amount", "danger"); return; }
  monthlyIncome = incomeValue;
  localStorage.setItem("monthlyIncome", String(monthlyIncome));
  showToast("Income saved successfully", "success");
  calculateStats();
}

function updateStats() {
  let monthEl = document.getElementById("monthSelector");
  if (monthEl) selectedMonth = monthEl.value || null;
  renderExpenses(); calculateStats();
}

function addCategoryBudget() {
  let catName = document.getElementById("budgetCategoryName").value.trim();
  let catAmount = Number(document.getElementById("budgetCategoryAmount").value);

  if (!catName || isNaN(catAmount) || catAmount <= 0) {
    showToast("Please enter a valid category and amount", "danger");
    return;
  }

  categoryBudgets[catName] = catAmount;
  save();
  document.getElementById("budgetCategoryName").value = "";
  document.getElementById("budgetCategoryAmount").value = "";
  showToast(`Budget limit set for ${catName}`, "success");
  renderCategoryBudgets();
  calculateStats();
}

function deleteCategoryBudget(catName) {
  delete categoryBudgets[catName];
  save();
  showToast(`Budget limit removed for ${catName}`, "info");
  renderCategoryBudgets();
  calculateStats();
}

function renderCategoryBudgets() {
  let list = document.getElementById("categoryBudgetList");
  if (!list) return;

  list.innerHTML = "";
  Object.entries(categoryBudgets).forEach(([cat, amount]) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0 py-1";
    li.innerHTML = `<span><i class="bi bi-tag-fill me-2 text-muted"></i>${cat}: <strong>${getCurrency()}${formatMoney(amount)}</strong></span>
      <button class="btn btn-sm text-danger border-0 p-0" onclick="deleteCategoryBudget('${cat}')">
        <i class="bi bi-x-circle"></i>
      </button>`;
    list.appendChild(li);
  });
}

function exportData() {
  let data = { expenses, emis, people };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a'); a.href = url; a.download = 'expense_data.json'; a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported successfully", "success");
}

function exportCSV() {
  const headers = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map(e => [
    e.date,
    `"${(e.category || "").replace(/"/g, '""')}"`,
    `"${(e.description || "").replace(/"/g, '""')}"`,
    e.amount
  ]);
  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'monever_expenses.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast("CSV exported successfully", "success");
}

function importData() {
  let file = document.getElementById('importFile').files[0];
  if (!file) { showToast("Please select a file to import", "danger"); return; }
  let reader = new FileReader();
  reader.onload = function (e) {
    try {
      let data = JSON.parse(e.target.result);
      expenses = data.expenses || []; emis = data.emis || []; people = data.people || [];
      save(); renderExpenses(); renderEMI(); renderPeople(); calculateStats();
      showToast("Data imported successfully", "success");
    } catch (err) { showToast("Invalid file format", "danger"); }
  };
  reader.readAsText(file);
}

function filterHistory() {
  let searchInput = document.getElementById("historySearchInput").value.toLowerCase();
  let list = document.getElementById("historyList");
  if (!list) return;
  let filtered = expenses.filter(e => 
    e.category.toLowerCase().includes(searchInput) || 
    (e.description && e.description.toLowerCase().includes(searchInput))
  );
  let count = document.getElementById("historyCount");
  if (count) count.textContent = `Showing ${filtered.length} of ${expenses.length} expenses`;

  list.innerHTML = "";
  let sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sorted.length === 0) {
    list.innerHTML = "<li class=\"list-group-item text-muted\">No expenses found</li>";
    return;
  }
  sorted.forEach((e) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    let desc = e.description ? `<div class="small text-muted">${e.description}</div>` : "";
    li.innerHTML = `<div>
        <span class="fw-bold">${e.category}</span> - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)})
        ${desc}
      </div>
      <button class="btn btn-danger btn-sm" onclick="deleteExpenseById('${e.id}')">Delete</button>`;
    list.appendChild(li);
  });
  animateListItems(list);
}

function renderHistory() { filterHistory(); }

function calculateSummaryStats() {
  if (!document.getElementById("allTimeTotal")) return;
  let allTimeTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  document.getElementById("allTimeTotal").textContent = `${getCurrency()}${formatMoney(allTimeTotal)}`;
  let biggest = expenses.reduce((max, e) => (Number(e.amount) || 0) > (Number(max.amount) || 0) ? e : max, expenses[0] || { amount: 0, category: "—" });
  document.getElementById("biggestExpense").textContent = biggest.amount > 0 ? `${biggest.category} - ${getCurrency()}${formatMoney(biggest.amount)}` : "—";
  let categoryTotals = {};
  expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
  let topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  document.getElementById("topCategory").textContent = topCat[0] !== "—" ? `${topCat[0]} - ${getCurrency()}${formatMoney(topCat[1])}` : "—";
  let totalLent = people.filter(p => p.type === "lent" && p.status === "open").reduce((sum, p) => sum + p.amount, 0);
  document.getElementById("totalLent").textContent = `${getCurrency()}${formatMoney(totalLent)}`;
  renderSummaryChart();
}

function renderSummaryChart() {
  let chartEl = document.getElementById("summaryChart");
  if (!chartEl) return;
  let today = new Date(); let monthData = {};
  for (let i = 5; i >= 0; i--) {
    let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthData[d.toISOString().slice(0, 7)] = 0;
  }
  expenses.forEach(e => { let mk = e.date.slice(0, 7); if (monthData.hasOwnProperty(mk)) monthData[mk] += e.amount; });
  let labels = Object.keys(monthData).map(m => {
    let [y, mo] = m.split('-');
    return new Date(y, parseInt(mo) - 1).toLocaleString('en-US', { month: 'short' });
  });
  let data = Object.values(monthData);
  if (data.every(d => d === 0)) {
    chartEl.style.display = 'none';
    let existingMsg = chartEl.parentNode.querySelector('.text-center.text-muted');
    if (!existingMsg) {
      let noDataMsg = document.createElement('div');
      noDataMsg.className = 'text-center text-muted py-5';
      noDataMsg.innerHTML = `<div class="mb-3"><i class="bi bi-bar-chart" style="font-size: 3rem;"></i></div><h5>No Spending Data</h5>`;
      chartEl.parentNode.appendChild(noDataMsg);
    }
    return;
  } else {
    let existingMsg = chartEl.parentNode.querySelector('.text-center.text-muted');
    if (existingMsg) existingMsg.remove();
    chartEl.style.display = 'block';
  }
  if (summaryChartInstance) summaryChartInstance.destroy();
  let ctx = chartEl.getContext('2d');
  summaryChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: `Monthly Spending (${getCurrency()})`, data: data, backgroundColor: CHART_COLORS, borderColor: '#404040', borderWidth: 1 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true, title: { display: true, text: `Amount (${getCurrency()})` } } }, plugins: { legend: { display: true } } }
  });
}

function runMaintenanceTask(taskName) {
  const compactModal = bootstrap.Modal.getInstance(document.getElementById('compactModal')) || new bootstrap.Modal(document.getElementById('compactModal'));
  const rebuildModal = bootstrap.Modal.getInstance(document.getElementById('rebuildModal')) || new bootstrap.Modal(document.getElementById('rebuildModal'));
  compactModal.hide(); rebuildModal.hide();
  const progModal = new bootstrap.Modal(document.getElementById('maintenanceProgressModal'));
  document.getElementById('maintenanceTaskTitle').textContent = taskName;
  progModal.show();
  let progress = 0; const bar = document.getElementById('retroProgressBar'); const status = document.getElementById('maintenanceStatus');
  const steps = [ { p: 10, s: 'Initializing subsystem...' }, { p: 30, s: 'Scanning data clusters...' }, { p: 50, s: 'Optimizing index nodes...' }, { p: 70, s: 'Flushing data buffers...' }, { p: 90, s: 'Finalizing optimization...' }, { p: 100, s: 'Maintenance Complete.' } ];
  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      progress = steps[currentStep].p; status.textContent = steps[currentStep].s; bar.style.width = progress + '%'; currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        progModal.hide(); showToast(taskName + ' successful', 'success', 'toastContainer');
        setTimeout(() => { bar.style.width = '0%'; status.textContent = 'Initializing subsystem...'; }, 500);
      }, 800);
    }
  }, 600);
}

// Initialization for data.html
document.addEventListener('DOMContentLoaded', () => {
  normalizeData();
  applyAppearance();
  loadSettings();
  attachDataTabEvents();
  initUpcomingFeaturesToggle();
  renderExpenses();
  renderEMI();
  renderPeople();
  renderHistory();
  calculateSummaryStats();
  renderCategoryOptions();
  renderCategoryBudgets();

  let monthSelector = document.getElementById("monthSelector");
  if (monthSelector) monthSelector.value = new Date().toISOString().slice(0, 7);
  let budgetInput = document.getElementById("monthlyBudget");
  if (budgetInput) budgetInput.value = monthlyBudget;
  calculateStats();
});
