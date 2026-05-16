// Shared state and utility functions for Monever

let expenses = JSON.parse(localStorage.getItem("moneverExpenses") || localStorage.getItem("expenses") || "[]");
let emis = JSON.parse(localStorage.getItem("moneverEMIs") || localStorage.getItem("emis") || "[]");
let people = JSON.parse(localStorage.getItem("moneverPeople") || localStorage.getItem("people") || "[]");
let lastCategory = localStorage.getItem("lastCategory") || "";
let monthlyBudget = Number(localStorage.getItem("monthlyBudget") || 0);
let monthlyIncome = Number(localStorage.getItem("monthlyIncome") || 0);
let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
let recurringExpenses = JSON.parse(localStorage.getItem("recurringExpenses")) || [];
let reminders = JSON.parse(localStorage.getItem("moneverReminders") || localStorage.getItem("reminders") || "[]");
let chartInstance = null;
let summaryChartInstance = null;
let selectedMonth = null;
let currencySymbol = localStorage.getItem("currencySymbol") || "₹";
let defaultCategory = localStorage.getItem("defaultCategory") || "General";
let dateFormat = localStorage.getItem("dateFormat") || "YYYY-MM-DD";
let bgStyle = localStorage.getItem("bgStyle") || "Soft Gradient";

let editIndexExpense = -1;
let editIndexEMI = -1;
let editIndexPerson = -1;

const CHART_COLORS = ['#303030', '#505050', '#707070', '#909090', '#b0b0b0', '#282828', '#484848', '#686868', '#888888', '#a8a8a8'];

function getChartPatterns() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 10;
  canvas.height = 10;

  const patterns = [];

  // 1. Slant lines
  ctx.clearRect(0, 0, 10, 10);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 10); ctx.lineTo(10, 0);
  ctx.stroke();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 2. Dots
  ctx.clearRect(0, 0, 10, 10);
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(5, 5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 3. Horizontal lines
  ctx.clearRect(0, 0, 10, 10);
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, 5); ctx.lineTo(10, 5);
  ctx.stroke();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 4. Reverse Slant
  ctx.clearRect(0, 0, 10, 10);
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(10, 10);
  ctx.stroke();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 5. Crosshatch
  ctx.clearRect(0, 0, 10, 10);
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(10, 10);
  ctx.moveTo(0, 10); ctx.lineTo(10, 0);
  ctx.stroke();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 6. Vertical lines
  ctx.clearRect(0, 0, 10, 10);
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(5, 0); ctx.lineTo(5, 10);
  ctx.stroke();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 7. Square Grid
  ctx.clearRect(0, 0, 10, 10);
  ctx.strokeStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(0, 5); ctx.lineTo(10, 5);
  ctx.moveTo(5, 0); ctx.lineTo(5, 10);
  ctx.stroke();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 8. Grid Dots
  ctx.clearRect(0, 0, 10, 10);
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(2, 2, 1, 0, Math.PI * 2);
  ctx.arc(7, 7, 1, 0, Math.PI * 2);
  ctx.fill();
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  // 9. Checkerboard
  ctx.clearRect(0, 0, 10, 10);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 5, 5);
  ctx.fillRect(5, 5, 5, 5);
  patterns.push(ctx.createPattern(canvas, 'repeat'));

  return patterns;
}

function save() {
  localStorage.setItem("moneverExpenses", JSON.stringify(expenses));
  localStorage.setItem("moneverEMIs", JSON.stringify(emis));
  localStorage.setItem("moneverPeople", JSON.stringify(people));
  localStorage.setItem("moneverReminders", JSON.stringify(reminders));
  localStorage.setItem("monthlyBudget", String(monthlyBudget));
  localStorage.setItem("monthlyIncome", String(monthlyIncome));
  localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
  localStorage.setItem("recurringExpenses", JSON.stringify(recurringExpenses));
  localStorage.setItem("currencySymbol", currencySymbol);
  localStorage.setItem("defaultCategory", defaultCategory);
  localStorage.setItem("dateFormat", dateFormat);
  localStorage.setItem("bgStyle", bgStyle);
}

function normalizeData() {
  expenses = expenses.map(e => ({
    id: e.id || Date.now().toString() + Math.random().toString(36).slice(2),
    amount: Number(e.amount) || 0,
    category: e.category || defaultCategory || "General",
    date: e.date || new Date().toISOString().split('T')[0],
    description: e.description || ""
  }));
  emis = emis.map(e => ({
    id: e.id || Date.now().toString() + Math.random().toString(36).slice(2),
    name: e.name || "EMI",
    amount: Number(e.amount) || 0,
    date: e.date || new Date().toISOString().split('T')[0]
  }));
  people = people.map(p => ({
    id: p.id || Date.now().toString() + Math.random().toString(36).slice(2),
    name: p.name || "Unknown",
    amount: Number(p.amount) || 0,
    type: p.type === "borrowed" ? "borrowed" : "lent",
    status: p.status === "closed" ? "closed" : "open",
    description: p.description || ""
  }));
  monthlyBudget = Number(monthlyBudget) || 0;
  monthlyIncome = Number(monthlyIncome) || 0;
  categoryBudgets = categoryBudgets || {};
  recurringExpenses = recurringExpenses.map(re => ({
    id: re.id || Date.now().toString() + Math.random().toString(36).slice(2),
    amount: Number(re.amount) || 0,
    category: re.category || "General",
    description: re.description || "",
    dayOfMonth: Number(re.dayOfMonth) || 1,
    lastLoggedMonth: re.lastLoggedMonth || ""
  }));
  reminders = reminders.map(r => ({
    id: r.id || Date.now().toString() + Math.random().toString(36).slice(2),
    label: r.label || "Reminder",
    date: r.date || new Date().toISOString().split('T')[0]
  }));
  dateFormat = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].includes(dateFormat) ? dateFormat : "YYYY-MM-DD";
  bgStyle = ["Soft Gradient", "Corporate Blue", "Classic Gray"].includes(bgStyle) ? bgStyle : "Soft Gradient";
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
  let bgMain = '#c0c0c0';
  if (bgStyle === 'Corporate Blue') {
    bgMain = '#e3f2fd';
  } else if (bgStyle === 'Soft Gradient') {
    bgMain = '#f0f2f5';
  }
  document.documentElement.style.setProperty('--bg-main', bgMain);
}

function saveAppearance() {
  let bgStyleInput = document.getElementById('bgStyle');
  if (bgStyleInput) bgStyle = bgStyleInput.value || 'Soft Gradient';
  applyAppearance();
  save();
  showToast('Appearance saved successfully', 'success');
}

function loadSettings() {
  let currencyInput = document.getElementById('currencySymbol');
  let defaultCategoryInput = document.getElementById('defaultCategory');
  let dateFormatInput = document.getElementById('dateFormat');
  let bgStyleInput = document.getElementById('bgStyle');
  let budgetEl = document.getElementById('monthlyBudgetInput');
  let incomeEl = document.getElementById('incomeInput');

  if (currencyInput) currencyInput.value = currencySymbol;
  if (defaultCategoryInput) defaultCategoryInput.value = defaultCategory;
  if (dateFormatInput) dateFormatInput.value = dateFormat;
  if (bgStyleInput) bgStyleInput.value = bgStyle;
  if (budgetEl) budgetEl.value = monthlyBudget;
  if (incomeEl) incomeEl.value = monthlyIncome;

  let currencyPrefixes = document.querySelectorAll('.currency-prefix');
  currencyPrefixes.forEach(prefix => prefix.textContent = currencySymbol);

  if (bgStyleInput) {
    bgStyleInput.addEventListener('change', function (event) {
      bgStyle = event.target.value;
      applyAppearance();
    });
  }

  if (typeof renderCategoryBudgets === 'function') renderCategoryBudgets();
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
  if (typeof renderExpenses === 'function') renderExpenses();
  if (typeof renderEMI === 'function') renderEMI();
  if (typeof renderPeople === 'function') renderPeople();
  if (typeof renderHistory === 'function') renderHistory();
  if (typeof renderSummary === 'function') renderSummary();
}

function saveBudget() {
  let budgetEl = document.getElementById("monthlyBudgetInput");
  if (!budgetEl) return;
  let budgetValue = Number(budgetEl.value);
  if (isNaN(budgetValue) || budgetValue < 0) { showToast("Enter a valid budget amount", "danger"); return; }
  monthlyBudget = budgetValue;
  localStorage.setItem("monthlyBudget", String(monthlyBudget));
  showToast("Budget saved successfully", "success");
  if (typeof calculateStats === 'function') calculateStats();
}

function saveIncome() {
  let incomeEl = document.getElementById("incomeInput");
  if (!incomeEl) return;
  let incomeValue = Number(incomeEl.value);
  if (isNaN(incomeValue) || incomeValue < 0) { showToast("Enter a valid income amount", "danger"); return; }
  monthlyIncome = incomeValue;
  localStorage.setItem("monthlyIncome", String(monthlyIncome));
  showToast("Income saved successfully", "success");
  if (typeof calculateStats === 'function') calculateStats();
}

function addCategoryBudget() {
  let catNameEl = document.getElementById("budgetCategoryName");
  let catAmountEl = document.getElementById("budgetCategoryAmount");
  if (!catNameEl || !catAmountEl) return;

  let catName = catNameEl.value.trim();
  let catAmount = Number(catAmountEl.value);

  if (!catName || isNaN(catAmount) || catAmount <= 0) {
    showToast("Please enter a valid category and amount", "danger");
    return;
  }

  categoryBudgets[catName] = catAmount;
  save();
  catNameEl.value = "";
  catAmountEl.value = "";
  showToast(`Budget limit set for ${catName}`, "success");
  if (typeof renderCategoryBudgets === 'function') renderCategoryBudgets();
  if (typeof calculateStats === 'function') calculateStats();
}

function deleteCategoryBudget(catName) {
  delete categoryBudgets[catName];
  save();
  showToast(`Budget limit removed for ${catName}`, "info");
  if (typeof renderCategoryBudgets === 'function') renderCategoryBudgets();
  if (typeof calculateStats === 'function') calculateStats();
}

function renderCategoryBudgets() {
  let list = document.getElementById("categoryBudgetList");
  if (!list) return;

  list.innerHTML = "";
  Object.entries(categoryBudgets).forEach(([cat, amount]) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0 py-1";
    li.innerHTML = `<span><i class="bi bi-tag-fill me-2 text-muted"></i>${cat}: <strong>${getCurrency()}${formatMoney(amount)}</strong></span>
      <button class="btn btn-sm border-0 p-0" onclick="deleteCategoryBudget('${cat}')"><i class="bi bi-trash"></i></button>`;
    list.appendChild(li);
  });
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

function calculateStatsDirect(id, end) {
  let obj = document.getElementById(id);
  if (!obj) return;
  obj.textContent = `${getCurrency()}${formatMoney(end)}`;
}

function addButtonLoading(button) {
  button.classList.add('loading');
  setTimeout(() => {
    button.classList.remove('loading');
  }, 800);
}

function scrollToCard(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function formatMoney(value) {
  let amount = Number(value);
  if (isNaN(amount)) amount = 0;
  return amount.toFixed(2).replace(/\.00$/, "");
}

function showToast(message, type = "info", containerId = "toastContainer") {
  let container = document.getElementById(containerId) || document.getElementById("toastContainer");
  if (!container) return;

  let toastHtml = `
    <div class="toast align-items-center text-white" style="background-color: #404040;" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  let toastDiv = document.createElement("div");
  toastDiv.innerHTML = toastHtml;
  container.appendChild(toastDiv);

  let toast = new bootstrap.Toast(toastDiv.querySelector(".toast"));
  toast.show();

  toastDiv.addEventListener("hidden.bs.toast", function () {
    toastDiv.remove();
  });
}

function saveCategory(category) {
  lastCategory = category;
  localStorage.setItem("lastCategory", category);
  save();
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

function runMaintenanceTask(taskName) {
  const compactModal = bootstrap.Modal.getInstance(document.getElementById('compactModal')) || new bootstrap.Modal(document.getElementById('compactModal'));
  const rebuildModal = bootstrap.Modal.getInstance(document.getElementById('rebuildModal')) || new bootstrap.Modal(document.getElementById('rebuildModal'));
  compactModal.hide(); rebuildModal.hide();
  
  const progModalEl = document.getElementById('maintenanceProgressModal');
  if (!progModalEl) {
    showToast(taskName + ' complete', 'success');
    return;
  }
  
  const progModal = new bootstrap.Modal(progModalEl);
  const taskTitleEl = document.getElementById('maintenanceTaskTitle');
  if (taskTitleEl) taskTitleEl.textContent = taskName;
  
  progModal.show();
  let progress = 0; 
  const bar = document.getElementById('retroProgressBar'); 
  const status = document.getElementById('maintenanceStatus');
  const steps = [ 
    { p: 10, s: 'Initializing subsystem...' }, 
    { p: 30, s: 'Scanning data clusters...' }, 
    { p: 50, s: 'Optimizing index nodes...' }, 
    { p: 70, s: 'Flushing data buffers...' }, 
    { p: 90, s: 'Finalizing optimization...' }, 
    { p: 100, s: 'Maintenance Complete.' } 
  ];
  
  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      progress = steps[currentStep].p; 
      if (status) status.textContent = steps[currentStep].s; 
      if (bar) bar.style.width = progress + '%'; 
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        progModal.hide(); 
        showToast(taskName + ' successful', 'success');
        setTimeout(() => { 
          if (bar) bar.style.width = '0%'; 
          if (status) status.textContent = 'Initializing subsystem...'; 
        }, 500);
      }, 800);
    }
  }, 400);
}

function showEraseModal() {
  const eraseModalEl = document.getElementById('eraseModal');
  if (!eraseModalEl) {
    if (confirm("FACTORY RESET: This will delete ALL data. Proceed?")) {
      eraseAllData();
    }
    return;
  }
  const modal = bootstrap.Modal.getOrCreateInstance(eraseModalEl);
  modal.show();
}

function eraseAllData() {
  localStorage.clear();
  expenses = []; emis = []; people = []; reminders = []; recurringExpenses = [];
  showToast("All data has been erased. System restarting...", "warning");
  setTimeout(() => {
    location.reload();
  }, 1000);
}

function exportData() {
  let data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      const val = localStorage.getItem(key);
      data[key] = val.startsWith('{') || val.startsWith('[') ? JSON.parse(val) : val;
    } catch(e) {
      data[key] = localStorage.getItem(key);
    }
  }
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a'); a.href = url; a.download = 'monever_system_backup.json'; a.click();
  URL.revokeObjectURL(url);
  showToast("System data exported successfully", "success");
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
  showToast("Expense CSV exported successfully", "success");
}

function importData() {
  let fileInput = document.getElementById('importFile');
  if (!fileInput || !fileInput.files[0]) { 
    showToast("Please select a valid JSON file", "danger"); 
    return; 
  }
  let file = fileInput.files[0];
  let reader = new FileReader();
  reader.onload = function (e) {
    try {
      let data = JSON.parse(e.target.result);
      
      const keyMap = {
        'expenses': 'moneverExpenses',
        'emis': 'moneverEMIs',
        'reminders': 'moneverReminders',
        'people': 'moneverPeople',
        'userProfile': 'moneverProfile',
        'assets': 'moneverAssets',
        'liabilities': 'moneverLiabilities'
      };

      for (const oldKey in data) {
        const newKey = keyMap[oldKey] || oldKey;
        const val = data[oldKey];
        if (typeof val === 'object' && val !== null) {
          localStorage.setItem(newKey, JSON.stringify(val));
        } else {
          localStorage.setItem(newKey, val);
        }
      }
      
      showToast("Data imported. System reloading...", "success");
      setTimeout(() => location.reload(), 1500);
    } catch (err) { 
      showToast("Invalid backup file", "danger"); 
    }
  };
  reader.readAsText(file);
}

function loadDemoData() {
  const currentExpenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  if (currentExpenses.length >= 5) {
    if (!confirm("This will add comprehensive 6-month demo data alongside your existing data. Continue?")) return;
  }

  localStorage.setItem('moneverDemoActive', 'true');

  const now = new Date();
  const fmt = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const mo = (offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  };

  const allDemoExpenses = [
    // Month 0 (current month)  8 entries
    { id: 'demo-1', amount: 14500, category: 'Rent', date: fmt(mo(0).y, mo(0).m, 1), description: 'Monthly Apartment Rent' },
    { id: 'demo-2', amount: 1240, category: 'Utilities', date: fmt(mo(0).y, mo(0).m, 3), description: 'Electricity & Water Bill' },
    { id: 'demo-3', amount: 499, category: 'Subscriptions', date: fmt(mo(0).y, mo(0).m, 5), description: 'Netflix Subscription' },
    { id: 'demo-4', amount: 380, category: 'Food', date: fmt(mo(0).y, mo(0).m, 6), description: 'Breakfast and Tea' },
    { id: 'demo-5', amount: 1850, category: 'Groceries', date: fmt(mo(0).y, mo(0).m, 7), description: 'Weekly Grocery Run' },
    { id: 'demo-6', amount: 240, category: 'Transport', date: fmt(mo(0).y, mo(0).m, 8), description: 'Auto Rickshaw Fare' },
    { id: 'demo-7', amount: 920, category: 'Dining Out', date: fmt(mo(0).y, mo(0).m, 9), description: 'Dinner with Friends' },
    { id: 'demo-8', amount: 1200, category: 'Shopping', date: fmt(mo(0).y, mo(0).m, 10), description: 'Stationery and Misc' },

    // Month 1 (last month)  18 entries
    { id: 'demo-9', amount: 14500, category: 'Rent', date: fmt(mo(1).y, mo(1).m, 1), description: 'Monthly Apartment Rent' },
    { id: 'demo-10', amount: 1100, category: 'Utilities', date: fmt(mo(1).y, mo(1).m, 4), description: 'Electricity Bill' },
    { id: 'demo-11', amount: 499, category: 'Subscriptions', date: fmt(mo(1).y, mo(1).m, 5), description: 'Netflix Subscription' },
    { id: 'demo-12', amount: 199, category: 'Subscriptions', date: fmt(mo(1).y, mo(1).m, 6), description: 'Spotify Premium' },
    { id: 'demo-13', amount: 450, category: 'Food', date: fmt(mo(1).y, mo(1).m, 7), description: 'Lunch at Office' },
    { id: 'demo-14', amount: 2400, category: 'Groceries', date: fmt(mo(1).y, mo(1).m, 8), description: 'Weekly Grocery Run' },
    { id: 'demo-15', amount: 320, category: 'Transport', date: fmt(mo(1).y, mo(1).m, 9), description: 'Uber Ride' },
    { id: 'demo-16', amount: 650, category: 'Health', date: fmt(mo(1).y, mo(1).m, 11), description: 'Pharmacy' },
    { id: 'demo-17', amount: 1100, category: 'Dining Out', date: fmt(mo(1).y, mo(1).m, 13), description: 'Weekend Lunch' },
    { id: 'demo-18', amount: 480, category: 'Food', date: fmt(mo(1).y, mo(1).m, 14), description: 'Breakfast and Coffee' },
    { id: 'demo-19', amount: 1800, category: 'Groceries', date: fmt(mo(1).y, mo(1).m, 16), description: 'Mid-month Groceries' },
    { id: 'demo-20', amount: 180, category: 'Transport', date: fmt(mo(1).y, mo(1).m, 17), description: 'Auto Rickshaw' },
    { id: 'demo-21', amount: 3400, category: 'Shopping', date: fmt(mo(1).y, mo(1).m, 19), description: 'Clothing and Shoes' },
    { id: 'demo-22', amount: 599, category: 'Entertainment', date: fmt(mo(1).y, mo(1).m, 21), description: 'Movie Tickets' },
    { id: 'demo-23', amount: 520, category: 'Food', date: fmt(mo(1).y, mo(1).m, 22), description: 'Swiggy Order' },
    { id: 'demo-24', amount: 950, category: 'Dining Out', date: fmt(mo(1).y, mo(1).m, 25), description: 'Birthday Dinner' },
    { id: 'demo-25', amount: 280, category: 'Transport', date: fmt(mo(1).y, mo(1).m, 27), description: 'Metro Recharge' },
    { id: 'demo-26', amount: 420, category: 'Food', date: fmt(mo(1).y, mo(1).m, 29), description: 'Office Canteen' },

    // Month 2  16 entries
    { id: 'demo-27', amount: 14500, category: 'Rent', date: fmt(mo(2).y, mo(2).m, 1), description: 'Monthly Apartment Rent' },
    { id: 'demo-28', amount: 980, category: 'Utilities', date: fmt(mo(2).y, mo(2).m, 3), description: 'Electricity & Gas' },
    { id: 'demo-29', amount: 499, category: 'Subscriptions', date: fmt(mo(2).y, mo(2).m, 5), description: 'Netflix Subscription' },
    { id: 'demo-30', amount: 390, category: 'Food', date: fmt(mo(2).y, mo(2).m, 6), description: 'Breakfast' },
    { id: 'demo-31', amount: 2200, category: 'Groceries', date: fmt(mo(2).y, mo(2).m, 7), description: 'Weekly Grocery Run' },
    { id: 'demo-32', amount: 420, category: 'Transport', date: fmt(mo(2).y, mo(2).m, 9), description: 'Fuel' },
    { id: 'demo-33', amount: 1200, category: 'Health', date: fmt(mo(2).y, mo(2).m, 11), description: 'Doctor Consultation' },
    { id: 'demo-34', amount: 780, category: 'Dining Out', date: fmt(mo(2).y, mo(2).m, 13), description: 'Lunch with Colleagues' },
    { id: 'demo-35', amount: 5500, category: 'Shopping', date: fmt(mo(2).y, mo(2).m, 15), description: 'Electronics Accessories' },
    { id: 'demo-36', amount: 1600, category: 'Groceries', date: fmt(mo(2).y, mo(2).m, 18), description: 'Weekend Grocery' },
    { id: 'demo-37', amount: 290, category: 'Transport', date: fmt(mo(2).y, mo(2).m, 20), description: 'Auto Fares' },
    { id: 'demo-38', amount: 480, category: 'Food', date: fmt(mo(2).y, mo(2).m, 22), description: 'Zomato Order' },
    { id: 'demo-39', amount: 899, category: 'Entertainment', date: fmt(mo(2).y, mo(2).m, 23), description: 'Concert Tickets' },
    { id: 'demo-40', amount: 1300, category: 'Dining Out', date: fmt(mo(2).y, mo(2).m, 25), description: 'Dinner Date' },
    { id: 'demo-41', amount: 340, category: 'Food', date: fmt(mo(2).y, mo(2).m, 27), description: 'Tea and Snacks' },
    { id: 'demo-42', amount: 2800, category: 'Shopping', date: fmt(mo(2).y, mo(2).m, 28), description: 'Clothing' },

    // Month 3  15 entries
    { id: 'demo-43', amount: 14500, category: 'Rent', date: fmt(mo(3).y, mo(3).m, 1), description: 'Monthly Apartment Rent' },
    { id: 'demo-44', amount: 1050, category: 'Utilities', date: fmt(mo(3).y, mo(3).m, 4), description: 'Electricity Bill' },
    { id: 'demo-45', amount: 499, category: 'Subscriptions', date: fmt(mo(3).y, mo(3).m, 5), description: 'Netflix Subscription' },
    { id: 'demo-46', amount: 360, category: 'Food', date: fmt(mo(3).y, mo(3).m, 7), description: 'Office Lunch' },
    { id: 'demo-47', amount: 1900, category: 'Groceries', date: fmt(mo(3).y, mo(3).m, 8), description: 'Grocery Shopping' },
    { id: 'demo-48', amount: 550, category: 'Transport', date: fmt(mo(3).y, mo(3).m, 10), description: 'Cab to Airport' },
    { id: 'demo-49', amount: 12000, category: 'Shopping', date: fmt(mo(3).y, mo(3).m, 12), description: 'New Shoes and Bag' },
    { id: 'demo-50', amount: 600, category: 'Health', date: fmt(mo(3).y, mo(3).m, 14), description: 'Pharmacy' },
    { id: 'demo-51', amount: 1500, category: 'Dining Out', date: fmt(mo(3).y, mo(3).m, 16), description: 'Friends Gathering' },
    { id: 'demo-52', amount: 400, category: 'Food', date: fmt(mo(3).y, mo(3).m, 18), description: 'Snacks and Beverages' },
    { id: 'demo-53', amount: 1400, category: 'Groceries', date: fmt(mo(3).y, mo(3).m, 20), description: 'Fruit and Vegetables' },
    { id: 'demo-54', amount: 199, category: 'Subscriptions', date: fmt(mo(3).y, mo(3).m, 21), description: 'Spotify Premium' },
    { id: 'demo-55', amount: 300, category: 'Transport', date: fmt(mo(3).y, mo(3).m, 23), description: 'Metro and Bus' },
    { id: 'demo-56', amount: 750, category: 'Entertainment', date: fmt(mo(3).y, mo(3).m, 25), description: 'OTT Annual Plan' },
    { id: 'demo-57', amount: 2100, category: 'Dining Out', date: fmt(mo(3).y, mo(3).m, 27), description: 'Family Dinner' }
  ];

  // Months 4 through 11  generate 12 entries per month
  let idCounter = 58;
  for (let mOffset = 4; mOffset <= 11; mOffset++) {
    const mData = mo(mOffset);
    allDemoExpenses.push(
      { id: `demo-${idCounter++}`, amount: 14500, category: 'Rent', date: fmt(mData.y, mData.m, 1), description: 'Monthly Apartment Rent' },
      { id: `demo-${idCounter++}`, amount: 1100, category: 'Utilities', date: fmt(mData.y, mData.m, 4), description: 'Electricity Bill' },
      { id: `demo-${idCounter++}`, amount: 499, category: 'Subscriptions', date: fmt(mData.y, mData.m, 5), description: 'Netflix Subscription' },
      { id: `demo-${idCounter++}`, amount: 410, category: 'Food', date: fmt(mData.y, mData.m, 7), description: 'Lunch at Office' },
      { id: `demo-${idCounter++}`, amount: 2000, category: 'Groceries', date: fmt(mData.y, mData.m, 9), description: 'Weekly Grocery Run' },
      { id: `demo-${idCounter++}`, amount: 350, category: 'Transport', date: fmt(mData.y, mData.m, 11), description: 'Uber Ride' },
      { id: `demo-${idCounter++}`, amount: 900, category: 'Dining Out', date: fmt(mData.y, mData.m, 15), description: 'Weekend Lunch' },
      { id: `demo-${idCounter++}`, amount: 490, category: 'Food', date: fmt(mData.y, mData.m, 17), description: 'Breakfast and Coffee' },
      { id: `demo-${idCounter++}`, amount: 1700, category: 'Groceries', date: fmt(mData.y, mData.m, 20), description: 'Mid-month Groceries' },
      { id: `demo-${idCounter++}`, amount: 2500, category: 'Shopping', date: fmt(mData.y, mData.m, 22), description: 'Clothing and Shoes' },
      { id: `demo-${idCounter++}`, amount: 650, category: 'Entertainment', date: fmt(mData.y, mData.m, 25), description: 'Movie Tickets' },
      { id: `demo-${idCounter++}`, amount: 280, category: 'Transport', date: fmt(mData.y, mData.m, 28), description: 'Auto Rickshaw' }
    );
  }

  const allExpenses = [...currentExpenses, ...allDemoExpenses];
  localStorage.setItem('moneverExpenses', JSON.stringify(allExpenses));

  // EMIs
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const ny = nextMonth.getFullYear();
  const nm = nextMonth.getMonth();
  const emisData = [
    { id: 'demo-emi-1', name: 'Car Loan', amount: 8500, date: formatDate(ny, nm, 1) },
    { id: 'demo-emi-2', name: 'Personal Loan', amount: 4200, date: formatDate(ny, nm, 15) },
    { id: 'demo-emi-3', name: 'Home Loan', amount: 45000, date: formatDate(ny, nm, 5) },
    { id: 'demo-emi-4', name: 'Electronics EMI', amount: 2400, date: formatDate(ny, nm, 10) }
  ];
  localStorage.setItem('moneverEMIs', JSON.stringify(emisData));

  // Reminders
  const addDays = (d) => {
    const res = new Date(now);
    res.setDate(res.getDate() + d);
    return formatDate(res.getFullYear(), res.getMonth(), res.getDate());
  };
  const remindersData = [
    { id: 'demo-r-1', label: 'Pay electricity bill', date: addDays(5) },
    { id: 'demo-r-2', label: 'Renew gym membership', date: addDays(12) },
    { id: 'demo-r-3', label: 'File quarterly taxes', date: addDays(20) },
    { id: 'demo-r-4', label: 'Renew Car Insurance', date: addDays(25) },
    { id: 'demo-r-5', label: 'Quarterly House Tax', date: addDays(40) }
  ];
  localStorage.setItem('moneverReminders', JSON.stringify(remindersData));

  // People Ledger
  const peopleData = [
    { id: 'demo-p-1', name: 'Rahul', amount: 2500, type: 'lent', status: 'open', description: 'Dinner split' },
    { id: 'demo-p-2', name: 'Priya', amount: 1200, type: 'borrowed', status: 'open', description: 'Uber trip' },
    { id: 'demo-p-3', name: 'Amit', amount: 5000, type: 'lent', status: 'closed', description: 'Weekend trip' },
    { id: 'demo-p-4', name: 'Suresh', amount: 800, type: 'borrowed', status: 'closed', description: 'Coffee' },
    { id: 'demo-p-5', name: 'Karan', amount: 15000, type: 'lent', status: 'open', description: 'Emergency help' },
    { id: 'demo-p-6', name: 'Sneha', amount: 450, type: 'borrowed', status: 'open', description: 'Movie ticket' }
  ];
  localStorage.setItem('people', JSON.stringify(peopleData));

  // Financial Goals
  const goals = [
    { id: 'demo-g-1', name: 'Emergency Fund', target: 150000, saved: 67000, targetDate: addDays(180) },
    { id: 'demo-g-2', name: 'Europe Trip', target: 250000, saved: 42000, targetDate: addDays(540) },
    { id: 'demo-g-3', name: 'New Laptop', target: 80000, saved: 25000, targetDate: addDays(90) }
  ];
  localStorage.setItem('financialGoals', JSON.stringify(goals));

  const demoAssets = [
    { id: 'demo-asset-1', name: 'Savings Account', amount: 85000, type: 'Cash' },
    { id: 'demo-asset-2', name: 'Mutual Funds', amount: 120000, type: 'Investments' },
    { id: 'demo-asset-3', name: 'Laptop', amount: 45000, type: 'Other' }
  ];
  localStorage.setItem('moneverAssets', JSON.stringify(demoAssets));

  const demoLiabilities = [
    { id: 'demo-liability-1', name: 'Personal Loan', amount: 80000 },
    { id: 'demo-liability-2', name: 'Credit Card Outstanding', amount: 12000 }
  ];
  localStorage.setItem('moneverLiabilities', JSON.stringify(demoLiabilities));

  localStorage.setItem('monthlyBudget', '35000');
  localStorage.setItem('monthlyIncome', '75000');

  // UI Updates
  const banner = document.getElementById('demo-banner');
  const loadBtn = document.getElementById('demo-load-btn');
  if (banner) banner.style.display = 'flex';
  if (loadBtn) loadBtn.style.display = 'none';

  // Update global state so normalizeData/save don't overwrite with old values
  expenses = allExpenses;
  emis = emisData;
  reminders = remindersData;
  people = peopleData;
  monthlyBudget = 35000;
  monthlyIncome = 75000;
  showToast('Comprehensive 6-month demo data loaded!', 'success');

  if (typeof normalizeData === 'function') normalizeData();
  if (typeof calculateStats === 'function') calculateStats();
  setTimeout(() => location.reload(), 800);
}

function clearDemoData() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    try {
      const val = localStorage.getItem(key);
      if (!val) return;
      const data = JSON.parse(val);
      if (Array.isArray(data)) {
        const filtered = data.filter(item => !String(item.id || '').startsWith('demo-'));
        localStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (e) {
      // Not JSON or not an array, ignore
    }
  });

  const savedAssets = JSON.parse(localStorage.getItem('moneverAssets') || '[]');
  const filteredAssets = savedAssets.filter(a => !String(a.id).startsWith('demo-'));
  if (filteredAssets.length > 0) {
    localStorage.setItem('moneverAssets', JSON.stringify(filteredAssets));
  } else {
    localStorage.removeItem('moneverAssets');
  }

  const savedLiabilities = JSON.parse(localStorage.getItem('moneverLiabilities') || '[]');
  const filteredLiabilities = savedLiabilities.filter(l => !String(l.id).startsWith('demo-'));
  if (filteredLiabilities.length > 0) {
    localStorage.setItem('moneverLiabilities', JSON.stringify(filteredLiabilities));
  } else {
    localStorage.removeItem('moneverLiabilities');
  }

  if (localStorage.getItem('monthlyBudget') === '35000') {
    localStorage.removeItem('monthlyBudget');
    monthlyBudget = 0;
  }
  if (localStorage.getItem('monthlyIncome') === '75000') {
    localStorage.removeItem('monthlyIncome');
    monthlyIncome = 0;
  }
  
  localStorage.removeItem('moneverDemoActive');
  
  // Immediately update UI before reload
  const banner = document.getElementById('demo-banner');
  const loadBtn = document.getElementById('demo-load-btn');
  if (banner) banner.style.display = 'none';
  if (loadBtn) loadBtn.style.display = 'block';
  
  showToast('Demo data cleared.', 'info');
  setTimeout(() => location.reload(), 500);
}

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('demo-banner');
  const loadBtn = document.getElementById('demo-load-btn');
  if (localStorage.getItem('moneverDemoActive') === 'true') {
    if (banner) banner.style.display = 'flex';
    if (loadBtn) loadBtn.style.display = 'none';
  } else {
    if (banner) banner.style.display = 'none';
    if (loadBtn) loadBtn.style.display = 'block';
  }
});
// Shared Data Management
function deleteExpenseById(id) {
  const index = expenses.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    expenses.splice(index, 1);
    save();
    showToast("Expense deleted", "success");
    if (typeof renderExpenses === 'function') renderExpenses();
    if (typeof renderRecentExpenses === 'function') renderRecentExpenses();
    if (typeof calculateStats === 'function') calculateStats();
    if (typeof filterHistory === 'function') filterHistory();
  }
}

function editExpenseById(id) {
  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  if (isHomePage) {
    if (typeof editExpense === 'function') {
      const index = expenses.findIndex(e => String(e.id) === String(id));
      if (index !== -1) editExpense(index);
    }
  } else {
    window.location.href = `index.html?editExpense=${id}`;
  }
}

function deleteEMIById(id) {
  const index = emis.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    emis.splice(index, 1);
    save();
    showToast("EMI deleted", "success");
    if (typeof renderEMI === 'function') renderEMI();
    if (typeof renderUpcomingPayments === 'function') renderUpcomingPayments();
  }
}

function editEMIById(id) {
  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  if (isHomePage) {
    if (typeof editEMI === 'function') {
      const index = emis.findIndex(e => String(e.id) === String(id));
      if (index !== -1) editEMI(index);
    }
  } else {
    window.location.href = `index.html?editEMI=${id}`;
  }
}

function deletePersonById(id) {
  const index = people.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    people.splice(index, 1);
    save();
    showToast("Person record deleted", "success");
    if (typeof renderPeople === 'function') renderPeople();
  }
}

function editPersonById(id) {
  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  if (isHomePage) {
    if (typeof editPerson === 'function') {
      const index = people.findIndex(e => String(e.id) === String(id));
      if (index !== -1) editPerson(index);
    }
  } else {
    window.location.href = `index.html?editPerson=${id}`;
  }
}
