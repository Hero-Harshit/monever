// profile.js

function getProfileValue(key) {
  const profileStr = localStorage.getItem('moneverProfile');
  if (!profileStr) return null;
  try {
    const profile = JSON.parse(profileStr);
    return profile[key] !== undefined ? profile[key] : null;
  } catch (e) {
    return null;
  }
}
window.getProfileValue = getProfileValue;

function saveProfile() {
  const ids = [
    'profName', 'profAge', 'profCity', 'profCityType', 'profEmployment', 'profPartnerName',
    'profCTC', 'profInHand', 'profExpenses', 'profMonthlySavings', 'profCorpus', 'profSideIncome', 'profRent', 'profBudget', 'profTrackingIncome',
    'profWorkHours', 'profWorkDays', 'profCommute', 'profCommuteHours', 'profWorkExpenses', 'profProfTax', 'profWFHDays',
    'profExpectedReturn', 'profRisk', 'profTaxRegime', 'profPF', 'profBasicPercent', 'profHRAPercent', 'profRetirementAge', 'profGoal',
    'currencySymbol', 'dateFormat', 'bgStyle', 'widgetSeparation',
    'monthlyBudgetInput', 'incomeInput'
  ];

  const profileObject = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      profileObject[id] = el.value;
      // Also update individual keys for system settings handled by utils.js
      if (id === 'currencySymbol') {
        localStorage.setItem('currencySymbol', el.value);
        if (typeof currencySymbol !== 'undefined') currencySymbol = el.value;
      }
      if (id === 'dateFormat') {
        localStorage.setItem('dateFormat', el.value);
        if (typeof dateFormat !== 'undefined') dateFormat = el.value;
      }
      if (id === 'bgStyle') {
        localStorage.setItem('bgStyle', el.value);
        if (typeof bgStyle !== 'undefined') bgStyle = el.value;
        if (typeof applyAppearance === 'function') applyAppearance();
      }
      if (id === 'monthlyBudgetInput') {
        localStorage.setItem('monthlyBudget', el.value);
        if (typeof monthlyBudget !== 'undefined') monthlyBudget = Number(el.value);
      }
      if (id === 'incomeInput') {
        localStorage.setItem('monthlyIncome', el.value);
        if (typeof monthlyIncome !== 'undefined') monthlyIncome = Number(el.value);
      }
    }
  });

  localStorage.setItem('moneverProfile', JSON.stringify(profileObject));
  
  if (typeof savePreferences === 'function') {
    savePreferences();
  }

  if (typeof showToast === 'function') {
    showToast('Profile saved successfully.');
  }

  if (typeof loadWidgetAssignments === 'function') {
    loadWidgetAssignments();
  }

  const modalEl = document.getElementById('profileModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  loadProfileOnInit();
}

function loadProfileOnInit() {
  const profileStr = localStorage.getItem('moneverProfile');
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr);

      const triggerBtn = document.getElementById('profileTrigger');
      if (triggerBtn) {
        let existingIndicator = triggerBtn.querySelector('.profile-indicator');
        if (!existingIndicator) {
          const indicator = document.createElement('div');
          indicator.className = 'profile-indicator';
          indicator.style.cssText = 'position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%; background-color: #cccccc; border: 2px solid #ffffff; z-index: 2;';
          triggerBtn.appendChild(indicator);
        }
      }

      const greeting = document.getElementById('profileGreeting');
      if (greeting && profile.profName) {
        greeting.style.display = 'block';
        greeting.innerText = `Welcome back, ${profile.profName}. Your profile is loaded.`;
      }

      autoFillFromProfile();

      if (typeof loadSettings === 'function') {
        loadSettings();
      }
    } catch (e) { }
  }
}

function clearProfile() {
  if (confirm('Are you sure you want to clear your profile? This cannot be undone.')) {
    localStorage.removeItem('moneverProfile');
    location.reload();
  }
}

function openProfileModal() {
  populateProfileModal();
  const modalEl = document.getElementById('profileModal');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

function populateProfileModal() {
  const profileStr = localStorage.getItem('moneverProfile');
  if (!profileStr) return;
  try {
    const profile = JSON.parse(profileStr);
    for (const key in profile) {
      const el = document.getElementById(key);
      if (el) {
        el.value = profile[key];
      }
    }
  } catch (e) { }
}

function autoFillFromProfile() {
  const profileStr = localStorage.getItem('moneverProfile');
  if (!profileStr) return;
  let profile = {};
  try {
    profile = JSON.parse(profileStr);
  } catch (e) {
    return;
  }

  const mapping = {
    'profAge': ['npsAge', 'sipTenure', 'ppfYear', 'rvbAnalysisPeriod', 'fireAge', 'faActualAge', 'procCurrentAge', 'wtAge', 'ccAge'],
    'profCTC': ['salaryCTC', 'shCTC', 'liCTC'],
    'profInHand': ['budgetIncome', 'quitSalary', 'shTakeHome'],
    'profExpenses': ['monthlyExpenses', 'quitEssential', 'fireCurrExp'],
    'profMonthlySavings': ['sipMonthly', 'elssMonthly', 'npsMonthly', 'wtMonthly', 'ccMonthly', 'procAmount', 'fireInvestment', 'oracleSavings'],
    'profCorpus': ['quitSavings', 'fireSavings', 'wtExisting', 'ccSavings'],
    'profSideIncome': ['quitSideIncome'],
    'profRent': ['salaryRent', 'rvbRent'],
    'profBudget': ['monthlyBudget'],
    'profTrackingIncome': ['monthlyIncome'],
    'profWorkHours': ['mcHoursPerDay', 'shWorkHours'],
    'profWorkDays': ['mcDaysPerWeek', 'shWorkDays'],
    'profCommute': ['shCommute'],
    'profWorkExpenses': ['shExpenses'],
    'profProfTax': ['salaryPT'],
    'profExpectedReturn': ['sipRate', 'sipStepUpRate', 'elssRate', 'fdRate', 'npsRate', 'ppfRate', 'wtRate', 'ccRate', 'procRate', 'fireReturn'],
    'profRetirementAge': ['npsRetirementAge', 'procRetireAge'],
    'profPF': ['salaryPF'],
    'profBasicPercent': ['salaryBasicPct'],
    'profHRAPercent': ['salaryHRAPct'],
    'profCityType': ['salaryCityType'],
    'profTaxRegime': ['taxRegime']
  };

  for (const profKey in mapping) {
    const savedVal = profile[profKey];
    if (savedVal === undefined || savedVal === null || savedVal === '') continue;

    const targetIds = mapping[profKey];
    targetIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (el.value === '' || el.value === '0' || el.value === null) {
          if (profKey === 'profAge' && id === 'sipTenure') return;
          if (profKey === 'profAge' && id === 'rvbAnalysisPeriod') return;
          if (profKey === 'profAge' && id === 'ppfYear') {
            const currentYear = new Date().getFullYear();
            el.value = currentYear - parseInt(savedVal, 10);
            return;
          }
          el.value = savedVal;
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', loadProfileOnInit);
