// Shared state and utility functions for Monever

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let emis = JSON.parse(localStorage.getItem("emis")) || [];
let people = JSON.parse(localStorage.getItem("people")) || [];
let lastCategory = localStorage.getItem("lastCategory") || "";
let monthlyBudget = Number(localStorage.getItem("monthlyBudget") || 0);
let monthlyIncome = Number(localStorage.getItem("monthlyIncome") || 0);
let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
let recurringExpenses = JSON.parse(localStorage.getItem("recurringExpenses")) || [];
let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
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

const CHART_COLORS = ['#008080', '#800000', '#000080', '#808000', '#800080', '#008000', '#C0C000', '#004080', '#804000', '#006060'];

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("emis", JSON.stringify(emis));
  localStorage.setItem("people", JSON.stringify(people));
  localStorage.setItem("reminders", JSON.stringify(reminders));
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
    id: e.id || Date.now() + Math.random(),
    amount: Number(e.amount) || 0,
    category: e.category || defaultCategory || "General",
    date: e.date || new Date().toISOString().split('T')[0],
    description: e.description || ""
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
  monthlyIncome = Number(monthlyIncome) || 0;
  categoryBudgets = categoryBudgets || {};
  recurringExpenses = recurringExpenses.map(re => ({
    id: re.id || Date.now() + Math.random(),
    amount: Number(re.amount) || 0,
    category: re.category || "General",
    description: re.description || "",
    dayOfMonth: Number(re.dayOfMonth) || 1,
    lastLoggedMonth: re.lastLoggedMonth || ""
  }));
  reminders = reminders.map(r => ({
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

function loadSettings() {
  let currencyInput = document.getElementById('currencySymbol');
  let defaultCategoryInput = document.getElementById('defaultCategory');
  let dateFormatInput = document.getElementById('dateFormat');
  let bgStyleInput = document.getElementById('bgStyle');
  let budgetEl = document.getElementById('monthlyBudget');
  let incomeEl = document.getElementById('monthlyIncome');

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
    <div class="toast align-items-center text-white bg-${type === "danger" ? "danger" : type === "success" ? "success" : type === "warning" ? "warning" : "info"}" role="alert" aria-live="assertive" aria-atomic="true">
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
