// Logic specific to data.html (Insights page)

let financialGoals = JSON.parse(localStorage.getItem("financialGoals") || "[]");
let moneverAssets = JSON.parse(localStorage.getItem("moneverAssets") || "[]");
let moneverLiabilities = JSON.parse(localStorage.getItem("moneverLiabilities") || "[]");

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
      case 'goals-tab':
        renderGoals();
        break;
      case 'networth-tab':
        renderNetWorth();
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
        <button class="btn btn-sm me-2" onclick="editExpenseById('${e.id}')">Edit</button>
        <button class="btn btn-sm" onclick="deleteExpenseById('${e.id}')">Delete</button>
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
      if (diff < 0) badge = '<span class="badge ms-2" style="background-color: #808080;">Overdue</span>';
      else if (diff <= 7) badge = '<span class="badge ms-2" style="background-color: #aaaaaa; color: #000;">Due Soon</span>';
    }

    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${e.name} - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)}) ${badge}</span>
      <div>
        <button class="btn btn-sm me-2" onclick="markEMIPaidById('${e.id}')">Mark Paid</button>
        <button class="btn btn-sm me-2" onclick="editEMIById('${e.id}')">Edit</button>
        <button class="btn btn-sm" onclick="deleteEMIById('${e.id}')">Delete</button>
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
      <button class="btn btn-sm" onclick="location.href='index.html'">Add EMI</button>
    `;
    list.appendChild(li);
  }
}


function markEMIPaidById(id) {
  const index = emis.findIndex(e => String(e.id) === String(id));
  if (index === -1) return;
  let emi = emis[index];
  let today = new Date().toISOString().split('T')[0];
  expenses.push({ id: Date.now().toString() + Math.random().toString(36).slice(2), amount: emi.amount, category: `EMI - ${emi.name}`, date: today, description: "" });
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
        ${p.status === "open" ? `<button class="btn btn-sm me-2" onclick="closeTxnById('${p.id}')">Close</button>` : ""}
        <button class="btn btn-sm me-2" onclick="editPersonById('${p.id}')">Edit</button>
        <button class="btn btn-sm" onclick="deletePersonById('${p.id}')">Delete</button>
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
      <button class="btn btn-sm" onclick="location.href='index.html'">Add Record</button>
    `;
    list.appendChild(li);
  }
  animateListItems(list);
}

function closeTxnById(id) {
  const index = people.findIndex(p => String(p.id) === String(id));
  if (index !== -1) {
    people[index].status = "closed";
    save();
    showToast("Person transaction marked as closed", "success");
    renderPeople();
  }
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
      // No replacement class needed, will inherit default gray/black
    } else {
      savingsRateEl.textContent = "";
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
  const patterns = getChartPatterns();
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categories),
      datasets: [{ data: Object.values(categories), backgroundColor: patterns, borderWidth: 1, borderColor: '#000000' }]
    },
    options: { responsive: true, cutout: '60%', plugins: { legend: { position: 'right', labels: { color: '#333', font: { weight: '600', size: 11 } } } }, animation: false }
  });
}


function updateStats() {
  let monthEl = document.getElementById("monthSelector");
  if (monthEl) selectedMonth = monthEl.value || null;
  renderExpenses(); calculateStats();
}


function filterHistory() {
  let searchInput = document.getElementById("historySearchInput").value.toLowerCase();
  let list = document.getElementById("historyList");
  if (!list) return;
  let filtered = expenses.filter(e =>
    e.category.toLowerCase().includes(searchInput) ||
    (e.description && e.description.toLowerCase().includes(searchInput)) ||
    e.amount.toString().includes(searchInput) ||
    e.date.includes(searchInput)
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
      <button class="btn btn-sm" onclick="deleteExpenseById('${e.id}')">Delete</button>`;
    list.appendChild(li);
  });
  animateListItems(list);
}

function renderHistory() { filterHistory(); }

function calculateSummaryStats() {
  if (!document.getElementById("allTimeTotal")) return;
  let allTimeTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  document.getElementById("allTimeTotal").textContent = `${getCurrency()}${formatMoney(allTimeTotal)}`;
  let biggest = expenses.reduce((max, e) => (Number(e.amount) || 0) > (Number(max.amount) || 0) ? e : max, expenses[0] || { amount: 0, category: "" });
  document.getElementById("biggestExpense").textContent = biggest.amount > 0 ? `${biggest.category} - ${getCurrency()}${formatMoney(biggest.amount)}` : "";
  let categoryTotals = {};
  expenses.forEach(e => { categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount; });
  let topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  document.getElementById("topCategory").textContent = topCat[0] !== "" ? `${topCat[0]} - ${getCurrency()}${formatMoney(topCat[1])}` : "";
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
  const patterns = getChartPatterns();
  summaryChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { 
      labels: labels, 
      datasets: [{ 
        label: `Monthly Spending (${getCurrency()})`, 
        data: data, 
        backgroundColor: patterns, 
        borderColor: '#000000', 
        borderWidth: 1 
      }] 
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, title: { display: true, text: `Amount (${getCurrency()})` } } }, plugins: { legend: { display: true } } }
  });
}

function addGoal() {
  const name = document.getElementById("goalName").value;
  const target = document.getElementById("goalTarget").value;
  const date = document.getElementById("goalDate").value;
  const starting = document.getElementById("goalStarting").value;

  if (!name || !target) {
    showToast("Please provide goal name and target amount", "warning");
    return;
  }

  const goal = {
    id: Date.now().toString(),
    name,
    target: Number(target),
    saved: Number(starting || 0),
    targetDate: date
  };

  financialGoals.push(goal);
  localStorage.setItem("financialGoals", JSON.stringify(financialGoals));
  renderGoals();
  
  document.getElementById("goalName").value = "";
  document.getElementById("goalTarget").value = "";
  document.getElementById("goalDate").value = "";
  document.getElementById("goalStarting").value = "";
  showToast("Goal added successfully", "success");
}

function renderGoals() {
  const list = document.getElementById("goalsList");
  if (!list) return;
  list.innerHTML = "";

  if (financialGoals.length === 0) {
    list.innerHTML = '<div class="col-12 text-center text-muted py-4">No goals yet. Add one above.</div>';
    return;
  }

  financialGoals.forEach((goal) => {
    const progress = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
    const remainingDays = goal.targetDate ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const daysText = remainingDays !== null ? (remainingDays > 0 ? `${remainingDays} days left` : "Deadline passed") : "No deadline";

    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";
    col.innerHTML = `
      <div class="card win95-fieldset p-3 h-100">
        <h6 class="fw-bold mb-2">${goal.name}</h6>
        <div class="progress mb-2" style="height: 20px; border: 2px solid #808080; border-radius: 0; background: #fff;">
          <div class="progress-bar" role="progressbar" style="width: ${progress}%; background-color: #808080; border-radius: 0;"></div>
        </div>
        <div class="d-flex justify-content-between small mb-3">
          <span>${getCurrency()}${formatMoney(goal.saved)} of ${getCurrency()}${formatMoney(goal.target)}</span>
          <span class="fw-bold">${progress.toFixed(1)}%</span>
        </div>
        <div class="text-muted small mb-3"><i class="bi bi-clock me-1"></i>${daysText}</div>
        <div class="d-flex gap-2 mt-auto">
          <button class="btn btn-primary btn-sm flex-grow-1" onclick="addContribution('${goal.id}')">Add Funds</button>
          <button class="btn btn-sm" onclick="deleteGoal('${goal.id}')"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `;
    list.appendChild(col);
  });
}

function addContribution(id) {
  const amount = prompt("Enter contribution amount:");
  if (amount === null || amount === "" || isNaN(amount)) return;

  const goal = financialGoals.find(g => g.id === id);
  if (goal) {
    goal.saved += Number(amount);
    localStorage.setItem("financialGoals", JSON.stringify(financialGoals));
    renderGoals();
    showToast("Contribution added", "success");
  }
}

function deleteGoal(id) {
  if (!confirm("Are you sure you want to delete this goal?")) return;
  financialGoals = financialGoals.filter(g => g.id !== id);
  localStorage.setItem("financialGoals", JSON.stringify(financialGoals));
  renderGoals();
  showToast("Goal deleted", "info");
}

function addAsset() {
  const name = document.getElementById("assetName").value;
  const amount = document.getElementById("assetAmount").value;
  const type = document.getElementById("assetType").value;

  if (!name || !amount) {
    showToast("Please enter asset name and value", "warning");
    return;
  }

  const asset = {
    id: Date.now().toString(),
    name,
    amount: Number(amount),
    type
  };

  moneverAssets.push(asset);
  localStorage.setItem("moneverAssets", JSON.stringify(moneverAssets));
  renderNetWorth();
  
  document.getElementById("assetName").value = "";
  document.getElementById("assetAmount").value = "";
  showToast("Asset added", "success");
}

function addLiability() {
  const name = document.getElementById("liabilityName").value;
  const amount = document.getElementById("liabilityAmount").value;

  if (!name || !amount) {
    showToast("Please enter liability name and amount", "warning");
    return;
  }

  const liability = {
    id: Date.now().toString(),
    name,
    amount: Number(amount)
  };

  moneverLiabilities.push(liability);
  localStorage.setItem("moneverLiabilities", JSON.stringify(moneverLiabilities));
  renderNetWorth();

  document.getElementById("liabilityName").value = "";
  document.getElementById("liabilityAmount").value = "";
  showToast("Liability added", "success");
}

function deleteAsset(id) {
  moneverAssets = moneverAssets.filter(a => a.id !== id);
  localStorage.setItem("moneverAssets", JSON.stringify(moneverAssets));
  renderNetWorth();
}

function deleteLiability(id) {
  moneverLiabilities = moneverLiabilities.filter(l => l.id !== id);
  localStorage.setItem("moneverLiabilities", JSON.stringify(moneverLiabilities));
  renderNetWorth();
}

function renderNetWorth() {
  const aList = document.getElementById("assetList");
  const lList = document.getElementById("liabilityList");
  if (!aList || !lList) return;

  aList.innerHTML = "";
  lList.innerHTML = "";

  let totalAssets = 0;
  moneverAssets.forEach(a => {
    totalAssets += a.amount;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent border-0 border-bottom";
    li.innerHTML = `
      <div>
        <div class="fw-bold">${a.name}</div>
        <div class="small text-muted">${a.type}</div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span style="color: #808080;">${getCurrency()}${formatMoney(a.amount)}</span>
        <button class="btn btn-link btn-sm p-0" onclick="deleteAsset('${a.id}')"><i class="bi bi-trash"></i></button>
      </div>
    `;
    aList.appendChild(li);
  });

  let totalLiabilities = 0;
  moneverLiabilities.forEach(l => {
    totalLiabilities += l.amount;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent border-0 border-bottom";
    li.innerHTML = `
      <div>
        <div class="fw-bold">${l.name}</div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span style="color: #606060;">${getCurrency()}${formatMoney(l.amount)}</span>
        <button class="btn btn-link btn-sm p-0" onclick="deleteLiability('${l.id}')"><i class="bi bi-trash"></i></button>
      </div>
    `;
    lList.appendChild(li);
  });

  document.getElementById("totalAssetsDisplay").textContent = `${getCurrency()}${formatMoney(totalAssets)}`;
  document.getElementById("totalLiabilitiesDisplay").textContent = `${getCurrency()}${formatMoney(totalLiabilities)}`;
  
  document.getElementById("nwAssetsTotal").textContent = `${getCurrency()}${formatMoney(totalAssets)}`;
  document.getElementById("nwLiabilitiesTotal").textContent = `${getCurrency()}${formatMoney(totalLiabilities)}`;
  document.getElementById("nwNetTotal").textContent = `${getCurrency()}${formatMoney(totalAssets - totalLiabilities)}`;
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
  renderGoals();
  renderNetWorth();
  calculateSummaryStats();
  renderCategoryOptions();
  
  let monthSelector = document.getElementById("monthSelector");
  if (monthSelector) monthSelector.value = new Date().toISOString().slice(0, 7);
  calculateStats();
});
