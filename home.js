// Logic specific to index.html (Home page)

function initQuoteTyping() {
  let quoteEl = document.getElementById('quoteContent');
  if (!quoteEl) return;

  const quotes = [
    "A budget is telling your money where to go instead of wondering where it went. ~ Dave Ramsey",
    "Do not save what is left after spending; spend what is left after saving. ~ Warren Buffett",
    "Money is a terrible master but an excellent servant. ~ P.T. Barnum",
    "The goal isn't more money. The goal is living life on your terms. ~ Chris Brogan",
    "Small daily improvements over time lead to stunning results. ~ Robin Sharma",
    "Wealth consists not in having great possessions, but in having few wants. ~ Epictetus",
    "It's not your salary that makes you rich, it's your spending habits. ~ Charles A. Jaffe",
    "Never spend your money before you have it. ~ Thomas Jefferson",
    "Save money and money will save you. ~ Jamaican Proverb",
    "The most important investment you can make is in yourself. ~ Warren Buffett",
    "Budgeting isn't about limiting yourself; it's about making the things that excite you possible. ~ Unknown"
  ];

  let selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.style.opacity = '0';
  setTimeout(() => {
    quoteEl.textContent = selectedQuote;
    quoteEl.style.transition = 'opacity 0.8s ease';
    quoteEl.style.opacity = '1';
  }, 400);
}

function addExpense() {
  let amount = document.getElementById("amount").value;
  let categoryInput = document.getElementById("customCategory");
  let category = categoryInput.value || lastCategory || defaultCategory || "General";
  let date = document.getElementById("expenseDate").value || new Date().toISOString().split('T')[0];
  let description = document.getElementById("expenseDescription").value;
  let isRecurring = document.getElementById("repeatMonthly").checked;

  if (!amount) {
    showToast("Please enter an amount", "danger");
    return;
  }

  if (Number(amount) <= 0) {
    showToast("Amount must be greater than 0", "danger");
    return;
  }

  if (editIndexExpense > -1) {
    let existingId = expenses[editIndexExpense].id;
    expenses[editIndexExpense] = { id: existingId, amount: Number(amount), category, date, description };
    editIndexExpense = -1;
    let btn = document.querySelector("#expense .btn-primary");
    if (btn) btn.textContent = "Add Expense Entry";
    showToast("Expense updated successfully", "success");
  } else {
    expenses.push({ id: Date.now() + Math.random(), amount: Number(amount), category, date, description });
    if (isRecurring) {
      let day = new Date(date).getDate();
      let monthKey = date.slice(0, 7);
      recurringExpenses.push({
        id: Date.now() + Math.random() + 1,
        amount: Number(amount),
        category,
        description,
        dayOfMonth: day,
        lastLoggedMonth: monthKey
      });
      renderRecurringExpenses();
    }
    showToast("Expense added successfully", "success");
  }

  save();
  saveCategory(category);
  document.getElementById("amount").value = "";
  categoryInput.value = category;
  document.getElementById("expenseDate").value = new Date().toISOString().split('T')[0];
  document.getElementById("expenseDescription").value = "";
  document.getElementById("repeatMonthly").checked = false;
  if (typeof renderExpenses === 'function') renderExpenses();
  renderRecentExpenses();
  if (typeof calculateStats === 'function') calculateStats();
  scrollToCard('expense');
}

function editExpense(index) {
  editIndexExpense = index;
  let exp = expenses[index];
  document.getElementById("amount").value = exp.amount;
  document.getElementById("customCategory").value = exp.category;
  document.getElementById("expenseDate").value = exp.date;
  document.getElementById("expenseDescription").value = exp.description || "";

  let tab = document.getElementById("expense-tab");
  if (tab) tab.click();

  let btn = document.querySelector("#expense .btn-primary");
  if (btn) btn.textContent = "Update Expense Entry";

  scrollToCard('expense');
}

function editExpenseById(id) {
  const index = expenses.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    editExpense(index);
  }
}

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

  if (editIndexEMI > -1) {
    emis[editIndexEMI] = { name, amount: amountValue, date };
    editIndexEMI = -1;
    let btn = document.querySelector("#emi .btn-warning");
    if (btn) btn.textContent = "Schedule EMI Payment";
    showToast("EMI updated successfully", "success");
  } else {
    emis.push({ name, amount: amountValue, date });
    showToast("EMI added successfully", "success");
  }

  save();
  document.getElementById("emiName").value = "";
  document.getElementById("emiAmount").value = "";
  document.getElementById("emiDate").value = "";
  if (typeof renderEMI === 'function') renderEMI();
  scrollToCard('emi');
}

function editEMI(index) {
  editIndexEMI = index;
  let emi = emis[index];
  document.getElementById("emiName").value = emi.name;
  document.getElementById("emiAmount").value = emi.amount;
  document.getElementById("emiDate").value = emi.date;

  let tab = document.getElementById("emi-tab");
  if (tab) tab.click();

  let btn = document.querySelector("#emi .btn-warning");
  if (btn) btn.textContent = "Update EMI Payment";

  scrollToCard('emi');
}

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

  if (editIndexPerson > -1) {
    people[editIndexPerson] = { name, amount: amountValue, type, status: people[editIndexPerson].status, description };
    editIndexPerson = -1;
    let btn = document.querySelector("#person .btn-info");
    if (btn) btn.textContent = "Save Ledger Record";
    showToast("Person record updated successfully", "success");
  } else {
    people.push({ name, amount: amountValue, type, status: "open", description });
    showToast("Person record added successfully", "success");
  }

  save();
  document.getElementById("personName").value = "";
  document.getElementById("personAmount").value = "";
  document.getElementById("personDescription").value = "";
  if (typeof renderPeople === 'function') renderPeople();
  scrollToCard('person');
}

function editPerson(index) {
  editIndexPerson = index;
  let p = people[index];
  document.getElementById("personName").value = p.name;
  document.getElementById("personAmount").value = p.amount;
  document.getElementById("transactionType").value = p.type;
  document.getElementById("personDescription").value = p.description;

  let tab = document.getElementById("person-tab");
  if (tab) tab.click();

  let btn = document.querySelector("#person .btn-info");
  if (btn) btn.textContent = "Update Ledger Record";

  scrollToCard('person');
}

function saveQuickNote() {
  let noteText = document.getElementById("quickNoteTextarea").value;
  if (!noteText.trim()) {
    showToast("Please write a note first", "warning");
    return;
  }

  let notes = JSON.parse(localStorage.getItem("quickNotes")) || [];
  let newNote = {
    id: Date.now(),
    text: noteText,
    date: new Date().toISOString()
  };
  notes.unshift(newNote);
  if (notes.length > 20) notes = notes.slice(0, 20);
  localStorage.setItem("quickNotes", JSON.stringify(notes));

  document.getElementById("quickNoteTextarea").value = "";
  showToast("Note added successfully", "success");
  displayQuickNote();
}

function deleteNote(id) {
  let notes = JSON.parse(localStorage.getItem("quickNotes")) || [];
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem("quickNotes", JSON.stringify(notes));
  displayQuickNote();
  showToast("Note deleted", "success");
}

function displayQuickNote() {
  let notes = JSON.parse(localStorage.getItem("quickNotes")) || [];
  let display = document.getElementById("quickNoteDisplay");
  if (!display) return;

  if (notes.length > 0) {
    let html = '<ul class="list-group shadow-sm">';
    notes.forEach(n => {
      html += `
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <div class="ms-2 me-auto">
            <div class="fw-bold small text-muted mb-1">${formatDate(n.date)}</div>
            <p class="mb-0" style="white-space: pre-wrap;">${n.text}</p>
          </div>
          <button class="btn btn-outline-danger btn-sm border-0" onclick="deleteNote(${n.id})">
            <i class="bi bi-trash"></i>
          </button>
        </li>
      `;
    });
    html += '</ul>';
    display.innerHTML = html;
  } else {
    display.innerHTML = '<p class="text-muted text-center py-3">No notes saved yet.</p>';
  }
}

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
    let isOverdue = r.date < today;
    let li = document.createElement("li");
    li.className = `list-group-item d-flex justify-content-between align-items-center ${isOverdue ? "text-danger" : ""}`;
    li.innerHTML = `<span>${r.label} - ${formatDate(r.date)} ${isOverdue ? "(overdue)" : ""}</span>
      <button class="btn btn-danger btn-sm" onclick="deleteReminder(${origIdx})">Delete</button>`;
    list.appendChild(li);
  });

  animateListItems(list);
}

function renderRecentExpenses() {
  let list = document.getElementById("recentEntriesList");
  if (!list) return;

  list.innerHTML = "";
  let sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (sorted.length === 0) {
    list.innerHTML = '<li class="list-group-item text-center text-muted py-3">No recent entries found.</li>';
    return;
  }

  sorted.forEach(e => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0 mb-2";
    li.innerHTML = `
      <div>
        <span class="fw-bold text-dark">${e.category}</span>
        <div class="small text-muted">${formatDate(e.date)}</div>
      </div>
      <span class="badge bg-secondary rounded-pill">${getCurrency()}${formatMoney(e.amount)}</span>
    `;
    list.appendChild(li);
  });
}

function processRecurringExpenses() {
  let today = new Date();
  let currentMonthKey = today.toISOString().slice(0, 7);
  let currentDay = today.getDate();
  let loggedCount = 0;

  recurringExpenses.forEach(re => {
    if (re.lastLoggedMonth !== currentMonthKey && currentDay >= re.dayOfMonth) {
      let date = `${currentMonthKey}-${String(re.dayOfMonth).padStart(2, '0')}`;
      expenses.push({
        id: Date.now() + Math.random(),
        amount: re.amount,
        category: re.category,
        date: date,
        description: (re.description ? re.description + " " : "") + "(Auto-logged)"
      });
      re.lastLoggedMonth = currentMonthKey;
      loggedCount++;
    }
  });

  if (loggedCount > 0) {
    save();
    showToast(`Auto-logged ${loggedCount} recurring expense(s)`, "success");
  }
}

function renderRecurringExpenses() {
  let list = document.getElementById("recurringExpenseList");
  if (!list) return;

  list.innerHTML = "";
  if (recurringExpenses.length === 0) {
    list.innerHTML = "<li class='list-group-item text-muted'>No recurring expenses yet</li>";
    return;
  }

  recurringExpenses.forEach((re) => {
    let li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span><strong>${re.category}</strong> - ${getCurrency()}${formatMoney(re.amount)} (Day ${re.dayOfMonth})</span>
      <button class="btn btn-danger btn-sm" onclick="deleteRecurringExpense('${re.id}')">Delete</button>`;
    list.appendChild(li);
  });
}

function deleteRecurringExpense(id) {
  recurringExpenses = recurringExpenses.filter(re => String(re.id) !== String(id));
  save();
  showToast("Recurring expense removed", "success");
  renderRecurringExpenses();
}

let splitPeople = [];

function addSplitPerson() {
  let name = document.getElementById("splitPersonName").value.trim();
  if (!name) return;
  if (splitPeople.includes(name)) {
    showToast("Person already added", "warning");
    return;
  }
  splitPeople.push(name);
  document.getElementById("splitPersonName").value = "";
  renderSplitPeople();
}

function removeSplitPerson(name) {
  splitPeople = splitPeople.filter(p => p !== name);
  renderSplitPeople();
}

function renderSplitPeople() {
  let container = document.getElementById("splitPeopleBadges");
  if (!container) return;
  container.innerHTML = "";
  splitPeople.forEach(p => {
    let badge = document.createElement("span");
    badge.className = "badge bg-secondary p-2 d-flex align-items-center gap-2";
    badge.innerHTML = `${p} <i class="bi bi-x-circle cursor-pointer" onclick="removeSplitPerson('${p}')"></i>`;
    container.appendChild(badge);
  });
}

function splitEqually() {
  let total = Number(document.getElementById("splitTotalAmount").value);
  if (!total || splitPeople.length === 0) {
    showToast("Enter total bill and add at least one person", "warning");
    return;
  }
  let share = total / splitPeople.length;
  let resultsList = document.getElementById("splitResultsList");
  resultsList.innerHTML = "";
  splitPeople.forEach(p => {
    resultsList.innerHTML += `<div class="d-flex justify-content-between mb-2">
      <span class="fw-bold">${p}</span>
      <span>${getCurrency()}${formatMoney(share.toFixed(2))}</span>
    </div>`;
  });
  document.getElementById("unequalSplitSection").classList.add("d-none");
  document.getElementById("splitResults").classList.remove("d-none");
}

function showUnequalSplit() {
  let total = Number(document.getElementById("splitTotalAmount").value);
  if (!total || splitPeople.length === 0) {
    showToast("Enter total bill and add at least one person", "warning");
    return;
  }
  document.getElementById("targetSplitTotal").textContent = getCurrency() + formatMoney(total);
  let container = document.getElementById("unequalInputsContainer");
  container.innerHTML = "";
  splitPeople.forEach(p => {
    container.innerHTML += `
      <div class="row mb-2 align-items-center">
        <div class="col-6 small fw-bold">${p}</div>
        <div class="col-6">
          <div class="input-group input-group-sm">
            <span class="input-group-text">${getCurrency()}</span>
            <input type="number" class="form-control unequal-input" data-person="${p}" placeholder="0.00" oninput="updateUnequalTotal()">
          </div>
        </div>
      </div>`;
  });
  document.getElementById("unequalSplitSection").classList.remove("d-none");
  document.getElementById("splitResults").classList.add("d-none");
  updateUnequalTotal();
}

function updateUnequalTotal() {
  let inputs = document.querySelectorAll(".unequal-input");
  let running = 0;
  inputs.forEach(i => running += Number(i.value));
  document.getElementById("runningSplitTotal").textContent = getCurrency() + formatMoney(running);
}

function splitUnequally() {
  let total = Number(document.getElementById("splitTotalAmount").value);
  let inputs = document.querySelectorAll(".unequal-input");
  let running = 0;
  inputs.forEach(i => running += Number(i.value));

  if (Math.abs(running - total) > 0.01) {
    showToast(`Amounts must sum to ${getCurrency()}${total}. Difference: ${getCurrency()}${(total - running).toFixed(2)}`, "danger");
    return;
  }

  let resultsList = document.getElementById("splitResultsList");
  resultsList.innerHTML = "";
  inputs.forEach(i => {
    resultsList.innerHTML += `<div class="d-flex justify-content-between mb-2">
      <span class="fw-bold">${i.dataset.person}</span>
      <span>${getCurrency()}${formatMoney(Number(i.value).toFixed(2))}</span>
    </div>`;
  });
  document.getElementById("splitResults").classList.remove("d-none");
}

function copySplitSummary() {
  let results = document.getElementById("splitResultsList").children;
  let summary = Array.from(results).map(r => {
    let name = r.querySelector(".fw-bold").textContent;
    let amount = r.querySelectorAll("span")[1].textContent;
    return `${name}: ${amount}`;
  }).join(", ");
  let total = document.getElementById("splitTotalAmount").value;
  let text = `${summary} — Total: ${getCurrency()}${total}`;
  
  navigator.clipboard.writeText(text).then(() => {
    showToast("Split summary copied to clipboard!", "success");
  });
}

// Initialization for index.html
document.addEventListener('DOMContentLoaded', () => {
  initQuoteTyping();
  normalizeData();
  applyAppearance();
  loadSettings();
  processRecurringExpenses();
  renderReminders();
  renderRecentExpenses();
  renderRecurringExpenses();
  displayQuickNote();
  setDefaultExpenseDate();
  renderCategoryOptions();
});
