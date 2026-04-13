let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let emis = JSON.parse(localStorage.getItem("emis")) || [];
let people = JSON.parse(localStorage.getItem("people")) || [];
let lastCategory = localStorage.getItem("lastCategory") || "";
let monthlyBudget = Number(localStorage.getItem("monthlyBudget") || 0);
let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
let chartInstance = null;
let summaryChartInstance = null;
let selectedMonth = null;
let currencySymbol = localStorage.getItem("currencySymbol") || "₹";
let defaultCategory = localStorage.getItem("defaultCategory") || "General";
let dateFormat = localStorage.getItem("dateFormat") || "YYYY-MM-DD";
let accentColor = localStorage.getItem("accentColor") || "#0d6efd";
let bgStyle = localStorage.getItem("bgStyle") || "Soft Gradient";

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("emis", JSON.stringify(emis));
  localStorage.setItem("people", JSON.stringify(people));
  localStorage.setItem("reminders", JSON.stringify(reminders));
  localStorage.setItem("monthlyBudget", String(monthlyBudget));
  localStorage.setItem("currencySymbol", currencySymbol);
  localStorage.setItem("defaultCategory", defaultCategory);
  localStorage.setItem("dateFormat", dateFormat);
  localStorage.setItem("accentColor", accentColor);
  localStorage.setItem("bgStyle", bgStyle);
}

function normalizeData() {
  expenses = expenses.map(e => ({
    amount: Number(e.amount) || 0,
    category: e.category || defaultCategory || "General",
    date: e.date || new Date().toISOString().split('T')[0]
  }));
  emis = emis.map(e => ({
    name: e.name || "EMI",
    amount: Number(e.amount) || 0,
    date: e.date || new Date().toISOString().split('T')[0]
  }));
  people = people.map(p => ({
    name: p.name || "Unknown",
    amount: Number(p.amount) || 0,
    type: p.type === "borrowed" ? "borrowed" : "lent",
    status: p.status === "closed" ? "closed" : "open",
    description: p.description || ""
  }));
  monthlyBudget = Number(monthlyBudget) || 0;
  reminders = reminders.map(r => ({
    label: r.label || "Reminder",
    date: r.date || new Date().toISOString().split('T')[0]
  }));
  dateFormat = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].includes(dateFormat) ? dateFormat : "YYYY-MM-DD";
  accentColor = accentColor || "#0d6efd";
  bgStyle = ["Soft Gradient", "Pure White", "Warm Cream"].includes(bgStyle) ? bgStyle : "Soft Gradient";
  save();
}

function getCurrency() {
  return currencySymbol || "₹";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  let date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  let day = String(date.getDate()).padStart(2, '0');
  let month = String(date.getMonth() + 1).padStart(2, '0');
  let year = date.getFullYear();

  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    default:
      return `${year}-${month}-${day}`;
  }
}

function applyAppearance() {
  document.documentElement.style.setProperty('--accent', accentColor || '#0d6efd');
  let bgValue = 'linear-gradient(135deg, #f0f4ff, #fdf6ff)';
  if (bgStyle === 'Pure White') {
    bgValue = '#ffffff';
  } else if (bgStyle === 'Warm Cream') {
    bgValue = '#fdf8f0';
  }
  document.body.style.background = bgValue;
}

function initQuoteTyping() {
  let quoteEl = document.getElementById('quoteContent');
  if (!quoteEl) return;

  const quotes = [
    "A budget is telling your money where to go instead of wondering where it went. ~ Dave Ramsey",
    "Do not save what is left after spending; spend what is left after saving. ~ Warren Buffett",
    "Money is a terrible master but an excellent servant. ~ P.T. Barnum",
    "The goal isn't more money. The goal is living life on your terms. ~ Chris Brogan",
    "It's not about having lots of money. It's knowing how to manage it. ~ T. Harv Eker",
    "Wealth is the ability to fully experience life. ~ Henry David Thoreau",
    "The real measure of your wealth is how much you'd be worth if you lost all your money. ~ Unknown",
    "The quickest way to double your money is to fold it over and put it in your pocket. ~ Will Rogers",
    "Small daily improvements over time lead to stunning results. ~ Robin Sharma",
    "The way to build wealth is to live below your means and invest the difference. ~ Unknown",
    "A penny saved is a penny earned. ~ Benjamin Franklin",
    "Financial freedom is available to those who learn about it and work for it. ~ Robert Kiyosaki",
    "Success is not just making money. Success is happiness. ~ Unknown",
    "Money grows on the tree of persistence. ~ Japanese Proverb",
    "Savings, remember, is the prerequisite of investment. ~ Campbell R. McConnell",
    "The only wealth which you will keep forever is the wealth you have given away. ~ Marcus Aurelius",
    "Know what you own, and know why you own it. ~ Peter Lynch",
    "Your future is created by what you do today, not tomorrow. ~ Robert Kiyosaki",
    "Rich people acquire assets. The poor only have expenses. ~ Robert Kiyosaki",
    "Beware of little expenses. A small leak will sink a great ship. ~ Benjamin Franklin",
    "A simple fact that is hard to learn is that the time to save money is when you have some. ~ Joe Moore",
    "If you don't find a way to make money while you sleep, you will work until you die. ~ Warren Buffett",
    "Formal education will make you a living; self-education will make you a fortune. ~ Jim Rohn",
    "The more you learn, the more you earn. ~ Warren Buffett",
    "Wealth consists not in having great possessions, but in having few wants. ~ Epictetus",
    "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver. ~ Ayn Rand",
    "It's not your salary that makes you rich, it's your spending habits. ~ Charles A. Jaffe",
    "Never spend your money before you have it. ~ Thomas Jefferson",
    "The best way to predict the future is to create it. ~ Peter Drucker",
    "Opportunities come infrequently. When it rains gold, put out the bucket, not the thimble. ~ Warren Buffett",
    "Time is more valuable than money. You can get more money, but you cannot get more time. ~ Jim Rohn",
    "Save money and money will save you. ~ Jamaican Proverb",
    "The stock market is a device for transferring money from the impatient to the patient. ~ Warren Buffett",
    "A wise person should have money in their head, but not in their heart. ~ Jonathan Swift",
    "The most important investment you can make is in yourself. ~ Warren Buffett",
    "Do not go where the path may lead, go instead where there is no path. ~ Ralph Waldo Emerson",
    "Frugality includes all the other virtues. ~ Cicero",
    "Get rich slowly. ~ Unknown",
    "Your habits determine your future. ~ Jack Canfield",
    "Money without brains is always dangerous. ~ Napoleon Hill",
    "A good reputation is more valuable than money. ~ Publilius Syrus",
    "You must gain control over your money or the lack of it will forever control you. ~ Dave Ramsey",
    "The journey of a thousand miles begins with one step. ~ Lao Tzu",
    "The art is not in making money, but in keeping it. ~ Proverb",
    "The hardest thing in the world to understand is the income tax. ~ Albert Einstein",
    "When it is a question of money, everybody is of the same religion. ~ Voltaire",
    "Earn with your mind, not your time. ~ Naval Ravikant",
    "Budgeting isn't about limiting yourself; it's about making the things that excite you possible. ~ Unknown",
    "Generosity is the key to happiness, and it is always profitable. ~ Unknown",
    "Every dollar you save is a soldier on your side. ~ Unknown",
    "Money is a great servant but a bad master. ~ Unknown"
  ];

  let selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = selectedQuote;
}

function loadSettings() {
  let currencyInput = document.getElementById('currencySymbol');
  let defaultCategoryInput = document.getElementById('defaultCategory');
  let dateFormatInput = document.getElementById('dateFormat');
  let accentColorInput = document.getElementById('accentColor');
  let bgStyleInput = document.getElementById('bgStyle');
  let budgetEl = document.getElementById('monthlyBudget');

  if (currencyInput) currencyInput.value = currencySymbol;
  if (defaultCategoryInput) defaultCategoryInput.value = defaultCategory;
  if (dateFormatInput) dateFormatInput.value = dateFormat;
  if (accentColorInput) accentColorInput.value = accentColor;
  if (bgStyleInput) bgStyleInput.value = bgStyle;
  if (budgetEl) budgetEl.value = monthlyBudget;

  if (accentColorInput) {
    accentColorInput.addEventListener('input', function(event) {
      accentColor = event.target.value;
      applyAppearance();
    });
  }

  if (bgStyleInput) {
    bgStyleInput.addEventListener('change', function(event) {
      bgStyle = event.target.value;
      applyAppearance();
    });
  }
}

function animateListItems(list) {
  const items = list.querySelectorAll('.list-group-item');
  items.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      item.style.transition = 'all 0.3s ease-out';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, index * 50);
  });
}

function addButtonLoading(button) {
  button.classList.add('loading');
  setTimeout(() => {
    button.classList.remove('loading');
  }, 1000);
}


function renderSummary() {
  calculateSummaryStats();
}

function attachDataTabEvents() {
  let dataTabs = document.getElementById('dataTabs');
  if (!dataTabs) return;

  dataTabs.addEventListener('shown.bs.tab', function(event) {
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

  featureCollapse.addEventListener('shown.bs.collapse', function() {
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
  showToast('Preferences saved successfully', 'success');
  renderExpenses();
  renderEMI();
  renderPeople();
  renderHistory();
  renderSummary();
}

function saveAppearance() {
  let accentColorInput = document.getElementById('accentColor');
  let bgStyleInput = document.getElementById('bgStyle');

  if (accentColorInput) accentColor = accentColorInput.value || '#0d6efd';
  if (bgStyleInput) bgStyle = bgStyleInput.value || 'Soft Gradient';

  applyAppearance();
  save();
  showToast('Appearance saved successfully', 'success');
}

function formatMoney(value) {
  let amount = Number(value);
  if (isNaN(amount)) amount = 0;
  return amount.toFixed(2).replace(/\.00$/, "");
}

function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) return;

  let toastHtml = `
    <div class="toast align-items-center text-white bg-${type === "danger" ? "danger" : type === "success" ? "success" : type === "warning" ? "warning" : "info"}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  let toastDiv = document.createElement("div");
  toastDiv.innerHTML = toastHtml;
  container.appendChild(toastDiv);

  let toast = new bootstrap.Toast(toastDiv.querySelector(".toast"));
  toast.show();

  toastDiv.addEventListener("hidden.bs.toast", function() {
    toastDiv.remove();
  });
}

// EXPENSE
function addExpense() {
  let amount = document.getElementById("amount").value;
  let categoryInput = document.getElementById("customCategory");
  let category = categoryInput.value || lastCategory || defaultCategory || "General";
  let date = document.getElementById("expenseDate").value || new Date().toISOString().split('T')[0];

  if (!amount) {
    showToast("Please enter an amount", "danger");
    return;
  }

  if (Number(amount) <= 0) {
    showToast("Amount must be greater than 0", "danger");
    return;
  }

  expenses.push({ amount: Number(amount), category, date });
  save();
  saveCategory(category);
  document.getElementById("amount").value = "";
  categoryInput.value = category;
  document.getElementById("expenseDate").value = new Date().toISOString().split('T')[0];
  showToast("Expense added successfully", "success");
  renderExpenses();
  calculateStats();
  scrollToCard('expense');
}

// EMI
function addEMI() {
  let name = document.getElementById("emiName").value;
  let amount = document.getElementById("emiAmount").value;
  let date = document.getElementById("emiDate").value;

  if (!name || !amount || !date) {
    showToast("Please fill in all EMI fields", "danger");
    return;
  }

  let amountValue = Number(amount);
  if (isNaN(amountValue) || amountValue <= 0) {
    showToast("EMI amount must be greater than 0", "danger");
    return;
  }

  emis.push({ name, amount: amountValue, date });
  save();
  document.getElementById("emiName").value = "";
  document.getElementById("emiAmount").value = "";
  document.getElementById("emiDate").value = "";
  showToast("EMI added successfully", "success");
  renderEMI();
  scrollToCard('emi');
}

// PERSON
function addPerson() {
  let name = document.getElementById("personName").value;
  let amount = document.getElementById("personAmount").value;
  let type = document.getElementById("transactionType").value;
  let description = document.getElementById("personDescription").value;

  if (!name || !amount) {
    showToast("Please enter name and amount", "danger");
    return;
  }

  let amountValue = Number(amount);
  if (isNaN(amountValue) || amountValue <= 0) {
    showToast("Amount must be greater than 0", "danger");
    return;
  }

  people.push({ name, amount: amountValue, type, status: "open", description });
  save();
  document.getElementById("personName").value = "";
  document.getElementById("personAmount").value = "";
  document.getElementById("personDescription").value = "";
  showToast("Person record added successfully", "success");
  renderPeople();
  scrollToCard('person');
}

// RENDER EXPENSE
function renderExpenses() {
  let list = document.getElementById("expenseList");
  if (!list) return;

  list.innerHTML = "";

  let month = selectedMonth || new Date().toISOString().slice(0, 7);
  let filtered = expenses.filter(e => e.date.startsWith(month));
  
  filtered.forEach((e) => {
    let origIdx = expenses.indexOf(e);
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${e.category} - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)})</span>
      <button class="btn btn-danger btn-sm" onclick="deleteExpense(${origIdx})">Delete</button>`;
    list.appendChild(li);
  });

  if (expenses.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-receipt-cutoff" style="font-size: 3rem;"></i>
      </div>
      <h5>No Expenses Yet</h5>
      <p>Add your first expense to start tracking your spending.</p>
      <button class="btn btn-primary btn-sm" onclick="document.getElementById('expense-tab').click();">Add Expense</button>
    `;
    list.appendChild(li);
  } else if (filtered.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-calendar-x" style="font-size: 3rem;"></i>
      </div>
      <h5>No Expenses This Month</h5>
      <p>No expenses found for the selected month.</p>
    `;
    list.appendChild(li);
  }

  animateListItems(list);
}


// RENDER EMI
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
      if (diff < 0) {
        badge = '<span class="badge bg-danger ms-2">Overdue</span>';
      } else if (diff <= 7) {
        badge = '<span class="badge bg-warning text-dark ms-2">Due Soon</span>';
      }
    }

    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${e.name} - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)}) ${badge}</span>
      <div>
        <button class="btn btn-success btn-sm me-2" onclick="markEMIPaid(${idx})">Mark Paid</button>
        <button class="btn btn-danger btn-sm" onclick="deleteEMI(${idx})">Delete</button>
      </div>`;
    list.appendChild(li);
  });
  if (emis.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-calendar-event" style="font-size: 3rem;"></i>
      </div>
      <h5>No EMIs Yet</h5>
      <p>Add your recurring payments to stay on top of them.</p>
      <button class="btn btn-warning btn-sm" onclick="document.getElementById('emi-tab').click();">Add EMI</button>
    `;
    list.appendChild(li);
  }}

// RENDER PEOPLE + CLOSE
function renderPeople() {
  let list = document.getElementById("peopleList");
  if (!list) return;

  list.innerHTML = "";

  let netBalance = people.filter(p => p.status === 'open').reduce((sum, p) => {
    return sum + (p.type === 'lent' ? p.amount : -p.amount);
  }, 0);

  let netItem = document.createElement('li');
  netItem.className = 'list-group-item d-flex justify-content-between align-items-center';
  if (netBalance > 0) {
    netItem.innerHTML = `<span class="text-success">You are owed ${getCurrency()}${formatMoney(netBalance)} net</span>`;
  } else if (netBalance < 0) {
    netItem.innerHTML = `<span class="text-danger">You owe ${getCurrency()}${formatMoney(Math.abs(netBalance))} net</span>`;
  } else {
    netItem.innerHTML = `<span class="text-muted">You are settled with your open ledger</span>`;
  }
  list.appendChild(netItem);

  people.forEach((p, i) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    let text = p.type === "lent"
      ? `You gave ${getCurrency()}${formatMoney(p.amount)} to ${p.name}`
      : `You took ${getCurrency()}${formatMoney(p.amount)} from ${p.name}`;

    if (p.description) text += ` (${p.description})`;

    li.innerHTML = `<span>${text} - ${p.status}</span>
      <div>
        ${p.status === "open" ? `<button class="btn btn-warning btn-sm me-2" onclick="closeTxn(${i})">Close</button>` : ""}
        <button class="btn btn-danger btn-sm" onclick="deletePerson(${i})">Delete</button>
      </div>`;

    list.appendChild(li);
  });

  if (people.length === 0) {
    let li = document.createElement("li");
    li.className = "list-group-item text-center text-muted py-5";
    li.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-people" style="font-size: 3rem;"></i>
      </div>
      <h5>No Ledger Entries Yet</h5>
      <p>Track who owes you or whom you owe money to.</p>
      <button class="btn btn-info btn-sm" onclick="document.getElementById('person-tab').click();">Add Record</button>
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

function deleteExpense(index) {
  expenses.splice(index, 1);
  save();
  showToast("Expense deleted", "success");
  renderExpenses();
  calculateStats();
}

function deleteEMI(index) {
  emis.splice(index, 1);
  save();
  showToast("EMI deleted", "success");
  renderEMI();
}

function deletePerson(index) {
  people.splice(index, 1);
  save();
  showToast("Person record deleted", "success");
  renderPeople();
}

function markEMIPaid(index) {
  let emi = emis[index];
  let today = new Date().toISOString().split('T')[0];
  expenses.push({ amount: emi.amount, category: `EMI - ${emi.name}`, date: today });
  save();
  renderExpenses();
  calculateStats();
  showToast(`${emi.name} payment recorded`, "success");
}

function saveCategory(category) {
  lastCategory = category;
  localStorage.setItem("lastCategory", category);
  renderCategoryOptions();
}

function renderCategoryOptions() {
  let list = document.getElementById("categoryList");
  if (!list) return;

  let categories = [...new Set(expenses.map(e => e.category).concat(lastCategory ? [lastCategory] : []))].filter(Boolean);
  list.innerHTML = categories.map(c => `<option value="${c}">`).join("");

  let categoryInput = document.getElementById("customCategory");
  if (categoryInput && !categoryInput.value) {
    categoryInput.value = lastCategory;
  }
}

function setDefaultExpenseDate() {
  let dateInput = document.getElementById("expenseDate");
  if (!dateInput) return;
  dateInput.value = new Date().toISOString().split('T')[0];
}

function calculateStats() {
  let totalEl = document.getElementById("totalExpense");
  let avgEl = document.getElementById("avgDaily");
  let projectedEl = document.getElementById("projected");
  let chartEl = document.getElementById('expenseChart');
  if (!totalEl || !avgEl || !projectedEl || !chartEl) return;

  let month = selectedMonth || new Date().toISOString().slice(0, 7);
  let [year, mon] = (month || new Date().toISOString().slice(0, 7)).split('-');
  let monthNum = Number.parseInt(mon, 10);
  let yearNum = Number.parseInt(year, 10);
  if (isNaN(yearNum) || isNaN(monthNum)) {
    let now = new Date();
    yearNum = now.getFullYear();
    monthNum = now.getMonth() + 1;
  }
  monthNum -= 1;

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

  totalEl.textContent = `Total Expense: ${getCurrency()}${formatMoney(total)}`;
  avgEl.textContent = `Avg Daily Expense: ${getCurrency()}${formatMoney(avgDaily)}`;
  projectedEl.textContent = `Projected Total: ${getCurrency()}${formatMoney(projected)}`;

  // Budget Alert
  let alertEl = document.getElementById("budgetAlert");
  if (alertEl) {
    alertEl.innerHTML = "";
    if (monthlyBudget > 0) {
      if (total > monthlyBudget) {
        let exceeded = total - monthlyBudget;
        alertEl.innerHTML = `<div class="alert alert-danger" role="alert">⚠️ Warning: You have exceeded your monthly budget by ${getCurrency()}${formatMoney(exceeded)}!</div>`;
      } else {
        let remaining = monthlyBudget - total;
        alertEl.innerHTML = `<div class="alert alert-success" role="alert">✅ You are within budget! Remaining: ${getCurrency()}${formatMoney(remaining)}</div>`;
      }
    }
  }

  // Chart
  let categories = {};
  monthlyExpenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  if (Object.keys(categories).length === 0) {
    chartEl.style.display = 'none';
    let noDataMsg = document.createElement('div');
    noDataMsg.className = 'text-center text-muted py-5';
    noDataMsg.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-pie-chart" style="font-size: 3rem;"></i>
      </div>
      <h5>No Expenses This Month</h5>
      <p>Add some expenses to see your spending breakdown.</p>
    `;
    chartEl.parentNode.appendChild(noDataMsg);
    return;
  } else {
    // Remove any existing no data message
    let existingMsg = chartEl.parentNode.querySelector('.text-center.text-muted');
    if (existingMsg) existingMsg.remove();
    chartEl.style.display = 'block';
  }

  let ctx = chartEl.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#00D9FF', '#8B00D9']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Expenses by Category'
        }
      }
    }
  });
}

function showEraseModal() {
  let modal = new bootstrap.Modal(document.getElementById('eraseModal'));
  modal.show();
}

function eraseAllData() {
  expenses = [];
  emis = [];
  people = [];
  save();
  renderExpenses();
  renderEMI();
  renderPeople();
  calculateStats();
  let modal = bootstrap.Modal.getInstance(document.getElementById('eraseModal'));
  if (modal) modal.hide();
  showToast("All data has been erased", "warning");
}

function saveBudget() {
  let budgetEl = document.getElementById("monthlyBudget");
  if (!budgetEl) return;
  let budgetValue = Number(budgetEl.value);
  if (isNaN(budgetValue) || budgetValue < 0) {
    showToast("Enter a valid budget amount", "danger");
    return;
  }
  monthlyBudget = budgetValue;
  localStorage.setItem("monthlyBudget", String(monthlyBudget));
  showToast("Budget saved successfully", "success");
  calculateStats();
}

function updateStats() {
  let monthEl = document.getElementById("monthSelector");
  if (monthEl) {
    selectedMonth = monthEl.value || null;
  }
  renderExpenses();
  calculateStats();
}

function exportData() {
  let data = { expenses, emis, people };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'expense_data.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported successfully", "success");
}

function importData() {
  let file = document.getElementById('importFile').files[0];
  if (!file) {
    showToast("Please select a file to import", "danger");
    return;
  }
  let reader = new FileReader();
  reader.onload = function(e) {
    try {
      let data = JSON.parse(e.target.result);
      expenses = data.expenses || [];
      emis = data.emis || [];
      people = data.people || [];
      save();
      renderExpenses();
      renderEMI();
      renderPeople();
      calculateStats();
      showToast("Data imported successfully", "success");
    } catch (err) {
      showToast("Invalid file format", "danger");
    }
  };
  reader.readAsText(file);
}

// QUICK NOTE
function saveQuickNote() {
  let noteText = document.getElementById("quickNoteTextarea").value;
  if (!noteText.trim()) {
    showToast("Please write a note first", "warning");
    return;
  }
  localStorage.setItem("quickNote", noteText);
  showToast("Note saved successfully", "success");
  displayQuickNote();
}

function displayQuickNote() {
  let noteText = localStorage.getItem("quickNote") || "";
  let display = document.getElementById("quickNoteDisplay");
  if (!display) return;
  
  if (noteText) {
    display.innerHTML = `<div class="alert alert-info"><h6>Saved Note:</h6><p>${noteText.replace(/\n/g, "<br>")}</p></div>`;
  } else {
    display.innerHTML = "";
  }
}

// REMINDERS
function addReminder() {
  let label = document.getElementById("reminderLabel").value;
  let date = document.getElementById("reminderDate").value;
  
  if (!label || !date) {
    showToast("Please fill in all reminder fields", "danger");
    return;
  }
  
  reminders.push({ label, date });
  save();
  document.getElementById("reminderLabel").value = "";
  document.getElementById("reminderDate").value = "";
  showToast("Reminder added", "success");
  renderReminders();
}

function deleteReminder(index) {
  reminders.splice(index, 1);
  save();
  showToast("Reminder deleted", "success");
  renderReminders();
}

function renderReminders() {
  let list = document.getElementById("reminderList");
  if (!list) return;
  
  list.innerHTML = "";
  
  let sorted = [...reminders].sort((a, b) => new Date(a.date) - new Date(b.date));
  let today = new Date().toISOString().split('T')[0];
  
  if (sorted.length === 0) {
    list.innerHTML = "<li class=\"list-group-item text-muted\">No reminders yet</li>";
    return;
  }
  
  sorted.forEach((r, idx) => {
    let origIdx = reminders.findIndex(x => x.label === r.label && x.date === r.date);
    let isOverdue = r.date <= today;
    let li = document.createElement("li");
    li.className = `list-group-item d-flex justify-content-between align-items-center ${isOverdue ? "text-danger" : ""}`;
    li.innerHTML = `<span>${r.label} - ${formatDate(r.date)} ${isOverdue ? "(overdue)" : ""}</span>
      <button class="btn btn-danger btn-sm" onclick="deleteReminder(${origIdx})">Delete</button>`;
    list.appendChild(li);
  });

  animateListItems(list);
}

// HISTORY
function filterHistory() {
  let searchInput = document.getElementById("historySearchInput").value.toLowerCase();
  let list = document.getElementById("historyList");
  
  let filtered = expenses.filter(e => e.category.toLowerCase().includes(searchInput));
  let count = document.getElementById("historyCount");
  if (count) {
    count.textContent = `Showing ${filtered.length} of ${expenses.length} expenses`;
  }
  
  list.innerHTML = "";
  let sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (sorted.length === 0) {
    if (expenses.length === 0) {
      list.innerHTML = `
        <li class="list-group-item text-center text-muted py-5">
          <div class="mb-3">
            <i class="bi bi-clock-history" style="font-size: 3rem;"></i>
          </div>
          <h5>No Expense History Yet</h5>
          <p>Your expense history will appear here once you start adding expenses.</p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('expense-tab').click();">Add Expense</button>
        </li>
      `;
    } else {
      list.innerHTML = "<li class=\"list-group-item text-muted\">No expenses found</li>";
    }
    return;
  }
  
  sorted.forEach((e, idx) => {
    let origIdx = expenses.indexOf(e);
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${e.category} - ${getCurrency()}${formatMoney(e.amount)} (${formatDate(e.date)})</span>
      <button class="btn btn-danger btn-sm" onclick="deleteExpense(${origIdx})">Delete</button>`;
    list.appendChild(li);
  });

  animateListItems(list);
}

function renderHistory() {
  filterHistory();
}

// SUMMARY
function calculateSummaryStats() {
  if (!document.getElementById("allTimeTotal")) return;
  
  // All-time total
  let allTimeTotal = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  document.getElementById("allTimeTotal").textContent = `${getCurrency()}${formatMoney(allTimeTotal)}`;
  
  // Biggest single expense
  let biggest = expenses.reduce((max, e) => (Number(e.amount) || 0) > (Number(max.amount) || 0) ? e : max, expenses[0] || { amount: 0, category: "—" });
  document.getElementById("biggestExpense").textContent = biggest.amount > 0 ? `${biggest.category} - ${getCurrency()}${formatMoney(biggest.amount)}` : "—";
  
  // Most spent category
  let categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  let topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
  document.getElementById("topCategory").textContent = topCat[0] !== "—" ? `${topCat[0]} - ${getCurrency()}${formatMoney(topCat[1])}` : "—";
  
  // Total lent (open)
  let totalLent = people.filter(p => p.type === "lent" && p.status === "open").reduce((sum, p) => sum + p.amount, 0);
  document.getElementById("totalLent").textContent = `${getCurrency()}${formatMoney(totalLent)}`;
  
  renderSummaryChart();
}

function renderSummaryChart() {
  let chartEl = document.getElementById("summaryChart");
  if (!chartEl) return;
  
  // Get last 6 months
  let today = new Date();
  let monthData = {};
  
  for (let i = 5; i >= 0; i--) {
    let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    let monthKey = d.toISOString().slice(0, 7);
    monthData[monthKey] = 0;
  }
  
  expenses.forEach(e => {
    let monthKey = e.date.slice(0, 7);
    if (monthData.hasOwnProperty(monthKey)) {
      monthData[monthKey] += e.amount;
    }
  });
  
  let labels = Object.keys(monthData).map(m => {
    let [y, mo] = m.split('-');
    let d = new Date(y, parseInt(mo) - 1);
    return d.toLocaleString('en-US', { month: 'short' });
  });
  let data = Object.values(monthData);
  
  if (data.every(d => d === 0)) {
    chartEl.style.display = 'none';
    let noDataMsg = document.createElement('div');
    noDataMsg.className = 'text-center text-muted py-5';
    noDataMsg.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-bar-chart" style="font-size: 3rem;"></i>
      </div>
      <h5>No Spending Data</h5>
      <p>Your monthly spending chart will appear here once you add expenses.</p>
    `;
    chartEl.parentNode.appendChild(noDataMsg);
    return;
  } else {
    // Remove any existing no data message
    let existingMsg = chartEl.parentNode.querySelector('.text-center.text-muted');
    if (existingMsg) existingMsg.remove();
    chartEl.style.display = 'block';
  }
  
  if (summaryChartInstance) summaryChartInstance.destroy();
  
  let ctx = chartEl.getContext('2d');
  summaryChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Monthly Spending (${getCurrency()})`,
        data: data,
        backgroundColor: 'var(--accent, #0d6efd)',
        borderColor: '#0861ca',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: `Amount (${getCurrency()})`
          }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        title: {
          display: false
        }
      }
    }
  });
}

// INIT
initQuoteTyping();
normalizeData();
applyAppearance();
loadSettings();
attachDataTabEvents();
initUpcomingFeaturesToggle();
renderExpenses();
renderEMI();
renderPeople();
renderCategoryOptions();
setDefaultExpenseDate();
renderReminders();
displayQuickNote();
renderHistory();
calculateSummaryStats();

// Set month selector to current month
let monthSelector = document.getElementById("monthSelector");
if (monthSelector) {
  monthSelector.value = new Date().toISOString().slice(0, 7);
}

// Set budget input
let budgetInput = document.getElementById("monthlyBudget");
if (budgetInput) {
  budgetInput.value = monthlyBudget;
}

calculateStats();