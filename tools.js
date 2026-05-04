// Tools page logic

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
    `Flat SIP total: ${getCurrency()}${formatMoney(flatMaturity.toFixed(0))} vs Step-up SIP total: ${getCurrency()}${formatMoney(totalMaturityValue.toFixed(0))} — Step-up SIP gives you ${getCurrency()}${formatMoney(diff.toFixed(0))} more.`;

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
    currentPropertyVal *= (1 + appreciation/100);
    currentMaintenance *= 1.05;

    const monthsPassed = year * 12;
    const remainingLoan = loanAmount * (Math.pow(1 + r, n) - Math.pow(1 + r, monthsPassed)) / (Math.pow(1 + r, n) - 1);
    buyNetWorth = currentPropertyVal - (remainingLoan > 0 ? remainingLoan : 0);

    currentRent *= (1 + rentIncrease/100);
    rentNetWorth = rentInvestmentCorpus;

    const diff = buyNetWorth - rentNetWorth;
    tableBody.innerHTML += `<tr>
      <td>Year ${year}</td>
      <td>${getCurrency()}${formatMoney(buyNetWorth.toFixed(0))}</td>
      <td>${getCurrency()}${formatMoney(rentNetWorth.toFixed(0))}</td>
      <td class="${diff >= 0 ? 'text-success' : 'text-danger'} fw-bold">${getCurrency()}${formatMoney(Math.abs(diff).toFixed(0))} ${diff >= 0 ? ' (Buy)' : ' (Rent)'}</td>
    </tr>`;
  }

  const diffFinal = buyNetWorth - rentNetWorth;
  const verdictTitle = diffFinal >= 0 ? `Buying is better by ${getCurrency()}${formatMoney(diffFinal.toFixed(0))}` : `Renting is better by ${getCurrency()}${formatMoney(Math.abs(diffFinal).toFixed(0))}`;
  const verdictDesc = diffFinal >= 0 ? "Property appreciation and loan equity outweigh the costs over this period." : "The investment returns on the surplus cash and down payment outweigh property gains.";

  const titleEl = document.getElementById('rvbVerdictTitle');
  titleEl.textContent = verdictTitle;
  titleEl.className = `fw-bold mb-2 ${diffFinal >= 0 ? 'text-danger' : 'text-primary'}`;
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
  
  counter.innerHTML = `Allocated: ${getCurrency()}${formatMoney(allocated.toFixed(0))} of ${getCurrency()}${formatMoney(income.toFixed(0))} income — <span class="${remaining < 0 ? 'text-danger' : 'text-success'}">${getCurrency()}${formatMoney(remaining.toFixed(0))} remaining</span>`;
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

    document.getElementById('infComparisonText').innerHTML = `At ${returnRate}% return, ${getCurrency()}${formatMoney(amount.toFixed(0))} invested today becomes ${getCurrency()}${formatMoney(investedVal.toFixed(0))} in ${years} years — a real gain of <strong>${getCurrency()}${formatMoney(realGain.toFixed(0))}</strong> (Effective real rate: ${realReturn.toFixed(2)}%).`;

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
});
