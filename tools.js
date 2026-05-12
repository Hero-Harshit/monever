// Tools page logic
let moneyClockInterval = null;

function calculateLoanEMI() {
  let P = Number(document.getElementById('calcLoanAmount').value);
  let annualRate = Number(document.getElementById('calcInterestRate').value);
  let n = Number(document.getElementById('calcTenure').value);

  if (!P || !annualRate || !n) {
    showToast("Please fill in all calculator fields", "warning");
    return;
  }

  let r = annualRate / 12 / 100;
  let emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  let totalPayable = emi * n;
  let totalInterest = totalPayable - P;

  document.getElementById('resMonthlyEMI').textContent = getCurrency() + formatMoney(emi.toFixed(2));
  document.getElementById('resTotalInterest').textContent = getCurrency() + formatMoney(totalInterest.toFixed(2));
  document.getElementById('resTotalPayable').textContent = getCurrency() + formatMoney(totalPayable.toFixed(2));

  document.getElementById('emiCalcResults').classList.remove('d-none');
}

function calculateFD() {
  let P = Number(document.getElementById('fdPrincipal').value);
  let annualRate = Number(document.getElementById('fdRate').value) / 100;
  let t = Number(document.getElementById('fdTenure').value);
  let n = Number(document.getElementById('fdCompounding').value);

  if (!P || !annualRate || !t) {
    showToast("Please fill in all calculator fields", "warning");
    return;
  }

  let A = P * Math.pow(1 + annualRate / n, n * t);
  let totalInterest = A - P;
  let yieldVal = (totalInterest / (P * t)) * 100;

  document.getElementById('resFDTotal').textContent = getCurrency() + formatMoney(A.toFixed(2));
  document.getElementById('resFDInterest').textContent = getCurrency() + formatMoney(totalInterest.toFixed(2));
  document.getElementById('resFDYield').textContent = yieldVal.toFixed(2) + '%';

  let tableBody = document.getElementById('fdGrowthTableBody');
  tableBody.innerHTML = "";
  let lastValue = P;
  for (let year = 1; year <= t; year++) {
    let yearValue = P * Math.pow(1 + annualRate / n, n * year);
    let yearInterest = yearValue - lastValue;
    let row = `<tr>
      <td>Year ${year}</td>
      <td>${getCurrency()}${formatMoney(yearInterest.toFixed(2))}</td>
      <td>${getCurrency()}${formatMoney(yearValue.toFixed(2))}</td>
    </tr>`;
    tableBody.innerHTML += row;
    lastValue = yearValue;
  }

  document.getElementById('fdCalcResults').classList.remove('d-none');
}

function calculateSIP() {
  let P = Number(document.getElementById('sipMonthly').value);
  let annualRate = Number(document.getElementById('sipRate').value);
  let t = Number(document.getElementById('sipTenure').value);

  if (!P || !annualRate || !t) {
    showToast("Please fill in all calculator fields", "warning");
    return;
  }

  let r = annualRate / 12 / 100;
  let n = t * 12;

  let M = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  let invested = P * n;
  let returns = M - invested;

  let lumpSumValue = invested * Math.pow(1 + annualRate / 100, t);

  document.getElementById('resSIPInvested').textContent = getCurrency() + formatMoney(invested.toFixed(0));
  document.getElementById('resSIPReturns').textContent = getCurrency() + formatMoney(returns.toFixed(0));
  document.getElementById('resSIPTotal').textContent = getCurrency() + formatMoney(M.toFixed(0));
  document.getElementById('resLumpSumTotal').textContent = getCurrency() + formatMoney(lumpSumValue.toFixed(0));

  let tableBody = document.getElementById('sipMilestoneTable');
  tableBody.innerHTML = "";
  [5, 10, 15, 20, 25, 30].forEach(years => {
    let months = years * 12;
    let value = P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    tableBody.innerHTML += `<tr>
      <td>${years} Years</td>
      <td class="fw-bold">${getCurrency()}${formatMoney(value.toFixed(0))}</td>
    </tr>`;
  });

  document.getElementById('sipCalcResults').classList.remove('d-none');
}

function calculatePPF() {
  let annualDeposit = Number(document.getElementById('ppfDeposit').value);
  let rate = Number(document.getElementById('ppfRate').value) / 100;
  let startYear = Number(document.getElementById('ppfYear').value);
  let extended = document.getElementById('ppfExtend').checked;

  if (!annualDeposit || !rate || !startYear) {
    showToast("Please fill in all calculator fields", "warning");
    return;
  }

  if (annualDeposit > 150000) {
    showToast("Annual PPF contribution limit is ₹1,50,000", "warning");
  }

  let duration = extended ? 25 : 15;
  let balance = 0;
  let totalDeposited = 0;
  let totalInterest = 0;
  let tableBody = document.getElementById('ppfTableBody');
  tableBody.innerHTML = "";

  for (let i = 1; i <= duration; i++) {
    let opening = balance;
    let deposit = annualDeposit;
    let interest = Math.round((opening + deposit) * rate);
    balance = opening + deposit + interest;

    totalDeposited += deposit;
    totalInterest += interest;

    tableBody.innerHTML += `<tr>
      <td>${startYear + i - 1} (Yr ${i})</td>
      <td>${getCurrency()}${formatMoney(opening)}</td>
      <td>${getCurrency()}${formatMoney(deposit)}</td>
      <td>${getCurrency()}${formatMoney(interest)}</td>
      <td class="fw-bold">${getCurrency()}${formatMoney(balance)}</td>
    </tr>`;
  }

  document.getElementById('resPPFInvested').textContent = getCurrency() + formatMoney(totalDeposited);
  document.getElementById('resPPFInterest').textContent = getCurrency() + formatMoney(totalInterest);
  document.getElementById('resPPFTotal').textContent = getCurrency() + formatMoney(balance);
  document.getElementById('resPPFDuration').textContent = duration + " Years";

  document.getElementById('ppfCalcResults').classList.remove('d-none');
}

function calculateNPS() {
  let age = Number(document.getElementById('npsAge').value);
  let retirementAge = Number(document.getElementById('npsRetirementAge').value);
  let monthlyP = Number(document.getElementById('npsMonthly').value);
  let rate = Number(document.getElementById('npsRate').value);
  let annuityRate = Number(document.getElementById('npsAnnuityRate').value);
  let annuityPercent = Number(document.getElementById('npsAnnuityPercent').value);

  if (!age || !retirementAge || !monthlyP || isNaN(rate) || isNaN(annuityRate)) {
    showToast("Please fill in all investment fields", "warning");
    return;
  }

  if (age < 18 || age > 60 || retirementAge <= age) {
    showToast("Please enter valid ages (18-60)", "warning");
    return;
  }

  let years = retirementAge - age;
  let months = years * 12;
  let r = rate / 12 / 100;

  let corpus = monthlyP * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  let lumpSum = corpus * (1 - annuityPercent / 100);
  let annuityCorpus = corpus * (annuityPercent / 100);
  let monthlyPension = annuityCorpus * (annuityRate / 100) / 12;

  document.getElementById('resNPSCorpus').textContent = getCurrency() + formatMoney(corpus.toFixed(0));
  document.getElementById('resNPSLumpSum').textContent = getCurrency() + formatMoney(lumpSum.toFixed(0));
  document.getElementById('resNPSAnnuity').textContent = getCurrency() + formatMoney(annuityCorpus.toFixed(0));
  document.getElementById('resNPSPension').textContent = getCurrency() + formatMoney(monthlyPension.toFixed(0));

  let tableBody = document.getElementById('npsGrowthTableBody');
  tableBody.innerHTML = "";

  for (let i = 0; i <= years; i++) {
    if (i % 5 === 0 || i === years) {
      let currentMonths = i * 12;
      let currentCorpus = i === 0 ? 0 : monthlyP * ((Math.pow(1 + r, currentMonths) - 1) / r) * (1 + r);
      let invested = monthlyP * 12 * i;

      tableBody.innerHTML += `<tr>
        <td>${age + i}</td>
        <td>${getCurrency()}${formatMoney((monthlyP * 12).toFixed(0))}</td>
        <td>${getCurrency()}${formatMoney(invested.toFixed(0))}</td>
        <td class="fw-bold">${getCurrency()}${formatMoney(currentCorpus.toFixed(0))}</td>
      </tr>`;
    }
  }

  document.getElementById('npsCalcResults').classList.remove('d-none');
}

function calculateStepUpSIP() {
  let P = Number(document.getElementById('sipMonthly').value);
  let annualRate = Number(document.getElementById('sipRate').value);
  let t = Number(document.getElementById('sipTenure').value);
  let stepUp = Number(document.getElementById('sipStepUpRate').value);

  if (!P || !annualRate || !t || isNaN(stepUp)) {
    showToast("Please fill in all investment fields", "warning");
    return;
  }

  let r = annualRate / 12 / 100;
  let totalMaturityValue = 0;
  let totalInvested = 0;
  let currentMonthlyInvestment = P;
  let tableBody = document.getElementById('stepUpYearlyTable');
  tableBody.innerHTML = "";

  for (let year = 1; year <= t; year++) {
    let yearlyInvestment = currentMonthlyInvestment * 12;
    totalInvested += yearlyInvestment;

    for (let m = 1; m <= 12; m++) {
      let monthsRemaining = (t * 12) - ((year - 1) * 12 + m) + 1;
      totalMaturityValue += currentMonthlyInvestment * Math.pow(1 + r, monthsRemaining);
    }

    tableBody.innerHTML += `<tr>
      <td>Year ${year}</td>
      <td>${getCurrency()}${formatMoney(currentMonthlyInvestment.toFixed(0))}</td>
      <td>${getCurrency()}${formatMoney(totalInvested.toFixed(0))}</td>
      <td class="fw-bold">${getCurrency()}${formatMoney(totalMaturityValue.toFixed(0))}</td>
    </tr>`;

    currentMonthlyInvestment *= (1 + stepUp / 100);
  }

  let returns = totalMaturityValue - totalInvested;
  let flatMonthlyRate = annualRate / 12 / 100;
  let flatN = t * 12;
  let flatMaturity = P * ((Math.pow(1 + flatMonthlyRate, flatN) - 1) / flatMonthlyRate) * (1 + flatMonthlyRate);

  document.getElementById('resStepUpFinalMonthly').textContent = getCurrency() + formatMoney((currentMonthlyInvestment / (1 + stepUp / 100)).toFixed(0));
  document.getElementById('resStepUpInvested').textContent = getCurrency() + formatMoney(totalInvested.toFixed(0));
  document.getElementById('resStepUpReturns').textContent = getCurrency() + formatMoney(returns.toFixed(0));
  document.getElementById('resStepUpTotal').textContent = getCurrency() + formatMoney(totalMaturityValue.toFixed(0));

  let diff = totalMaturityValue - flatMaturity;
  document.getElementById('stepUpComparisonText').textContent =
    `Flat SIP total: ${getCurrency()}${formatMoney(flatMaturity.toFixed(0))} vs Step-up SIP total: ${getCurrency()}${formatMoney(totalMaturityValue.toFixed(0))}  Step-up SIP gives you ${getCurrency()}${formatMoney(diff.toFixed(0))} more.`;

  document.getElementById('stepUpResults').classList.remove('d-none');
}

function calculateELSS() {
  let monthlyP = Number(document.getElementById('elssMonthly').value);
  let annualRate = Number(document.getElementById('elssRate').value);
  let t = Number(document.getElementById('elssTenure').value);
  let taxSlab = Number(document.getElementById('elssTaxSlab').value);

  if (!monthlyP || !annualRate || !t) {
    showToast("Please fill in all investment fields", "warning");
    return;
  }

  let r = annualRate / 12 / 100;
  let n = t * 12;

  let maturity = monthlyP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  let totalInvested = monthlyP * n;
  let returns = maturity - totalInvested;

  let annual80C = Math.min(monthlyP * 12, 150000);
  let annualTaxSaved = annual80C * (taxSlab / 100);
  let totalTaxSaved = annualTaxSaved * t;
  let effectiveInvestment = totalInvested - totalTaxSaved;
  let effectiveReturnPercent = ((maturity - effectiveInvestment) / effectiveInvestment) * 100;

  document.getElementById('resELSSMaturity').textContent = getCurrency() + formatMoney(maturity.toFixed(0));
  document.getElementById('resELSSInvested').textContent = getCurrency() + formatMoney(totalInvested.toFixed(0));
  document.getElementById('resELSSReturns').textContent = getCurrency() + formatMoney(returns.toFixed(0));
  document.getElementById('resELSSTaxSaved').textContent = getCurrency() + formatMoney(totalTaxSaved.toFixed(0));
  document.getElementById('resELSSEffectiveRate').textContent = effectiveReturnPercent.toFixed(1) + "%";

  document.getElementById('elssCalcResults').classList.remove('d-none');
}

function calculateRentVsBuy() {
  const rent = Number(document.getElementById('rvbRent').value);
  const rentIncrease = Number(document.getElementById('rvbRentIncrease').value);
  const rentReturn = Number(document.getElementById('rvbRentReturn').value);

  const price = Number(document.getElementById('rvbPrice').value);
  const downPayment = Number(document.getElementById('rvbDownPayment').value);
  const loanRate = Number(document.getElementById('rvbLoanRate').value);
  const loanTenure = Number(document.getElementById('rvbLoanTenure').value);
  const appreciation = Number(document.getElementById('rvbAppreciation').value);
  const maintenance = Number(document.getElementById('rvbMaintenance').value);

  const period = Number(document.getElementById('rvbAnalysisPeriod').value);

  if (!rent || !price || !downPayment || !loanRate || !loanTenure || !period) {
    showToast("Please fill in all required fields", "warning");
    return;
  }

  if (downPayment < price * 0.1) {
    showToast("Warning: Down payment is less than 10% of property price.", "warning");
  }

  const loanAmount = price - downPayment;
  const r = loanRate / 12 / 100;
  const n = loanTenure * 12;
  const emi = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);

  document.getElementById('rvbEMI').value = emi.toFixed(0);
  document.getElementById('rvbSurplus').value = Math.max(0, emi - rent).toFixed(0);

  let buyNetWorth = 0;
  let rentNetWorth = 0;
  let totalRentPaid = 0;
  let totalBuyOutflow = downPayment;

  let rentInvestmentCorpus = downPayment;
  const rentReturnMonthly = rentReturn / 12 / 100;

  const tableBody = document.getElementById('rvbComparisonTableBody');
  tableBody.innerHTML = "";

  let currentRent = rent;
  let currentPropertyVal = price;
  let currentMaintenance = maintenance;

  for (let year = 1; year <= period; year++) {
    for (let month = 1; month <= 12; month++) {
      totalBuyOutflow += emi + currentMaintenance;
      totalRentPaid += currentRent;
      const surplus = Math.max(0, emi - currentRent);
      rentInvestmentCorpus = (rentInvestmentCorpus + surplus) * (1 + rentReturnMonthly);
    }
    currentPropertyVal *= (1 + appreciation / 100);
    currentMaintenance *= 1.05;

    const monthsPassed = year * 12;
    const remainingLoan = loanAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, monthsPassed)) / (Math.pow(1 + r, n) - 1);
    buyNetWorth = currentPropertyVal - (remainingLoan > 0 ? remainingLoan : 0);

    currentRent *= (1 + rentIncrease / 100);
    rentNetWorth = rentInvestmentCorpus;

    const diff = buyNetWorth - rentNetWorth;
    tableBody.innerHTML += `<tr>
      <td>Year ${year}</td>
      <td>${getCurrency()}${formatMoney(buyNetWorth.toFixed(0))}</td>
      <td>${getCurrency()}${formatMoney(rentNetWorth.toFixed(0))}</td>
      <td class="fw-bold">${getCurrency()}${formatMoney(Math.abs(diff).toFixed(0))} ${diff >= 0 ? 'Surplus' : 'Deficit'}</td>
    </tr>`;
  }

  const diffFinal = buyNetWorth - rentNetWorth;
  const verdictTitle = diffFinal >= 0 ? `Buying is better by ${getCurrency()}${formatMoney(diffFinal.toFixed(0))}` : `Renting is better by ${getCurrency()}${formatMoney(Math.abs(diffFinal).toFixed(0))}`;
  const verdictDesc = diffFinal >= 0 ? "Property appreciation and loan equity outweigh the costs over this period." : "The investment returns on the surplus cash and down payment outweigh property gains.";

  const titleEl = document.getElementById('rvbVerdictTitle');
  titleEl.textContent = verdictTitle;
  titleEl.className = `fw-bold mb-2`;
  document.getElementById('rvbVerdictDesc').textContent = verdictDesc;

  document.getElementById('resRentTotalPaid').textContent = getCurrency() + formatMoney(totalRentPaid.toFixed(0));
  document.getElementById('resRentNetWorth').textContent = getCurrency() + formatMoney(rentNetWorth.toFixed(0));

  document.getElementById('resBuyTotalOutflow').textContent = getCurrency() + formatMoney(totalBuyOutflow.toFixed(0));
  document.getElementById('resBuyNetWorth').textContent = getCurrency() + formatMoney(buyNetWorth.toFixed(0));

  document.getElementById('rvbResults').classList.remove('d-none');
}

function setupRvBListeners() {
  const inputs = ['rvbPrice', 'rvbDownPayment', 'rvbLoanRate', 'rvbLoanTenure', 'rvbRent'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const price = Number(document.getElementById('rvbPrice').value);
        const down = Number(document.getElementById('rvbDownPayment').value);
        const rate = Number(document.getElementById('rvbLoanRate').value);
        const tenure = Number(document.getElementById('rvbLoanTenure').value);
        const rent = Number(document.getElementById('rvbRent').value);

        if (price && down && rate && tenure) {
          const loanAmount = price - down;
          const r = rate / 12 / 100;
          const n = tenure * 12;
          const emi = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
          document.getElementById('rvbEMI').value = emi.toFixed(0);
          if (rent) {
            document.getElementById('rvbSurplus').value = Math.max(0, emi - rent).toFixed(0);
          }
        }
      });
    }
  });
}

function generateBudget() {
  const income = Number(document.getElementById('budgetIncome').value);
  if (!income) {
    showToast("Please enter your monthly income", "warning");
    return;
  }

  const needs = income * 0.5;
  const wants = income * 0.3;
  const savings = income * 0.2;

  document.getElementById('resNeedsAmt').textContent = getCurrency() + formatMoney(needs.toFixed(0));
  document.getElementById('resWantsAmt').textContent = getCurrency() + formatMoney(wants.toFixed(0));
  document.getElementById('resSavingsAmt').textContent = getCurrency() + formatMoney(savings.toFixed(0));

  const needsData = [
    { cat: "Rent/EMI", p: 0.30 },
    { cat: "Groceries & Food", p: 0.10 },
    { cat: "Transport", p: 0.05 },
    { cat: "Utilities & Bills", p: 0.03 },
    { cat: "Insurance Premiums", p: 0.02 }
  ];

  const wantsData = [
    { cat: "Dining Out & Entertainment", p: 0.10 },
    { cat: "Shopping & Clothing", p: 0.08 },
    { cat: "Subscriptions (OTT, gym)", p: 0.04 },
    { cat: "Hobbies & Travel", p: 0.05 },
    { cat: "Miscellaneous", p: 0.03 }
  ];

  const savingsData = [
    { cat: "Emergency Fund", p: 0.05 },
    { cat: "SIP / Mutual Funds", p: 0.08 },
    { cat: "PPF / NPS", p: 0.04 },
    { cat: "Short-term goals", p: 0.03 }
  ];

  const renderRows = (targetId, data) => {
    const tbody = document.getElementById(targetId);
    tbody.innerHTML = "";
    data.forEach(item => {
      const suggested = income * item.p;
      tbody.innerHTML += `
        <tr>
          <td>${item.cat}</td>
          <td class="text-muted small">${getCurrency()}${formatMoney(suggested.toFixed(0))}</td>
          <td>
            <div class="input-group input-group-sm" style="width: 140px;">
              <span class="input-group-text">${getCurrency()}</span>
              <input type="number" class="form-control budget-plan-input" value="${suggested.toFixed(0)}" oninput="updateAllocated()">
            </div>
          </td>
        </tr>
      `;
    });
  };

  renderRows('needsTableBody', needsData);
  renderRows('wantsTableBody', wantsData);
  renderRows('savingsTableBody', savingsData);

  document.getElementById('budgetResults').classList.remove('d-none');
  updateAllocated();
}

function updateAllocated() {
  const income = Number(document.getElementById('budgetIncome').value);
  const inputs = document.querySelectorAll('.budget-plan-input');
  let allocated = 0;
  inputs.forEach(input => allocated += Number(input.value) || 0);

  const remaining = income - allocated;
  const counter = document.getElementById('allocatedCounter');

  counter.innerHTML = `Allocated: ${getCurrency()}${formatMoney(allocated.toFixed(0))} of ${getCurrency()}${formatMoney(income.toFixed(0))} income  ${getCurrency()}${formatMoney(remaining.toFixed(0))} remaining`;
}

function copyBudgetSummary() {
  const income = Number(document.getElementById('budgetIncome').value);
  const needs = document.getElementById('resNeedsAmt').textContent;
  const wants = document.getElementById('resWantsAmt').textContent;
  const savings = document.getElementById('resSavingsAmt').textContent;

  let summary = `Monever 50/30/20 Budget Summary\n`;
  summary += `-----------------------------------\n`;
  summary += `Monthly Income: ${getCurrency()}${formatMoney(income.toFixed(0))}\n\n`;
  summary += `Needs (50%): ${needs}\n`;
  summary += `Wants (30%): ${wants}\n`;
  summary += `Savings (20%): ${savings}\n\n`;

  summary += `Breakdown:\n`;
  const rows = document.querySelectorAll('#budgetResults tbody tr');
  rows.forEach(row => {
    const cat = row.cells[0].textContent;
    const plan = row.cells[2].querySelector('input').value;
    summary += `- ${cat}: ${getCurrency()}${formatMoney(Number(plan).toFixed(0))}\n`;
  });

  const allocatedText = document.getElementById('allocatedCounter').textContent;
  summary += `\n${allocatedText}`;

  navigator.clipboard.writeText(summary).then(() => {
    showToast("Budget summary copied to clipboard!", "success");
  });
}

function calculateInflation() {
  const isFutureMode = document.getElementById('future-mode-tab').classList.contains('active');

  if (isFutureMode) {
    const amount = Number(document.getElementById('infFutureAmount').value);
    const rate = Number(document.getElementById('infFutureRate').value);
    const years = Number(document.getElementById('infFutureYears').value);

    if (!amount || isNaN(rate) || !years) {
      showToast("Please fill in all inflation fields", "warning");
      return;
    }

    const futureAmount = amount * Math.pow(1 + rate / 100, years);
    const powerLoss = futureAmount - amount;
    const monthlyEquivalent = futureAmount / 12;

    document.getElementById('resInfMainLabel').textContent = "Future Amount Needed";
    document.getElementById('resInfMainVal').textContent = getCurrency() + formatMoney(futureAmount.toFixed(0));
    document.getElementById('resInfSecondaryLabel').textContent = "Purchasing Power Lost";
    document.getElementById('resInfSecondaryVal').textContent = getCurrency() + formatMoney(powerLoss.toFixed(0));
    document.getElementById('resInfMonthlyVal').textContent = getCurrency() + formatMoney(monthlyEquivalent.toFixed(0));

    // Erosion Table
    const tableBody = document.getElementById('infErosionTableBody');
    tableBody.innerHTML = "";
    document.querySelectorAll('.resInfCurrentBase').forEach(el => el.textContent = getCurrency() + formatMoney(amount.toFixed(0)));

    const step = years > 30 ? 2 : 1;
    for (let i = 1; i <= years; i += step) {
      const val = amount * Math.pow(1 + rate / 100, i);
      tableBody.innerHTML += `<tr><td>Year ${i}</td><td class="fw-bold">${getCurrency()}${formatMoney(val.toFixed(0))}</td></tr>`;
      if (i + step > years && i < years) {
        const lastVal = amount * Math.pow(1 + rate / 100, years);
        tableBody.innerHTML += `<tr><td>Year ${years}</td><td class="fw-bold">${getCurrency()}${formatMoney(lastVal.toFixed(0))}</td></tr>`;
      }
    }

    // Context Table
    const contextBody = document.getElementById('infContextTableBody');
    contextBody.innerHTML = "";
    document.querySelectorAll('.resInfYearsLabel').forEach(el => el.textContent = years);

    const examples = [
      { name: "Monthly Groceries", base: 5000 },
      { name: "Monthly Rent", base: 15000 },
      { name: "Annual Vacation", base: 50000 },
      { name: "Child's School Fees/yr", base: 80000 },
      { name: "Monthly Medical Expenses", base: 3000 }
    ];

    examples.forEach(ex => {
      const futureEx = ex.base * Math.pow(1 + rate / 100, years);
      contextBody.innerHTML += `
        <tr>
          <td>${ex.name}</td>
          <td>${getCurrency()}${formatMoney(ex.base.toFixed(0))}</td>
          <td class="text-end fw-bold">${getCurrency()}${formatMoney(futureEx.toFixed(0))}</td>
        </tr>
      `;
    });

    // Comparison
    const returnRate = Number(document.getElementById('infReturnRate').value) || 12;
    const investedVal = amount * Math.pow(1 + returnRate / 100, years);
    const realReturn = (((1 + returnRate / 100) / (1 + rate / 100)) - 1) * 100;
    const realGain = investedVal - futureAmount;

    document.getElementById('infComparisonText').innerHTML = `At ${returnRate}% return, ${getCurrency()}${formatMoney(amount.toFixed(0))} invested today becomes ${getCurrency()}${formatMoney(investedVal.toFixed(0))} in ${years} years  a real gain of <strong>${getCurrency()}${formatMoney(realGain.toFixed(0))}</strong> (Effective real rate: ${realReturn.toFixed(2)}%).`;

    document.getElementById('infErosionSection').classList.remove('d-none');
  } else {
    // Past Value Mode
    const amount = Number(document.getElementById('infPastAmount').value);
    const rate = Number(document.getElementById('infPastRate').value);
    const years = Number(document.getElementById('infPastYears').value);

    if (!amount || isNaN(rate) || !years) {
      showToast("Please fill in all inflation fields", "warning");
      return;
    }

    const todayEquivalent = amount * Math.pow(1 + rate / 100, years);
    const diff = todayEquivalent - amount;

    document.getElementById('resInfMainLabel').textContent = "Today's Equivalent";
    document.getElementById('resInfMainVal').textContent = getCurrency() + formatMoney(todayEquivalent.toFixed(0));
    document.getElementById('resInfSecondaryLabel').textContent = "Difference in Value";
    document.getElementById('resInfSecondaryVal').textContent = getCurrency() + formatMoney(diff.toFixed(0));
    document.getElementById('resInfMonthlyVal').textContent = getCurrency() + formatMoney((todayEquivalent / 12).toFixed(0));

    document.getElementById('infErosionSection').classList.add('d-none');
  }

  document.getElementById('inflationResults').classList.remove('d-none');
}

// Initializing the Tools page
document.addEventListener('DOMContentLoaded', () => {
  normalizeData();
  applyAppearance();
  loadSettings();
  setupRvBListeners();

  const infModeTabs = document.querySelectorAll('#inflationModes button');
  infModeTabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', () => {
      if (document.getElementById('inflationResults').classList.contains('d-none')) return;
      calculateInflation();
    });
  });

  initMoneyClock();
});

function calculateSalaryBreakup() {
  const annualCTC = Number(document.getElementById('salaryCTC').value);
  const basicPct = Number(document.getElementById('salaryBasicPct').value);
  const hraPct = Number(document.getElementById('salaryHRAPct').value);
  const cityType = document.getElementById('salaryCityType').value;
  const rentPaid = Number(document.getElementById('salaryRent').value);
  const annualPT = Number(document.getElementById('salaryPT').value);
  const pfPct = Number(document.getElementById('salaryPF').value);
  const addDeductions = Number(document.getElementById('salaryAddDeductions').value || 0);

  if (!annualCTC) {
    showToast("Please enter your Annual CTC", "warning");
    return;
  }

  // Monthly values
  const monthlyCTC = annualCTC / 12;
  const basic = (monthlyCTC * basicPct) / 100;
  const hra = (basic * hraPct) / 100;
  const employerPF = (basic * 12) / 100;
  const specialAllowance = monthlyCTC - basic - hra - employerPF;
  const grossSalary = basic + hra + specialAllowance;

  // Deductions
  const employeePF = (pfPct / 100) * basic;
  const pt = annualPT / 12;
  const stdDeduction = 50000 / 12;

  // HRA Exemption
  let hraExemption = 0;
  if (rentPaid > 0) {
    const rentMinus10Basic = Math.max(0, rentPaid - (basic * 0.1));
    const hraMetroPct = cityType === 'metro' ? 0.5 : 0.4;
    const cap = basic * hraMetroPct;
    hraExemption = Math.min(hra, rentMinus10Basic, cap);
  }
  const taxableHRA = hra - hraExemption;

  // Taxable Income (Monthly)
  const monthlyTaxableIncome = basic + taxableHRA + specialAllowance - stdDeduction - employeePF;
  const annualTaxableIncome = Math.max(0, monthlyTaxableIncome * 12);

  // TDS (New Regime 2024-25)
  // 0-3L: 0%
  // 3-7L: 5%
  // 7-10L: 10%
  // 10-12L: 15%
  // 12-15L: 20%
  // > 15L: 30%
  let annualTax = 0;
  if (annualTaxableIncome > 300000) {
    if (annualTaxableIncome <= 700000) {
      annualTax = (annualTaxableIncome - 300000) * 0.05;
    } else if (annualTaxableIncome <= 1000000) {
      annualTax = (400000 * 0.05) + (annualTaxableIncome - 700000) * 0.10;
    } else if (annualTaxableIncome <= 1200000) {
      annualTax = (400000 * 0.05) + (300000 * 0.10) + (annualTaxableIncome - 1000000) * 0.15;
    } else if (annualTaxableIncome <= 1500000) {
      annualTax = (400000 * 0.05) + (300000 * 0.10) + (200000 * 0.15) + (annualTaxableIncome - 1200000) * 0.20;
    } else {
      annualTax = (400000 * 0.05) + (300000 * 0.10) + (200000 * 0.15) + (300000 * 0.20) + (annualTaxableIncome - 1500000) * 0.30;
    }
  }

  // Rebate Section 87A (New Regime) - Tax is 0 if taxable income <= 7,00,000
  if (annualTaxableIncome <= 700000) {
    annualTax = 0;
  }

  const cess = annualTax * 0.04;
  const totalAnnualTax = annualTax + cess;
  const monthlyTDS = totalAnnualTax / 12;

  const netInHand = grossSalary - employeePF - pt - monthlyTDS - addDeductions;

  // Render Table
  const tableBody = document.getElementById('salaryTableBody');
  tableBody.innerHTML = `
    <tr><td>Basic Salary</td><td class="text-end">${getCurrency()}${formatMoney(basic.toFixed(0))}</td></tr>
    <tr><td>HRA</td><td class="text-end">${getCurrency()}${formatMoney(hra.toFixed(0))}</td></tr>
    <tr><td>Special Allowance</td><td class="text-end">${getCurrency()}${formatMoney(specialAllowance.toFixed(0))}</td></tr>
    <tr style="background-color: #eeeeee; font-weight:bold;"><td>Gross Salary</td><td class="text-end">${getCurrency()}${formatMoney(grossSalary.toFixed(0))}</td></tr>
    <tr><td colspan="2" class="py-1"></td></tr>
    <tr><td class="text-muted">Employee PF</td><td class="text-end">-${getCurrency()}${formatMoney(employeePF.toFixed(0))}</td></tr>
    <tr><td class="text-muted">Professional Tax</td><td class="text-end">-${getCurrency()}${formatMoney(pt.toFixed(0))}</td></tr>
    <tr><td class="text-muted">Estimated TDS (New Regime)</td><td class="text-end">-${getCurrency()}${formatMoney(monthlyTDS.toFixed(0))}</td></tr>
    <tr><td class="text-muted">Additional Deductions</td><td class="text-end">-${getCurrency()}${formatMoney(addDeductions.toFixed(0))}</td></tr>
    <tr class="fw-bold" style="background-color: #eeeeee;"><td>Net Monthly In-Hand</td><td class="text-end">${getCurrency()}${formatMoney(netInHand.toFixed(0))}</td></tr>
  `;

  // Render Summary Cards
  document.getElementById('resSalAnnualCTC').textContent = getCurrency() + formatMoney(annualCTC.toFixed(0));
  document.getElementById('resSalAnnualGross').textContent = getCurrency() + formatMoney((grossSalary * 12).toFixed(0));
  document.getElementById('resSalAnnualDeductions').textContent = getCurrency() + formatMoney(((employeePF + pt + monthlyTDS + addDeductions) * 12).toFixed(0));
  document.getElementById('resSalAnnualNet').textContent = getCurrency() + formatMoney((netInHand * 12).toFixed(0));

  document.getElementById('salaryResults').classList.remove('d-none');
}

function initMoneyClock() {
  // Setup any initial state for Money Clock if needed
  const salaryInput = document.getElementById('mcSalary');
  if (salaryInput && monthlyIncome) {
    salaryInput.value = monthlyIncome * 12;
  }
}

function startMoneyClock() {
  const salary = Number(document.getElementById('mcSalary').value);
  const hoursPerDay = Number(document.getElementById('mcHoursPerDay').value) || 8;
  const daysPerWeek = Number(document.getElementById('mcDaysPerWeek').value) || 5;

  if (!salary) {
    showToast("Please enter your annual salary to start the clock.", "danger");
    return;
  }

  // Clear any existing interval
  if (moneyClockInterval) clearInterval(moneyClockInterval);

  // Compute static values
  const totalWorkHoursPerYear = daysPerWeek * 52 * hoursPerDay;
  const hourlyRate = salary / totalWorkHoursPerYear;
  const dailyEarnings = hourlyRate * hoursPerDay;
  const weeklyEarnings = dailyEarnings * daysPerWeek;
  const monthlyEarnings = salary / 12;

  // Display static values
  document.getElementById('mcResHourly').textContent = getCurrency() + formatMoney(hourlyRate.toFixed(2));
  document.getElementById('mcResDaily').textContent = getCurrency() + formatMoney(dailyEarnings.toFixed(2));
  document.getElementById('mcResWeekly').textContent = getCurrency() + formatMoney(weeklyEarnings.toFixed(2));
  document.getElementById('mcResMonthly').textContent = getCurrency() + formatMoney(monthlyEarnings.toFixed(2));

  // Render context table
  const contextBody = document.getElementById('mcContextTableBody');
  contextBody.innerHTML = "";
  const contexts = [
    { label: "1 minute", minutes: 1 },
    { label: "1 coffee break (15 min)", minutes: 15 },
    { label: "1 hour", minutes: 60 },
    { label: "Lunch break (30 min)", minutes: 30 },
    { label: "One Netflix episode (45 min)", minutes: 45 },
    { label: "One workday", minutes: hoursPerDay * 60 }
  ];

  contexts.forEach(ctx => {
    const earned = (hourlyRate / 60) * ctx.minutes;
    contextBody.innerHTML += `<tr><td>${ctx.label}</td><td class="fw-bold">${getCurrency()}${formatMoney(earned)}</td></tr>`;
  });

  // Show display section
  document.getElementById('moneyClockInputs').classList.add('d-none');
  document.getElementById('moneyClockDisplay').classList.remove('d-none');

  // Start ticker
  const perSecond = hourlyRate / 3600;
  const perMinute = hourlyRate / 60;

  moneyClockInterval = setInterval(() => {
    const now = new Date();

    // Calculate Today So Far
    // Assume work starts at 9:00 AM today
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    let elapsedSeconds = Math.max(0, (now.getTime() - startTime.getTime()) / 1000);
    let todayEarned = elapsedSeconds * perSecond;

    // Cap at full day's earnings
    const maxDaily = hourlyRate * hoursPerDay;
    if (todayEarned > maxDaily) todayEarned = maxDaily;

    // Update ticking values
    document.getElementById('tickSecond').textContent = getCurrency() + formatMoney(perSecond);
    document.getElementById('tickMinute').textContent = getCurrency() + formatMoney(perMinute);
    document.getElementById('tickHour').textContent = getCurrency() + formatMoney(hourlyRate);
    document.getElementById('tickToday').textContent = getCurrency() + formatMoney(todayEarned);
  }, 100);
}

function stopMoneyClock() {
  if (moneyClockInterval) {
    clearInterval(moneyClockInterval);
    moneyClockInterval = null;
  }
  document.getElementById('moneyClockDisplay').classList.add('d-none');
  document.getElementById('moneyClockInputs').classList.remove('d-none');
}

function calculateProcrastination() {
  const P = Number(document.getElementById('procAmount').value);
  const annualRate = Number(document.getElementById('procRate').value);
  const currentAge = Number(document.getElementById('procCurrentAge').value);
  const retireAge = Number(document.getElementById('procRetireAge').value);

  if (!P || !annualRate || !currentAge || !retireAge) {
    showToast("Please fill in all calculator fields", "warning");
    return;
  }

  if (currentAge >= retireAge) {
    showToast("Current age must be less than retirement age", "warning");
    return;
  }

  const r = annualRate / 12 / 100;
  const scenarios = [
    { label: "Start Today", delayYrs: 0 },
    { label: "Start 1 Year Later", delayYrs: 1 },
    { label: "Start 2 Years Later", delayYrs: 2 },
    { label: "Start 5 Years Later", delayYrs: 5 },
    { label: "Start 10 Years Later", delayYrs: 10 }
  ];

  let todayMaturity = 0;
  const comparisonBody = document.getElementById('procComparisonBody');
  const compensateBody = document.getElementById('procCompensateBody');
  comparisonBody.innerHTML = "";
  compensateBody.innerHTML = "";

  scenarios.forEach((sc, index) => {
    const tenureYrs = retireAge - currentAge - sc.delayYrs;
    if (tenureYrs <= 0) return;

    const n = tenureYrs * 12;
    const factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const maturity = P * factor;
    const invested = P * n;

    if (sc.delayYrs === 0) todayMaturity = maturity;

    const costOfWaiting = todayMaturity - maturity;

    // Table 1
    const row1 = document.createElement('tr');
    if (index === 0) {
      row1.style.fontWeight = "bold";
      row1.style.backgroundColor = "#eeeeee";
    }
    row1.innerHTML = `
      <td>${sc.label}</td>
      <td>${getCurrency()}${formatMoney(P)}</td>
      <td>${getCurrency()}${formatMoney(invested.toFixed(0))}</td>
      <td>${getCurrency()}${formatMoney(maturity.toFixed(0))}</td>
      <td style="${index > 0 ? 'color: #606060;' : ''}">${getCurrency()}${formatMoney(costOfWaiting.toFixed(0))}</td>
    `;
    comparisonBody.appendChild(row1);

    // Verdict for 1 year delay
    if (sc.delayYrs === 1) {
      document.getElementById('procVerdictAmt').textContent = getCurrency() + formatMoney(costOfWaiting.toFixed(0));
    }

    // Table 2 (Compensation)
    if (sc.delayYrs > 0) {
      const neededP = todayMaturity / factor;
      const extraP = neededP - P;
      const totalExtraPaid = extraP * n;

      const row2 = document.createElement('tr');
      row2.innerHTML = `
        <td>${sc.label}</td>
        <td class="fw-bold">${getCurrency()}${formatMoney(neededP.toFixed(0))}</td>
        <td>${getCurrency()}${formatMoney(extraP.toFixed(0))}</td>
        <td>${getCurrency()}${formatMoney(totalExtraPaid.toFixed(0))}</td>
      `;
      compensateBody.appendChild(row2);
    }
  });

  document.getElementById('procResults').classList.remove('d-none');
}

function generateWealthTimeline() {
  const existing = Number(document.getElementById('wtExisting').value) || 0;
  const monthlyP = Number(document.getElementById('wtMonthly').value);
  const annualRate = Number(document.getElementById('wtRate').value);
  const currentAge = Number(document.getElementById('wtAge').value);

  if (isNaN(monthlyP) || isNaN(annualRate) || isNaN(currentAge) || !monthlyP || !currentAge) {
    showToast("Please fill in all investment fields", "warning");
    return;
  }

  const milestones = [
    { label: "₹1 Lakh", val: 100000 },
    { label: "₹5 Lakh", val: 500000 },
    { label: "₹10 Lakh", val: 1000000 },
    { label: "₹25 Lakh", val: 2500000 },
    { label: "₹50 Lakh", val: 5000000 },
    { label: "₹1 Crore", val: 10000000 },
    { label: "₹2 Crore", val: 20000000 },
    { label: "₹5 Crore", val: 50000000 },
    { label: "₹10 Crore", val: 100000000 }
  ];

  const r = annualRate / 12 / 100;
  let corpus = existing;
  let currentYear = new Date().getFullYear();
  let results = milestones.map(m => ({ ...m, achieved: corpus >= m.val }));

  const timelineContainer = document.getElementById('wtTimelineContainer');
  timelineContainer.innerHTML = "";

  const summary = { 5: 0, 10: 0, 20: 0, 30: 0 };

  // Month-by-month loop
  for (let m = 1; m <= 1200; m++) {
    corpus = corpus * (1 + r) + monthlyP;

    results.forEach(res => {
      if (!res.achieved && corpus >= res.val) {
        res.achieved = true;
        res.months = m;
        res.year = currentYear + Math.floor(m / 12);
        res.age = currentAge + Math.floor(m / 12);
      }
    });

    if (m === 60) summary[5] = corpus;
    if (m === 120) summary[10] = corpus;
    if (m === 240) summary[20] = corpus;
    if (m === 360) summary[30] = corpus;
  }

  results.forEach(res => {
    const node = document.createElement('div');
    node.style.marginBottom = "1.5rem";
    node.style.position = "relative";

    let content = "";
    if (res.val <= existing) {
      content = `<span style="display:inline-block; width:12px; height:12px; background:#808080; margin-left:-27px; margin-right:15px; vertical-align:middle;"></span>
                 <span class="fw-bold" style="font-size: 1.1rem;">${res.label}</span>
                 <div style="color: #808080; font-size: 0.85rem; margin-left: 20px;">Already achieved</div>`;
    } else if (res.achieved) {
      const yrs = Math.floor(res.months / 12);
      if (yrs > 40) {
        content = `<span style="display:inline-block; width:12px; height:12px; background:#808080; margin-left:-27px; margin-right:15px; vertical-align:middle;"></span>
                   <span class="fw-bold" style="font-size: 1.1rem;">${res.label}</span>
                   <div style="color: #808080; font-size: 0.85rem; margin-left: 20px;">Requires 40+ years at this rate</div>`;
      } else {
        content = `<span style="display:inline-block; width:12px; height:12px; background:#808080; margin-left:-27px; margin-right:15px; vertical-align:middle;"></span>
                   <span class="fw-bold" style="font-size: 1.1rem;">${res.label}</span>
                   <div style="color: #808080; font-size: 0.85rem; margin-left: 20px;">Age ${res.age} · Year ${res.year} · in ${yrs} years</div>`;
      }
    } else {
      content = `<span style="display:inline-block; width:12px; height:12px; background:#808080; margin-left:-27px; margin-right:15px; vertical-align:middle;"></span>
                 <span class="fw-bold" style="font-size: 1.1rem;">${res.label}</span>
                 <div style="color: #808080; font-size: 0.85rem; margin-left: 20px;">Requires 100+ years at this rate</div>`;
    }

    node.innerHTML = content;
    timelineContainer.appendChild(node);
  });

  document.getElementById('wtRes5').textContent = getCurrency() + formatMoney(summary[5].toFixed(0));
  document.getElementById('wtRes10').textContent = getCurrency() + formatMoney(summary[10].toFixed(0));
  document.getElementById('wtRes20').textContent = getCurrency() + formatMoney(summary[20].toFixed(0));
  document.getElementById('wtRes30').textContent = getCurrency() + formatMoney(summary[30].toFixed(0));

  const yearsToDouble = (72 / annualRate).toFixed(1);
  document.getElementById('wtRuleOf72').textContent = `At this rate your money doubles every ${yearsToDouble} years.`;

  document.getElementById('wtResults').classList.remove('d-none');
}

function calculateCroreCounter() {
  const existing = Number(document.getElementById('ccSavings').value) || 0;
  const monthlyP = Number(document.getElementById('ccMonthly').value);
  const annualRate = Number(document.getElementById('ccRate').value);
  const targetSelect = Number(document.getElementById('ccTargetSelect').value);
  const targetCustom = Number(document.getElementById('ccTargetCustom').value);
  const currentAge = Number(document.getElementById('ccAge').value);
  const income = Number(document.getElementById('ccIncome').value);

  const target = targetCustom || targetSelect;

  if (monthlyP <= 0) {
    showToast("Monthly investment must be greater than 0", "warning");
    return;
  }

  const r = annualRate / 12 / 100;
  let corpus = existing;
  let totalInvested = existing;
  let achievedMonth = -1;
  let milestones = { 25: -1, 50: -1, 100: -1 };
  let yearData = [];

  for (let m = 1; m <= 600; m++) {
    corpus = corpus * (1 + r) + monthlyP;
    totalInvested += monthlyP;

    if (milestones[25] === -1 && corpus >= target * 0.25) milestones[25] = m;
    if (milestones[50] === -1 && corpus >= target * 0.50) milestones[50] = m;
    if (milestones[100] === -1 && corpus >= target) {
      milestones[100] = m;
      achievedMonth = m;
    }

    if (m % 12 === 0 || m === achievedMonth) {
      const year = m / 12;
      yearData.push({
        month: m,
        year: year.toFixed(1),
        age: currentAge ? currentAge + Math.floor(year) : null,
        val: corpus,
        pct: (corpus / target * 100).toFixed(1)
      });
    }
    if (achievedMonth !== -1 && m > achievedMonth + 240) break; // Optimization
  }

  const announce = document.getElementById('ccAnnouncement');
  if (achievedMonth === -1) {
    announce.innerHTML = `<h4>TARGET: ${getCurrency()}${formatMoney(target)}</h4>
                          <div style="font-size: 1.5rem; font-weight: bold; margin-top: 10px;">TARGET NOT ACHIEVABLE IN 50 YEARS</div>
                          <p class="mt-2 mb-0">Increase your monthly investment or return expectations.</p>`;
  } else {
    const yrs = Math.floor(achievedMonth / 12);
    const mos = achievedMonth % 12;
    announce.innerHTML = `<h4>TARGET: ${getCurrency()}${formatMoney(target)}</h4>
                          <div style="font-size: 1.5rem; font-weight: bold; margin-top: 10px;">ACHIEVED IN: ${yrs} Years ${mos} Months</div>
                          ${currentAge ? `<p class="mt-2 mb-0" style="font-size: 1.2rem;">At age: ${currentAge + yrs}</p>` : ""}`;
  }

  const progressSection = document.getElementById('ccProgressSection');
  progressSection.innerHTML = '<h5 class="fw-bold mb-4">Milestone Progress</h5>';
  [25, 50, 100].forEach(pct => {
    const m = milestones[pct];
    const val = target * (pct / 100);
    const label = m === -1 ? `Not reached in 50Y` : `${Math.floor(m / 12)}Y ${m % 12}M`;
    progressSection.innerHTML += `
      <div class="mb-4">
        <div class="d-flex justify-content-between mb-1 small fw-bold">
          <span>${pct}%  ${getCurrency()}${formatMoney(val)}</span>
          <span>${label}</span>
        </div>
        <div class="retro-progress-container">
          <div class="retro-progress-bar" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });

  const finalInvested = achievedMonth === -1 ? totalInvested : (existing + monthlyP * achievedMonth);
  const finalCorpus = achievedMonth === -1 ? corpus : target;
  document.getElementById('ccResInvested').textContent = getCurrency() + formatMoney(finalInvested.toFixed(0));
  document.getElementById('ccResReturns').textContent = getCurrency() + formatMoney((finalCorpus - finalInvested).toFixed(0));

  if (income) {
    const rate = (monthlyP / income * 100).toFixed(1);
    document.getElementById('ccResSavingsRate').textContent = rate + "%";
  } else {
    document.getElementById('ccResSavingsRate').textContent = "N/A";
  }

  const n10 = 120;
  const factor10 = ((Math.pow(1 + r, n10) - 1) / r) * (1 + r);
  const compoundExisting10 = existing * Math.pow(1 + r, n10);
  const neededP10 = Math.max(0, (target - compoundExisting10) / factor10);
  document.getElementById('ccRes10Y').textContent = getCurrency() + formatMoney(neededP10.toFixed(0));

  const tableBody = document.getElementById('ccMilestoneTableBody');
  tableBody.innerHTML = "";
  const displayYears = [1, 2, 5, 10, 15, 20];

  yearData.forEach(d => {
    const yInt = Math.floor(Number(d.year));
    const isExactYear = Math.abs(Number(d.year) - yInt) < 0.01;
    if ((isExactYear && displayYears.includes(yInt)) || d.month === achievedMonth) {
      const isAchievementRow = d.month === achievedMonth;
      const row = document.createElement('tr');
      if (isAchievementRow) {
        row.style.backgroundColor = "#eeeeee";
        row.style.fontWeight = "bold";
      }
      row.innerHTML = `
        <td>Year ${d.year}</td>
        <td>${d.age || "-"}</td>
        <td>${getCurrency()}${formatMoney(d.val.toFixed(0))}</td>
        <td>${d.pct}%</td>
      `;
      tableBody.appendChild(row);
    }
  });

  document.getElementById('ccResults').classList.remove('d-none');

}

function calculateJobComparator() {
  const ctcA = Number(document.getElementById('jobCtcA').value);
  const ctcB = Number(document.getElementById('jobCtcB').value);
  if (!ctcA || !ctcB) {
    if (typeof showToast === 'function') showToast('Please enter CTC for both offers', 'danger');
    return;
  }

  const companyA = document.getElementById('jobCompanyA').value || 'Offer A';
  const companyB = document.getElementById('jobCompanyB').value || 'Offer B';
  const bonusA = Number(document.getElementById('jobBonusA').value) || 0;
  const bonusB = Number(document.getElementById('jobBonusB').value) || 0;
  const hoursA = Number(document.getElementById('jobHoursA').value) || 45;
  const hoursB = Number(document.getElementById('jobHoursB').value) || 45;
  const wfhA = Number(document.getElementById('jobWfhA').value) || 0;
  const wfhB = Number(document.getElementById('jobWfhB').value) || 0;
  const growthA = Number(document.getElementById('jobGrowthA').value);
  const growthB = Number(document.getElementById('jobGrowthB').value);
  const wlbA = Number(document.getElementById('jobWlbA').value);
  const wlbB = Number(document.getElementById('jobWlbB').value);

  const maxCtc = Math.max(ctcA + bonusA, ctcB + bonusB);
  const salaryScoreA = ((ctcA + bonusA) / maxCtc) * 10;
  const salaryScoreB = ((ctcB + bonusB) / maxCtc) * 10;
  const growthScoreA = growthA / 2.5;
  const growthScoreB = growthB / 2.5;
  const wlbAAdj = Math.max(0, wlbA - Math.floor(Math.max(0, hoursA - 40) / 5) * 0.5);
  const wlbBAdj = Math.max(0, wlbB - Math.floor(Math.max(0, hoursB - 40) / 5) * 0.5);
  const locScoreA = (wfhA / 5) * 10;
  const locScoreB = (wfhB / 5) * 10;

  const weights = { salary: 3, growth: 2, wlb: 2, location: 1 };
  const totalW = Object.values(weights).reduce((a, b) => a + b, 0);
  const scoreA = ((salaryScoreA * weights.salary) + (growthScoreA * weights.growth) + (wlbAAdj * weights.wlb) + (locScoreA * weights.location)) / totalW;
  const scoreB = ((salaryScoreB * weights.salary) + (growthScoreB * weights.growth) + (wlbBAdj * weights.wlb) + (locScoreB * weights.location)) / totalW;
  const finalA = Math.min(100, Math.round(scoreA * 10));
  const finalB = Math.min(100, Math.round(scoreB * 10));
  const winner = finalA > finalB ? companyA : finalB > finalA ? companyB : 'Tie';
  const diff = Math.abs(finalA - finalB);

  const cs = typeof getCurrency === 'function' ? getCurrency() : '₹';

  document.getElementById('jobVerdictBar').innerHTML = `<div class="row">
      <div style="border:2px solid;border-color:${finalA >= finalB ? '#404040' : '#808080'} #808080 #808080 #404040; background:#fff; padding:10px; flex:1;">
        <h6 class="fw-bold">Job Offer A</h6>
        <div style="font-size:1.1rem; font-weight:bold;">${getCurrency()}${formatMoney(finalA.toFixed(0))}</div>
        <div style="font-size:0.65rem; color:#666;">5-Year Projected Value</div>
      </div>
      <div style="width:10px;"></div>
      <div style="border:2px solid;border-color:${finalB > finalA ? '#404040' : '#808080'} #808080 #808080 #404040; background:#fff; padding:10px; flex:1;">
        <h6 class="fw-bold">Job Offer B</h6>
        <div style="font-size:1.1rem; font-weight:bold;">${getCurrency()}${formatMoney(finalB.toFixed(0))}</div>
        <div style="font-size:0.65rem; color:#666;">5-Year Projected Value</div>
      </div>
    </div>
    <div class="col-md-2 d-flex align-items-center justify-content-center">
      <div style="text-align:center;font-size:0.8rem;font-weight:bold;">${winner === 'Tie' ? 'TIE' : winner + ' wins<br>by ' + diff + ' pts'}</div>
      <div style="border:2px solid;border-color:${finalB > finalA ? '#404040' : '#808080'} #808080 #808080 #ffffff;padding:1rem;text-align:center;background:${finalB > finalA ? '#eeeeee' : '#fff'};">
        <div style="font-weight:bold;margin-bottom:4px;">${companyB}</div>
        <div style="font-size:2rem;font-weight:bold;font-family:Courier New;">${finalB}</div>
        <div style="font-size:0.75rem;color:#555;">out of 100</div>
      </div>
    </div>`;

  const rows = [
    ['Salary Score', salaryScoreA.toFixed(1), salaryScoreB.toFixed(1)],
    ['Growth Score', growthScoreA.toFixed(1), growthScoreB.toFixed(1)],
    ['Work-Life Balance', wlbAAdj.toFixed(1), wlbBAdj.toFixed(1)],
    ['Location / WFH', locScoreA.toFixed(1), locScoreB.toFixed(1)],
  ];
  document.getElementById('jobBreakdownTable').innerHTML = `
    <h6 class="fw-bold mb-2">Score Breakdown</h6>
    <table class="table table-sm border small">
      <thead style="background-color:#c0c0c0"><tr><th>Factor</th><th>${companyA}</th><th>${companyB}</th><th>Winner</th></tr></thead>
      <tbody>${rows.map(r => {
    const w = Number(r[1]) >= Number(r[2]) ? companyA : companyB;
    return `<tr><td>${r[0]}</td><td${Number(r[1]) >= Number(r[2]) ? ' style="font-weight:bold"' : ''}>${r[1]}</td><td${Number(r[2]) > Number(r[1]) ? ' style="font-weight:bold"' : ''}>${r[2]}</td><td>${w}</td></tr>`;
  }).join('')}</tbody>
    </table>`;

  const inHandA = (ctcA * 0.72 / 12);
  const inHandB = (ctcB * 0.72 / 12);
  const hrA = ctcA / (hoursA * 52);
  const hrB = ctcB / (hoursB * 52);
  document.getElementById('jobFinancialTable').innerHTML = `
    <h6 class="fw-bold mb-2">Financial Comparison</h6>
    <table class="table table-sm border small">
      <thead style="background-color:#c0c0c0"><tr><th>Factor</th><th>${companyA}</th><th>${companyB}</th></tr></thead>
      <tbody>
        <tr><td>Annual CTC</td><td>${cs}${formatMoney(ctcA)}</td><td>${cs}${formatMoney(ctcB)}</td></tr>
        <tr><td>Annual Bonus</td><td>${cs}${formatMoney(bonusA)}</td><td>${cs}${formatMoney(bonusB)}</td></tr>
        <tr><td>Total Comp</td><td><strong>${cs}${formatMoney(ctcA + bonusA)}</strong></td><td><strong>${cs}${formatMoney(ctcB + bonusB)}</strong></td></tr>
        <tr><td>Est. Monthly In-Hand</td><td>${cs}${formatMoney(inHandA.toFixed(0))}</td><td>${cs}${formatMoney(inHandB.toFixed(0))}</td></tr>
        <tr><td>Effective Hourly Rate</td><td>${cs}${formatMoney(hrA.toFixed(0))}/hr</td><td>${cs}${formatMoney(hrB.toFixed(0))}/hr</td></tr>
      </tbody>
    </table>`;

  const yr5A = ctcA * Math.pow(1 + growthA / 100, 5);
  const yr5B = ctcB * Math.pow(1 + growthB / 100, 5);
  const total5A = Array.from({ length: 5 }, (_, i) => ctcA * Math.pow(1 + growthA / 100, i)).reduce((a, b) => a + b, 0);
  const total5B = Array.from({ length: 5 }, (_, i) => ctcB * Math.pow(1 + growthB / 100, i)).reduce((a, b) => a + b, 0);
  document.getElementById('jobProjection').innerHTML = `
    <h6 class="fw-bold mb-2">5-Year Projection</h6>
    <div class="row g-3">
      <div class="col-md-6"><div class="summary-stat-card"><div class="stat-value">${cs}${formatMoney(yr5A.toFixed(0))}</div><div class="stat-label">${companyA}  CTC at Year 5</div></div></div>
      <div class="col-md-6"><div class="summary-stat-card"><div class="stat-value">${cs}${formatMoney(yr5B.toFixed(0))}</div><div class="stat-label">${companyB}  CTC at Year 5</div></div></div>
      <div class="col-md-6"><div class="summary-stat-card"><div class="stat-value">${cs}${formatMoney(total5A.toFixed(0))}</div><div class="stat-label">${companyA}  Total Earned over 5yrs</div></div></div>
      <div class="col-md-6"><div class="summary-stat-card"><div class="stat-value">${cs}${formatMoney(total5B.toFixed(0))}</div><div class="stat-label">${companyB}  Total Earned over 5yrs</div></div></div>
    </div>`;

  document.getElementById('jobCompResults').classList.remove('d-none');
}
