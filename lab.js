// Lab page logic
let currentTool = null;
let labLifestyleEntries = [];

const toolNames = {
  'quit-calculator': 'Should I Quit?',
  'lifestyle-inflation': 'Lifestyle Inflation',
  'financial-freedom': 'Financial Freedom',
  'financial-age': 'Financial Age Test',
  'salary-hours': 'Salary to Hours',
  'fortune-teller': 'Fortune Teller',
  'ticker-screensaver': 'Stock Ticker',
  'compatibility-test': 'Compatibility Test',
  'daily-briefing': 'Daily Briefing'
};

function openTool(toolId) {
  currentTool = toolId;
  const panel = document.getElementById('labToolPanel');
  const title = document.getElementById('labToolPanelTitle');
  const content = document.getElementById('labToolContent');

  if (title) {
    title.textContent = toolNames[toolId] || 'Experiment';
  }

  if (panel) {
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'instant' });
  }

  // Inject Tool Content
  if (content) {
    switch (toolId) {
      case 'quit-calculator':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-4">SHOULD I QUIT MY JOB?</h4>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Monthly In-Hand Salary</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="quitSalary" class="form-control" placeholder="100000">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Current Savings / Emergency Fund</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="quitSavings" class="form-control" placeholder="500000">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Monthly Essential Expenses</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="quitEssential" class="form-control" placeholder="40000">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Monthly Non-Essential Expenses</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="quitNonEssential" class="form-control" placeholder="20000">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Side Income (if any)</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="quitSideIncome" class="form-control" value="0">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Target Expense Reduction (%)</label>
                <input type="number" id="quitReduction" class="form-control" value="20">
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">New Job Lined Up?</label>
                <select id="quitJobStatus" class="form-control" onchange="initQuitCalculator()">
                  <option value="no">No  taking a break</option>
                  <option value="yes_fast">Yes  joining in under 1 month</option>
                  <option value="yes_slow">Yes  joining in 1–3 months</option>
                  <option value="exploring">Exploring  no timeline yet</option>
                </select>
              </div>
              <div class="col-md-6" id="quitSearchContainer">
                <label class="form-label text-muted small fw-bold">Expected Months to Find Next Job</label>
                <input type="number" id="quitSearchMonths" class="form-control" value="3">
              </div>
            </div>
            <button class="btn btn-primary btn-wide w-100 mt-4" onclick="calculateQuitJob()">Calculate My Runway</button>
            
            <div id="quitResults" class="mt-5 d-none">
                <div id="quitVerdictBox"></div>
                <div class="row g-3 mb-4" id="quitStatGrid"></div>
                <div class="table-responsive mb-4">
                    <table class="table border">
                        <thead style="background-color: #c0c0c0;">
                            <tr><th>Category</th><th>Monthly Amount</th></tr>
                        </thead>
                        <tbody id="quitBreakdownBody"></tbody>
                    </table>
                </div>
                <div id="quitSafeBuildCard"></div>
            </div>
          </div>
        `;
        initQuitCalculator();
        break;
      case 'lifestyle-inflation':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-2">LIFESTYLE INFLATION TRACKER</h4>
            <p class="text-muted small mb-4">How much of your hike are you actually keeping?</p>
            
            <div class="row g-2 mb-4 p-3 bg-light border">
              <div class="col-md-3">
                <label class="form-label text-muted small fw-bold">Year</label>
                <input type="number" id="liYear" class="form-control" placeholder="2024">
              </div>
              <div class="col-md-3">
                <label class="form-label text-muted small fw-bold">Annual CTC</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="liCTC" class="form-control" placeholder="1200000">
                </div>
              </div>
              <div class="col-md-3">
                <label class="form-label text-muted small fw-bold">Monthly Expenses</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="liExpenses" class="form-control" placeholder="40000">
                </div>
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button class="btn btn-primary w-100" onclick="addLifestyleYear()">Add Year</button>
              </div>
            </div>

            <div id="lifestyleEntries" class="list-group mb-4"></div>
            
            <button id="liAnalyseBtn" class="btn btn-primary btn-wide w-100 d-none" onclick="analyseLifestyleInflation()">Analyse Inflation</button>
            
            <div id="liResults" class="mt-5 d-none">
              <h5 class="fw-bold mb-3">Analysis Table</h5>
              <div class="table-responsive mb-5">
                <table class="table border text-center">
                  <thead style="background-color: #c0c0c0;">
                    <tr>
                      <th>Period</th>
                      <th>Salary Growth %</th>
                      <th>Expense Growth %</th>
                      <th>Inflation Rate</th>
                      <th>Savings Then</th>
                      <th>Savings Now</th>
                      <th>Verdict</th>
                    </tr>
                  </thead>
                  <tbody id="liBreakdownBody"></tbody>
                </table>
              </div>

              <div class="card section-card mb-5" style="background-color: #eeeeee; border: 2px solid #808080;">
                <h5 class="fw-bold mb-3">VERDICT</h5>
                <p id="liVerdictText" class="mb-0" style="font-size: 1.1rem;"></p>
              </div>

              <h5 class="fw-bold mb-3">Visual Comparison</h5>
              <div id="liVisualGrid" class="row g-3"></div>
            </div>
          </div>
        `;
        initLifestyleInflation();
        break;
      case 'financial-freedom':
        initFinancialFreedom();
        break;
      case 'financial-age':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-2">FINANCIAL AGE TEST</h4>
            <p class="text-muted small mb-4">Answer honestly. No one is watching.</p>
            
            <div class="row g-3 mb-4">
              <div class="col-md-12">
                <label class="form-label text-muted small fw-bold">Your Actual Age</label>
                <input type="number" id="faActualAge" class="form-control mb-4" placeholder="25" style="max-width: 200px;">
              </div>
            </div>

            <div id="faQuizContainer">
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q1: Do you have an emergency fund?</label>
                <select id="faQ1" class="form-control">
                  <option value="0">No emergency fund</option>
                  <option value="1">Less than 1 month expenses</option>
                  <option value="2">1–3 months expenses</option>
                  <option value="4">3–6 months expenses</option>
                  <option value="5">6+ months expenses</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q2: What % of your income do you save/invest?</label>
                <select id="faQ2" class="form-control">
                  <option value="0">I spend more than I earn</option>
                  <option value="1">0–5%</option>
                  <option value="2">5–15%</option>
                  <option value="4">15–30%</option>
                  <option value="5">30%+</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q3: Do you have any investments?</label>
                <select id="faQ3" class="form-control">
                  <option value="0">None</option>
                  <option value="1">Just a savings account</option>
                  <option value="2">FD or RD</option>
                  <option value="4">Mutual funds or stocks</option>
                  <option value="5">Diversified portfolio</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q4: Do you track your expenses?</label>
                <select id="faQ4" class="form-control">
                  <option value="0">Never</option>
                  <option value="1">Sometimes after overspending</option>
                  <option value="3">Monthly</option>
                  <option value="4">Weekly</option>
                  <option value="5">Daily</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q5: Do you have any debt?</label>
                <select id="faQ5" class="form-control">
                  <option value="0">Yes, credit card debt I carry monthly</option>
                  <option value="1">Yes, personal loan</option>
                  <option value="3">Only a home loan</option>
                  <option value="5">No debt at all</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q6: Do you have life or health insurance?</label>
                <select id="faQ6" class="form-control">
                  <option value="0">Neither</option>
                  <option value="2">Health only</option>
                  <option value="2">Life only</option>
                  <option value="3">Both but inadequate</option>
                  <option value="5">Both with adequate cover</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q7: Do you know your net worth?</label>
                <select id="faQ7" class="form-control">
                  <option value="0">What is net worth</option>
                  <option value="2">Roughly</option>
                  <option value="3">Yes approximately</option>
                  <option value="4">Yes exactly</option>
                  <option value="5">Yes and I track it monthly</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q8: When you get a salary hike what do you do?</label>
                <select id="faQ8" class="form-control">
                  <option value="0">Upgrade lifestyle immediately</option>
                  <option value="1">Spend most of it</option>
                  <option value="3">Split between spending and saving</option>
                  <option value="4">Mostly invest it</option>
                  <option value="5">Invest all of it</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q9: Do you have a financial goal with a timeline?</label>
                <select id="faQ9" class="form-control">
                  <option value="0">No goals</option>
                  <option value="1">Vague goals, no timeline</option>
                  <option value="2">Goals but no investment plan</option>
                  <option value="3">Goals with a rough plan</option>
                  <option value="5">Goals with active investments tracking them</option>
                </select>
              </div>
              <div class="fa-q-block">
                <label class="fw-bold small text-uppercase">Q10: How often do you think about retirement?</label>
                <select id="faQ10" class="form-control">
                  <option value="0">Never, I am too young</option>
                  <option value="1">Occasionally</option>
                  <option value="2">I have thought about it</option>
                  <option value="3">I have a rough retirement plan</option>
                  <option value="5">I have a detailed retirement corpus target</option>
                </select>
              </div>
            </div>

            <style>
              .fa-q-block { background-color: #eeeeee; border: 1px solid #808080; padding: 0.75rem; margin-bottom: 0.75rem; }
            </style>

            <button class="btn btn-primary btn-wide w-100 mt-4" onclick="calculateFinancialAge()">Reveal My Financial Age</button>
            
            <div id="faResults" class="mt-5 d-none">
              <div id="faReportCard" style="background-color: #ffffff; border: 2px solid #808080; padding: 1.5rem; margin-bottom: 2rem;"></div>
              
              <h5 class="fw-bold mb-3">Score Breakdown</h5>
              <div class="table-responsive mb-5">
                <table class="table border text-center small">
                  <thead style="background-color: #e0e0e0;">
                    <tr>
                      <th>Question</th>
                      <th>Your Answer</th>
                      <th>Points</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody id="faBreakdownBody"></tbody>
                </table>
              </div>

              <div id="faTipsSection"></div>
            </div>
          </div>
        `;
        initFinancialAge();
        break;
      case 'salary-hours':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-2">SALARY TO HOURS</h4>
            <p class="text-muted small mb-4">How many hours of your life does anything cost?</p>
            
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Annual CTC</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="shCTC" class="form-control" placeholder="1200000">
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small fw-bold">Monthly Take-Home (Optional)</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="shTakeHome" class="form-control" placeholder="75000">
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label text-muted small fw-bold">Work Hours Per Day</label>
                <input type="number" id="shWorkHours" class="form-control" value="8">
              </div>
              <div class="col-md-4">
                <label class="form-label text-muted small fw-bold">Work Days Per Week</label>
                <input type="number" id="shWorkDays" class="form-control" value="5">
              </div>
              <div class="col-md-4">
                <label class="form-label text-muted small fw-bold">Commute Hours Per Day</label>
                <input type="number" id="shCommute" class="form-control" value="1">
              </div>
              <div class="col-md-12">
                <label class="form-label text-muted small fw-bold">Work-related Expenses Per Month</label>
                <div class="input-group">
                  <span class="input-group-text currency-prefix">₹</span>
                  <input type="number" id="shExpenses" class="form-control" value="0">
                </div>
                <div class="form-text small">Commute cost, work clothes, food at office, etc.</div>
              </div>
            </div>

            <button class="btn btn-primary btn-wide w-100 mt-4" onclick="calculateSalaryHours()">Calculate My Time Rate</button>
            
            <div id="shResults" class="mt-5 d-none">
              <div id="shRateCard" class="card section-card text-center mb-4" style="background-color: #eeeeee; border: 2px solid #808080; padding: 1.5rem;">
                <div id="shTerminalContent" class="fw-bold" style="font-family: 'Courier New', Courier, monospace; font-size: 1.1rem;"></div>
              </div>
              
              <div class="row g-3 mb-4" id="shStatGrid"></div>
              
              <h5 class="fw-bold mb-3">Common Purchases: The Time Cost</h5>
              <div class="table-responsive mb-5">
                <table class="table border text-center small">
                  <thead style="background-color: #e0e0e0;">
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Hours of Life</th>
                      <th>Days of Work</th>
                    </tr>
                  </thead>
                  <tbody id="shItemsBody"></tbody>
                </table>
              </div>

              <h5 class="fw-bold mb-3">Custom Time Lookup</h5>
              <div class="row g-2 mb-4">
                <div class="col-md-8">
                  <div class="input-group">
                    <span class="input-group-text currency-prefix">₹</span>
                    <input type="number" id="shCustomPrice" class="form-control" placeholder="Enter any price">
                  </div>
                </div>
                <div class="col-md-4">
                  <button class="btn btn-primary w-100" onclick="convertPriceToHours()">Convert to Hours</button>
                </div>
              </div>
              <div id="shCustomResult" class="mb-4 d-none" style="background-color: #eeeeee; border: 1px solid #808080; padding: 0.75rem; font-weight: bold; font-size: 0.9rem;"></div>
              
              <p id="shPhilosophical" class="mt-4"></p>
            </div>
          </div>
        `;
        initSalaryToHours();
        break;
      case 'fortune-teller':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-2">MONEVER 3000 FINANCIAL ORACLE</h4>
            <p class="text-muted small mb-4">Peer into the fiscal void. The Oracle does not lie. Often.</p>
            
            <div id="oracleInputSection">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">Your Name</label>
                  <input type="text" id="oracleName" class="form-control" placeholder="Enter name">
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">Current Monthly Savings</label>
                  <div class="input-group">
                    <span class="input-group-text currency-prefix">₹</span>
                    <input type="number" id="oracleSavings" class="form-control" placeholder="10000">
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">Biggest Financial Weakness</label>
                  <select id="oracleWeakness" class="form-control">
                    <option value="shopping">Online shopping</option>
                    <option value="eating">Eating out</option>
                    <option value="impulse">Impulse purchases</option>
                    <option value="subs">Subscriptions</option>
                    <option value="lending">Lending money to friends</option>
                    <option value="yesman">Saying yes to everything</option>
                    <option value="ignoring">Ignoring my budget</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">Your Financial Spirit Animal</label>
                  <select id="oracleAnimal" class="form-control">
                    <option value="squirrel">The Squirrel (saves everything)</option>
                    <option value="magpie">The Magpie (attracted to shiny things)</option>
                    <option value="ostrich">The Ostrich (avoids financial reality)</option>
                    <option value="ant">The Ant (disciplined, methodical)</option>
                    <option value="grasshopper">The Grasshopper (spends today worries tomorrow)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">This year I will mostly be...</label>
                  <select id="oraclePlan" class="form-control">
                    <option value="aggressive">Saving aggressively</option>
                    <option value="wisely">Investing wisely</option>
                    <option value="mindfully">Spending mindfully</option>
                    <option value="honestly">Surviving honestly</option>
                    <option value="pretending">Pretending everything is fine</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label text-muted small fw-bold">Birth Month</label>
                  <select id="oracleMonth" class="form-control">
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                </div>
              </div>
              <button class="btn btn-primary btn-wide w-100 mt-4" onclick="consultOracle()">Consult the Oracle</button>
            </div>

            <div id="oracleResults" class="mt-4 d-none">
              <div class="card section-card mb-4" style="background-color: #eeeeee; border: 2px solid #808080; padding: 1.5rem; min-height: 200px;">
                <div id="oracleHeader" class="fw-bold mb-2" style="font-family: 'Courier New', Courier, monospace; font-size: 1.1rem; color: #404040; text-align: center;"></div>
                <div id="oracleOutput" style="font-family: 'Courier New', Courier, monospace; line-height: 1.6; font-size: 1rem; color: #000;"></div>
              </div>
              <button id="oracleResetBtn" class="btn btn-outline-secondary w-100 mt-3 d-none" onclick="initFortuneTeller()">Consult Again</button>
            </div>
          </div>
        `;
        initFortuneTeller();
        break;
      case 'ticker-screensaver':
        content.innerHTML = `
          <div id="tickerSetup">
            <div class="card section-card">
              <h4 class="mb-2">STOCK TICKER SCREENSAVER</h4>
              <p class="text-muted small mb-4">Add your holdings below. Then launch the ticker.</p>
              
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <label class="form-label text-muted small fw-bold">Symbol</label>
                  <input type="text" id="tsSymbol" class="form-control" placeholder="RELIANCE">
                </div>
                <div class="col-md-3">
                  <label class="form-label text-muted small fw-bold">Price</label>
                  <div class="input-group">
                    <span class="input-group-text currency-prefix">₹</span>
                    <input type="number" id="tsPrice" class="form-control" placeholder="2847">
                  </div>
                </div>
                <div class="col-md-3">
                  <label class="form-label text-muted small fw-bold">Change %</label>
                  <input type="number" id="tsChange" class="form-control" placeholder="0.8" step="0.1">
                </div>
                <div class="col-md-3">
                  <label class="form-label text-muted small fw-bold">Quantity</label>
                  <input type="number" id="tsQty" class="form-control" placeholder="10">
                </div>
              </div>
              
              <div class="d-flex gap-2 mb-4">
                <button class="btn btn-primary" onclick="addTickerStock()">Add to Ticker</button>
                <button class="btn btn-outline-secondary" onclick="loadDemoStocks()">Load Demo Stocks</button>
              </div>

              <div id="tickerEntries" class="list-group mb-4"></div>

              <button id="launchTickerBtn" class="btn btn-primary btn-wide w-100 d-none" onclick="launchTicker()">Launch Ticker</button>
            </div>
          </div>

          <div id="tickerDisplay" style="display: none;">
            <div class="terminal-container" style="background-color: #212529; border: 2px solid #6c757d; padding: 0;">
              <div style="background-color: #6c757d; color: #ffffff; padding: 3px 8px; font-size: 0.8rem; font-weight: bold; font-family: 'Courier New', Courier, monospace; display: flex; justify-content: space-between;">
                <span>MONEVER MARKET TERMINAL v1.0</span>
                <span id="tsClock">00:00:00</span>
              </div>
              
              <div style="overflow: hidden; white-space: nowrap; padding: 6px 0; border-bottom: 1px solid #333;">
                <div id="tickerLine" style="display: inline-block; color: #cccccc; font-family: 'Courier New', Courier, monospace;"></div>
              </div>

              <div style="padding: 1rem; color: #cccccc; font-family: 'Courier New', Courier, monospace; font-size: 0.85rem;">
                <div id="tsPortfolioSummary" class="mb-3"></div>
                <div class="table-responsive">
                  <table class="table table-dark table-borderless small mb-0" style="background-color: transparent;">
                    <thead>
                      <tr style="border-bottom: 1px solid #333;">
                        <th class="p-1">SYMBOL</th>
                        <th class="p-1">PRICE</th>
                        <th class="p-1">CHANGE</th>
                        <th class="p-1">QTY</th>
                        <th class="p-1">VALUE</th>
                      </tr>
                    </thead>
                    <tbody id="tsTableBody"></tbody>
                  </table>
                </div>
              </div>
            </div>
            <button class="btn btn-outline-secondary w-100 mt-3" onclick="closeTicker()">Close Ticker</button>
          </div>
        `;
        initTickerScreensaver();
        break;
      case 'compatibility-test':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-2">FINANCIAL COMPATIBILITY TEST</h4>
            <p class="text-muted small mb-4">You and your partner both fill this in. Truth will be revealed.</p>
            
            <div class="row g-4">
              <div class="col-md-6 border-end">
                <div style="background-color: #808080; color: #fff; padding: 4px 8px; font-size: 0.85rem; font-weight: bold; text-align: center; margin-bottom: 0.75rem;">PERSON A</div>
                <div id="compPersonA">
                  ${generateCompQuestions('A')}
                </div>
              </div>
              <div class="col-md-6">
                <div style="background-color: #808080; color: #fff; padding: 4px 8px; font-size: 0.85rem; font-weight: bold; text-align: center; margin-bottom: 0.75rem;">PERSON B</div>
                <div id="compPersonB">
                  ${generateCompQuestions('B')}
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-wide w-100 mt-4" onclick="calculateCompatibility()">Calculate Compatibility</button>

            <div id="compResults" class="mt-5 d-none">
              <div id="compReportCard" class="mb-4" style="background-color: #ffffff; border: 2px solid #808080; padding: 1.5rem;"></div>
              
              <h5 class="fw-bold mb-3">Question Breakdown</h5>
              <div class="table-responsive mb-5">
                <table class="table border text-center small">
                  <thead style="background-color: #e0e0e0;">
                    <tr>
                      <th>Question</th>
                      <th>Person A</th>
                      <th>Person B</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody id="compBreakdownBody"></tbody>
                </table>
              </div>

              <div id="compAdviceSection"></div>
            </div>
          </div>
        `;
        initCompatibilityTest();
        break;
      case 'daily-briefing':
        content.innerHTML = `
          <div class="card section-card">
            <h4 class="mb-2">MONEVER DAILY BRIEFING</h4>
            <p class="text-muted small mb-4">Your finances. As tomorrow's headlines.</p>
            
            <div id="briefingSetup">
              <button class="btn btn-primary btn-wide w-100" onclick="generateBriefing()">Generate Today's Briefing</button>
              <p class="text-muted small text-center mt-2">Reads your actual expense data from Monever. Add some expenses first for the best experience.</p>
            </div>

            <div id="briefingOutput" class="mt-4"></div>
          </div>
        `;
        initDailyBriefing();
        break;
      default:
        content.innerHTML = `<p style="color: #808080; font-size: 0.85rem;">This experiment is currently under construction. Check back soon.</p>`;
    }
  }
}

function initQuitCalculator() {
  const statusEl = document.getElementById('quitJobStatus');
  if (!statusEl) return;
  const status = statusEl.value;
  const searchContainer = document.getElementById('quitSearchContainer');
  const searchInput = document.getElementById('quitSearchMonths');

  if (status === 'no' || status === 'exploring') {
    searchContainer.style.display = 'block';
  } else {
    searchContainer.style.display = 'none';
    searchInput.value = status === 'yes_fast' ? 1 : 3;
  }
}

function calculateQuitJob() {
  const salary = Number(document.getElementById('quitSalary').value);
  const savings = Number(document.getElementById('quitSavings').value);
  const essential = Number(document.getElementById('quitEssential').value);
  const nonEssential = Number(document.getElementById('quitNonEssential').value);
  const sideIncome = Number(document.getElementById('quitSideIncome').value);
  const reduction = Number(document.getElementById('quitReduction').value);
  const searchMonths = Number(document.getElementById('quitSearchMonths').value);
  const status = document.getElementById('quitJobStatus').value;

  if (!salary || !savings || !essential) {
    showToast("Please fill in basic salary, savings, and expenses", "warning");
    return;
  }

  const reducedNonEssential = nonEssential * (1 - (reduction / 100));
  const monthlyBurn = essential + reducedNonEssential - sideIncome;
  const runway = savings / monthlyBurn;

  let expectedMonths = searchMonths;
  if (status === 'yes_fast') expectedMonths = 1;
  if (status === 'yes_slow') expectedMonths = 3;

  const safeThreshold = expectedMonths * 1.5;

  let verdict, verdictColor;
  if (runway >= safeThreshold) {
    verdict = "✓ SAFE TO QUIT";
    verdictColor = "#888888";
  } else if (runway >= safeThreshold * 0.8) {
    verdict = "⚠ PROCEED WITH CAUTION";
    verdictColor = "#888888";
  } else {
    verdict = "✗ NOT RECOMMENDED YET";
    verdictColor = "#606060";
  }

  const verdictBox = document.getElementById('quitVerdictBox');
  verdictBox.innerHTML = `
    <div style="border: 2px solid #808080; background-color: #eeeeee; padding: 1.5rem; text-align: center; margin-bottom: 1rem;">
        <div style="font-size: 1.25rem; font-weight: bold; color: ${verdictColor};">${verdict}</div>
        <div class="stat-value mt-2">${runway.toFixed(1)} months of runway</div>
    </div>
  `;

  const statGrid = document.getElementById('quitStatGrid');
  statGrid.innerHTML = `
    <div class="col-md-3">
        <div class="summary-stat-card">
            <h6>Monthly Burn</h6>
            <p class="stat-value">${getCurrency()}${formatMoney(monthlyBurn.toFixed(0))}</p>
        </div>
    </div>
    <div class="col-md-3">
        <div class="summary-stat-card">
            <h6>Total Runway</h6>
            <p class="stat-value">${runway.toFixed(1)} Mo</p>
        </div>
    </div>
    <div class="col-md-3">
        <div class="summary-stat-card">
            <h6>Safe Threshold</h6>
            <p class="stat-value">${safeThreshold.toFixed(1)} Mo</p>
        </div>
    </div>
    <div class="col-md-3">
        <div class="summary-stat-card">
            <h6>Daily Burn</h6>
            <p class="stat-value">${getCurrency()}${formatMoney((monthlyBurn / 30).toFixed(0))}</p>
        </div>
    </div>
  `;

  const breakdownBody = document.getElementById('quitBreakdownBody');
  breakdownBody.innerHTML = `
    <tr><td>Essential Expenses</td><td>${getCurrency()}${formatMoney(essential)}</td></tr>
    <tr><td>Reduced Non-Essentials (${reduction}% cut)</td><td>${getCurrency()}${formatMoney(reducedNonEssential.toFixed(0))}</td></tr>
    <tr><td>Side Income</td><td>- ${getCurrency()}${formatMoney(sideIncome)}</td></tr>
    <tr class="fw-bold" style="background-color: #f8f9fa;"><td>Net Monthly Burn Rate</td><td>${getCurrency()}${formatMoney(monthlyBurn.toFixed(0))}</td></tr>
  `;

  const buildCard = document.getElementById('quitSafeBuildCard');
  buildCard.innerHTML = "";
  if (runway < safeThreshold) {
    const totalExpenses = essential + nonEssential;
    const savingsRate = salary - totalExpenses;
    const neededSavings = safeThreshold * monthlyBurn;
    const gap = neededSavings - savings;
    const monthsToBuild = gap / savingsRate;

    if (savingsRate > 0) {
      buildCard.innerHTML = `
            <div class="card section-card" style="border: 2px solid #808080;">
                <p class="mb-0">To quit safely, you need <strong>${getCurrency()}${formatMoney(gap.toFixed(0))}</strong> more in savings. At your current savings rate of ${getCurrency()}${formatMoney(savingsRate)}/mo, that takes <strong>${Math.ceil(monthsToBuild)} months</strong>.</p>
            </div>
        `;
    } else {
      buildCard.innerHTML = `
            <div class="card section-card" style="border: 2px solid #606060;">
                <p class="mb-0 fw-bold" style="color: #606060;">CRITICAL: Your current expenses exceed or equal your salary. You cannot build a safe runway without increasing income or cutting costs first.</p>
            </div>
        `;
    }
  }

  document.getElementById('quitResults').classList.remove('d-none');
}

function initLifestyleInflation() {
  labLifestyleEntries = [];
  renderLifestyleList();
  document.getElementById('liResults').classList.add('d-none');
}

function addLifestyleYear() {
  const year = Number(document.getElementById('liYear').value);
  const ctc = Number(document.getElementById('liCTC').value);
  const exp = Number(document.getElementById('liExpenses').value);

  if (!year || !ctc || !exp) {
    showToast("Please fill all fields", "warning");
    return;
  }

  labLifestyleEntries.push({ year, ctc, exp });
  renderLifestyleList();

  document.getElementById('liYear').value = "";
  document.getElementById('liCTC').value = "";
  document.getElementById('liExpenses').value = "";
}

function deleteLifestyleYear(index) {
  labLifestyleEntries.splice(index, 1);
  renderLifestyleList();
}

function renderLifestyleList() {
  const container = document.getElementById('lifestyleEntries');
  if (!container) return;
  container.innerHTML = "";

  labLifestyleEntries.forEach((entry, index) => {
    container.innerHTML += `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <span class="fw-bold">${entry.year}</span>: CTC ${getCurrency()}${formatMoney(entry.ctc)}, Exp ${getCurrency()}${formatMoney(entry.exp)}/mo
        </div>
        <button class="btn btn-sm" onclick="deleteLifestyleYear(${index})"><i class="bi bi-trash"></i></button>
      </div>
    `;
  });

  const btn = document.getElementById('liAnalyseBtn');
  if (btn) {
    if (labLifestyleEntries.length >= 2) btn.classList.remove('d-none');
    else btn.classList.add('d-none');
  }
}

function analyseLifestyleInflation() {
  const entries = [...labLifestyleEntries].sort((a, b) => a.year - b.year);
  const tbody = document.getElementById('liBreakdownBody');
  tbody.innerHTML = "";

  let totalHikeAbsorbed = 0;
  let pairCount = 0;

  for (let i = 1; i < entries.length; i++) {
    const old = entries[i - 1];
    const curr = entries[i];

    const salInc = (curr.ctc - old.ctc) / old.ctc * 100;
    const expInc = (curr.exp - old.exp) / old.exp * 100;
    const savRateOld = ((old.ctc / 12) - old.exp) / (old.ctc / 12) * 100;
    const savRateNew = ((curr.ctc / 12) - curr.exp) / (curr.ctc / 12) * 100;
    const inflRate = expInc - salInc;

    const deltaSalaryMonthly = (curr.ctc - old.ctc) / 12;
    const deltaExpenses = curr.exp - old.exp;
    const absorbed = deltaSalaryMonthly > 0 ? (deltaExpenses / deltaSalaryMonthly * 100) : 0;

    totalHikeAbsorbed += Math.max(0, absorbed);
    pairCount++;

    let verdict = "CONTROLLED";
    if (expInc > salInc + 5) verdict = "INFLATED";
    else if (expInc < salInc) verdict = "DISCIPLINED";

    tbody.innerHTML += `
      <tr>
        <td>${old.year} → ${curr.year}</td>
        <td>${salInc.toFixed(1)}%</td>
        <td>${expInc.toFixed(1)}%</td>
        <td class="${inflRate > 5 ? 'fw-bold' : ''}">${inflRate.toFixed(1)}%</td>
        <td>${savRateOld.toFixed(1)}%</td>
        <td>${savRateNew.toFixed(1)}%</td>
        <td class="fw-bold">${verdict}</td>
      </tr>
    `;
  }

  const avgAbsorbed = (totalHikeAbsorbed / pairCount).toFixed(1);
  const improvement = (100 - avgAbsorbed).toFixed(1);
  document.getElementById('liVerdictText').innerHTML = `Across all tracked periods, <strong>${avgAbsorbed}%</strong> of your salary growth was absorbed by lifestyle inflation. You kept <strong>${improvement}%</strong> as actual savings improvement.`;

  const visualGrid = document.getElementById('liVisualGrid');
  visualGrid.innerHTML = "";
  const maxCTC = Math.max(...entries.map(e => e.ctc));
  const maxExp = Math.max(...entries.map(e => e.exp));

  entries.forEach(e => {
    visualGrid.innerHTML += `
      <div class="col-md-6">
        <div class="p-3 border bg-white shadow-sm">
          <div class="fw-bold mb-2">${e.year}</div>
          <div class="mb-2">
            <span class="small d-block text-muted">Salary: ${getCurrency()}${formatMoney(e.ctc)}</span>
            <div style="width: 200px; background-color: #eeeeee; border: 1px solid #808080; display: inline-block;">
              <div style="background-color: #808080; height: 16px; width: ${(e.ctc / maxCTC * 100)}%;"></div>
            </div>
          </div>
          <div>
            <span class="small d-block text-muted">Expenses (Monthly): ${getCurrency()}${formatMoney(e.exp)}</span>
            <div style="width: 200px; background-color: #eeeeee; border: 1px solid #808080; display: inline-block;">
              <div style="background-color: #606060; height: 16px; width: ${(e.exp / maxExp * 100)}%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById('liResults').classList.remove('d-none');
}

function initFinancialFreedom() {
  const res = document.getElementById('fireResults');
  if (res) res.classList.add('d-none');
}

function calculateFinancialFreedom() {
  const age = Number(document.getElementById('fireAge').value);
  const currExp = Number(document.getElementById('fireCurrExp').value);
  const retExp = Number(document.getElementById('fireRetExp').value);
  const savings = Number(document.getElementById('fireSavings').value);
  const investment = Number(document.getElementById('fireInvestment').value);
  const returns = Number(document.getElementById('fireReturn').value);
  const swr = Number(document.getElementById('fireSWR').value);
  const inflation = Number(document.getElementById('fireInflation').value);

  if (!age || !currExp || !investment) {
    showToast("Please fill in basic details", "warning");
    return;
  }

  function simulate(monthlyInvest) {
    let corpus = savings;
    const monthlyReturn = Math.pow(1 + returns / 100, 1 / 12) - 1;
    const monthlyInflation = Math.pow(1 + inflation / 100, 1 / 12) - 1;

    let months = 0;
    while (months < 600) { // 50 years max
      months++;
      corpus = corpus * (1 + monthlyReturn) + monthlyInvest;
      const inflatedExp = retExp * Math.pow(1 + monthlyInflation, months);
      const neededCorpus = (inflatedExp * 12) / (swr / 100);

      if (corpus >= neededCorpus) return { months, corpus: neededCorpus };
    }
    return { months: 999, corpus: 0 };
  }

  const result = simulate(investment);
  const years = Math.floor(result.months / 12);
  const months = result.months % 12;
  const freedomAge = age + years;
  const savingsRate = (investment / (investment + currExp)) * 100;

  const announcement = document.getElementById('fireAnnouncement');
  if (result.months < 600) {
    announcement.innerHTML = `
      <div style="background-color: #808080; color: #ffffff; padding: 1.5rem; text-align: center; font-family: 'Courier New', Courier, monospace;">
        <div style="text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; margin-bottom: 0.5rem;">FINANCIAL FREEDOM TARGET</div>
        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${getCurrency()}${formatMoney(result.corpus.toFixed(0))}</div>
        <div style="font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 0.5rem;">
          ACHIEVED AT AGE ${freedomAge}  IN ${years} YEARS ${months} MONTHS
        </div>
      </div>
    `;
  } else {
    announcement.innerHTML = `
      <div style="background-color: #606060; color: #ffffff; padding: 1.5rem; text-align: center; font-family: 'Courier New', Courier, monospace; border: 2px solid #808080;">
        <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">TARGET NOT REACHABLE IN 50 YEARS</div>
        <div style="font-size: 0.9rem;">INCREASE YOUR SAVINGS RATE TO REACH FREEDOM</div>
      </div>
    `;
  }

  const statGrid = document.getElementById('fireStatGrid');
  statGrid.innerHTML = `
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>FIRE Corpus</h6>
        <p class="stat-value">${getCurrency()}${formatMoney(result.corpus.toFixed(0))}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Years to Freedom</h6>
        <p class="stat-value">${result.months < 600 ? years + 'y ' + months + 'm' : 'N/A'}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Freedom Age</h6>
        <p class="stat-value">${result.months < 600 ? freedomAge : 'N/A'}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Savings Rate %</h6>
        <p class="stat-value">${savingsRate.toFixed(1)}%</p>
      </div>
    </div>
  `;

  const sensitivityBody = document.getElementById('fireSensitivityBody');
  sensitivityBody.innerHTML = "";
  const levels = [0, 2000, 5000, 10000];
  levels.forEach(l => {
    const r = simulate(investment + l);
    const y = Math.floor(r.months / 12);
    const m = r.months % 12;
    const fa = age + y;
    const isCurrent = l === 0;

    sensitivityBody.innerHTML += `
      <tr style="${isCurrent ? 'font-weight: bold; background-color: #f8f9fa;' : ''}">
        <td>${getCurrency()}${formatMoney(investment + l)}</td>
        <td>${r.months < 600 ? y + 'y ' + m + 'm' : '> 50y'}</td>
        <td>${r.months < 600 ? fa : 'N/A'}</td>
      </tr>
    `;
  });

  const insight = document.getElementById('fireInsight');
  const yearsInRetirement = 90 - freedomAge;
  insight.textContent = `Your money needs to last approximately ${yearsInRetirement > 0 ? yearsInRetirement : 30} years in retirement. At ${swr}% withdrawal, your corpus covers this indefinitely.`;

  document.getElementById('fireResults').classList.remove('d-none');
}

function closeTool() {
  const panel = document.getElementById('labToolPanel');
  const title = document.getElementById('labToolPanelTitle');

  if (panel) {
    panel.style.display = 'none';
  }

  if (title) {
    title.textContent = 'SELECT AN EXPERIMENT ABOVE';
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  currentTool = null;
}

function initFinancialAge() {
  const res = document.getElementById('faResults');
  if (res) res.classList.add('d-none');
}

function calculateFinancialAge() {
  const realAge = Number(document.getElementById('faActualAge').value);
  if (!realAge) {
    showToast("Please enter your actual age first", "warning");
    return;
  }

  const questions = [
    { id: 'faQ1', label: 'Emergency Fund', tip: 'Build an emergency fund of at least 3 months expenses before anything else' },
    { id: 'faQ2', label: 'Savings Rate', tip: 'Automate a SIP of at least 10% of your salary on the day you get paid' },
    { id: 'faQ3', label: 'Investments', tip: 'Open a mutual fund account this week  even ₹500/month is a start' },
    { id: 'faQ4', label: 'Expense Tracking', tip: 'Start recording every single rupee you spend in an app or diary for 30 days' },
    { id: 'faQ5', label: 'Debt Management', tip: 'Clear your highest-interest debt (like credit cards) as your #1 priority' },
    { id: 'faQ6', label: 'Insurance', tip: 'Get a basic term plan and a ₹5 Lakh health insurance policy immediately' },
    { id: 'faQ7', label: 'Net Worth', tip: 'Calculate your net worth (Assets - Liabilities) today to know where you stand' },
    { id: 'faQ8', label: 'Hike Behavior', tip: 'Commit to investing at least 50% of every future salary hike' },
    { id: 'faQ9', label: 'Financial Goals', tip: 'Define one specific goal (e.g. buying a house) and set a ₹ target and date' },
    { id: 'faQ10', label: 'Retirement Plan', tip: 'Use a retirement calculator to see how much you need to stop working comfortably' }
  ];

  let totalPoints = 0;
  const breakdownBody = document.getElementById('faBreakdownBody');
  breakdownBody.innerHTML = "";

  const resultsData = [];

  questions.forEach(q => {
    const el = document.getElementById(q.id);
    const pts = Number(el.value);
    const ansText = el.options[el.selectedIndex].text;
    totalPoints += pts;

    resultsData.push({ ...q, points: pts, answer: ansText });

    breakdownBody.innerHTML += `
      <tr>
        <td class="text-start">${q.label}</td>
        <td class="text-start">${ansText}</td>
        <td class="fw-bold">${pts}</td>
        <td>5</td>
      </tr>
    `;
  });

  breakdownBody.innerHTML += `
    <tr class="fw-bold" style="background-color: #f8f9fa;">
      <td colspan="2" class="text-end">TOTAL SCORE</td>
      <td>${totalPoints}</td>
      <td>50</td>
    </tr>
  `;

  let finAge = 60;
  if (totalPoints >= 45) finAge = 20;
  else if (totalPoints >= 39) finAge = 24;
  else if (totalPoints >= 31) finAge = 28;
  else if (totalPoints >= 21) finAge = 35;
  else if (totalPoints >= 11) finAge = 45;

  let verdict = "You are right on track financially.";
  if (finAge < realAge) verdict = "You are financially AHEAD of your age. Keep going.";
  else if (finAge > realAge) verdict = "Your finances are BEHIND your real age. Time to catch up.";

  const reportCard = document.getElementById('faReportCard');
  reportCard.innerHTML = `
    <div style="background-color: #808080; color: #fff; padding: 4px 10px; font-size: 0.85rem; font-weight: bold; margin: -1.5rem -1.5rem 1rem -1.5rem;">MONEVER FINANCIAL REPORT CARD</div>
    <div class="mb-2">Your Real Age: <span class="fw-bold">${realAge}</span></div>
    <div class="mb-3">Your Financial Age: <span style="font-size: 1.5rem; font-weight: bold; color: ${finAge <= realAge ? '#888888' : '#606060'};">${finAge}</span></div>
    <div class="mb-3 fw-bold small">${verdict}</div>
    <div class="text-muted small">Score: ${totalPoints} out of 50 points</div>
  `;

  const tipsSection = document.getElementById('faTipsSection');
  tipsSection.innerHTML = `<h5 class="fw-bold mb-3">To Improve Your Financial Age</h5>`;

  const sortedByPoints = resultsData.sort((a, b) => a.points - b.points);
  const lowestThree = sortedByPoints.slice(0, 3);

  lowestThree.forEach(t => {
    tipsSection.innerHTML += `
      <div class="card p-2 mb-2" style="border-left: 4px solid #808080; background-color: #eeeeee;">
        <div class="small fw-bold text-uppercase text-muted">${t.label} Improvement</div>
        <div class="small">${t.tip}</div>
      </div>
    `;
  });

  document.getElementById('faResults').classList.remove('d-none');
}

function initSalaryToHours() {
  const res = document.getElementById('shResults');
  if (res) res.classList.add('d-none');
}

let labEffectiveHourlyRate = 0;
let labTotalDailyHours = 0;

function calculateSalaryHours() {
  const ctc = Number(document.getElementById('shCTC').value);
  const takeHomeInput = Number(document.getElementById('shTakeHome').value);
  const workHours = Number(document.getElementById('shWorkHours').value);
  const workDays = Number(document.getElementById('shWorkDays').value);
  const commute = Number(document.getElementById('shCommute').value);
  const expenses = Number(document.getElementById('shExpenses').value);

  if (!ctc && !takeHomeInput) {
    showToast("Please enter either CTC or Monthly Take-Home", "warning");
    return;
  }

  const effectiveMonthlyIncome = takeHomeInput || (ctc * 0.72 / 12);
  const netMonthlyIncome = effectiveMonthlyIncome - expenses;
  const totalWorkHoursPerWeek = (workHours + commute) * workDays;
  const totalDailyHours = workHours + commute;

  const hourlyRate = (netMonthlyIncome * 12) / (totalWorkHoursPerWeek * 52);
  labEffectiveHourlyRate = hourlyRate;
  labTotalDailyHours = totalDailyHours;

  const terminal = document.getElementById('shTerminalContent');
  terminal.innerHTML = `
    <div>EFFECTIVE HOURLY RATE: ${getCurrency()}${formatMoney(hourlyRate.toFixed(2))}</div>
    <div>EFFECTIVE DAILY RATE: ${getCurrency()}${formatMoney((hourlyRate * totalDailyHours).toFixed(2))}</div>
    <div>EFFECTIVE RATE PER MINUTE: ${getCurrency()}${formatMoney((hourlyRate / 60).toFixed(2))}</div>
  `;

  const statGrid = document.getElementById('shStatGrid');
  statGrid.innerHTML = `
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Hourly Rate</h6>
        <p class="stat-value">${getCurrency()}${formatMoney(hourlyRate.toFixed(0))}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Daily Rate</h6>
        <p class="stat-value">${getCurrency()}${formatMoney((hourlyRate * totalDailyHours).toFixed(0))}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Weekly Rate</h6>
        <p class="stat-value">${getCurrency()}${formatMoney((hourlyRate * totalWorkHoursPerWeek).toFixed(0))}</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="summary-stat-card">
        <h6>Effective Monthly</h6>
        <p class="stat-value">${getCurrency()}${formatMoney(netMonthlyIncome.toFixed(0))}</p>
      </div>
    </div>
  `;

  const items = [
    { name: 'Chai from tapri', price: 10 },
    { name: 'Movie ticket', price: 300 },
    { name: 'Zomato order', price: 400 },
    { name: 'New shoes', price: 2000 },
    { name: 'Smartphone', price: 15000 },
    { name: 'Laptop', price: 60000 },
    { name: 'Bike', price: 80000 },
    { name: 'Car', price: 800000 }
  ];

  const itemsBody = document.getElementById('shItemsBody');
  itemsBody.innerHTML = "";
  items.forEach(item => {
    const hours = item.price / hourlyRate;
    const days = hours / totalDailyHours;
    itemsBody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${getCurrency()}${formatMoney(item.price)}</td>
        <td class="fw-bold">${hours.toFixed(1)} hrs</td>
        <td>${days.toFixed(1)} days</td>
      </tr>
    `;
  });

  const philosophical = document.getElementById('shPhilosophical');
  philosophical.innerHTML = `Your time is worth <strong>${getCurrency()}${formatMoney(hourlyRate.toFixed(2))}</strong> per hour. Before buying something, ask yourself: is this worth the time you spend to earn it?`;

  document.getElementById('shResults').classList.remove('d-none');
}

function convertPriceToHours() {
  const price = Number(document.getElementById('shCustomPrice').value);
  if (!price || !labEffectiveHourlyRate) return;

  const totalHours = price / labEffectiveHourlyRate;
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);

  const totalDays = totalHours / labTotalDailyHours;
  const d = Math.floor(totalDays);
  const remainingHours = (totalDays - d) * labTotalDailyHours;

  const res = document.getElementById('shCustomResult');
  res.innerHTML = `This costs you ${h} hours ${m} minutes of your life  ${d} days ${remainingHours.toFixed(1)} hours of work.`;
  res.classList.remove('d-none');
}

function initFortuneTeller() {
  const inputSec = document.getElementById('oracleInputSection');
  const resSec = document.getElementById('oracleResults');
  if (inputSec) inputSec.classList.remove('d-none');
  if (resSec) resSec.classList.add('d-none');

  const header = document.getElementById('oracleHeader');
  const output = document.getElementById('oracleOutput');
  const resetBtn = document.getElementById('oracleResetBtn');
  if (header) header.innerHTML = "";
  if (output) output.innerHTML = "";
  if (resetBtn) resetBtn.classList.add('d-none');
}

function consultOracle() {
  const name = document.getElementById('oracleName').value;
  const savings = Number(document.getElementById('oracleSavings').value);
  const weakness = document.getElementById('oracleWeakness').value;
  const animal = document.getElementById('oracleAnimal').value;
  const plan = document.getElementById('oraclePlan').value;
  const month = Number(document.getElementById('oracleMonth').value);

  if (!name) {
    showToast("The Oracle requires your name to search the void.", "warning");
    return;
  }

  const openings = [
    "Born under the January frost, your spirit seeks stability.",
    "A February soul, often caught between love and ledger.",
    "March winds blow through your wallet, carrying both dust and dreams.",
    "In April's rain, you planted seeds that now await the sun.",
    "May's bloom reveals a heart that beats for luxury and logic.",
    "June's long days bring long receipts and even longer thoughts.",
    "July's heat ignites a passion for progress and premium coffee.",
    "August strength carries you through the driest financial spells.",
    "September's harvest depends on the discipline you showed in spring.",
    "October shadows hide both missed opportunities and hidden gains.",
    "November's chill reminds you that winter is coming for your bank balance.",
    "December's light shines on a year of choices made and debts paid."
  ];

  const weaknessWarnings = {
    'shopping': "The Oracle sees a great many browser tabs open in your future. Each one whispers 'add to cart.' Resist, or your savings will weep.",
    'eating': "Your stomach is a black hole for capital. The Oracle suggests that a home-cooked meal contains 400% more financial wisdom.",
    'impulse': "The 'Buy Now' button is your greatest nemesis. It strikes when your guard is down and your mood is high.",
    'subs': "A thousand tiny leaks will sink even the grandest ship. You are being bled dry ₹499 at a time.",
    'lending': "Your kindness is your currency, but your friends are poor exchangers. The Oracle warns: do not become the bank you despise.",
    'yesman': "The word 'No' is a powerful investment. Learn it, or spend your life paying for everyone else's joy.",
    'ignoring': "Darkness does not hide the numbers; it only makes them grow more teeth. Open the app. Face the truth."
  };

  const animalProphecies = {
    'squirrel': "The Squirrel energy is strong. Your cache is deep, but remember to eat some of the nuts before they rot.",
    'magpie': "You chase the shine of the new, ignoring the value of the old. Not everything that glitters has a high ROI.",
    'ostrich': "The Ostrich energy is strong with you. Your bank statement has been unseen for months. The Oracle suggests a brief look.",
    'ant': "The Ant's path is slow but certain. Your colony will thrive while others perish in the winter of inflation.",
    'grasshopper': "You play the fiddle while the markets burn. The music is sweet, but the winter of old age is very quiet and very cold."
  };

  const yearPredictions = {
    'aggressive': "This year, your bank balance will climb like a mountain goatsteady and unafraid of the heights.",
    'wisely': "Wisdom will be your shield. You will see the trap before the trap sees you.",
    'mindfully': "Every rupee will have a name and a purpose. You will find peace in the math.",
    'honestly': "The path is narrow and the rocks are sharp, but you will emerge on the other side with your soul intact.",
    'pretending': "The Oracle sighs. Mirrors do not change your face, and spreadsheets do not change for your smile."
  };

  let closing = "";
  if (savings < 5000) closing = "Start small, for even the mighty banyan began as a tiny seed. Your path to wealth begins with the next ₹100.";
  else if (savings < 25000) closing = "You have the momentum of a rolling stone. Keep pushing, and the mountain of debt will crumble.";
  else closing = "The Oracle bows. You have mastered the base metals and are turning them into gold. Continue the Great Work.";

  const fullFortune = openings[month] + " " + weaknessWarnings[weakness] + " " + animalProphecies[animal] + " " + yearPredictions[plan] + " " + closing;

  document.getElementById('oracleInputSection').classList.add('d-none');
  document.getElementById('oracleResults').classList.remove('d-none');

  const header = document.getElementById('oracleHeader');
  const output = document.getElementById('oracleOutput');
  const date = new Date().toLocaleDateString('en-GB');

  header.innerHTML = `ORACLE SESSION FOR: ${name.toUpperCase()}<br>DATE: ${date}<br>STATUS: CONSULTING THE FISCAL VOID...`;

  setTimeout(() => {
    header.innerHTML = `ORACLE SESSION FOR: ${name.toUpperCase()}<br>DATE: ${date}`;
    let i = 0;
    const interval = setInterval(() => {
      output.innerHTML += fullFortune[i];
      i++;
      if (i >= fullFortune.length) {
        clearInterval(interval);
        document.getElementById('oracleResetBtn').classList.remove('d-none');
      }
    }, 30);
  }, 1000);
}

let tickerStocks = [];
let tsTickerInterval = null;
let tsClockInterval = null;

function initTickerScreensaver() {
  tickerStocks = [];
  renderTickerList();
}

function addTickerStock() {
  const symbol = document.getElementById('tsSymbol').value.toUpperCase();
  const price = Number(document.getElementById('tsPrice').value);
  const change = Number(document.getElementById('tsChange').value);
  const qty = Number(document.getElementById('tsQty').value);

  if (!symbol || !price) {
    showToast("Symbol and Price are required", "warning");
    return;
  }

  tickerStocks.push({ symbol, price, change, qty });
  renderTickerList();

  // Clear inputs
  document.getElementById('tsSymbol').value = "";
  document.getElementById('tsPrice').value = "";
  document.getElementById('tsChange').value = "";
  document.getElementById('tsQty').value = "";
}

function deleteTickerStock(index) {
  tickerStocks.splice(index, 1);
  renderTickerList();
}

function renderTickerList() {
  const list = document.getElementById('tickerEntries');
  const launchBtn = document.getElementById('launchTickerBtn');
  if (!list) return;

  list.innerHTML = "";
  tickerStocks.forEach((s, idx) => {
    const value = s.price * s.qty;
    list.innerHTML += `
      <div class="list-group-item d-flex justify-content-between align-items-center small">
        <div>
          <span class="fw-bold">${s.symbol}</span> · ₹${formatMoney(s.price)} · 
          <span class="${s.change >= 0 ? 'text-success' : 'text-danger'}">${s.change >= 0 ? '+' : ''}${s.change}%</span> · 
          QTY: ${s.qty} · VALUE: ₹${formatMoney(value.toFixed(0))}
        </div>
        <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteTickerStock(${idx})"><i class="bi bi-trash"></i></button>
      </div>
    `;
  });

  if (tickerStocks.length > 0) {
    launchBtn.classList.remove('d-none');
  } else {
    launchBtn.classList.add('d-none');
  }
}

function loadDemoStocks() {
  tickerStocks = [
    { symbol: 'RELIANCE', price: 2847, change: 0.8, qty: 10 },
    { symbol: 'INFY', price: 1623, change: -1.2, qty: 15 },
    { symbol: 'TCS', price: 3912, change: 0.3, qty: 5 },
    { symbol: 'HDFC', price: 1678, change: 1.5, qty: 20 },
    { symbol: 'WIPRO', price: 456, change: -0.6, qty: 50 }
  ];
  renderTickerList();
}

function launchTicker() {
  document.getElementById('tickerSetup').style.display = 'none';
  document.getElementById('tickerDisplay').style.display = 'block';

  // Build ticker content
  const tickerLine = document.getElementById('tickerLine');
  tickerLine.innerHTML = "";
  tickerStocks.forEach(s => {
    const color = s.change >= 0 ? '#cccccc' : '#606060';
    const icon = s.change >= 0 ? '▲' : '▼';
    tickerLine.innerHTML += `
      <span style="color: ${color}; margin-right: 20px;">${s.symbol} ₹${formatMoney(s.price)} ${icon}${Math.abs(s.change)}%</span>
      <span style="color: #444; margin-right: 20px;">|</span>
    `;
  });

  // Start scrolling
  let offset = 100;
  if (tsTickerInterval) clearInterval(tsTickerInterval);
  tsTickerInterval = setInterval(() => {
    offset -= 0.5;
    tickerLine.style.transform = `translateX(${offset}%)`;
    if (offset < -100) offset = 100;
  }, 30);

  // Start clock
  if (tsClockInterval) clearInterval(tsClockInterval);
  tsClockInterval = setInterval(() => {
    document.getElementById('tsClock').textContent = new Date().toLocaleTimeString();
  }, 1000);

  // Summary
  let totalValue = 0;
  let totalPnL = 0;
  const tableBody = document.getElementById('tsTableBody');
  tableBody.innerHTML = "";

  tickerStocks.forEach(s => {
    const val = s.price * s.qty;
    const pnl = val * (s.change / 100);
    totalValue += val;
    totalPnL += pnl;

    tableBody.innerHTML += `
      <tr>
        <td class="p-1">${s.symbol}</td>
        <td class="p-1">${formatMoney(s.price)}</td>
        <td class="p-1">${s.change >= 0 ? '▲' : '▼'}${Math.abs(s.change)}%</td>
        <td class="p-1">${s.qty}</td>
        <td class="p-1">${formatMoney(val.toFixed(0))}</td>
      </tr>
    `;
  });

  const pnlPercent = (totalPnL / (totalValue - totalPnL)) * 100;
  document.getElementById('tsPortfolioSummary').innerHTML = `
    <div>> PORTFOLIO HOLDINGS: ${tickerStocks.length} STOCKS</div>
    <div>> TOTAL VALUE: ₹${formatMoney(totalValue.toFixed(0))}</div>
    <div class="fw-bold">> TODAY'S P&L: ₹${formatMoney(totalPnL.toFixed(0))} (${totalPnL >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)</div>
  `;
}

function closeTicker() {
  if (tsTickerInterval) clearInterval(tsTickerInterval);
  if (tsClockInterval) clearInterval(tsClockInterval);
  document.getElementById('tickerSetup').style.display = 'block';
  document.getElementById('tickerDisplay').style.display = 'none';
}

function generateCompQuestions(person) {
  const qs = [
    { label: "When you get paid, you first", options: ["Pay bills then see what's left", "Transfer savings first then spend rest", "Spend freely and save whatever remains", "Have no fixed plan"] },
    { label: "Your approach to debt", options: ["Avoid debt at all costs", "Only take debt for assets (home/education)", "Use credit cards freely and pay minimums", "Comfortable with debt if returns are higher"] },
    { label: "Your savings rate is approximately", options: ["I spend more than I earn", "Less than 10%", "10–25%", "25–40%", "Above 40%"] },
    { label: "A major purchase decision", options: ["Decide alone immediately", "Discuss but decide myself", "Discuss and decide together", "Research extensively then decide together"] },
    { label: "Your reaction to a financial emergency", options: ["Panic and figure it out", "Use credit cards", "Dip into savings reluctantly", "Use emergency fund  that's what it's for"] },
    { label: "Splitting expenses in a relationship", options: ["One person handles everything", "Split 50/50 strictly", "Proportional to income", "Pooled finances, no splitting"] },
    { label: "Your financial goal priority", options: ["Buy a house", "Travel and experiences", "Early retirement", "Build a business", "Children's education", "No specific priority"] },
    { label: "Your relationship with money is", options: ["It causes me stress", "It's a necessary evil", "It's a tool I manage", "It's something I enjoy optimising"] }
  ];

  return qs.map((q, i) => `
    <div class="mb-3">
      <label class="form-label text-muted small fw-bold">${q.label}</label>
      <select id="compQ${i + 1}${person}" class="form-control">
        ${q.options.map((opt, idx) => `<option value="${idx}">${opt}</option>`).join('')}
      </select>
    </div>
  `).join('');
}

function initCompatibilityTest() {
  const res = document.getElementById('compResults');
  if (res) res.classList.add('d-none');
}

function calculateCompatibility() {
  const matrix = {
    1: [[10, 8, 2, 0], [8, 10, 2, 0], [2, 2, 10, 5], [0, 0, 5, 10]],
    2: [[10, 8, 0, 5], [8, 10, 2, 8], [0, 2, 10, 5], [5, 8, 5, 10]],
    3: [[10, 5, 2, 0, 0], [5, 10, 7, 3, 2], [2, 7, 10, 7, 5], [0, 3, 7, 10, 8], [0, 2, 5, 8, 10]],
    4: [[10, 5, 0, 0], [5, 10, 5, 3], [0, 5, 10, 8], [0, 3, 8, 10]],
    5: [[10, 2, 5, 5], [2, 10, 3, 0], [5, 3, 10, 8], [5, 0, 8, 10]],
    6: [[10, 0, 2, 5], [0, 10, 5, 2], [2, 5, 10, 8], [5, 2, 8, 10]],
    7: [[10, 5, 8, 5, 5, 2], [5, 10, 5, 5, 5, 2], [8, 5, 10, 8, 5, 2], [5, 5, 8, 10, 5, 2], [5, 5, 5, 5, 10, 2], [2, 2, 2, 2, 2, 10]],
    8: [[10, 8, 5, 2], [8, 10, 8, 5], [5, 8, 10, 8], [2, 5, 8, 10]]
  };

  const advice = {
    1: "You have different budgeting rhythms. One prefers planning, the other prefers flow. Align on a monthly check-in.",
    2: "Your views on debt are opposing. One is debt-averse, while the other is comfortable using credit. This can lead to significant stress.",
    3: "There is a gap in your savings rates. Discuss a joint savings target to ensure one person doesn't carry the entire burden.",
    4: "Your decision-making styles differ. Decide on a 'purchase threshold' (e.g. ₹5,000) above which both must agree.",
    5: "Your emergency response strategies vary. Build a dedicated joint emergency fund to prevent panic or credit card debt.",
    6: "You have different approaches to splitting expenses. Have an explicit conversation about this before combining finances.",
    7: "Your long-term goals are not aligned. List your top 3 priorities and find a middle ground to work towards together.",
    8: "One of you feels stress about money while the other sees it as a tool. Be patient with each other's emotional responses."
  };

  const questions = [
    "Budgeting Style", "Debt Approach", "Savings Rate", "Purchase Decisions",
    "Emergency Reaction", "Expense Splitting", "Financial Goals", "Money Relationship"
  ];

  let totalScore = 0;
  const breakdownBody = document.getElementById('compBreakdownBody');
  breakdownBody.innerHTML = "";
  const lowScores = [];

  for (let i = 1; i <= 8; i++) {
    const valA = Number(document.getElementById(`compQ${i}A`).value);
    const valB = Number(document.getElementById(`compQ${i}B`).value);
    const score = matrix[i][valA][valB];
    totalScore += score;

    const ansA = document.getElementById(`compQ${i}A`).options[valA].text;
    const ansB = document.getElementById(`compQ${i}B`).options[valB].text;

    const isLow = score < 5;
    if (isLow) lowScores.push({ q: questions[i-1], advice: advice[i] });

    breakdownBody.innerHTML += `
      <tr style="${isLow ? 'background-color: #eeeeee;' : ''}">
        <td class="text-start">${questions[i-1]}</td>
        <td class="text-start small">${ansA}</td>
        <td class="text-start small">${ansB}</td>
        <td class="fw-bold">${score}</td>
      </tr>
    `;
  }

  const rating = totalScore >= 70 ? "HIGHLY COMPATIBLE" :
                 totalScore >= 55 ? "COMPATIBLE WITH MINOR DIFFERENCES" :
                 totalScore >= 40 ? "SOME FINANCIAL TENSION AHEAD" :
                 totalScore >= 25 ? "SIGNIFICANT DIFFERENCES  DISCUSS OPENLY" :
                 "FINANCIAL OPPOSITES  COMMUNICATION IS CRITICAL";

  const reportCard = document.getElementById('compReportCard');
  reportCard.innerHTML = `
    <div style="background-color: #808080; color: #fff; padding: 4px 10px; font-size: 0.85rem; font-weight: bold; margin: -1.5rem -1.5rem 1rem -1.5rem;">MONEVER COMPATIBILITY REPORT</div>
    <div class="mb-2 text-muted small">Compatibility Score:</div>
    <div class="mb-2" style="font-size: 2rem; font-weight: bold;">${totalScore} / 80</div>
    <div class="mb-3" style="font-size: 1.1rem; font-weight: bold;">${rating}</div>
    <div class="retro-progress-container mb-2">
      <div class="retro-progress-bar" style="width: ${(totalScore/80)*100}%"></div>
    </div>
  `;

  const adviceSection = document.getElementById('compAdviceSection');
  adviceSection.innerHTML = lowScores.length > 0 ? `<h5 class="fw-bold mb-3">Key Differences & Advice</h5>` : "";
  lowScores.forEach(item => {
    adviceSection.innerHTML += `
      <div class="card p-2 mb-2" style="border-left: 4px solid #606060; background-color: #eeeeee;">
        <div class="small fw-bold text-uppercase text-muted">${item.q}</div>
        <div class="small">${item.advice}</div>
      </div>
    `;
  });

  document.getElementById('compResults').classList.remove('d-none');
}

function initDailyBriefing() {
  const output = document.getElementById('briefingOutput');
  if (output) output.innerHTML = "";
}

function generateBriefing() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || '[]');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || '[]');
  const reminders = JSON.parse(localStorage.getItem('moneverReminders') || '[]');
  const budget = Number(localStorage.getItem('monthlyBudget') || 0);
  const income = Number(localStorage.getItem('monthlyIncome') || 0);

  const output = document.getElementById('briefingOutput');
  if (expenses.length === 0 && emis.length === 0) {
    output.innerHTML = `<div class="alert alert-info border-2 border-dark small fw-bold">NO DATA FOUND  OUR CORRESPONDENTS HAVE NOTHING TO REPORT. ADD SOME EXPENSES TO MONEVER FIRST.</div>`;
    return;
  }

  // Analytics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0) + 
                    emis.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const highestExp = thisMonthExpenses.reduce((prev, curr) => (Number(curr.amount) > Number(prev.amount) ? curr : prev), { amount: 0, category: 'General', date: new Date().toISOString() });
  
  const savingsRate = income > 0 ? ((income - totalSpent) / income) * 100 : 0;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysLeft = daysInMonth - new Date().getDate();

  // News Logic
  let mainHeadline = "";
  if (highestExp.amount > 5000) {
    mainHeadline = `LOCAL RESIDENT COMMITS FINANCIAL FELONY: ₹${formatMoney(highestExp.amount)} VANISHES INTO ${highestExp.category.toUpperCase()}`;
  } else if (highestExp.amount >= 1000) {
    mainHeadline = `EYEBROWS RAISED AS ${highestExp.category.toUpperCase()} SPENDING REACHES ₹${formatMoney(highestExp.amount)}`;
  } else {
    mainHeadline = `MODEST EXPENDITURE REPORTED; ECONOMISTS CAUTIOUSLY OPTIMISTIC`;
  }

  let budgetHeadline = "";
  if (budget > 0) {
    if (totalSpent > budget) {
      budgetHeadline = `BUDGET BREACH: MONTH SEES SPENDING EXCEED LIMITS BY ₹${formatMoney(totalSpent - budget)}`;
    } else {
      budgetHeadline = `FISCAL DISCIPLINE HOLDS: RESIDENT REMAINS ₹${formatMoney(budget - totalSpent)} UNDER MONTHLY BUDGET`;
    }
  } else {
    budgetHeadline = `BUDGET MYSTERY: LOCAL RESIDENT OPERATES WITHOUT SPENDING LIMITS, EXPERTS BAFFLED`;
  }

  let editorial = "";
  if (savingsRate > 30) {
    editorial = "This publication commends the fiscal restraint on display. Rarely does one witness such disciplined stewardship of personal finances.";
  } else if (savingsRate >= 10) {
    editorial = "Progress is being made, though this publication urges continued vigilance. The path to financial freedom is long but navigable.";
  } else {
    editorial = "This publication expresses grave concern. The figures do not lie. Immediate corrective action is advised before the next edition.";
  }

  const nextReminder = reminders.length > 0 ? reminders[0] : null;

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const vol = Math.floor(Math.random() * 90) + 10;

  output.innerHTML = `
    <div style="background-color: #fff; color: #000; padding: 2rem; border: 1px solid #000; font-family: 'Courier New', Courier, monospace; box-shadow: 10px 10px 0px #808080;">
      <div style="text-align: center; border-bottom: 3px solid #000; border-top: 3px solid #000; padding: 0.5rem; margin-bottom: 1rem;">
        <div style="font-size: 1.75rem; font-weight: bold; letter-spacing: 4px;">THE MONEVER GAZETTE</div>
        <div style="font-size: 0.75rem; margin-top: 5px;">
          VOL. 1, NO. ${vol} · ${dateStr} · PRICE: YOUR ATTENTION
        </div>
        <div style="border-top: 1px solid #000; margin-top: 5px; font-size: 0.7rem; padding-top: 3px;">ALL THE FINANCIAL NEWS THAT'S FIT TO PRINT</div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <div style="border-right: 1px solid #000; padding-right: 1.5rem;">
          <h2 style="font-size: 1.25rem; font-weight: bold; line-height: 1.2; margin-bottom: 0.5rem;">${mainHeadline}</h2>
          <div style="font-size: 0.75rem; font-style: italic; margin-bottom: 1rem;">By Our Financial Correspondent</div>
          <p style="font-size: 0.85rem; text-align: justify; line-height: 1.4;">
            Sources close to the wallet confirm that ₹${formatMoney(highestExp.amount)} was spent on ${highestExp.category} on ${new Date(highestExp.date).toLocaleDateString()}. 
            The transaction, described by insiders as "${highestExp.note || 'necessary'}", has prompted widespread discussion in financial circles.
          </p>

          <hr style="border: 0; border-top: 1px solid #000; margin: 1.5rem 0;">

          <h3 style="font-size: 1rem; font-weight: bold; margin-bottom: 0.5rem;">${budgetHeadline}</h3>
          <p style="font-size: 0.85rem; text-align: justify; line-height: 1.4;">
            As the month progresses, analysts are closely monitoring the flow of capital. "The numbers are quite revealing," said one anonymous ledger. 
            "We are seeing a pattern that suggests either high-level planning or high-level improvisation."
          </p>
        </div>

        <div>
          <div style="border-bottom: 2px solid #000; font-weight: bold; font-size: 0.8rem; margin-bottom: 0.5rem;">MARKET SUMMARY</div>
          <table style="width: 100%; font-size: 0.75rem; margin-bottom: 1.5rem;">
            <tr><td>Total Spent:</td><td style="text-align: right;">₹${formatMoney(totalSpent)}</td></tr>
            <tr><td>Month End:</td><td style="text-align: right;">${daysLeft} Days</td></tr>
            <tr><td>Savings Rate:</td><td style="text-align: right;">${savingsRate.toFixed(1)}%</td></tr>
          </table>

          <div style="border-bottom: 2px solid #000; font-weight: bold; font-size: 0.8rem; margin-bottom: 0.5rem;">REMINDERS DESK</div>
          <p style="font-size: 0.75rem; margin-bottom: 1.5rem;">
            ${nextReminder ? `UPCOMING: ${nextReminder.text}  ${nextReminder.date}` : 'NO ALERTS  SUSPICIOUSLY CALM'}
          </p>

          <div style="border-bottom: 2px solid #000; font-weight: bold; font-size: 0.8rem; margin-bottom: 0.5rem;">EDITORIAL</div>
          <p style="font-size: 0.75rem; font-style: italic; line-height: 1.4;">
            "${editorial}"
          </p>
        </div>
      </div>

      <div style="border-top: 2px solid #000; margin-top: 1.5rem; padding-top: 0.5rem; text-align: center; font-size: 0.65rem;">
        MONEVER GAZETTE IS NOT RESPONSIBLE FOR FINANCIAL DECISIONS MADE BASED ON THIS PUBLICATION · ALL FIGURES ARE YOUR OWN · PLEASE SPEND RESPONSIBLY
      </div>
    </div>

    <div class="d-flex gap-2 mt-4 no-print">
      <button class="btn btn-primary flex-grow-1" onclick="generateBriefing()">Generate New Edition</button>
      <button class="btn btn-outline-secondary" onclick="window.print()">Print / Save as PDF</button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  normalizeData();
  applyAppearance();
  loadSettings();
});
