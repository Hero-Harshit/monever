let currentPickerSlot = null;
let widgetSlotAssignments = {};
let budgetWidgetMonth = new Date().getMonth();
let budgetWidgetYear = new Date().getFullYear();

function openWidgetPicker(slotId) {
  currentPickerSlot = slotId;
  const modalElement = document.getElementById('widgetPickerModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

function selectWidget(widgetId) {
  const animatedWidgetIds = [
    'screensaver', 'grandfather-clock', 'vinyl-record', 'kaleidoscope',
    'lava-lamp', 'lucky-cat', 'black-hole', 'pinball',
    'financial-butterfly', 'cashflow-tide', 'tamagotchi', 'combo-streak'
  ];

  if (animatedWidgetIds.includes(widgetId)) {
    const currentAnimatedCount = Object.values(widgetSlotAssignments)
      .filter(id => animatedWidgetIds.includes(id)).length;
    if (currentAnimatedCount >= 4) {
      showToast(
        'Maximum 4 animated widgets allowed at once. Remove one first.',
        'warn'
      );
      bootstrap.Modal.getInstance(
        document.getElementById('widgetPickerModal')
      )?.hide();
      return;
    }
  }

  const modalElement = document.getElementById('widgetPickerModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
  renderWidget(currentPickerSlot, widgetId);
  saveWidgetAssignments();
}

function filterWidgetPicker(query) {
  const q = query.trim().toLowerCase();
  const tabs = document.getElementById('widgetPickerTabs');
  const countEl = document.getElementById('widget-search-count');
  const choices = document.querySelectorAll('.widget-choice');
  const panels = document.querySelectorAll('.tab-pane[id^="panel-"]');
  const allPanel = document.getElementById('panel-all');

  if (!q) {
    if (tabs) tabs.style.display = 'flex';
    choices.forEach(c => c.style.display = '');
    if (countEl) countEl.style.display = 'none';

    // Restore the first tab as active when search is cleared
    if (tabs) {
      const firstTab = tabs.querySelector('.nav-link');
      if (firstTab) {
        // Remove active from all tabs and panels
        tabs.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane[id^="panel-"]').forEach(p => {
          p.classList.remove('show', 'active');
        });
        // Activate the first tab
        firstTab.classList.add('active');
        const targetId = firstTab.getAttribute('data-bs-target');
        if (targetId) {
          const targetPanel = document.querySelector(targetId);
          if (targetPanel) targetPanel.classList.add('show', 'active');
        }
      }
    }
    return;
  }

  if (tabs) tabs.style.display = 'none';

  // Force show the "All" panel and hide others
  panels.forEach(p => {
    p.classList.remove('show', 'active');
  });
  if (allPanel) {
    allPanel.classList.add('show', 'active');
    const allChoices = allPanel.querySelectorAll('.widget-choice');
    let matchCount = 0;
    allChoices.forEach(choice => {
      const name = choice.querySelector('.widget-name')?.textContent.toLowerCase() || '';
      const desc = choice.querySelector('.widget-desc')?.textContent.toLowerCase() || '';
      if (name.includes(q) || desc.includes(q)) {
        choice.style.display = '';
        matchCount++;
      } else {
        choice.style.display = 'none';
      }
    });
    if (countEl) {
      countEl.style.display = 'block';
      countEl.textContent = `${matchCount} widgets found`;
    }
  }
}

function renderWidget(slotId, widgetId) {
  renderWidgetSync(slotId, widgetId);
  widgetSlotAssignments[slotId] = widgetId;
  saveWidgetAssignments();
}

function renderWidgetSync(slotId, widgetId) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  slot.innerHTML = getWidgetHTML(widgetId, slotId);

  // Clear all classes and inline styles that might interfere
  slot.className = "widget-slot";
  slot.style.border = "none";
  slot.style.padding = "0";
  slot.style.backgroundColor = "transparent";
  slot.style.aspectRatio = "1/1";
  slot.style.height = "auto";
  slot.style.display = "block";

  // Remove the onclick from the slot itself to prevent replacement dialog when clicking the widget
  slot.removeAttribute('onclick');

  initWidget(widgetId);
}

function getWidgetHTML(widgetId, slotId) {
  let name = "";
  let icon = "";
  let bodyContent = `<div class="text-center py-3 text-muted" style="font-size:0.65rem;">Loading...</div>`;

  const shellStyle = `background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.8rem; width: 100%; box-sizing: border-box; overflow: hidden; height: 100%; display: flex; flex-direction: column;`;
  const titleStyle = `background-color: #c0c0c0; color: #000000; padding: 2px 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; font-weight: bold; font-family: 'Courier New', monospace; white-space: nowrap; overflow: hidden; flex-shrink: 0; border-bottom: 1px solid #808080;`;
  const bodyStyle = `background-color: #ffffff; margin: 2px; padding: 5px 6px; box-sizing: border-box; overflow: hidden; flex: 1; display: flex; flex-direction: column;`;
  const btnStyle = `background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; padding: 2px 4px; font-size: 0.65rem; width: 100%; margin-top: 4px; cursor: pointer; font-family: inherit; flex-shrink: 0;`;

  switch (widgetId) {
    case 'smart-insights':
      name = "Smart Insights";
      icon = "bi-lightbulb";
      bodyContent = `
        <div style="font-size: 0.65rem; font-weight: bold; color: #555; margin-bottom: 2px;">Today's Insight</div>
        <div id="si-insight-text" style="font-size: 0.65rem; line-height: 1.2; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 1.6rem;"></div>
        <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; flex: 1; table-layout: fixed;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Spending</td>
            <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="si-week-total"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Top Category</td>
            <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="si-top-cat"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">vs Last Week</td>
            <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="si-vs-last"></td>
          </tr>
        </table>
        <button onclick="window.location.href='data.html'" style="${btnStyle}">View Detailed Insights</button>
      `;
      break;
    case 'budget-tracker':
      name = "Budget Tracker";
      icon = "bi-wallet2";
      bodyContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
          <button onclick="budgetWidgetPrevMonth()" style="background-color: #c0c0c0; border: 1px solid; border-color: #ffffff #808080 #808080 #ffffff; padding: 0 5px; font-size: 0.65rem; cursor: pointer;">&lt;</button>
          <span id="bw-month-label" style="font-size: 0.65rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px;"></span>
          <button onclick="budgetWidgetNextMonth()" style="background-color: #c0c0c0; border: 1px solid; border-color: #ffffff #808080 #808080 #ffffff; padding: 0 5px; font-size: 0.65rem; cursor: pointer;">&gt;</button>
        </div>
        <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; margin-bottom: 3px; table-layout: fixed;">
          <tr>
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Budget</td>
            <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="bw-budget-amount"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Spent</td>
            <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="bw-spent-amount"></td>
          </tr>
        </table>
        <div style="border: 1px solid #808080; background: #ffffff; padding: 1px; height: 10px; width: 100%; margin-bottom: 2px; box-sizing: border-box;">
          <div id="bw-progress-bar" style="height: 100%; width: 0%; background-color: #404040; transition: none;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.65rem; margin-bottom: 3px; overflow: hidden;">
          <span style="color: #555; white-space: nowrap;">Rem.</span>
          <span id="bw-remaining" style="font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></span>
        </div>
        <button onclick="window.location.href='data.html'" style="${btnStyle}">Manage Budgets</button>
      `;
      break;
    case 'upcoming-payments':
      name = "Payments";
      icon = "bi-calendar-event";
      bodyContent = `
        <div style="font-size: 0.65rem; font-weight: bold; color: #555; margin-bottom: 3px;">Next 30 Days</div>
        <div id="up-payments-list" style="flex: 1; overflow: hidden;"></div>
        <button onclick="window.location.href='data.html'" style="${btnStyle}">View All Payments</button>
      `;
      break;
    case 'health-score':
      name = "Health Score";
      icon = "bi-heart-pulse";
      bodyContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; overflow: hidden;">
          <div id="hs-score-display" style="font-size: 1.2rem; font-weight: bold; font-family: 'Courier New', Courier, monospace; white-space: nowrap;">-- / 100</div>
          <div id="hs-face" style="font-size: 1.2rem; line-height: 1;">🙂</div>
        </div>
        <hr style="border: none; border-top: 1px solid #c0c0c0; margin: 3px 0;">
        <div id="hs-verdict" style="font-size: 0.6rem; line-height: 1.2; color: #333; margin-bottom: 4px; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; height: 1.4rem;"></div>
        <table style="font-size: 0.55rem; border-collapse: collapse; width: 100%; margin-bottom: 3px; flex: 1; table-layout: fixed;">
          <tr><td style="padding: 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Budget</td><td style="text-align: right; font-weight: bold;" id="hs-p1"></td></tr>
          <tr><td style="padding: 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Savings</td><td style="text-align: right; font-weight: bold;" id="hs-p2"></td></tr>
          <tr><td style="padding: 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Tracking</td><td style="text-align: right; font-weight: bold;" id="hs-p3"></td></tr>
          <tr><td style="padding: 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">EMI Burden</td><td style="text-align: right; font-weight: bold;" id="hs-p4"></td></tr>
          <tr><td style="padding: 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Goals</td><td style="text-align: right; font-weight: bold;" id="hs-p5"></td></tr>
        </table>
        <button onclick="window.location.href='data.html'" style="${btnStyle}">View Full Report</button>
      `;
      break;
    case 'spending-heatmap':
      const hmNow = new Date();
      const hmMonthYear = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][hmNow.getMonth()]} ${hmNow.getFullYear()}`;
      name = `Heatmap (${hmMonthYear})`;
      icon = "bi-calendar3";
      bodyContent = `
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin-bottom: 2px; text-align: center;">
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">M</div>
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">T</div>
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">W</div>
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">T</div>
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">F</div>
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">S</div>
          <div style="font-size: 0.5rem; font-weight: bold; color: #555;">S</div>
        </div>
        <div id="hm-calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; flex: 1; overflow: hidden;"></div>
        <div style="display: flex; align-items: center; gap: 3px; margin-top: 3px; font-size: 0.5rem; flex-wrap: nowrap; overflow: hidden; white-space: nowrap;">
          <span style="display:inline-block; width:6px; height:6px; background:#eeeeee; border:1px solid #808080; flex-shrink:0;"></span>Lo
          <span style="display:inline-block; width:6px; height:6px; background:#c0c0c0; border:1px solid #808080; flex-shrink:0;"></span>Md
          <span style="display:inline-block; width:6px; height:6px; background:#808080; border:1px solid #808080; flex-shrink:0;"></span>Hi
          <span style="display:inline-block; width:6px; height:6px; background:#404040; border:1px solid #808080; flex-shrink:0;"></span>Mx
        </div>
      `;
      break;
    case 'suspicious-alert':
      name = "Spend Alert";
      icon = "bi-exclamation-triangle";
      bodyContent = `
        <div id="sa-alert-content" style="flex: 1;"></div>
        <button onclick="window.location.href='data.html'" style="${btnStyle}">View Transactions</button>
      `;
      break;
    case 'expense-dna':
      name = "Expense DNA";
      icon = "bi-fingerprint";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 4px; overflow: hidden; display: flex; flex-direction: column; height: 100%;">
          <div style="font-size: 0.6rem; color: #555; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            DNA for <span id="dna-month-label"></span>
          </div>
          <canvas id="dna-canvas" width="140" height="80"
            style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080;
            background: #c0c0c0; display: block; margin: 0 auto 6px; max-width: 100%; height: auto; flex-shrink: 0;">
          </canvas>
          <div id="dna-summary" style="font-size: 0.65rem; line-height: 1.3; overflow: hidden; flex: 1;"></div>
        </div>
      `;
      break;
    case 'daily-average':
      name = "Daily Average Tracker";
      icon = "bi-bar-chart-line";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 6px; flex-shrink: 0;">
          <div style="font-size: 0.65rem; color: #555; margin-bottom: 2px;">Today's Average</div>
          <div id="da-today-avg" style="font-size: 1.25rem; font-weight: bold; font-family: 'Courier New', Courier, monospace;">${getCurrency()}0</div>
          <div id="da-vs-label" style="font-size: 0.65rem; margin-top: 2px; font-weight: bold; height: 1rem;"></div>
        </div>
        <div style="border-top: 1px solid #c0c0c0; padding-top: 4px; margin-bottom: 6px; flex: 1; overflow: hidden;">
          <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed;">
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">This month avg/day</td>
              <td id="da-this-month" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Last month avg/day</td>
              <td id="da-last-month" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Days elapsed</td>
              <td id="da-days-elapsed" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
          </table>
        </div>
        <div style="font-size: 0.6rem; color: #555; margin-bottom: 3px; flex-shrink: 0;">Last 7 days</div>
        <div id="da-bar-chart" style="display: flex; align-items: flex-end; gap: 3px; height: 36px; flex-shrink: 0;"></div>
        <div id="da-day-labels" style="display: flex; gap: 3px; margin-top: 2px; flex-shrink: 0;"></div>
      `;
      break;
    case 'weekend-weekday':
      name = "Weekend vs Weekday";
      icon = "bi-calendar-week";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; text-align: center; margin-bottom: 6px; flex-shrink: 0;">
          This month's spending split
        </div>
        <div style="margin-bottom: 8px; flex-shrink: 0;">
          <div style="display: flex; justify-content: space-between; font-size: 0.65rem; margin-bottom: 2px;">
            <span style="font-weight: bold;">Weekdays</span>
            <span id="ww-weekday-amount" style="font-weight: bold;"></span>
          </div>
          <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 1px; height: 14px;">
            <div id="ww-weekday-bar" style="height: 100%; width: 0%; background-color: #404040; transition: none;"></div>
          </div>
          <div id="ww-weekday-pct" style="font-size: 0.55rem; color: #555; text-align: right; margin-top: 1px;"></div>
        </div>
        <div style="margin-bottom: 8px; flex-shrink: 0;">
          <div style="display: flex; justify-content: space-between; font-size: 0.65rem; margin-bottom: 2px;">
            <span style="font-weight: bold;">Weekends</span>
            <span id="ww-weekend-amount" style="font-weight: bold;"></span>
          </div>
          <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 1px; height: 14px;">
            <div id="ww-weekend-bar" style="height: 100%; width: 0%; background-color: #808080; transition: none;"></div>
          </div>
          <div id="ww-weekend-pct" style="font-size: 0.55rem; color: #555; text-align: right; margin-top: 1px;"></div>
        </div>
        <div style="border-top: 1px solid #c0c0c0; padding-top: 6px; flex: 1; overflow: hidden;">
          <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed;">
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Weekday avg/day</td>
              <td id="ww-weekday-avg" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Weekend avg/day</td>
              <td id="ww-weekend-avg" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
            <tr>
              <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Spend more on</td>
              <td id="ww-verdict" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
          </table>
        </div>
      `;
      break;
    case 'savings-xp':
      name = "Savings XP";
      icon = "bi-controller";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 4px; flex-shrink: 0;">
          <div id="xp-level-badge" style="display: inline-block; background-color: #c0c0c0; color: #000000; border: 1px solid #808080; font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 0.7rem; padding: 2px 8px; margin-bottom: 3px;">LEVEL 1</div>
          <div id="xp-level-title" style="font-size: 0.65rem; color: #555; margin-bottom: 4px; font-weight: bold;"></div>
        </div>
        <div style="margin-bottom: 3px; font-size: 0.6rem; display: flex; justify-content: space-between; flex-shrink: 0;">
          <span>XP Progress</span>
          <span id="xp-progress-label"></span>
        </div>
        <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #000000; padding: 1px; height: 16px; margin-bottom: 6px; flex-shrink: 0;">
          <div id="xp-bar" style="height: 100%; width: 0%; background-color: #cccccc; background-image: repeating-linear-gradient(90deg, #cccccc 0px, #cccccc 6px, #888888 6px, #888888 8px); transition: none;"></div>
        </div>
        <div id="xp-stats" style="font-size: 0.65rem; margin-bottom: 6px; flex: 1; overflow: hidden;"></div>
        <div id="xp-next-reward" style="background-color: #eeeeee; border: 1px solid #808080; padding: 4px; font-size: 0.6rem; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0;"></div>
      `;
      break;
    case 'horoscope':
      name = "Financial Horoscope";
      icon = "bi-stars";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 4px; flex-shrink: 0;">
          <div id="hs-sign-display" style="font-size: 1.1rem; margin-bottom: 1px;"></div>
          <div id="hs-sign-name" style="font-weight: bold; font-size: 0.7rem; margin-bottom: 0px; font-family: 'Courier New', Courier, monospace;"></div>
          <div id="hs-date-range" style="font-size: 0.55rem; color: #555; margin-bottom: 4px;"></div>
        </div>
        <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 4px 6px; margin-bottom: 6px; flex: 1; overflow-y: auto;">
          <div id="hs-prediction" style="font-size: 0.62rem; line-height: 1.3; font-style: italic; color: #333;"></div>
        </div>
        <table style="width: 100%; font-size: 0.6rem; border-collapse: collapse; table-layout: fixed; flex-shrink: 0;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Lucky Category</td>
            <td id="hs-lucky-cat" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Avoid Spending</td>
            <td id="hs-avoid-cat" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Financial Energy</td>
            <td id="hs-energy" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
        </table>
      `;
      break;
    case 'achievements':
      name = "Achievements";
      icon = "bi-trophy";
      bodyContent = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; flex-shrink: 0;">
          <div style="font-size: 0.65rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            <span id="ach-unlocked-count" style="font-weight: bold; font-size: 0.9rem;">0</span>/<span id="ach-total-count">0</span> unlocked
          </div>
          <div style="font-size: 0.55rem; color: #555; font-style: italic; max-width: 60%; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="ach-latest-label"></div>
        </div>
        <div id="ach-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 6px; flex: 1; overflow-y: auto; padding-right: 2px;">
          <!-- badges -->
        </div>
        <div id="ach-latest-detail" style="background-color: #eeeeee; border: 1px solid #808080; padding: 4px; font-size: 0.6rem; text-align: center; display: none; height: 1.8rem; overflow: hidden; line-height: 1.2; flex-shrink: 0;">
        </div>
      `;
      break;
    case 'spending-personality':
      name = "Spending Personality";
      icon = "bi-person-badge";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 6px; flex-shrink: 0;">
          <div id="sp-icon" style="font-size: 1.5rem; display: block; margin-bottom: 2px;"></div>
          <div id="sp-type" style="font-weight: bold; font-size: 0.8rem; margin-bottom: 1px; font-family: 'Courier New', Courier, monospace;"></div>
          <div id="sp-tagline" style="font-size: 0.65rem; color: #555; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
        </div>
        <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 6px; margin-bottom: 6px; flex: 1; overflow-y: auto;">
          <div id="sp-description" style="font-size: 0.65rem; line-height: 1.3; color: #333;"></div>
        </div>
        <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed; flex-shrink: 0;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Top Trait</td>
            <td id="sp-top-trait" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Style</td>
            <td id="sp-style" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
          <tr>
            <td style="padding: 2px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Weakness</td>
            <td id="sp-weakness" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
        </table>
      `;
      break;
    case 'peer-comparison':
      name = "Peer Comparison";
      icon = "bi-people";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; margin-bottom: 4px; text-align: center;" id="pc-peer-label">vs peers in your city & age group</div>
        <div style="flex: 1; overflow-y: auto; margin-bottom: 6px;">
          <table style="width: 100%; font-size: 0.6rem; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="background-color: #c0c0c0; position: sticky; top: 0; z-index: 1;">
                <td style="padding: 2px 4px; font-weight: bold; width: 35%; overflow: hidden; text-overflow: ellipsis;">Cat</td>
                <td style="padding: 2px 4px; font-weight: bold; text-align: right; width: 22%;">You</td>
                <td style="padding: 2px 4px; font-weight: bold; text-align: right; width: 25%;">Peers</td>
                <td style="padding: 2px 4px; font-weight: bold; text-align: right; width: 18%;">vs</td>
              </tr>
            </thead>
            <tbody id="pc-table-body"></tbody>
          </table>
        </div>
        <div id="pc-verdict" style="background-color: #eeeeee; border: 1px solid #808080; padding: 4px; font-size: 0.6rem; text-align: center; flex-shrink: 0; line-height: 1.2;"></div>
      `;
      break;
    case 'networth-snapshot':
      name = "Net Worth";
      icon = "bi-bank";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 6px; flex-shrink: 0;">
          <div style="font-size: 0.65rem; color: #555; margin-bottom: 1px;">Your Net Worth</div>
          <div id="nw-total" style="font-size: 1.2rem; font-weight: bold; font-family: 'Courier New', Courier, monospace; margin-bottom: 1px;">₹0</div>
          <div id="nw-status" style="font-size: 0.65rem; font-weight: bold;"></div>
        </div>
        <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 4px; margin-bottom: 6px; flex-shrink: 0;">
          <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed;">
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Assets</td>
              <td id="nw-assets" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Total Liab.</td>
              <td id="nw-liabilities" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
            <tr>
              <td style="padding: 1px 0; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Net Worth</td>
              <td id="nw-net" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
          </table>
        </div>
        <div style="font-size: 0.6rem; display: flex; justify-content: space-between; margin-bottom: 1px; flex-shrink: 0;">
          <span>Liabilities</span><span>Assets</span>
        </div>
        <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #eeeeee; height: 12px; display: flex; overflow: hidden; flex-shrink: 0;">
          <div id="nw-liability-bar" style="background-color: #808080; height: 100%; width: 50%; transition: none;"></div>
          <div id="nw-asset-bar" style="background-color: #404040; height: 100%; width: 50%; transition: none;"></div>
        </div>
        <div id="nw-tip" style="font-size: 0.6rem; color: #555; text-align: center; margin-top: 4px; font-style: italic; line-height: 1.2; flex: 1; overflow-y: auto;"></div>
        <button onclick="window.location.href='data.html'" style="width: 100%; background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.65rem; padding: 2px; cursor: pointer; font-family: inherit; margin-top: 6px; flex-shrink: 0;">Update Net Worth</button>
      `;
      break;
    case 'weather-spend':
      name = "Weather & Spend";
      icon = "bi-cloud-sun";
      bodyContent = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #c0c0c0; flex-shrink: 0;">
          <div>
            <div style="font-size: 0.65rem; color: #555; margin-bottom: 1px;">Today's Conditions</div>
            <div id="ws-weather-display" style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Detecting...</div>
            <div id="ws-city-label" style="font-size: 0.55rem; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
          </div>
          <div id="ws-weather-icon" style="font-size: 1.8rem; line-height: 1; flex-shrink: 0;">⏳</div>
        </div>
        <div style="margin-bottom: 6px; flex-shrink: 0;">
          <div style="font-size: 0.65rem; color: #555; margin-bottom: 3px;">Spending vs Weather Pattern</div>
          <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed;">
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Today so far</td>
              <td id="ws-today-spend" style="text-align: right; font-weight: bold;"></td>
            </tr>
            <tr style="border-bottom: 1px solid #eeeeee;">
              <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Your avg spend</td>
              <td id="ws-avg-spend" style="text-align: right; font-weight: bold;"></td>
            </tr>
            <tr>
              <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Pattern says</td>
              <td id="ws-pattern" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
            </tr>
          </table>
        </div>
        <div id="ws-insight" style="background-color: #eeeeee; border: 1px solid #808080; padding: 4px; font-size: 0.6rem; text-align: center; line-height: 1.3; font-style: italic; flex: 1; overflow-y: auto;"></div>
      `;
      break;
    case 'clippy-advisor':
      name = "Clippy Advisor";
      icon = "bi-chat-square-text";
      bodyContent = `
        <div style="display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px; flex: 1; min-height: 0;">
          <div id="clippy-figure" style="font-family: 'Courier New', monospace; font-size: 0.55rem; line-height: 1.1; flex-shrink: 0; white-space: pre; color: #000; border: 1px solid #808080; background: #eeeeee; padding: 2px; width: 45px; height: 60px; display: flex; align-items: center; justify-content: center;"></div>
          <div style="flex: 1; position: relative; min-width: 0;">
            <div style="border: 2px solid #404040; background: #ffffff; padding: 4px; font-size: 0.65rem; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;" id="clippy-speech"></div>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
          <span id="clippy-mood" style="font-size: 0.6rem; color: #555; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%;"></span>
          <button onclick="refreshClippy()" style="background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.6rem; padding: 1px 6px; cursor: pointer; font-family: inherit;">New Tip</button>
        </div>
      `;
      break;
    case 'spending-spiral':
      name = "Spending Spiral";
      icon = "bi-circle";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 3px; flex-shrink: 0;">
          <span style="font-size: 0.65rem; color: #000; font-weight: bold;" id="spiral-month-label"></span>
        </div>
        <div style="display: flex; justify-content: center; margin-bottom: 3px; flex-shrink: 0;">
          <canvas id="spiral-canvas" width="130" height="110" style="border: 1px solid #808080; background: #000000; display: block;"></canvas>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.6rem; color: #000; padding: 0 4px; flex-shrink: 0;">
          <span>Total: <strong id="spiral-total" style="color: #000;"></strong></span>
          <span>Peak: <strong id="spiral-peak" style="color: #000;"></strong></span>
        </div>
      `;
      break;
    case 'this-day-finance':
      name = "This Day in Finance";
      icon = "bi-calendar2-event";
      bodyContent = `
        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 3px; flex-shrink: 0;">
          <span id="tdf-date-badge" style="background-color: #c0c0c0; color: #000000; border: 1px solid #808080; font-family: 'Courier New', monospace; font-size: 0.65rem; font-weight: bold; padding: 1px 6px; white-space: nowrap; flex-shrink: 0;"></span>
          <span style="font-size: 0.6rem; color: #555;">in financial history</span>
        </div>
        <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 5px; margin-bottom: 4px; flex-shrink: 0;">
          <div id="tdf-year" style="font-size: 0.6rem; color: #555; margin-bottom: 1px;"></div>
          <div id="tdf-fact" style="font-size: 0.65rem; line-height: 1.3; font-weight: bold; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; color: #000;"></div>
        </div>
        <div id="tdf-context" style="font-size: 0.6rem; color: #333; line-height: 1.3; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
          <span id="tdf-category-badge" style="font-size: 0.6rem; background: #c0c0c0; border: 1px solid #808080; padding: 0px 5px; color: #000;"></span>
          <button onclick="nextTDFFact()" style="background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.6rem; padding: 1px 6px; cursor: pointer; font-family: inherit;">Next Fact</button>
        </div>
      `;
      break;
    case 'moon-phase':
      name = "Moon & Spending";
      icon = "bi-moon-stars";
      bodyContent = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-shrink: 0;">
          <canvas id="moon-canvas" width="44" height="44" style="border: 1px solid #808080; background: #000000; flex-shrink: 0; display: block;"></canvas>
          <div style="flex: 1; min-width: 0;">
            <div id="moon-phase-name" style="font-weight: bold; font-size: 0.72rem; margin-bottom: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
            <div id="moon-phase-desc" style="font-size: 0.6rem; color: #555; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"></div>
          </div>
        </div>
        <div style="border: 1px solid #c0c0c0; margin-bottom: 4px; flex-shrink: 0;"></div>
        <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed; flex-shrink: 0;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Today's spending</td>
            <td id="moon-today-spend" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Phase avg spend</td>
            <td id="moon-phase-avg" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">The moon says</td>
            <td id="moon-verdict" style="text-align: right; font-weight: bold;"></td>
          </tr>
        </table>
        <div id="moon-insight" style="font-size: 0.6rem; color: #555; font-style: italic; margin-top: 3px; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;"></div>
      `;
      break;
    case 'festival-calendar':
      name = "Festival Calendar";
      icon = "bi-gift";
      bodyContent = `
        <div id="fest-next-banner" style="background-color: #c0c0c0; color: #000000; padding: 3px 6px; margin: -5px -6px 4px -6px; font-size: 0.65rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-bottom: 1px solid #808080; flex-shrink: 0;"></div>
        <div id="fest-countdown" style="text-align: center; font-family: 'Courier New', monospace; font-size: 1rem; font-weight: bold; margin-bottom: 2px; flex-shrink: 0;"></div>
        <div id="fest-warning" style="font-size: 0.6rem; color: #606060; text-align: center; margin-bottom: 4px; font-style: italic; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 1.5rem; flex-shrink: 0;"></div>
        <div style="border-top: 1px solid #c0c0c0; padding-top: 3px; flex: 1; overflow-y: auto;">
          <div style="font-size: 0.55rem; color: #555; margin-bottom: 2px; font-weight: bold;">Coming up next:</div>
          <div id="fest-upcoming-list"></div>
        </div>
      `;
      break;
    case 'alter-ego':
      name = "Alter Ego";
      icon = "bi-person-fill";
      bodyContent = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px; flex-shrink: 0;">
          <div style="border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; background: #eeeeee; padding: 4px; text-align: center; overflow: hidden;">
            <div style="font-size: 0.6rem; font-weight: bold; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">✅ Responsible</div>
            <div id="ae-responsible-score" style="font-size: 1rem; font-weight: bold; font-family: 'Courier New', monospace; color: #000;"></div>
            <div id="ae-responsible-label" style="font-size: 0.55rem; color: #555; margin-top: 1px;"></div>
          </div>
          <div style="border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; background: #eeeeee; padding: 4px; text-align: center; overflow: hidden;">
            <div style="font-size: 0.6rem; font-weight: bold; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">😈 Impulsive</div>
            <div id="ae-impulsive-score" style="font-size: 1rem; font-weight: bold; font-family: 'Courier New', monospace; color: #000;"></div>
            <div id="ae-impulsive-label" style="font-size: 0.55rem; color: #555; margin-top: 1px;"></div>
          </div>
        </div>
        <div style="margin-bottom: 4px; flex-shrink: 0;">
          <div style="display: flex; height: 10px; border: 1px solid #000000; overflow: hidden; background-color: #ffffff;">
            <div id="ae-responsible-bar" style="background-color: #404040; height: 100%; width: 50%; transition: none;"></div>
            <div id="ae-impulsive-bar" style="background-color: #808080; height: 100%; width: 50%; transition: none;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.55rem; color: #555; margin-top: 1px;">
            <span>Responsible</span><span>Impulsive</span>
          </div>
        </div>
        <div id="ae-verdict" style="font-size: 0.62rem; text-align: center; font-weight: bold; margin-bottom: 3px; color: #000; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></div>
        <div id="ae-today-action" style="font-size: 0.6rem; color: #555; text-align: center; font-style: italic; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;"></div>
      `;
      break;
    case 'doppelganger':
      name = "Doppelganger";
      icon = "bi-arrow-left-right";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; text-align: center; margin-bottom: 3px; flex-shrink: 0;">What if you invested every impulse buy?</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-bottom: 4px; flex-shrink: 0;">
          <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 4px; text-align: center;">
            <div style="font-size: 0.6rem; color: #555; margin-bottom: 1px;">😅 Real You</div>
            <div id="dg-real-spent" style="font-size: 0.8rem; font-weight: bold; font-family: 'Courier New', monospace; color: #606060;"></div>
            <div style="font-size: 0.55rem; color: #555;">spent impulsively</div>
          </div>
          <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 4px; text-align: center;">
            <div style="font-size: 0.6rem; color: #555; margin-bottom: 1px;">🧠 Investor You</div>
            <div id="dg-invested-value" style="font-size: 0.8rem; font-weight: bold; font-family: 'Courier New', monospace; color: #404040;"></div>
            <div style="font-size: 0.55rem; color: #555;">if invested @ 12%</div>
          </div>
        </div>
        <table style="width: 100%; font-size: 0.62rem; border-collapse: collapse; margin-bottom: 3px; table-layout: fixed; flex-shrink: 0;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Impulse categories</td>
            <td id="dg-impulse-cats" style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">In 5 years worth</td>
            <td id="dg-5yr-value" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">In 10 years worth</td>
            <td id="dg-10yr-value" style="text-align: right; font-weight: bold;"></td>
          </tr>
        </table>
        <div id="dg-punchline" style="font-size: 0.6rem; color: #606060; font-style: italic; text-align: center; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;"></div>
      `;
      break;
    case 'tamagotchi':
      name = "Rupee  Your Pet";
      icon = "bi-heart-pulse";
      bodyContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; flex-shrink: 0;">
          <div>
            <div style="font-size: 0.6rem; color: #555;">Mood</div>
            <div id="tama-mood" style="font-size: 0.72rem; font-weight: bold;"></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.6rem; color: #555;">Health</div>
            <div id="tama-health" style="font-size: 0.72rem; font-weight: bold; font-family: 'Courier New', monospace;"></div>
          </div>
        </div>
        <div style="background: #c0c0c0; border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; padding: 4px; text-align: center; margin-bottom: 4px; font-family: 'Courier New', monospace; flex-shrink: 0; overflow: hidden;">
          <div id="tama-pet" style="font-size: 0.6rem; line-height: 1.2; color: #000000; white-space: pre; display: inline-block;"></div>
          <div id="tama-speech" style="font-size: 0.55rem; color: #000000; margin-top: 2px; font-style: italic; min-height: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
        </div>
        <div style="margin-bottom: 3px; flex-shrink: 0;">
          <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; background: #ffffff; padding: 1px; height: 10px;">
            <div id="tama-health-bar" style="height: 100%; width: 100%; background-color: #000000; transition: none;"></div>
          </div>
        </div>
        <table style="width: 100%; font-size: 0.62rem; border-collapse: collapse; table-layout: fixed; flex: 1;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Months healthy</td>
            <td id="tama-months-healthy" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Status</td>
            <td id="tama-status" style="text-align: right; font-weight: bold;"></td>
          </tr>
        </table>
      `;
      break;
    case 'combo-streak':
      name = "Combo Streak";
      icon = "bi-lightning-charge";
      bodyContent = `
        <!-- Main combo display -->
        <div style="background: #c0c0c0; border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; padding: 6px; text-align: center; margin-bottom: 4px; flex-shrink: 0;">
          <div id="combo-label" style="font-size: 0.6rem; color: #000000; font-family: 'Courier New', monospace; margin-bottom: 2px; letter-spacing: 2px;"></div>
          <div style="display: flex; align-items: baseline; justify-content: center; gap: 3px;">
            <div id="combo-number" style="font-size: 2rem; font-weight: bold; color: #000000; font-family: 'Courier New', monospace; line-height: 1;"></div>
            <div style="font-size: 0.65rem; color: #000000; font-family: 'Courier New', monospace;">DAY</div>
          </div>
          <div id="combo-sublabel" style="font-size: 0.6rem; color: #333333; font-family: 'Courier New', monospace; margin-top: 2px;"></div>
        </div>
        <!-- Stats row -->
        <table style="width: 100%; font-size: 0.62rem; border-collapse: collapse; margin-bottom: 3px; flex-shrink: 0;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555;">Best streak</td>
            <td id="combo-best" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555;">Today's spend</td>
            <td id="combo-today" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555;">Daily avg</td>
            <td id="combo-avg" style="text-align: right; font-weight: bold;"></td>
          </tr>
        </table>
        <!-- Streak dots  last 7 days -->
        <div style="font-size: 0.6rem; color: #555; margin-bottom: 2px; flex-shrink: 0;">
          Last 7 days
        </div>
        <div id="combo-dots" style="display: flex; gap: 3px; align-items: center; flex: 1; overflow: hidden;"></div>
      `;
      break;
    case 'screensaver':
      name = "Screensaver";
      icon = "bi-display";
      bodyContent = `
        <div id="ss-viewport" style="background: #c0c0c0; border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; position: relative; overflow: hidden; height: 110px; margin-bottom: 4px; cursor: pointer;" title="Click to change color" onclick="ssChangeColor()">
          <div id="ss-logo" style="position: absolute; font-family: 'Courier New', monospace; font-weight: bold; font-size: 0.8rem; white-space: nowrap; user-select: none; line-height: 1; color: #000000;">MONEVER</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.6rem; color: #555;" id="ss-bounce-count">Bounces: 0</span>
          <span style="font-size: 0.6rem; color: #555;" id="ss-corner-msg"></span>
          <button onclick="ssTogglePause()" id="ss-pause-btn" style="background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.6rem; padding: 1px 6px; cursor: pointer; font-family: inherit;">Pause</button>
        </div>
      `;
      break;
    case 'money-tree':
      name = "Money Tree";
      icon = "bi-tree";
      bodyContent = `
        <div style="text-align: center; margin-bottom: 2px;">
          <span id="mt-stage-label" style="font-size: 0.6rem; color: #555; font-family: 'Courier New', monospace;"></span>
        </div>
        <canvas id="mt-canvas" width="150" height="100" style="display: block; margin: 0 auto 4px; background: #c0c0c0; border: 1px solid #808080;"></canvas>
        <table style="width: 100%; font-size: 0.62rem; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555;">Net Worth</td>
            <td id="mt-networth" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555;">Tree Stage</td>
            <td id="mt-stage-num" style="text-align: right; font-weight: bold;"></td>
          </tr>
        </table>
      `;
      break;
    case 'savings-garden':
      name = "Savings Garden";
      icon = "bi-flower1";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; margin-bottom: 2px; text-align: center;" id="sg-status-label"></div>
        <canvas id="sg-canvas" width="150" height="90" style="display: block; margin: 0 auto 4px; background: #c0c0c0; border: 1px solid #808080;"></canvas>
        <div style="font-size: 0.6rem; color: #555; text-align: center;" id="sg-goal-count"></div>
      `;
      break;
    case 'coral-reef':
      name = "Coral Reef";
      icon = "bi-water";
      bodyContent = `
        <canvas id="cr-canvas" width="150" height="100" style="display: block; margin: 0 auto 3px; background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span style="color: #555;">Reef Health</span>
          <span id="cr-health-label" style="font-weight: bold;"></span>
        </div>
        <div style="border: 1px solid #808080; background: #000; height: 8px; margin-top: 2px;">
          <div id="cr-health-bar" style="height: 100%; width: 0%; background: #aaaaaa; transition: none;"></div>
        </div>
      `;
      break;
    case 'city-skyline':
      name = "City Skyline";
      icon = "bi-buildings";
      bodyContent = `
        <canvas id="cs-canvas" width="150" height="100" style="display: block; margin: 0 auto 3px; background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="cs-city-name" style="font-weight: bold;"></span>
          <span id="cs-pop-label" style="color: #555;"></span>
        </div>
      `;
      break;
    case 'space-colony':
      name = "Space Colony";
      icon = "bi-globe";
      bodyContent = `
        <canvas id="sc-canvas" width="150" height="100" style="display: block; margin: 0 auto 3px; background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="sc-stage-label" style="font-weight: bold;"></span>
          <span id="sc-nw-label" style="color: #555;"></span>
        </div>
      `;
      break;
    case 'grandfather-clock':
      name = "Grandfather Clock";
      icon = "bi-clock";
      bodyContent = `
        <canvas id="gc-canvas" width="150" height="110" style="display: block; margin: 0 auto 2px; background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="gc-time-label" style="font-family: 'Courier New', monospace;"></span>
          <span id="gc-budget-label" style="color: #555;"></span>
        </div>
      `;
      break;
    case 'hourglass':
      name = "Hourglass";
      icon = "bi-hourglass-split";
      bodyContent = `
        <canvas id="hg-canvas" width="150" height="100" style="display: block; margin: 0 auto 3px; background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="hg-days-label" style="color: #555;"></span>
          <span id="hg-budget-label" style="font-weight: bold;"></span>
        </div>
      `;
      break;
    case 'time-capsule':
      name = "Time Capsule";
      icon = "bi-envelope-paper";
      bodyContent = `
        <div id="tc-write-section">
          <div style="font-size: 0.62rem; color: #555; margin-bottom: 3px; line-height: 1.3;">Write a message to your future self. Opens in 1 year.</div>
          <textarea id="tc-message-input" style="width: 100%; height: 50px; font-size: 0.62rem; font-family: 'Courier New', monospace; background: #ffffff; border: 2px solid; border-color: #808080 #ffffff #ffffff #808080; resize: none; padding: 3px; box-sizing: border-box; margin-bottom: 3px;" placeholder="Dear future me..."></textarea>
          <button onclick="sealTimeCapsule()" style="width: 100%; background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.62rem; padding: 2px; cursor: pointer; font-family: inherit;">🔒 Seal Capsule</button>
        </div>
        <div id="tc-sealed-section" style="display: none;">
          <div style="text-align: center; margin-bottom: 4px;">
            <div style="font-size: 0.6rem; color: #555; margin-bottom: 2px;">SEALED ON <span id="tc-sealed-date"></span></div>
            <div style="border: 2px solid #808080; background: #000000; padding: 8px; margin-bottom: 4px;">
              <div style="font-size: 1.5rem; line-height: 1;">📦</div>
              <div style="font-size: 0.6rem; color: #808080; font-family: 'Courier New', monospace; margin-top: 3px;">TOP SECRET</div>
            </div>
            <div style="font-size: 0.62rem; font-weight: bold;" id="tc-countdown"></div>
            <div style="font-size: 0.6rem; color: #555; margin-top: 1px;" id="tc-opens-label"></div>
          </div>
          <div id="tc-open-section" style="display: none;">
            <div style="font-size: 0.6rem; color: #555; margin-bottom: 2px;">Your message from the past:</div>
            <div id="tc-message-display" style="border: 1px solid #808080; background: #eeeeee; padding: 4px; font-size: 0.62rem; font-family: 'Courier New', monospace; line-height: 1.3; max-height: 40px; overflow-y: auto;"></div>
          </div>
          <button onclick="resetTimeCapsule()" style="width: 100%; background-color: #c0c0c0; border: 2px solid; border-color: #ffffff #808080 #808080 #ffffff; font-size: 0.62rem; padding: 2px; cursor: pointer; font-family: inherit; margin-top: 3px;" id="tc-reset-btn"></button>
        </div>
      `;
      break;
    case 'pixel-portrait':
      name = "Pixel Portrait";
      icon = "bi-person-square";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; text-align: center;
          margin-bottom: 2px;">Your financial identity</div>
        <canvas id="pp-canvas" width="80" height="80"
          style="display: block; margin: 0 auto 4px; image-rendering: pixelated;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="font-size: 0.62rem; text-align: center; margin-bottom: 2px;">
          <span id="pp-name" style="font-weight: bold; font-family: 'Courier New', monospace;"></span>
        </div>
        <table style="width: 100%; font-size: 0.6rem; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eeeeee;">
            <td style="padding: 1px 0; color: #555;">Personality</td>
            <td id="pp-personality" style="text-align: right; font-weight: bold;"></td>
          </tr>
          <tr>
            <td style="padding: 1px 0; color: #555;">Seed</td>
            <td id="pp-seed" style="text-align: right; color: #808080;
              font-family: 'Courier New', monospace;"></td>
          </tr>
        </table>
      `;
      break;
    case 'vinyl-record':
      name = "Monever FM";
      icon = "bi-disc";
      bodyContent = `
        <canvas id="vr-canvas" width="90" height="90"
          style="display: block; margin: 0 auto 3px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="font-size: 0.6rem; text-align: center; margin-bottom: 2px;">
          <span id="vr-track-label"
            style="font-family: 'Courier New', monospace; font-weight: bold;"></span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.6rem;">
          <span style="color: #555;">RPM</span>
          <span id="vr-rpm-label" style="font-weight: bold; font-family: 'Courier New', monospace;"></span>
        </div>
      `;
      break;
    case 'kaleidoscope':
      name = "Kaleidoscope";
      icon = "bi-symmetry-vertical";
      bodyContent = `
        <canvas id="kl-canvas" width="110" height="110"
          style="display: block; margin: 0 auto 3px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="font-size: 0.6rem; color: #555; text-align: center;"
          id="kl-desc-label"></div>
      `;
      break;
    case 'lava-lamp':
      name = "Lava Lamp";
      icon = "bi-droplet";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; text-align: center; margin-bottom: 2px;">Spending Temperature</div>
        <canvas id="ll-canvas" width="60" height="110" style="display: block; margin: 0 auto; background: #000; border: 1px solid #808080; border-radius: 20px 20px 5px 5px;"></canvas>
        <div id="ll-temp-label" style="font-size: 0.62rem; text-align: center; font-weight: bold; margin-top: 2px;"></div>
      `;
      break;
    case 'lucky-cat':
      name = "Lucky Cat";
      icon = "bi-hand-index";
      bodyContent = `
        <canvas id="lc-canvas" width="80" height="95"
          style="display: block; margin: 0 auto 2px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="lc-mood-label" style="font-weight: bold;"></span>
          <span id="lc-wave-speed" style="color: #555;"></span>
        </div>
      `;
      break;
    case 'piggy-bank':
      name = "Piggy Bank";
      icon = "bi-piggy-bank";
      bodyContent = `
        <canvas id="pb-canvas" width="120" height="90"
          style="display: block; margin: 0 auto 3px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="pb-fill-label" style="color: #555;"></span>
          <span id="pb-amount-label" style="font-weight: bold;"></span>
        </div>
        <div style="border: 1px solid #808080; background: #000; height: 6px; margin-top: 2px;">
          <div id="pb-fill-bar" style="height: 100%; width: 0%; background: #aaaaaa;"></div>
        </div>
      `;
      break;
    case 'wall-of-fame':
      name = "Wall of Fame";
      icon = "bi-award";
      bodyContent = `
        <canvas id="wf-canvas" width="150" height="90"
          style="display: block; margin: 0 auto 3px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="font-size: 0.6rem; color: #555; text-align: center;"
          id="wf-count-label"></div>
      `;
      break;
    case 'black-hole':
      name = "Black Hole";
      icon = "bi-circle";
      bodyContent = `
        <canvas id="bh-canvas" width="120" height="100"
          style="display: block; margin: 0 auto 3px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="bh-size-label" style="color: #555;"></span>
          <span id="bh-debt-label" style="font-weight: bold;"></span>
        </div>
      `;
      break;
    case 'pinball':
      name = "Budget Pinball";
      icon = "bi-controller";
      bodyContent = `
        <canvas id="pn-canvas" width="90" height="95"
          style="display: block; margin: 0 auto 2px;
          background: #000000; border: 1px solid #808080; cursor: pointer;"
          onclick="pinballLaunch()"
          title="Click to launch a ball"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.6rem;">
          <span style="color: #555;">Score</span>
          <span id="pn-score-label"
            style="font-weight: bold; font-family: 'Courier New', monospace;"></span>
        </div>
        <div style="font-size: 0.6rem; color: #555; text-align: center;"
          id="pn-balls-label"></div>
      `;
      break;
    case 'fortune-cookie':
      name = "Fortune Cookie";
      icon = "bi-chat-quote";
      bodyContent = `
        <div id="fc-closed-state" style="text-align: center;">
          <canvas id="fc-canvas" width="80" height="65"
            style="display: block; margin: 0 auto 4px;
            background: #000000; border: 1px solid #808080;
            cursor: pointer;"
            onclick="crackFortuneCookie()"
            title="Click to crack open"></canvas>
          <div style="font-size: 0.65rem; color: #555; margin-bottom: 4px;">
            Click to crack open
          </div>
          <div style="font-size: 0.6rem; color: #555; font-family: 'Courier New', monospace;"
            id="fc-date-label"></div>
        </div>
        <div id="fc-open-state" style="display: none;">
          <div style="border: 2px solid; border-color: #808080 #ffffff #ffffff #808080;
            background: #ffffff; padding: 5px; margin-bottom: 4px;">
            <div style="font-size: 0.62rem; line-height: 1.4; font-style: italic;
              color: #000; text-align: center;"
              id="fc-fortune-text"></div>
          </div>
          <div style="font-size: 0.6rem; color: #555; text-align: center;
            margin-bottom: 3px;" id="fc-lucky-numbers"></div>
          <button onclick="resetFortuneCookie()"
            style="width: 100%; background-color: #c0c0c0; border: 2px solid;
            border-color: #ffffff #808080 #808080 #ffffff;
            font-size: 0.6rem; padding: 2px; cursor: pointer;
            font-family: inherit;">🥠 New Cookie Tomorrow</button>
        </div>
      `;
      break;
    case 'financial-butterfly':
      name = "Financial Butterfly";
      icon = "bi-bug";
      bodyContent = `
        <div style="font-size: 0.6rem; color: #555; text-align: center;
          margin-bottom: 2px;" id="fb-stage-label"></div>
        <canvas id="fb-canvas" width="130" height="85"
          style="display: block; margin: 0 auto 3px;
          background: #000000; border: 1px solid #808080;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 0.62rem;">
          <span id="fb-progress-label" style="color: #555;"></span>
          <span id="fb-next-label" style="color: #808080;"></span>
        </div>
        <div style="border: 1px solid #808080; background: #000; height: 6px; margin-top: 2px;">
          <div id="fb-stage-bar" style="height: 100%; width: 0%; background: #aaaaaa;"></div>
        </div>
      `;
      break;
    // ── NEW FINANCIAL WIDGETS ──────────────────────────────────────────────
    case 'burn-rate-clock':
      name = "Burn Rate";
      icon = "bi-speedometer2";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">Budget consumption speed</div>
        <canvas id="brc-canvas" width="110" height="80"
          style="display:block;margin:0 auto 3px;background:#000;border:1px solid #808080;"></canvas>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;margin-bottom:1px;">
          <span style="color:#555;">Per Hour</span>
          <span id="brc-hour" style="font-weight:bold;font-family:'Courier New',monospace;"></span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;">
          <span style="color:#555;">Per Day</span>
          <span id="brc-day" style="font-weight:bold;font-family:'Courier New',monospace;"></span>
        </div>
      `;
      break;
    case 'payday-countdown':
      name = "Pay Day";
      icon = "bi-calendar-check";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">Next salary in</div>
        <div id="pdc-days" style="font-size:2rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;line-height:1.1;"></div>
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:4px;">days</div>
        <div style="border:1px solid #808080;background:#000;height:6px;margin-bottom:4px;">
          <div id="pdc-bar" style="height:100%;width:0%;background:#aaaaaa;"></div>
        </div>
        <table style="width:100%;font-size:0.6rem;border-collapse:collapse;">
          <tr><td style="color:#555;">Budget left</td><td id="pdc-budget-left" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">Per day left</td><td id="pdc-per-day" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'subscription-drain':
      name = "Sub Drain";
      icon = "bi-droplet";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:2px;">Monthly locked spend</div>
        <div id="sd-list" style="flex:1;overflow:hidden;"></div>
        <div style="border-top:1px solid #c0c0c0;margin-top:3px;padding-top:2px;display:flex;justify-content:space-between;font-size:0.62rem;">
          <span style="color:#555;">Total locked</span>
          <span id="sd-total" style="font-weight:bold;"></span>
        </div>
        <div style="border:1px solid #808080;background:#000;height:6px;margin-top:2px;">
          <div id="sd-bar" style="height:100%;width:0%;background:#aaaaaa;"></div>
        </div>
      `;
      break;
    case 'impulse-tax-jar':
      name = "Impulse Jar";
      icon = "bi-archive";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">10% tax on impulse buys</div>
        <canvas id="itj-canvas" width="80" height="80"
          style="display:block;margin:0 auto 3px;background:#000;border:1px solid #808080;"></canvas>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;margin-bottom:1px;">
          <span style="color:#555;">Impulse spent</span>
          <span id="itj-spent" style="font-weight:bold;"></span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;">
          <span style="color:#555;">Jar saved</span>
          <span id="itj-jar" style="font-weight:bold;"></span>
        </div>
      `;
      break;
    case 'zero-day-tracker':
      name = "Zero Days";
      icon = "bi-check2-circle";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:2px;">No-spend days this month</div>
        <div id="zdt-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;"></div>
        <div style="display:flex;justify-content:space-between;font-size:0.62rem;margin-bottom:1px;">
          <span style="color:#555;">Zero days</span>
          <span id="zdt-count" style="font-weight:bold;font-family:'Courier New',monospace;"></span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;">
          <span style="color:#555;">Best streak</span>
          <span id="zdt-streak" style="font-weight:bold;"></span>
        </div>
      `;
      break;
    case 'cashflow-tide':
      name = "Cash Tide";
      icon = "bi-water";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">Income vs Expenses wave</div>
        <canvas id="cft-canvas" width="130" height="80"
          style="display:block;margin:0 auto 3px;background:#000;border:1px solid #808080;"></canvas>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;margin-bottom:1px;">
          <span style="color:#555;">Income</span>
          <span id="cft-income" style="font-weight:bold;"></span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;">
          <span id="cft-label" style="color:#555;">Expenses</span>
          <span id="cft-spent" style="font-weight:bold;"></span>
        </div>
      `;
      break;
    // ── NEW ANALYTICAL WIDGETS ─────────────────────────────────────────────
    case 'category-drift':
      name = "Cat. Drift";
      icon = "bi-arrow-left-right";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:2px;">Top category shift this month</div>
        <div id="cdr-content" style="flex:1;overflow:hidden;"></div>
      `;
      break;
    case 'spending-clock':
      name = "Spend Clock";
      icon = "bi-clock-history";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">Spending by time of day</div>
        <canvas id="sck-canvas" width="110" height="110"
          style="display:block;margin:0 auto 2px;background:#000;border:1px solid #808080;"></canvas>
        <div style="font-size:0.6rem;color:#555;text-align:center;" id="sck-peak-label"></div>
      `;
      break;
    case 'merchant-loyalty':
      name = "Loyalty Map";
      icon = "bi-shop";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:2px;">Your top 3 spending habits</div>
        <div id="ml-content" style="flex:1;overflow:hidden;"></div>
        <div style="font-size:0.6rem;color:#555;margin-top:2px;" id="ml-footer"></div>
      `;
      break;
    case 'fifty-thirty-twenty':
      name = "50-30-20";
      icon = "bi-pie-chart";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">Ideal budget split</div>
        <canvas id="ftw-canvas" width="110" height="75"
          style="display:block;margin:0 auto 3px;background:#000;border:1px solid #808080;"></canvas>
        <table style="width:100%;font-size:0.58rem;border-collapse:collapse;">
          <tr><td style="color:#555;">Needs (50%)</td><td id="ftw-needs" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">Wants (30%)</td><td id="ftw-wants" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">Savings (20%)</td><td id="ftw-savings" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'expense-volatility':
      name = "Volatility";
      icon = "bi-activity";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:2px;">Day-to-day spending stability</div>
        <canvas id="ev-canvas" width="130" height="70"
          style="display:block;margin:0 auto 3px;background:#000;border:1px solid #808080;"></canvas>
        <div style="display:flex;justify-content:space-between;font-size:0.62rem;margin-bottom:1px;">
          <span style="color:#555;">Stability</span>
          <span id="ev-score" style="font-weight:bold;font-family:'Courier New',monospace;"></span>
        </div>
        <div style="font-size:0.6rem;color:#555;text-align:center;" id="ev-verdict"></div>
      `;
      break;
    case 'night-owl':
      name = "Night Owl";
      icon = "bi-moon";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:2px;">When do you spend most?</div>
        <canvas id="now-canvas" width="130" height="70"
          style="display:block;margin:0 auto 3px;background:#000;border:1px solid #808080;"></canvas>
        <div style="display:flex;justify-content:space-between;font-size:0.6rem;margin-bottom:1px;">
          <span style="color:#555;">Peak window</span>
          <span id="now-peak" style="font-weight:bold;"></span>
        </div>
        <div style="font-size:0.6rem;color:#555;text-align:center;" id="now-verdict"></div>
      `;
      break;
    // ── DATA-HEAVY FINANCIAL WIDGETS ──────────────────────────────────────
    case 'savings-rate':
      name = "Savings Rate";
      icon = "bi-percent";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:4px;">Portion of income saved</div>
        <div id="sr-value" style="font-size:1.8rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;line-height:1;"></div>
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:6px;" id="sr-label"></div>
        <table style="width:100%;font-size:0.58rem;border-collapse:collapse;">
          <tr><td style="color:#555;">Target</td><td style="text-align:right;font-weight:bold;">20.0%</td></tr>
          <tr><td style="color:#555;">Last Month</td><td id="sr-last" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'fire-number':
      name = "FIRE Number";
      icon = "bi-fire";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:2px;">Financial Independence Goal</div>
        <div id="fire-num" style="font-size:1.1rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;margin-bottom:4px;"></div>
        <div style="border:1px solid #808080;background:#000;height:8px;margin-bottom:4px;">
          <div id="fire-bar" style="height:100%;width:0%;background:#aaaaaa;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.58rem;">
          <span style="color:#555;">Progress</span>
          <span id="fire-pct" style="font-weight:bold;"></span>
        </div>
        <div style="font-size:0.55rem;color:#808080;text-align:center;margin-top:2px;">(25x Annual Expenses)</div>
      `;
      break;
    case 'tax-estimator':
      name = "Tax Estimator";
      icon = "bi-receipt";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:3px;">Monthly Tax Est. (New Regime)</div>
        <div id="te-tax" style="font-size:1.3rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;margin-bottom:4px;"></div>
        <table style="width:100%;font-size:0.58rem;border-collapse:collapse;">
          <tr><td style="color:#555;">Eff. Rate</td><td id="te-rate" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">Take Home</td><td id="te-net" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'debt-payoff':
      name = "Debt Payoff";
      icon = "bi-bank2";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:3px;">Time to clear all debts</div>
        <div id="dp-months" style="font-size:1.6rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;line-height:1;"></div>
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:5px;">months</div>
        <table style="width:100%;font-size:0.58rem;border-collapse:collapse;">
          <tr><td style="color:#555;">Total Debt</td><td id="dp-total" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">Avg. Payoff</td><td id="dp-avg" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'monthly-pnl':
      name = "Monthly P&L";
      icon = "bi-file-earmark-ruled";
      bodyContent = `
        <div style="font-size:0.58rem;color:#555;margin-bottom:2px;">Cash flow statement</div>
        <table style="width:100%;font-size:0.6rem;border-collapse:collapse;line-height:1.2;">
          <tr style="border-bottom:1px solid #c0c0c0;"><td style="color:#555;">Income</td><td id="pnl-income" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">Expenses</td><td id="pnl-spent" style="text-align:right;"></td></tr>
          <tr style="border-bottom:1px solid #c0c0c0;"><td style="color:#555;">EMI/Fixed</td><td id="pnl-fixed" style="text-align:right;"></td></tr>
          <tr style="background:#eee;"><td style="color:#000;font-weight:bold;">Net</td><td id="pnl-net" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'emi-burden':
      name = "EMI Burden";
      icon = "bi-shield-exclamation";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:3px;">Debt-to-Income Ratio</div>
        <div id="eb-pct" style="font-size:1.5rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;"></div>
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:4px;" id="eb-verdict"></div>
        <div style="border:1px solid #808080;background:#000;height:6px;">
          <div id="eb-bar" style="height:100%;width:0%;background:#aaaaaa;"></div>
        </div>
      `;
      break;
    // ── DATA-HEAVY ANALYTICAL WIDGETS ─────────────────────────────────────
    case 'breakeven-day':
      name = "Break-Even";
      icon = "bi-calendar-x";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:3px;">When you'll hit ₹0</div>
        <div id="be-day" style="font-size:1.8rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;line-height:1;"></div>
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:5px;" id="be-month"></div>
        <table style="width:100%;font-size:0.58rem;border-collapse:collapse;">
          <tr><td style="color:#555;">Daily Burn</td><td id="be-burn" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'rule-of-72':
      name = "Rule of 72";
      icon = "bi-hourglass-top";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:3px;">Years to double money</div>
        <div id="r72-years" style="font-size:1.6rem;font-weight:bold;font-family:'Courier New',monospace;text-align:center;line-height:1;"></div>
        <div style="font-size:0.6rem;color:#555;text-align:center;margin-bottom:5px;">years</div>
        <table style="width:100%;font-size:0.58rem;border-collapse:collapse;">
          <tr><td style="color:#555;">At Rate</td><td id="r72-rate" style="text-align:right;font-weight:bold;">12%</td></tr>
          <tr><td style="color:#555;">Double To</td><td id="r72-target" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
      `;
      break;
    case 'expense-ratio':
      name = "Exp. Ratio";
      icon = "bi-list-ol";
      bodyContent = `
        <div style="font-size:0.58rem;color:#555;margin-bottom:2px;">Top 4 % of Income</div>
        <div id="er-list" style="flex:1;"></div>
      `;
      break;
    case 'inflation-eroder':
      name = "Eroder";
      icon = "bi-ghost";
      bodyContent = `
        <div style="font-size:0.6rem;color:#555;margin-bottom:3px;">Future value of ₹1,000</div>
        <table style="width:100%;font-size:0.6rem;border-collapse:collapse;line-height:1.3;">
          <tr><td style="color:#555;">In 5 Years</td><td id="ie-5" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">In 10 Years</td><td id="ie-10" style="text-align:right;font-weight:bold;"></td></tr>
          <tr><td style="color:#555;">In 20 Years</td><td id="ie-20" style="text-align:right;font-weight:bold;"></td></tr>
        </table>
        <div style="font-size:0.55rem;color:#808080;text-align:center;margin-top:3px;">@ 6% Inflation</div>
      `;
      break;
  }

  return `
  <div class="widget-window" style="${shellStyle}">
    <div style="${titleStyle}">
      <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 4px;">
        <i class="bi ${icon}" style="margin-right: 4px; flex-shrink: 0;"></i>${name}
      </span>
      <span class="widget-close-btn" onclick="removeWidget('${slotId}')" style="background-color: #c0c0c0; color: #000; border: 1px solid; border-color: #ffffff #808080 #808080 #ffffff; width: 16px; height: 14px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px; font-weight: 900; font-family: 'Courier New', monospace; line-height: 1; flex-shrink: 0;">✕</span>
    </div>
    <div id="widget-body-${widgetId}" style="${bodyStyle}">
      ${bodyContent}
    </div>
  </div>`;
}

function removeWidget(slotId) {
  removeWidgetSync(slotId);
  delete widgetSlotAssignments[slotId];
  saveWidgetAssignments();
}

function removeWidgetSync(slotId) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  // Cleanup screensaver interval if it exists
  if (typeof ssState !== 'undefined' && ssState.intervalId) {
    clearInterval(ssState.intervalId);
    ssState.intervalId = null;
  }
  if (typeof gcState !== 'undefined' && gcState.intervalId) {
    clearInterval(gcState.intervalId);
    gcState.intervalId = null;
  }
  if (typeof vrState !== 'undefined' && vrState.intervalId) {
    clearInterval(vrState.intervalId);
    vrState.intervalId = null;
  }
  if (typeof klState !== 'undefined' && klState.intervalId) {
    clearInterval(klState.intervalId);
    klState.intervalId = null;
  }
  if (typeof llState !== 'undefined' && llState.intervalId) {
    clearInterval(llState.intervalId);
    llState.intervalId = null;
  }
  if (typeof lcState !== 'undefined' && lcState.intervalId) {
    clearInterval(lcState.intervalId);
    lcState.intervalId = null;
  }
  if (typeof bhState !== 'undefined' && bhState.intervalId) {
    clearInterval(bhState.intervalId);
    bhState.intervalId = null;
  }
  if (typeof pnState !== 'undefined' && pnState.intervalId) {
    clearInterval(pnState.intervalId);
    pnState.intervalId = null;
  }
  if (typeof fbState !== 'undefined' && fbState.intervalId) {
    clearInterval(fbState.intervalId);
    fbState.intervalId = null;
  }
  if (typeof cftState !== 'undefined' && cftState.intervalId) {
    clearInterval(cftState.intervalId);
    cftState.intervalId = null;
  }

  slot.innerHTML = `
    <div class="widget-add-btn" onclick="openWidgetPicker('${slotId}')" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; cursor: pointer; padding: 1rem;">
      <span style="font-size: 1.75rem; color: #808080; display: block; margin-bottom: 6px;">
        <i class="bi bi-plus-lg"></i>
      </span>
      <span style="font-size: 0.75rem; color: #808080; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
        Add Widget
      </span>
    </div>
  `;

  // Restore placeholder styles
  slot.className = "widget-slot";
  slot.style.border = "2px dashed #808080";
  slot.style.backgroundColor = "#ffffff";
  slot.style.padding = "0";
  slot.removeAttribute('onclick');
}

function getWidgetStorageKey() {
  const separation = typeof getProfileValue === 'function' ? getProfileValue('widgetSeparation') : null;
  if (separation === 'local') {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return `moneverWidgets_${page}`;
  }
  return 'moneverWidgets';
}

function saveWidgetAssignments() {
  const key = getWidgetStorageKey();
  localStorage.setItem(key, JSON.stringify(widgetSlotAssignments));
}

function loadWidgetAssignments() {
  const key = getWidgetStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    widgetSlotAssignments = JSON.parse(saved);
  } else {
    widgetSlotAssignments = {};
  }

  // Sync all slots on the page with current assignments
  document.querySelectorAll('.widget-slot').forEach(slot => {
    const slotId = slot.id;
    if (widgetSlotAssignments[slotId]) {
      renderWidgetSync(slotId, widgetSlotAssignments[slotId]);
    } else {
      removeWidgetSync(slotId);
    }
  });
}

function initWidget(widgetId) {
  switch (widgetId) {
    case 'smart-insights': initSmartInsights(); break;
    case 'budget-tracker': initBudgetWidget(); break;
    case 'upcoming-payments': initUpcomingPayments(); break;
    case 'health-score': initHealthScore(); break;
    case 'spending-heatmap': initSpendingHeatmap(); break;
    case 'suspicious-alert': initSuspiciousAlert(); break;
    case 'expense-dna': initExpenseDNA(); break;
    case 'daily-average': initDailyAverage(); break;
    case 'weekend-weekday': initWeekendWeekday(); break;
    case 'savings-xp': initSavingsXP(); break;
    case 'horoscope': initHoroscope(); break;
    case 'achievements': initAchievements(); break;
    case 'spending-personality': initSpendingPersonality(); break;
    case 'peer-comparison': initPeerComparison(); break;
    case 'networth-snapshot': initNetWorthSnapshot(); break;
    case 'weather-spend': initWeatherSpend(); break;
    case 'clippy-advisor': initClippy(); break;
    case 'spending-spiral': initSpendingSpiral(); break;
    case 'this-day-finance': initThisDayFinance(); break;
    case 'moon-phase': initMoonPhase(); break;
    case 'festival-calendar': initFestivalCalendar(); break;
    case 'alter-ego': initAlterEgo(); break;
    case 'doppelganger': initDoppelganger(); break;
    case 'tamagotchi': initTamagotchi(); break;
    case 'combo-streak': initComboStreak(); break;
    case 'screensaver': initScreensaver(); break;
    case 'money-tree': initMoneyTree(); break;
    case 'savings-garden': initSavingsGarden(); break;
    case 'coral-reef': initCoralReef(); break;
    case 'city-skyline': initCitySkyline(); break;
    case 'space-colony': initSpaceColony(); break;
    case 'grandfather-clock': initGrandfatherClock(); break;
    case 'hourglass': initHourglass(); break;
    case 'time-capsule': initTimeCapsule(); break;
    case 'pixel-portrait': initPixelPortrait(); break;
    case 'vinyl-record': initVinylRecord(); break;
    case 'kaleidoscope': initKaleidoscope(); break;
    case 'lava-lamp': initLavaLamp(); break;
    case 'lucky-cat': initLuckyCat(); break;
    case 'piggy-bank': initPiggyBank(); break;
    case 'wall-of-fame': initWallOfFame(); break;
    case 'black-hole': initBlackHole(); break;
    case 'pinball': initPinball(); break;
    case 'fortune-cookie': initFortuneCookie(); break;
    case 'financial-butterfly': initFinancialButterfly(); break;
    // New Financial
    case 'burn-rate-clock': initBurnRateClock(); break;
    case 'payday-countdown': initPaydayCountdown(); break;
    case 'subscription-drain': initSubscriptionDrain(); break;
    case 'impulse-tax-jar': initImpulseTaxJar(); break;
    case 'zero-day-tracker': initZeroDayTracker(); break;
    case 'cashflow-tide': initCashflowTide(); break;
    // New Analytical
    case 'category-drift': initCategoryDrift(); break;
    case 'spending-clock': initSpendingClock(); break;
    case 'merchant-loyalty': initMerchantLoyalty(); break;
    case 'fifty-thirty-twenty': initFiftyThirtyTwenty(); break;
    case 'expense-volatility': initExpenseVolatility(); break;
    case 'night-owl': initNightOwl(); break;
    // Data-Heavy Financial
    case 'savings-rate': initSavingsRate(); break;
    case 'fire-number': initFireNumber(); break;
    case 'tax-estimator': initTaxEstimator(); break;
    case 'debt-payoff': initDebtPayoff(); break;
    case 'monthly-pnl': initMonthlyPNL(); break;
    case 'emi-burden': initEMIBurden(); break;
    // Data-Heavy Analytical
    case 'breakeven-day': initBreakevenDay(); break;
    case 'rule-of-72': initRuleOf72(); break;
    case 'expense-ratio': initExpenseRatio(); break;
    case 'inflation-eroder': initInflationEroder(); break;
  }
}

function initSmartInsights() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Calculate this week's start (Monday)
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() + diffToMonday);
  thisWeekStart.setHours(0, 0, 0, 0);

  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const insightTextEl = document.getElementById('si-insight-text');
  const weekTotalEl = document.getElementById('si-week-total');
  const topCatEl = document.getElementById('si-top-cat');
  const vsLastEl = document.getElementById('si-vs-last');

  if (!insightTextEl) return;

  if (expenses.length === 0) {
    insightTextEl.innerHTML = "Add some expenses to see insights here.";
    if (weekTotalEl) weekTotalEl.textContent = "";
    if (topCatEl) topCatEl.textContent = "";
    if (vsLastEl) vsLastEl.textContent = "";
    return;
  }

  // Today's spending per category
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayCatTotals = {};
  todayExpenses.forEach(e => todayCatTotals[e.category] = (todayCatTotals[e.category] || 0) + e.amount);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Yesterday's spending per category
  const yesterdayExpenses = expenses.filter(e => e.date === yesterdayStr);
  const yesterdayCatTotals = {};
  yesterdayExpenses.forEach(e => yesterdayCatTotals[e.category] = (yesterdayCatTotals[e.category] || 0) + e.amount);
  const yesterdayTotal = yesterdayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Today's Insight logic
  if (todayTotal === 0) {
    insightTextEl.innerHTML = "No spending recorded today. Great start!";
  } else {
    let topCategory = "";
    let maxDiff = -Infinity;

    const allCats = new Set([...Object.keys(todayCatTotals), ...Object.keys(yesterdayCatTotals)]);
    allCats.forEach(cat => {
      const diff = (todayCatTotals[cat] || 0) - (yesterdayCatTotals[cat] || 0);
      if (diff > maxDiff) {
        maxDiff = diff;
        topCategory = cat;
      }
    });

    if (todayTotal > yesterdayTotal) {
      insightTextEl.innerHTML = `You spent ${getCurrency()}${formatMoney(todayTotal - yesterdayTotal)} more on ${topCategory} than yesterday.`;
    } else if (todayTotal < yesterdayTotal) {
      insightTextEl.innerHTML = `You spent ${getCurrency()}${formatMoney(yesterdayTotal - todayTotal)} less than yesterday. Good discipline.`;
    } else {
      insightTextEl.innerHTML = "You spent the same as yesterday. Consistent!";
    }
  }

  // This Week stats
  const thisWeekExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d >= thisWeekStart && d <= today;
  });
  const weekTotal = thisWeekExpenses.reduce((sum, e) => sum + e.amount, 0);
  if (weekTotalEl) weekTotalEl.textContent = getCurrency() + formatMoney(weekTotal);

  const weekCatTotals = {};
  thisWeekExpenses.forEach(e => weekCatTotals[e.category] = (weekCatTotals[e.category] || 0) + e.amount);

  let topCat = "";
  let topCatAmount = 0;
  Object.entries(weekCatTotals).forEach(([cat, amt]) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCat = cat;
    }
  });

  if (topCatEl) {
    if (weekTotal > 0) {
      const pct = Math.round((topCatAmount / weekTotal) * 100);
      topCatEl.textContent = `${topCat} (${pct}%)`;
    } else {
      topCatEl.textContent = "";
    }
  }

  // vs Last Week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);
  lastWeekEnd.setHours(23, 59, 59, 999);

  const lastWeekExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d >= lastWeekStart && d <= lastWeekEnd;
  });
  const lastWeekTotal = lastWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (vsLastEl) {
    if (lastWeekTotal > 0) {
      const pctDiff = ((weekTotal - lastWeekTotal) / lastWeekTotal) * 100;
      if (pctDiff > 0) vsLastEl.textContent = `↑ ${Math.abs(Math.round(pctDiff))}%`;
      else if (pctDiff < 0) vsLastEl.textContent = `↓ ${Math.abs(Math.round(pctDiff))}%`;
      else vsLastEl.textContent = "0%";
    } else {
      vsLastEl.textContent = "";
    }
  }
}

function initBudgetWidget() {
  budgetWidgetMonth = new Date().getMonth();
  budgetWidgetYear = new Date().getFullYear();
  renderBudgetWidget();
}

function renderBudgetWidget() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const labelEl = document.getElementById('bw-month-label');
  const budgetEl = document.getElementById('bw-budget-amount');
  const spentEl = document.getElementById('bw-spent-amount');
  const barEl = document.getElementById('bw-progress-bar');
  const remainingEl = document.getElementById('bw-remaining');

  if (!labelEl) return;

  labelEl.textContent = `${monthNames[budgetWidgetMonth]} ${budgetWidgetYear}`;

  const monthStr = `${budgetWidgetYear}-${String(budgetWidgetMonth + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(monthStr));
  const spent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (budget <= 0) {
    budgetEl.textContent = "No budget set";
    spentEl.textContent = getCurrency() + formatMoney(spent);
    if (barEl) barEl.style.width = "0%";
    if (remainingEl) remainingEl.textContent = "";
    return;
  }

  budgetEl.textContent = getCurrency() + formatMoney(budget);
  const pct = Math.round((spent / budget) * 100 * 10) / 10;
  spentEl.textContent = `${getCurrency()}${formatMoney(spent)} (${pct}%)`;

  const barPct = Math.min((spent / budget) * 100, 100);
  if (barEl) {
    barEl.style.width = barPct + "%";
    if (spent > budget) {
      barEl.style.backgroundColor = "#606060";
    } else {
      barEl.style.backgroundColor = "#404040";
    }
  }

  if (remainingEl) {
    if (spent <= budget) {
      remainingEl.textContent = getCurrency() + formatMoney(budget - spent);
      remainingEl.style.color = "inherit";
    } else {
      remainingEl.textContent = "OVER by " + getCurrency() + formatMoney(spent - budget);
      remainingEl.style.color = "#606060";
    }
  }
}

function budgetWidgetPrevMonth() {
  budgetWidgetMonth--;
  if (budgetWidgetMonth < 0) {
    budgetWidgetMonth = 11;
    budgetWidgetYear--;
  }
  renderBudgetWidget();
}

function budgetWidgetNextMonth() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (budgetWidgetYear > currentYear || (budgetWidgetYear === currentYear && budgetWidgetMonth >= currentMonth)) {
    return;
  }

  budgetWidgetMonth++;
  if (budgetWidgetMonth > 11) {
    budgetWidgetMonth = 0;
    budgetWidgetYear++;
  }
  renderBudgetWidget();
}

function initUpcomingPayments() {
  const reminders = JSON.parse(localStorage.getItem('moneverReminders') || localStorage.getItem('reminders') || '[]');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const unified = [
    ...reminders.map(r => ({ name: r.label || r.text, amount: r.amount || null, dueDate: r.date, type: 'reminder' })),
    ...emis.map(e => ({ name: e.name, amount: e.amount, dueDate: e.date || e.dueDate, type: 'emi' }))
  ];

  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  const upcoming = unified.filter(item => {
    const d = new Date(item.dueDate);
    return d >= today && d <= thirtyDaysLater;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const listEl = document.getElementById('up-payments-list');
  if (!listEl) return;

  if (upcoming.length === 0) {
    listEl.innerHTML = `<p style="font-size: 0.75rem; color: #555; text-align: center; padding: 8px 0;">No payments due in next 30 days.</p>`;
    return;
  }

  listEl.innerHTML = upcoming.slice(0, 2).map(item => {
    const dueDate = new Date(item.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / 86400000);

    let dueString = "";
    const dateStr = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (diffDays === 0) dueString = "Due today";
    else if (diffDays === 1) dueString = `Due tomorrow (${dateStr})`;
    else dueString = `Due in ${diffDays} days (${dateStr})`;

    const colorStyle = diffDays <= 3 ? 'color: #606060;' : '';
    const amountStr = item.amount ? getCurrency() + formatMoney(item.amount) : '';

    return `
      <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 2px 0; border-bottom: 1px solid #eeeeee; font-size: 0.65rem; overflow: hidden; width: 100%;">
        <div style="flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding-right: 4px;">
          <span style="font-weight: bold; display: block; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
          <span style="color: #555; font-size: 0.55rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${colorStyle}">${dueString}</span>
        </div>
        <div style="font-weight: bold; white-space: nowrap; flex-shrink: 0; font-size: 0.6rem;">${amountStr}</div>
      </div>
    `;
  }).join('');
}

function initHealthScore() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const goals = JSON.parse(localStorage.getItem('financialGoals') || '[]');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  let score = 0;
  let p1 = 0, p2 = 0, p3 = 0, p4 = 0, p5 = 0;

  // 1. Budget adherence (25pts)
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(monthStr));
  const monthlySpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  if (budget > 0) {
    const ratio = monthlySpent / budget;
    if (ratio < 0.8) p1 = 25;
    else if (ratio <= 1.0) p1 = 15;
    else p1 = 5;
  } else {
    p1 = 10;
  }
  score += p1;

  // 2. Savings rate (25pts)
  if (income > 0) {
    const savingsRate = ((income - monthlySpent) / income) * 100;
    if (savingsRate > 30) p2 = 25;
    else if (savingsRate >= 20) p2 = 20;
    else if (savingsRate >= 10) p2 = 12;
    else if (savingsRate >= 0) p2 = 5;
  } else {
    p2 = 10;
  }
  score += p2;

  // 3. Expense tracking consistency (20pts)
  const last30Days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last30Days.push(d.toISOString().split('T')[0]);
  }
  const entryDays = last30Days.filter(dayStr => expenses.some(e => e.date === dayStr)).length;
  if (entryDays >= 20) p3 = 20;
  else if (entryDays >= 10) p3 = 12;
  else if (entryDays >= 5) p3 = 6;
  else p3 = 2;
  score += p3;

  // 4. EMI burden (15pts)
  const totalEmi = emis.reduce((sum, e) => sum + e.amount, 0);
  if (income > 0) {
    const emiBurden = (totalEmi / income) * 100;
    if (emiBurden < 20) p4 = 15;
    else if (emiBurden <= 35) p4 = 10;
    else if (emiBurden <= 50) p4 = 5;
    else p4 = 3;
  } else {
    p4 = 3;
  }
  score += p4;

  // 5. Financial goals (15pts)
  if (goals.length >= 2) {
    const activeWithContrib = goals.filter(g => (g.current || 0) > 0).length;
    if (activeWithContrib >= 2) p5 = 15;
    else if (activeWithContrib === 1) p5 = 10;
    else p5 = 5;
  } else if (goals.length === 1) {
    const hasContrib = (goals[0].current || 0) > 0;
    if (hasContrib) p5 = 10;
    else p5 = 5;
  } else {
    p5 = 0;
  }
  score += p5;

  const scoreEl = document.getElementById('hs-score-display');
  const faceEl = document.getElementById('hs-face');
  const verdictEl = document.getElementById('hs-verdict');

  if (scoreEl) scoreEl.textContent = `${score} / 100`;
  document.getElementById('hs-p1').textContent = `${p1}/25`;
  document.getElementById('hs-p2').textContent = `${p2}/25`;
  document.getElementById('hs-p3').textContent = `${p3}/20`;
  document.getElementById('hs-p4').textContent = `${p4}/15`;
  document.getElementById('hs-p5').textContent = `${p5}/15`;

  let face = "🙂";
  let verdict = "";

  if (score >= 80) {
    face = "😊";
    verdict = "Excellent! Your finances are in great shape.";
  } else if (score >= 60) {
    face = "🙂";
    verdict = "You're doing well. Keep tracking to improve.";
  } else if (score >= 40) {
    face = "😐";
    verdict = "Room for improvement. Focus on budgeting.";
  } else {
    face = "😟";
    verdict = "Your finances need attention. Start with a budget.";
  }

  if (faceEl) faceEl.textContent = face;
  if (verdictEl) verdictEl.textContent = verdict;
}

function initSpendingHeatmap() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startingOffset = (firstDay === 0) ? 6 : firstDay - 1; // Monday = 0

  const dailyTotals = {};
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  expenses.forEach(e => {
    if (e.date.startsWith(monthPrefix)) {
      const day = parseInt(e.date.split('-')[2]);
      dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
    }
  });

  const totalsArray = Object.values(dailyTotals);
  const maxTotal = totalsArray.length > 0 ? Math.max(...totalsArray) : 0;

  const gridEl = document.getElementById('hm-calendar-grid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  for (let i = 0; i < startingOffset; i++) {
    const filler = document.createElement('div');
    filler.style.aspectRatio = '1';
    gridEl.appendChild(filler);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  for (let day = 1; day <= daysInMonth; day++) {
    const total = dailyTotals[day] || 0;
    let color = "#ffffff";
    let textColor = "#000";

    if (total > 0) {
      if (total <= maxTotal * 0.25) color = "#eeeeee";
      else if (total <= maxTotal * 0.6) color = "#c0c0c0";
      else if (total <= maxTotal * 0.85) color = "#808080";
      else {
        color = "#404040";
        textColor = "#fff";
      }
    }

    const isToday = (day === today.getDate() && month === today.getMonth() && year === today.getFullYear());
    const dayCell = document.createElement('div');
    dayCell.style.backgroundColor = color;
    dayCell.style.border = "1px solid #c0c0c0";
    dayCell.style.aspectRatio = "1";
    dayCell.style.display = "flex";
    dayCell.style.alignItems = "center";
    dayCell.style.justifyContent = "center";
    dayCell.style.fontSize = "0.55rem";
    dayCell.style.color = textColor;
    if (isToday) {
      dayCell.style.outline = "1px solid #404040";
      dayCell.style.outlineOffset = "-1px";
      dayCell.style.fontWeight = "bold";
    }
    dayCell.textContent = day;
    gridEl.appendChild(dayCell);
  }
}

function initSuspiciousAlert() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const contentEl = document.getElementById('sa-alert-content');
  if (!contentEl) return;

  if (expenses.length === 0) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 12px 0;">
        <i class="bi bi-info-circle" style="font-size: 1.5rem; display: block; margin-bottom: 6px;"></i>
        <div style="font-size: 0.75rem; color: #555; line-height: 1.4;">
          Add expenses to start monitoring your spending patterns.
        </div>
      </div>
    `;
    return;
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const last30Days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last30Days.push(d.toISOString().split('T')[0]);
  }

  const categories = [...new Set(expenses.map(e => e.category))];
  let mostSuspicious = null;
  let maxMultiple = 0;

  categories.forEach(cat => {
    const catExpenses = expenses.filter(e => e.category === cat);
    const todayAmount = catExpenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

    const last30DaysTotal = catExpenses.filter(e => last30Days.includes(e.date)).reduce((sum, e) => sum + e.amount, 0);
    const avgDailyAmount = last30DaysTotal / 30;

    if (avgDailyAmount > 0) {
      const multiple = (todayAmount / avgDailyAmount) * 100;
      if (multiple > maxMultiple) {
        maxMultiple = multiple;
        mostSuspicious = {
          category: cat,
          todayAmount: todayAmount,
          avgDailyAmount: avgDailyAmount,
          multiple: multiple
        };
      }
    } else if (todayAmount > 0) {
      // Very high multiple if average was 0
      if (999 > maxMultiple) {
        maxMultiple = 999;
        mostSuspicious = {
          category: cat,
          todayAmount: todayAmount,
          avgDailyAmount: 0,
          multiple: 999
        };
      }
    }
  });

  if (mostSuspicious && mostSuspicious.multiple >= 200 && mostSuspicious.todayAmount > 0) {
    contentEl.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 4px; background-color: #eeeeee; border: 1px solid #808080; padding: 4px; margin-bottom: 4px; overflow: hidden;">
        <i class="bi bi-exclamation-triangle" style="font-size: 0.8rem; flex-shrink: 0;"></i>
        <div style="font-size: 0.65rem; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 1.5rem;">
          Spike detected in ${mostSuspicious.category}.
        </div>
      </div>
      <table style="width: 100%; font-size: 0.65rem; border-collapse: collapse; table-layout: fixed;">
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Category</td>
          <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${mostSuspicious.category}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Today</td>
          <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${getCurrency()}${formatMoney(mostSuspicious.todayAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 1px 0; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Avg</td>
          <td style="text-align: right; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${getCurrency()}${formatMoney(mostSuspicious.avgDailyAmount)}</td>
        </tr>
      </table>
    `;
  } else {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 8px 0;">
        <i class="bi bi-check-circle" style="font-size: 1.2rem; display: block; margin-bottom: 4px;"></i>
        <div style="font-size: 0.65rem; color: #555; line-height: 1.3;">No unusual spending today.</div>
      </div>
    `;
  }
}

function initExpenseDNA() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const labelEl = document.getElementById('dna-month-label');
  const summaryEl = document.getElementById('dna-summary');
  const canvas = document.getElementById('dna-canvas');

  if (labelEl) labelEl.textContent = `${monthNames[month]} ${year}`;
  if (!canvas || !summaryEl) return;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, 140, 80);

  const currentExpenses = expenses.filter(e => e.date.startsWith(monthStr));

  if (currentExpenses.length === 0) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(140, 40);
    ctx.stroke();
    summaryEl.innerHTML = `<div style="font-size: 0.7rem; color: #555; text-align: center; padding-top: 5px;">No spending data yet.<br>Your DNA is blank.</div>`;
    return;
  }

  const categoryCount = new Set(currentExpenses.map(e => e.category)).size;
  const totalSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = currentExpenses.length;
  const avgTransaction = totalSpent / transactionCount;

  const dailyTotals = new Array(daysInMonth + 1).fill(0);
  currentExpenses.forEach(e => {
    const day = parseInt(e.date.split('-')[2]);
    dailyTotals[day] += e.amount;
  });

  const maxDailyTotal = Math.max(...dailyTotals) || 1;

  // Draw Top Strand
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 1; i <= daysInMonth; i++) {
    const x = ((i - 1) / (daysInMonth - 1)) * 140;
    const y = 20 + (dailyTotals[i] / maxDailyTotal) * 18;
    if (i === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw Bottom Strand (Mirror)
  ctx.beginPath();
  for (let i = 1; i <= daysInMonth; i++) {
    const x = ((i - 1) / (daysInMonth - 1)) * 140;
    const y = 60 - (dailyTotals[i] / maxDailyTotal) * 18;
    if (i === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw Rungs
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i <= daysInMonth; i += 3) {
    const x = ((i - 1) / (daysInMonth - 1)) * 140;
    const topY = 20 + (dailyTotals[i] / maxDailyTotal) * 18;
    const bottomY = 60 - (dailyTotals[i] / maxDailyTotal) * 18;
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.stroke();
  }

  summaryEl.innerHTML = `
    <div style="font-size: 0.65rem; color: #333;">Transactions: ${transactionCount}</div>
    <div style="font-size: 0.65rem; color: #333;">Categories: ${categoryCount}</div>
    <div style="font-size: 0.65rem; color: #333;">Avg per txn: ${getCurrency()}${formatMoney(avgTransaction)}</div>
  `;
}

function initDailyAverage() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();

  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastYear = lastMonthDate.getFullYear();
  const lastMonthPrefix = `${lastYear}-${String(lastMonth + 1).padStart(2, '0')}`;
  const daysInLastMonth = new Date(lastYear, lastMonth + 1, 0).getDate();

  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const todayCount = todayExpenses.length;
  const todayAvg = todayCount > 0 ? todayTotal / todayCount : 0;

  const thisMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthAvgPerDay = thisMonthTotal / dayOfMonth;

  const lastMonthExpenses = expenses.filter(e => e.date.startsWith(lastMonthPrefix));
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastMonthAvgPerDay = lastMonthTotal / daysInLastMonth;

  // Elements
  const todayAvgEl = document.getElementById('da-today-avg');
  const vsLabelEl = document.getElementById('da-vs-label');
  const thisMonthEl = document.getElementById('da-this-month');
  const lastMonthEl = document.getElementById('da-last-month');
  const daysElapsedEl = document.getElementById('da-days-elapsed');
  const barChartEl = document.getElementById('da-bar-chart');
  const dayLabelsEl = document.getElementById('da-day-labels');

  if (todayAvgEl) todayAvgEl.textContent = getCurrency() + formatMoney(todayAvg);
  if (thisMonthEl) thisMonthEl.textContent = getCurrency() + formatMoney(thisMonthAvgPerDay);
  if (lastMonthEl) lastMonthEl.textContent = getCurrency() + formatMoney(lastMonthAvgPerDay);
  if (daysElapsedEl) daysElapsedEl.textContent = `Day ${dayOfMonth} of ${daysInCurrentMonth}`;

  if (vsLabelEl) {
    if (todayCount === 0) {
      vsLabelEl.textContent = "No spending today";
      vsLabelEl.style.color = "#808080";
    } else if (lastMonthTotal === 0) {
      vsLabelEl.textContent = "First month of tracking";
      vsLabelEl.style.color = "inherit";
    } else {
      const diffPct = ((thisMonthAvgPerDay - lastMonthAvgPerDay) / lastMonthAvgPerDay) * 100;
      if (diffPct > 0) {
        vsLabelEl.textContent = `↑ ${Math.abs(Math.round(diffPct))}% vs last month`;
        vsLabelEl.style.color = "#606060";
      } else if (diffPct < 0) {
        vsLabelEl.textContent = `↓ ${Math.abs(Math.round(diffPct))}% vs last month`;
        vsLabelEl.style.color = "#808080";
      } else {
        vsLabelEl.textContent = "Same as last month";
        vsLabelEl.style.color = "inherit";
      }
    }
  }

  // Bar chart
  if (barChartEl && dayLabelsEl) {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      last7Days.push(d);
    }

    const dayTotals = last7Days.map(date => {
      const ds = date.toISOString().split('T')[0];
      return expenses.filter(e => e.date === ds).reduce((sum, e) => sum + e.amount, 0);
    });

    const maxTotal = Math.max(...dayTotals) || 1;
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    barChartEl.innerHTML = "";
    dayLabelsEl.innerHTML = "";

    last7Days.forEach((date, i) => {
      const amount = dayTotals[i];
      const barHeight = amount > 0 ? Math.max(2, (amount / maxTotal) * 34) : 0;
      const isToday = i === 6;
      const color = isToday ? "#404040" : "#404040";

      const bar = document.createElement('div');
      bar.style.flex = "1";
      bar.style.backgroundColor = color;
      bar.style.height = barHeight + "px";
      bar.style.minHeight = amount > 0 ? "2px" : "0px";
      bar.style.border = "1px solid #808080";
      bar.style.position = "relative";
      bar.title = `${date.toLocaleDateString()}: ${getCurrency()}${formatMoney(amount)}`;
      barChartEl.appendChild(bar);

      const label = document.createElement('div');
      label.style.flex = "1";
      label.style.fontSize = "0.55rem";
      label.style.textAlign = "center";
      label.style.color = "#555";
      label.textContent = dayNames[date.getDay()];
      dayLabelsEl.appendChild(label);
    });
  }
}

function initWeekendWeekday() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();
  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(monthStr));

  const weekdayExpenses = [];
  const weekendExpenses = [];

  currentMonthExpenses.forEach(e => {
    const d = new Date(e.date).getDay();
    if (d === 0 || d === 6) weekendExpenses.push(e);
    else weekdayExpenses.push(e);
  });

  const weekdayTotal = weekdayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weekendTotal = weekendExpenses.reduce((sum, e) => sum + e.amount, 0);
  const grandTotal = weekdayTotal + weekendTotal;

  let weekdayDaysElapsed = 0;
  let weekendDaysElapsed = 0;
  for (let i = 1; i <= dayOfMonth; i++) {
    const d = new Date(currentYear, currentMonth, i).getDay();
    if (d === 0 || d === 6) weekendDaysElapsed++;
    else weekdayDaysElapsed++;
  }

  const weekdayAvg = weekdayTotal / (weekdayDaysElapsed || 1);
  const weekendAvg = weekendTotal / (weekendDaysElapsed || 1);

  // Elements
  const wdAmtEl = document.getElementById('ww-weekday-amount');
  const weAmtEl = document.getElementById('ww-weekend-amount');
  const wdBarEl = document.getElementById('ww-weekday-bar');
  const weBarEl = document.getElementById('ww-weekend-bar');
  const wdPctEl = document.getElementById('ww-weekday-pct');
  const wePctEl = document.getElementById('ww-weekend-pct');
  const wdAvgEl = document.getElementById('ww-weekday-avg');
  const weAvgEl = document.getElementById('ww-weekend-avg');
  const verdictEl = document.getElementById('ww-verdict');

  if (currentMonthExpenses.length === 0) {
    if (wdAmtEl) wdAmtEl.textContent = "";
    if (weAmtEl) weAmtEl.textContent = "";
    if (wdAvgEl) wdAvgEl.textContent = "";
    if (weAvgEl) weAvgEl.textContent = "";
    if (verdictEl) verdictEl.textContent = "Add expenses";
    return;
  }

  if (wdAmtEl) wdAmtEl.textContent = getCurrency() + formatMoney(weekdayTotal);
  if (weAmtEl) weAmtEl.textContent = getCurrency() + formatMoney(weekendTotal);

  if (grandTotal > 0) {
    const wdPct = (weekdayTotal / grandTotal) * 100;
    const wePct = (weekendTotal / grandTotal) * 100;
    if (wdBarEl) wdBarEl.style.width = wdPct + "%";
    if (weBarEl) weBarEl.style.width = wePct + "%";
    if (wdPctEl) wdPctEl.textContent = `${Math.round(wdPct)}% of total spending`;
    if (wePctEl) wePctEl.textContent = `${Math.round(wePct)}% of total spending`;
  }

  if (wdAvgEl) wdAvgEl.textContent = getCurrency() + formatMoney(weekdayAvg);
  if (weAvgEl) weAvgEl.textContent = getCurrency() + formatMoney(weekendAvg);

  if (verdictEl) {
    if (weekendAvg > weekdayAvg) {
      const ratio = (weekendAvg / (weekdayAvg || 1)).toFixed(1);
      verdictEl.textContent = `Weekends (${ratio}x)`;
    } else {
      const ratio = (weekdayAvg / (weekendAvg || 1)).toFixed(1);
      verdictEl.textContent = `Weekdays (${ratio}x)`;
    }
  }
}

function initSavingsXP() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');

  if (income === 0 && typeof getProfileValue === 'function') {
    income = parseFloat(getProfileValue('profInHand') || '0');
  } else if (income === 0) {
    const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
    income = parseFloat(profile.profInHand || '0');
  }

  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const currentSpending = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const currentSavings = Math.max(0, income - currentSpending);

  let totalSaved = parseFloat(localStorage.getItem('moneverTotalSaved') || '0');
  const lastCountedMonth = localStorage.getItem('moneverXPLastMonth');

  if (lastCountedMonth !== currentMonthPrefix) {
    totalSaved += currentSavings;
    localStorage.setItem('moneverTotalSaved', totalSaved);
    localStorage.setItem('moneverXPLastMonth', currentMonthPrefix);
  }

  const levels = [
    { name: "Penny Watcher", min: 0, max: 10000 },
    { name: "Budget Apprentice", min: 10000, max: 25000 },
    { name: "Savings Scout", min: 25000, max: 50000 },
    { name: "Frugal Warrior", min: 50000, max: 100000 },
    { name: "Wealth Builder", min: 100000, max: 250000 },
    { name: "Crore Seeker", min: 250000, max: 500000 },
    { name: "Financial Sage", min: 500000, max: 1000000 },
    { name: "Monever Master", min: 1000000, max: Infinity }
  ];

  let currentLevelIdx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalSaved >= levels[i].min) {
      currentLevelIdx = i;
      break;
    }
  }

  const currentLevel = levels[currentLevelIdx];
  const nextLevel = levels[currentLevelIdx + 1];

  // Elements
  const badgeEl = document.getElementById('xp-level-badge');
  const titleEl = document.getElementById('xp-level-title');
  const barEl = document.getElementById('xp-bar');
  const progressLabelEl = document.getElementById('xp-progress-label');
  const statsEl = document.getElementById('xp-stats');
  const rewardEl = document.getElementById('xp-next-reward');

  if (badgeEl) {
    badgeEl.textContent = `LEVEL ${currentLevelIdx + 1}`;
    if (currentLevelIdx === 0) {
      badgeEl.style.backgroundColor = "#c0c0c0";
      badgeEl.style.color = "#000000";
      badgeEl.style.border = "1px solid #808080";
    } else {
      badgeEl.style.backgroundColor = "#404040";
      badgeEl.style.color = "#ffffff";
      badgeEl.style.border = "none";
    }
  }
  if (titleEl) titleEl.textContent = currentLevel.name;

  if (nextLevel) {
    const range = nextLevel.min - currentLevel.min;
    const progress = Math.min(100, ((totalSaved - currentLevel.min) / range) * 100);
    if (barEl) barEl.style.width = progress + "%";
    if (progressLabelEl) progressLabelEl.textContent = `${getCurrency()}${formatMoney(totalSaved - currentLevel.min)} / ${getCurrency()}${formatMoney(range)}`;
    if (rewardEl) rewardEl.textContent = `Next level: ${nextLevel.name} at ${getCurrency()}${formatMoney(nextLevel.min)}`;
  } else {
    if (barEl) barEl.style.width = "100%";
    if (progressLabelEl) progressLabelEl.textContent = "MAX LEVEL";
    if (rewardEl) rewardEl.textContent = "MAX LEVEL REACHED. You are a Monever Master.";
  }

  if (statsEl) {
    statsEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; padding: 2px 0; border-bottom: 1px solid #eeeeee;">
        <span>This Month Saved</span><span>${getCurrency()}${formatMoney(currentSavings)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding: 2px 0; border-bottom: 1px solid #eeeeee;">
        <span>Total XP Earned</span><span>${formatMoney(totalSaved)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding: 2px 0; border-bottom: 1px solid #eeeeee;">
        <span>Current Level</span><span>${currentLevelIdx + 1} of 8</span>
      </div>
    `;
  }
}

function initHoroscope() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();

  const signs = [
    { name: "Capricorn", emoji: "♑", range: "Dec 22 – Jan 19", start: [12, 22], end: [1, 19] },
    { name: "Aquarius", emoji: "♒", range: "Jan 20 – Feb 18", start: [1, 20], end: [2, 18] },
    { name: "Pisces", emoji: "♓", range: "Feb 19 – Mar 20", start: [2, 19], end: [3, 20] },
    { name: "Aries", emoji: "♈", range: "Mar 21 – Apr 19", start: [3, 21], end: [4, 19] },
    { name: "Taurus", emoji: "♉", range: "Apr 20 – May 20", start: [4, 20], end: [5, 20] },
    { name: "Gemini", emoji: "♊", range: "May 21 – Jun 20", start: [5, 21], end: [6, 20] },
    { name: "Cancer", emoji: "♋", range: "Jun 21 – Jul 22", start: [6, 21], end: [7, 22] },
    { name: "Leo", emoji: "♌", range: "Jul 23 – Aug 22", start: [7, 23], end: [8, 22] },
    { name: "Virgo", emoji: "♍", range: "Aug 23 – Sep 22", start: [8, 23], end: [9, 22] },
    { name: "Libra", emoji: "♎", range: "Sep 23 – Oct 22", start: [9, 23], end: [10, 22] },
    { name: "Scorpio", emoji: "♏", range: "Oct 23 – Nov 21", start: [10, 23], end: [11, 21] },
    { name: "Sagittarius", emoji: "♐", range: "Nov 22 – Dec 21", start: [11, 22], end: [12, 21] }
  ];

  let mySign = signs.find(s => {
    const sM = s.start[0], sD = s.start[1], eM = s.end[0], eD = s.end[1];
    if (sM === eM) return m === sM && d >= sD && d <= eD;
    return (m === sM && d >= sD) || (m === eM && d <= eD);
  });
  if (!mySign) mySign = signs[0]; // Fallback

  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const catTotals = {};
  monthExpenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const sortedCats = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a]);
  const topCat = sortedCats[0] || "Shopping";
  const luckyCat = sortedCats[sortedCats.length - 1] || "Misc";

  // Savings energy
  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  if (income === 0) {
    const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
    income = parseFloat(profile.profInHand || '0') || 50000;
  }
  const spending = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsRate = income > 0 ? (income - spending) / income : 0;
  let energyText = "Chaotic ✦✧✧✧✧";
  if (savingsRate > 0.3) energyText = "Saving ✦✦✦✦✦";
  else if (savingsRate > 0.15) energyText = "Balanced ✦✦✦✧✧";
  else if (savingsRate > 0.05) energyText = "Spending ✦✦✧✧✧";

  // Prediction Templates
  const templates = {
    "Aries": "The ram charges forward  and so does your spending on [TOP_CATEGORY]. Mars warns that [CURR][AMOUNT] spent today is but the beginning. A windfall approaches, but only if you resist the checkout button.",
    "Taurus": "Venus blesses your [TOP_CATEGORY] expenditure with cosmic approval. However, the bull must beware of impulsive purchases today. Your wallet is stubborn  teach it wisdom.",
    "Gemini": "Mercury causes double vision in your [TOP_CATEGORY] budget. One transaction feels like two. Balance the scales or prepare for a twins-sized bill. Curiosity is free; [TOP_CATEGORY] is not.",
    "Cancer": "The crab retreats into its shell after seeing the bill for [TOP_CATEGORY]. Moonbeams guide you toward savings. Secure your nest egg before the tide goes out. Sentimentality costs [CURR][AMOUNT] today.",
    "Leo": "The sun shines bright on your [TOP_CATEGORY] glory. You spend like royalty, but do you have a king's ransom? Jupiter suggests a more humble approach to luxury. Your roar is loud, but your bank account is quiet.",
    "Virgo": "Precision is your strength, yet [TOP_CATEGORY] remains an outlier in your spreadsheets. Mercury demands an audit. Analyze the [CURR][AMOUNT] you spent today with extreme prejudice. Perfection costs less than you think.",
    "Libra": "The scales are tipped heavily toward [TOP_CATEGORY]. Venus seeks harmony between your desires and your balance. Seek equilibrium before the cosmic bailiff arrives. Beauty is found in a surplus.",
    "Scorpio": "Pluto unearths deep desires for [TOP_CATEGORY] that haunt your dreams. Your financial secrets are known to the stars. Transform your habits before the scorpion's sting of debt finds you.",
    "Sagittarius": "The archer aims for the horizon but hits [TOP_CATEGORY] instead. Your optimism is your wallet's greatest threat. Adventure awaits, but only if you can afford the passage. Luck favors the frugal.",
    "Capricorn": "Saturn rewards your discipline, yet even you have a weakness for [TOP_CATEGORY]. The mountain is steep, and [CURR][AMOUNT] is a heavy pack to carry. Build your empire brick by brick, not bill by bill.",
    "Aquarius": "The water-bearer pours wealth into [TOP_CATEGORY] with reckless abandon. Your eccentric tastes are catching up to your credit limit. Uranus demands a revolution in your habits. The future is funded today.",
    "Pisces": "You're swimming in a sea of [TOP_CATEGORY] and the current is strong. Neptune blurs the lines between 'need' and 'want.' Anchor yourself in reality before you've spent [CURR][AMOUNT] on dreams."
  };

  const prediction = templates[mySign.name]
    .replace(/\[TOP_CATEGORY\]/g, topCat)
    .replace(/\[CURR\]/g, getCurrency())
    .replace(/\[AMOUNT\]/g, formatMoney(todayTotal));

  // Render
  const dispEl = document.getElementById('hs-sign-display');
  const nameEl = document.getElementById('hs-sign-name');
  const rangeEl = document.getElementById('hs-date-range');
  const predEl = document.getElementById('hs-prediction');
  const luckyEl = document.getElementById('hs-lucky-cat');
  const avoidEl = document.getElementById('hs-avoid-cat');
  const energyEl = document.getElementById('hs-energy');

  if (dispEl) dispEl.textContent = mySign.emoji;
  if (nameEl) nameEl.textContent = mySign.name.toUpperCase();
  if (rangeEl) rangeEl.textContent = mySign.range;
  if (predEl) predEl.textContent = prediction;
  if (luckyEl) luckyEl.textContent = luckyCat;
  if (avoidEl) avoidEl.textContent = topCat;
  if (energyEl) energyEl.textContent = energyText;
}

let globalAchievements = [];

function initAchievements() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const goals = JSON.parse(localStorage.getItem('financialGoals') || '[]');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');

  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  if (income === 0) income = parseFloat(profile.profInHand || '0');

  const now = new Date();
  const currentMonthPrefix = now.toISOString().substring(0, 7);
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const currentSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const uniqueCats = new Set(expenses.map(e => e.category));

  // Streak logic
  const getStreak = (dates) => {
    if (dates.length === 0) return 0;
    const sorted = [...new Set(dates)].sort();
    let max = 0, current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1]);
      const d2 = new Date(sorted[i]);
      if ((d2 - d1) / (1000 * 60 * 60 * 24) === 1) current++;
      else { max = Math.max(max, current); current = 1; }
    }
    return Math.max(max, current);
  };
  const streak = getStreak(expenses.map(e => e.date));

  globalAchievements = [
    { id: 'first-expense', icon: 'bi-pencil', name: "First Step", desc: "Logged your first expense", check: () => expenses.length >= 1 },
    { id: 'ten-expenses', icon: 'bi-list-check', name: "Getting Serious", desc: "Logged 10 expenses", check: () => expenses.length >= 10 },
    { id: 'fifty-expenses', icon: 'bi-journal-check', name: "Dedicated Tracker", desc: "Logged 50 expenses", check: () => expenses.length >= 50 },
    { id: 'budget-set', icon: 'bi-wallet2', name: "Budget Boss", desc: "Set a monthly budget", check: () => budget > 0 },
    { id: 'under-budget', icon: 'bi-check-circle', name: "Living Within Means", desc: "Finished a month under budget", check: () => budget > 0 && currentSpent < budget },
    { id: 'goal-set', icon: 'bi-flag', name: "Dream Setter", desc: "Created a financial goal", check: () => goals.length >= 1 },
    { id: 'emi-added', icon: 'bi-calendar-check', name: "Loan Tamer", desc: "Added an EMI to track", check: () => emis.length >= 1 },
    { id: 'seven-day-streak', icon: 'bi-fire', name: "7-Day Streak", desc: "Logged expenses 7 days in a row", check: () => streak >= 7 },
    { id: 'categories-five', icon: 'bi-grid', name: "Diversified", desc: "Used 5 different expense categories", check: () => uniqueCats.size >= 5 },
    { id: 'profile-complete', icon: 'bi-person-check', name: "Identity Confirmed", desc: "Filled your Monever profile", check: () => profile.profName && profile.profName !== "" },
    { id: 'savings-positive', icon: 'bi-piggy-bank', name: "In the Black", desc: "Saved money this month", check: () => income > 0 && currentSpent < income },
    { id: 'note-added', icon: 'bi-sticky', name: "Noted!", desc: "Added a quick note", check: () => notes.length >= 1 }
  ];

  const grid = document.getElementById('ach-grid');
  const countEl = document.getElementById('ach-unlocked-count');
  const totalEl = document.getElementById('ach-total-count');
  const latestEl = document.getElementById('ach-latest-label');

  if (!grid) return;
  grid.innerHTML = "";

  let unlockedCount = 0;
  let latestName = "";

  globalAchievements.forEach(ach => {
    const isUnlocked = ach.check();
    if (isUnlocked) {
      unlockedCount++;
      latestName = ach.name;
    }

    const cell = document.createElement('div');
    cell.style.textAlign = "center";
    cell.style.padding = "4px 2px";
    cell.style.backgroundColor = isUnlocked ? "#eeeeee" : "#ffffff";
    cell.style.border = "1px solid #808080";
    cell.style.cursor = "pointer";
    cell.title = `${ach.name}: ${ach.desc}`;
    cell.setAttribute('onmouseenter', `showAchDetail('${ach.id}')`);
    cell.setAttribute('onmouseleave', 'hideAchDetail()');

    cell.innerHTML = `
      <i class="bi ${ach.icon}" style="font-size: 0.9rem; display: block; color: ${isUnlocked ? "#404040" : "#c0c0c0"};"></i>
      <div style="font-size: 0.55rem; margin-top: 2px; line-height: 1.2; color: ${isUnlocked ? "#000" : "#888"}; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
        ${isUnlocked ? ach.name : '???'}
      </div>
    `;
    grid.appendChild(cell);
  });

  if (countEl) countEl.textContent = unlockedCount;
  if (totalEl) totalEl.textContent = globalAchievements.length;
  if (latestEl && latestName) latestEl.textContent = `Latest: ${latestName}`;
}

function showAchDetail(id) {
  const ach = globalAchievements.find(a => a.id === id);
  const detailEl = document.getElementById('ach-latest-detail');
  if (ach && detailEl) {
    detailEl.innerHTML = `<i class="bi ${ach.icon}"></i> <strong>${ach.name}</strong><br>${ach.desc}`;
    detailEl.style.display = "block";
  }
}

function hideAchDetail() {
  const detailEl = document.getElementById('ach-latest-detail');
  if (detailEl) detailEl.style.display = "none";
}

function initSpendingPersonality() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const relevantExpenses = expenses.filter(e => new Date(e.date) >= threeMonthsAgo);

  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  if (income === 0) {
    const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
    income = parseFloat(profile.profInHand || '0') || 50000;
  }

  const totalSpent = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
  const txnCount = relevantExpenses.length;
  const avgTxn = txnCount > 0 ? totalSpent / txnCount : 0;

  const catTotals = {};
  let weekendSpend = 0;
  const uniqueCats = new Set();
  relevantExpenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    uniqueCats.add(e.category);
    const day = new Date(e.date).getDay();
    if (day === 0 || day === 6) weekendSpend += e.amount;
  });

  const topCat = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0] || "";
  const topCatPct = totalSpent > 0 ? (catTotals[topCat] / totalSpent) * 100 : 0;
  const weekendPct = totalSpent > 0 ? (weekendSpend / totalSpent) * 100 : 0;
  const savingsRate = income > 0 ? (income - (totalSpent / 3)) / income : 0; // Approx monthly savings

  const personalities = [
    {
      id: 'ghost',
      icon: '👻',
      type: 'The Ghost',
      tagline: 'Money comes in. Where it goes is a mystery.',
      desc: 'Your expense tracking is sparse. Either you are remarkably frugal or remarkably unaware. The Oracle suspects the latter.',
      trait: 'Mysterious',
      style: 'Unknown',
      weakness: 'No data to analyze',
      check: () => txnCount < 5
    },
    {
      id: 'foodie',
      icon: '🍕',
      type: 'The Foodie',
      tagline: 'You eat well. Your wallet? Less so.',
      desc: 'A significant portion of your spending goes toward food and dining. You value experiences at the table over material things.',
      trait: 'Experiential',
      style: 'Frequent, moderate',
      weakness: 'Dining out frequency',
      check: () => (topCat === 'Food & Dining' || topCat === 'Food' || topCat === 'Dining') && topCatPct > 35
    },
    {
      id: 'homebody',
      icon: '🏠',
      type: 'The Homebody',
      tagline: 'Home is where the money is.',
      desc: 'Housing costs dominate your budget. You prioritize comfort and stability, which is wise  but watch remaining categories.',
      trait: 'Stability-focused',
      style: 'Fixed large expenses',
      weakness: 'Inflexible budget',
      check: () => (topCat === 'Rent' || topCat === 'Utilities' || topCat === 'Housing') && topCatPct > 40
    },
    {
      id: 'impulse',
      icon: '🛍️',
      type: 'The Impulse Artist',
      tagline: 'Every day is a shopping adventure.',
      desc: 'You make many small purchases across many categories. Each feels minor  but they add up faster than you realize.',
      trait: 'Spontaneous',
      style: 'Frequent small spends',
      weakness: 'Death by a thousand cuts',
      check: () => (txnCount / 3) > 20 && uniqueCats.size > 6 && avgTxn < 1000
    },
    {
      id: 'saver',
      icon: '🏦',
      type: 'The Disciplined Saver',
      tagline: 'Boring? Maybe. Wealthy? Definitely.',
      desc: 'Your spending is intentional, infrequent, and controlled. You likely have a budget and actually follow it. A rare breed.',
      trait: 'Discipline',
      style: 'Infrequent, deliberate',
      weakness: 'Occasional rigidity',
      check: () => savingsRate > 0.25 && (txnCount / 3) < 15
    },
    {
      id: 'weekend',
      icon: '🎉',
      type: 'The Weekend Warrior',
      tagline: 'Monday you regret. Friday you forget.',
      desc: 'Your finances are split personality  frugal on weekdays, free-spirited on weekends. The weekend you treats the weekday you poorly.',
      trait: 'Reward-seeking',
      style: 'Weekend binges',
      weakness: 'Weekend splurges',
      check: () => weekendPct > 60
    },
    {
      id: 'billpayer',
      icon: '📋',
      type: 'The Bill Payer',
      tagline: 'Obligations first, everything else never.',
      desc: 'Most of your money is already spoken for before the month begins. EMIs and fixed bills dominate. Building flexibility is key.',
      trait: 'Responsible',
      style: 'Mostly fixed bills',
      weakness: 'Limited freedom',
      check: () => topCatPct > 50 && (topCat === 'EMI' || topCat === 'Bills' || topCat === 'Investments')
    }
  ];

  let myPersonality = personalities.find(p => p.check());
  if (!myPersonality) {
    myPersonality = {
      icon: '⚖️',
      type: 'The Balanced One',
      tagline: 'A little of everything, a lot of nothing excessive.',
      desc: 'Your spending is spread evenly across categories with no major outliers. You are financially balanced  which is rarer than it sounds.',
      trait: 'Equilibrium',
      style: 'Diverse and moderate',
      weakness: 'Occasionally too cautious'
    };
  }

  // Render
  const iconEl = document.getElementById('sp-icon');
  const typeEl = document.getElementById('sp-type');
  const taglineEl = document.getElementById('sp-tagline');
  const descEl = document.getElementById('sp-description');
  const traitEl = document.getElementById('sp-top-trait');
  const styleEl = document.getElementById('sp-style');
  const weakEl = document.getElementById('sp-weakness');

  if (iconEl) iconEl.textContent = myPersonality.icon;
  if (typeEl) typeEl.textContent = myPersonality.type.toUpperCase();
  if (taglineEl) taglineEl.textContent = myPersonality.tagline;
  if (descEl) descEl.textContent = myPersonality.desc;
  if (traitEl) traitEl.textContent = myPersonality.trait;
  if (styleEl) styleEl.textContent = myPersonality.style;
  if (weakEl) weakEl.textContent = myPersonality.weakness;
}

function initPeerComparison() {
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const city = profile.profCity || "Other";
  const age = parseInt(profile.profAge || "25");

  let ageGroup = "25-30";
  if (age < 25) ageGroup = "18-24";
  else if (age <= 30) ageGroup = "25-30";
  else if (age <= 35) ageGroup = "31-35";
  else if (age <= 45) ageGroup = "36-45";
  else ageGroup = "45+";

  const mumbaiBenchmarks = {
    '18-24': { Food: 6000, Transport: 3500, Shopping: 4000, Entertainment: 2500, Utilities: 2000, Health: 1000 },
    '25-30': { Food: 8000, Transport: 4000, Shopping: 6000, Entertainment: 3000, Utilities: 2500, Health: 1500 },
    '31-35': { Food: 10000, Transport: 5000, Shopping: 8000, Entertainment: 3500, Utilities: 3000, Health: 2000 },
    '36-45': { Food: 12000, Transport: 6000, Shopping: 10000, Entertainment: 4000, Utilities: 4000, Health: 3000 },
    '45+': { Food: 15000, Transport: 7000, Shopping: 12000, Entertainment: 5000, Utilities: 5000, Health: 5000 }
  };

  const multipliers = {
    'Mumbai': 1.0, 'Delhi': 0.95, 'Bangalore': 0.85, 'Pune': 0.75,
    'Hyderabad': 0.70, 'Chennai': 0.70, 'Other': 0.65
  };

  const mult = multipliers[city] || multipliers['Other'];
  const basePeer = mumbaiBenchmarks[ageGroup];
  const peerData = {};
  Object.keys(basePeer).forEach(k => peerData[k] = basePeer[k] * mult);

  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const currentMonthPrefix = now.toISOString().substring(0, 7);
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));

  const userTotals = {};
  monthExpenses.forEach(e => {
    const cat = e.category.toLowerCase();
    Object.keys(peerData).forEach(pc => {
      if (cat === pc.toLowerCase() || cat.includes(pc.toLowerCase())) {
        userTotals[pc] = (userTotals[pc] || 0) + e.amount;
      }
    });
  });

  // Render
  const labelEl = document.getElementById('pc-peer-label');
  const tableBody = document.getElementById('pc-table-body');
  const verdictEl = document.getElementById('pc-verdict');

  if (labelEl) labelEl.textContent = profile.profCity ? `vs ${ageGroup} peers in ${city}` : `vs national average peers`;
  if (!tableBody) return;
  tableBody.innerHTML = "";

  if (!profile.profCity || !profile.profAge) {
    if (verdictEl) {
      verdictEl.textContent = "Fill profile with city/age for accurate comparison.";
      verdictEl.style.color = "#606060";
    }
    Object.keys(peerData).forEach(cat => {
      const row = `
        <tr style="border-bottom: 1px solid #eeeeee;">
          <td style="padding: 2px 4px;">${cat}</td>
          <td style="padding: 2px 4px; text-align: right;">${getCurrency()}${formatMoney(userTotals[cat] || 0)}</td>
          <td style="padding: 2px 4px; text-align: right; color: #555;"></td>
          <td style="padding: 2px 4px; text-align: right; font-weight: bold;"></td>
        </tr>`;
      tableBody.innerHTML += row;
    });
    return;
  }

  let aboveCount = 0;
  let belowCount = 0;

  Object.keys(peerData).forEach(cat => {
    const userAmt = userTotals[cat] || 0;
    const peerAmt = peerData[cat];
    const diffPct = peerAmt > 0 ? ((userAmt - peerAmt) / peerAmt) * 100 : 0;

    if (userAmt > peerAmt) aboveCount++;
    else if (userAmt < peerAmt) belowCount++;

    const color = userAmt > peerAmt ? "#606060" : (userAmt < peerAmt ? "#808080" : "inherit");
    const icon = userAmt > peerAmt ? "↑" : (userAmt < peerAmt ? "↓" : "");

    const row = `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 2px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cat}</td>
        <td style="padding: 2px 4px; text-align: right;">${formatMoney(userAmt)}</td>
        <td style="padding: 2px 4px; text-align: right; color: #555;">${formatMoney(peerAmt)}</td>
        <td style="padding: 2px 4px; text-align: right; font-weight: bold; color: ${color};">
          ${icon}${Math.abs(Math.round(diffPct))}%
        </td>
      </tr>`;
    tableBody.innerHTML += row;
  });

  if (verdictEl) {
    if (belowCount >= 4) {
      verdictEl.textContent = "You spend less than peers in most areas. Strong discipline!";
      verdictEl.style.color = "#808080";
    } else if (aboveCount >= 4) {
      verdictEl.textContent = "You spend more than peers in most areas. Review your top categories.";
      verdictEl.style.color = "#606060";
    } else {
      verdictEl.textContent = "Your spending is broadly in line with peers. A few categories to watch.";
      verdictEl.style.color = "inherit";
    }
  }
}

function initNetWorthSnapshot() {
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const people = JSON.parse(localStorage.getItem('people') || '[]');
  
  let totalAssets = parseFloat(profile.profCorpus || '0');
  totalAssets += people.filter(p => p.type === 'lent' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  
  const totalLiabs = people.filter(p => p.type === 'borrowed' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  const netWorth = totalAssets - totalLiabs;

  const totalVal = totalAssets + totalLiabs;
  const liabPct = totalVal > 0 ? (totalLiabs / totalVal) * 100 : 50;
  const assetPct = 100 - liabPct;

  // Render
  const totalEl = document.getElementById('nw-total');
  const statusEl = document.getElementById('nw-status');
  const assetsEl = document.getElementById('nw-assets');
  const liabsEl = document.getElementById('nw-liabilities');
  const netEl = document.getElementById('nw-net');
  const liabBar = document.getElementById('nw-liability-bar');
  const assetBar = document.getElementById('nw-asset-bar');
  const tipEl = document.getElementById('nw-tip');

  if (totalEl) totalEl.textContent = getCurrency() + formatMoney(netWorth);
  if (assetsEl) assetsEl.textContent = getCurrency() + formatMoney(totalAssets);
  if (liabsEl) liabsEl.textContent = getCurrency() + formatMoney(totalLiabs);
  if (netEl) netEl.textContent = getCurrency() + formatMoney(netWorth);

  if (statusEl) {
    if (netWorth > 0 && netWorth > totalLiabs) {
      statusEl.textContent = "POSITIVE ↑";
      statusEl.style.color = "#808080";
    } else if (netWorth > 0) {
      statusEl.textContent = "BUILDING ↗";
      statusEl.style.color = "#404040";
    } else {
      statusEl.textContent = "NEGATIVE ↓";
      statusEl.style.color = "#606060";
    }
  }

  if (liabBar) {
    liabBar.style.backgroundColor = "#808080";
    liabBar.style.width = `${liabPct}%`;
  }
  if (assetBar) {
    assetBar.style.backgroundColor = "#404040";
    assetBar.style.width = `${assetPct}%`;
  }

  if (tipEl) {
    if (assets.length === 0 && liabs.length === 0) {
      tipEl.textContent = "Visit Insights → Net Worth to track your assets and liabilities.";
    } else if (netWorth < 0) {
      tipEl.textContent = "Focus on reducing liabilities before building more assets.";
    } else if (netWorth < 100000) {
      tipEl.textContent = "Keep growing. Every rupee of net worth counts.";
    } else if (netWorth > 1000000) {
      tipEl.textContent = "Strong net worth. Diversify your assets for long-term growth.";
    } else {
      tipEl.textContent = "You're on the right track. Maintain your savings rate.";
    }
  }
}

function initWeatherSpend() {
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const city = profile.profCity || "Other";
  const cityCoords = {
    'Mumbai': [19.076, 72.877], 'Delhi': [28.613, 77.209], 'Bangalore': [12.972, 77.593],
    'Hyderabad': [17.385, 78.486], 'Chennai': [13.083, 80.270], 'Pune': [18.520, 73.856],
    'Kolkata': [22.572, 88.363], 'Other': [20.593, 78.962]
  };

  const getWeatherData = async (lat, lon, source) => {
    try {
      const resp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await resp.json();
      const cw = data.current_weather;

      const weatherMap = {
        0: ["Clear", "☀️"],
        1: ["Partly Cloudy", "⛅"], 2: ["Partly Cloudy", "⛅"], 3: ["Partly Cloudy", "⛅"],
        45: ["Foggy", "🌫️"], 48: ["Foggy", "🌫️"],
        51: ["Rainy", "🌧️"], 53: ["Rainy", "🌧️"], 55: ["Rainy", "🌧️"], 61: ["Rainy", "🌧️"], 63: ["Rainy", "🌧️"], 65: ["Rainy", "🌧️"],
        80: ["Showers", "🌦️"], 81: ["Showers", "🌦️"], 82: ["Showers", "🌦️"],
        95: ["Thunderstorm", "⛈️"], 96: ["Thunderstorm", "⛈️"], 99: ["Thunderstorm", "⛈️"]
      };

      const [condition, emoji] = weatherMap[cw.weathercode] || ["Unknown", "❓"];

      // Update UI
      const dispEl = document.getElementById('ws-weather-display');
      const iconEl = document.getElementById('ws-weather-icon');
      const cityEl = document.getElementById('ws-city-label');

      if (dispEl) dispEl.textContent = `${condition}, ${Math.round(cw.temperature)}°C`;
      if (iconEl) iconEl.textContent = emoji;
      if (cityEl) cityEl.textContent = `Location: ${profile.profCity || source}`;

      // Spending Logic
      const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const todayTotal = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

      const dates = [...new Set(expenses.map(e => e.date))];
      const overallAvg = expenses.reduce((sum, e) => sum + e.amount, 0) / (dates.length || 1);

      document.getElementById('ws-today-spend').textContent = getCurrency() + formatMoney(todayTotal);
      document.getElementById('ws-avg-spend').textContent = getCurrency() + formatMoney(Math.round(overallAvg));

      // Correlation Log
      let weatherLog = JSON.parse(localStorage.getItem('moneverWeatherLog') || '[]');
      if (!weatherLog.some(entry => entry.date === todayStr)) {
        weatherLog.push({ date: todayStr, code: cw.weathercode, spend: todayTotal });
        localStorage.setItem('moneverWeatherLog', JSON.stringify(weatherLog));
      }

      // Pattern calculation
      const isRainy = (code) => [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
      const isClear = (code) => [0, 1, 2, 3].includes(code);

      const rainyDays = weatherLog.filter(l => isRainy(l.code));
      const clearDays = weatherLog.filter(l => isClear(l.code));

      const rainyAvg = rainyDays.reduce((sum, l) => sum + l.spend, 0) / (rainyDays.length || 1);
      const clearAvg = clearDays.reduce((sum, l) => sum + l.spend, 0) / (clearDays.length || 1);

      const patternEl = document.getElementById('ws-pattern');
      if (weatherLog.length < 7) {
        patternEl.textContent = `Pattern: ${weatherLog.length}/7 days`;
      } else {
        if (rainyAvg > clearAvg * 1.2) patternEl.textContent = "Rainy = High Spend";
        else if (clearAvg > rainyAvg * 1.2) patternEl.textContent = "Sunny = High Spend";
        else patternEl.textContent = "No weather pattern";
      }

      // Insight
      const insightEl = document.getElementById('ws-insight');
      if (isRainy(cw.weathercode)) insightEl.textContent = "Rainy day ahead. Historically, people spend more indoors on delivery.";
      else if (isClear(cw.weathercode)) insightEl.textContent = "Clear skies today. Your wallet has no excuse to leak.";
      else if (cw.weathercode === 95 || cw.weathercode === 99) insightEl.textContent = "Stay inside. Your bank account will thank you.";
      else insightEl.textContent = "Indecisive weather, indecisive wallet. Watch small purchases.";

    } catch (err) {
      console.error(err);
      document.getElementById('ws-weather-display').textContent = "Weather unavailable";
      document.getElementById('ws-weather-icon').textContent = "❓";
    }
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => getWeatherData(pos.coords.latitude, pos.coords.longitude, "GPS"),
      () => {
        const coords = cityCoords[city] || cityCoords['Other'];
        getWeatherData(coords[0], coords[1], city);
      }
    );
  } else {
    const coords = cityCoords[city] || cityCoords['Other'];
    getWeatherData(coords[0], coords[1], city);
  }
}

const clippyFaces = {
  happy: "/\\_/\\\n( ^.^)\n/ > <\\\n|     |\n\\_____/",
  concerned: "/\\_/\\\n( o.o)\n/ > <\\\n|     |\n\\_____/",
  judging: "/\\_/\\\n( -_-)\n/ > <\\\n|     |\n\\_____/"
};

const clippyAdvice = [
  { mood: 'judging', getText: (data) => `I see you spent ${getCurrency()}${formatMoney(data.todaySpend)} today. Bold choice.` },
  { mood: 'concerned', getText: (data) => `${data.topCategory} again? That's ${data.topCatCount} transactions already.` },
  { mood: 'happy', getText: (data) => data.savingsRate > 20 ? `${data.savingsRate}% savings rate? I'm almost impressed.` : `Saving less than 20%? I have concerns.` },
  { mood: 'judging', getText: (data) => `You're overspending. Want help? (I can't actually help.)` },
  { mood: 'concerned', getText: (data) => `${data.daysLeft} days left. ₹${formatMoney(data.remaining)} remaining. Good luck.` },
  { mood: 'judging', getText: (data) => `Budget is ${data.budgetPct}% used. I noticed. You're welcome.` },
  { mood: 'happy', getText: (data) => `No spending today! I'm ${data.dayOfMonth > 15 ? 'impressed' : 'suspicious'}.` },
  { mood: 'judging', getText: (data) => `Logged an expense? I was watching the whole time.` },
  { mood: 'concerned', getText: (data) => `Your balance is thin. Like my wire body. Fix it.` },
  { mood: 'happy', getText: (data) => `You saved money today. Want a trophy? Too bad.` },
  { mood: 'judging', getText: (data) => `I've analyzed your trends. You like ${data.topCategory} too much.` },
  { mood: 'concerned', getText: (data) => `₹${formatMoney(data.todaySpend)}? At this hour? In this economy?` },
  { mood: 'happy', getText: (data) => `Goal progress detected. I'll allow it. For now.` },
  { mood: 'judging', getText: (data) => `Your math is correct. Your life choices, however...` },
  { mood: 'concerned', getText: (data) => `Is that another impulse buy? My paperclip is trembling.` },
  { mood: 'happy', getText: (data) => `Budget under control. I'm feeling benevolent today.` },
  { mood: 'judging', getText: (data) => `Spending detected. Would you like to stop? Please?` },
  { mood: 'concerned', getText: (data) => `The spreadsheet doesn't lie. But you can certainly try.` },
  { mood: 'happy', getText: (data) => `A savings win! I might smile. Don't get used to it.` },
  { mood: 'judging', getText: (data) => `Financial mastery? Or just lucky? I'm leaning toward luck.` }
];

function initClippy() {
  refreshClippy();
}

function refreshClippy() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  if (income === 0) income = parseFloat(profile.profInHand || '0') || 50000;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const todayTotal = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

  const catTotals = {};
  monthExpenses.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + 1);
  const topCat = Object.keys(catTotals).sort((a, b) => catTotals[b] - catTotals[a])[0] || "None";

  const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const savingsRate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;

  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const data = {
    todaySpend: todayTotal,
    topCategory: topCat,
    topCatCount: catTotals[topCat] || 0,
    budgetPct: budgetPct,
    savingsRate: savingsRate,
    remaining: budget - spent,
    dayOfMonth: now.getDate(),
    daysLeft: lastDay - now.getDate()
  };

  const advice = clippyAdvice[Math.floor(Math.random() * clippyAdvice.length)];

  const speechEl = document.getElementById('clippy-speech');
  const figureEl = document.getElementById('clippy-figure');
  const moodEl = document.getElementById('clippy-mood');

  if (speechEl) speechEl.textContent = advice.getText(data);
  if (figureEl) figureEl.textContent = clippyFaces[advice.mood];
  if (moodEl) moodEl.textContent = `Clippy is ${advice.mood}.`;
}

function initSpendingSpiral() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  document.getElementById('spiral-month-label').textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const dailyTotals = new Array(daysInMonth).fill(0);
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      dailyTotals[d.getDate() - 1] += e.amount;
    }
  });

  const monthTotal = dailyTotals.reduce((sum, val) => sum + val, 0);
  let maxDaily = Math.max(...dailyTotals);
  const peakDay = dailyTotals.indexOf(maxDaily) + 1;

  document.getElementById('spiral-total').textContent = getCurrency() + formatMoney(monthTotal);
  document.getElementById('spiral-peak').textContent = `${peakDay} (${getCurrency()}${formatMoney(maxDaily)})`;

  const canvas = document.getElementById('spiral-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, 130, 110);

  const cx = 65;
  const cy = 55;

  // Draw Base Spiral (Dim)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let d = 1; d <= daysInMonth; d++) {
    const angle = ((d - 1) / 7) * Math.PI * 2 - Math.PI / 2;
    const radius = 10 + (d / daysInMonth) * 35;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (d === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Draw Spending Spiral
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  let peakX = 0, peakY = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const angle = ((d - 1) / 7) * Math.PI * 2 - Math.PI / 2;
    const baseRadius = 10 + (d / daysInMonth) * 35;
    const spike = maxDaily > 0 ? (dailyTotals[d - 1] / maxDaily) * 12 : 0;
    const radius = baseRadius + spike;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    if (d === 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    if (d === peakDay && maxDaily > 0) {
      peakX = x; peakY = y;
    }
  }
  ctx.stroke();

  // Peak Dot
  if (maxDaily > 0) {
    ctx.fillStyle = '#606060'; // Dark red for the peak dot to stand out on gray
    ctx.beginPath();
    ctx.arc(peakX, peakY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

const financeFacts = {
  "01-01": [{ year: 1994, headline: "NASDAQ begins electronic trading revolution", context: "Changed how stocks were bought forever.", category: "Markets" }],
  "01-15": [{ year: 2001, headline: "Wikipedia launches, making knowledge free", context: "Challenged the entire encyclopedia industry.", category: "Milestone" }],
  "01-16": [{ year: 1991, headline: "Gulf War begins, oil prices spike 30%", context: "Markets worldwide fell sharply on the news.", category: "Crisis" }],
  "02-04": [{ year: 2004, headline: "Facebook founded in a Harvard dorm room", context: "Valued at $1 trillion by 2021.", category: "Tech" }],
  "02-11": [{ year: 1990, headline: "Nelson Mandela released, SA markets surge", context: "Sanctions began lifting, opening new markets.", category: "Markets" }],
  "03-10": [{ year: 2000, headline: "Dot-com bubble peaks, NASDAQ hits 5048", context: "Would lose 78% of value over next 2 years.", category: "Crisis" }],
  "03-23": [{ year: 2020, headline: "COVID crash  markets hit circuit breakers", context: "Fastest bear market in history. BSE fell 13%.", category: "Crisis" }],
  "04-01": [{ year: 1935, headline: "RBI established as India's central bank", context: "Started with a capital of ₹5 crore.", category: "India" }],
  "04-04": [{ year: 1975, headline: "Microsoft founded by Gates and Allen", context: "Started as a BASIC interpreter for Altair.", category: "Tech" }],
  "04-13": [{ year: 1992, headline: "Harshad Mehta scam exposed in India", context: "₹5000 crore securities fraud rocked BSE.", category: "India" }],
  "05-01": [{ year: 1960, headline: "Maharashtra and Gujarat separated", context: "Reorganized India's industrial heartland.", category: "India" }],
  "05-11": [{ year: 1998, headline: "India conducts Pokhran nuclear tests", context: "Led to US sanctions, rupee depreciated 7%.", category: "India" }],
  "05-17": [{ year: 1792, headline: "New York Stock Exchange founded", context: "The Buttonwood Agreement created Wall Street.", category: "Markets" }],
  "06-05": [{ year: 1947, headline: "Marshall Plan announced to rebuild Europe", context: "$13 billion to rebuild post-war economies.", category: "Policy" }],
  "06-15": [{ year: 1991, headline: "India approaches IMF amid forex crisis", context: "Had only 2 weeks of import cover remaining.", category: "India" }],
  "07-01": [{ year: 2017, headline: "GST launched in India at midnight session", context: "Replaced 17 taxes. One nation one tax.", category: "India" }],
  "07-09": [{ year: 1997, headline: "Thailand devalues baht, Asian crisis begins", context: "Wiped $600 billion from Asian markets.", category: "Crisis" }],
  "08-05": [{ year: 1991, headline: "LPG reforms begin  India opens economy", context: "Manmohan Singh's budget changed India forever.", category: "India" }],
  "08-15": [{ year: 1947, headline: "India gains independence, BSE rings bell", context: "The Bombay Stock Exchange celebrated freedom.", category: "India" }],
  "09-11": [{ year: 2001, headline: "9/11 attacks  NYSE closed for 6 days", context: "Dow fell 684 points on reopening day.", category: "Crisis" }],
  "09-15": [{ year: 2008, headline: "Lehman Brothers files for bankruptcy", context: "Largest bankruptcy in US history. $619B owed.", category: "Crisis" }],
  "10-19": [{ year: 1987, headline: "Black Monday  Dow falls 22% in one day", context: "Still the largest single-day % drop ever.", category: "Crisis" }],
  "10-24": [{ year: 1929, headline: "Black Thursday  Great Depression begins", context: "12 million shares dumped in panic selling.", category: "Crisis" }],
  "11-08": [{ year: 2016, headline: "India demonetises high value notes", context: "₹15.44 lakh crore wiped from circulation.", category: "India" }],
  "11-11": [{ year: 1918, headline: "WWI ends, markets begin 10-year bull run", context: "The Roaring Twenties of wealth followed.", category: "Markets" }],
  "12-01": [{ year: 2009, headline: "Dubai requests debt standstill", context: "Dubai World had $26B in liabilities.", category: "Crisis" }],
  "12-05": [{ year: 1996, headline: "Greenspan warns of irrational exuberance", context: "Markets fell 2% then kept rising anyway.", category: "Policy" }],
  "12-24": [{ year: 1914, headline: "NYSE reopens after 4 month closure", context: "Longest closure in NYSE history.", category: "Markets" }]
};

let tdfFactIndex = 0;

function initThisDayFinance() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;

  tdfFactIndex = 0;
  renderTDFFact(key);
}

function renderTDFFact(key) {
  const defaultFact = { year: 1991, headline: "India's historic economic liberalisation era", context: "The reforms that built modern India's economy.", category: "India" };
  const facts = financeFacts[key] || [defaultFact];
  const fact = facts[tdfFactIndex % facts.length];

  const now = new Date();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;

  const dateBadge = document.getElementById('tdf-date-badge');
  const yearEl = document.getElementById('tdf-year');
  const factEl = document.getElementById('tdf-fact');
  const contextEl = document.getElementById('tdf-context');
  const catEl = document.getElementById('tdf-category-badge');

  if (dateBadge) dateBadge.textContent = dateStr;
  if (yearEl) yearEl.textContent = fact.year;
  if (factEl) factEl.textContent = fact.headline;
  if (contextEl) contextEl.textContent = fact.context;
  if (catEl) catEl.textContent = fact.category;
}

function nextTDFFact() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;

  tdfFactIndex++;
  renderTDFFact(key);
}

function initMoonPhase() {
  const now = new Date();
  const refDate = new Date('2000-01-06T12:00:00Z');
  const lunarCycle = 29.53059;
  const daysSince = (now - refDate) / (24 * 60 * 60 * 1000);
  const moonAge = daysSince % lunarCycle;
  const illum = moonAge / lunarCycle;

  let phase = "";
  let desc = "";
  if (moonAge < 1.85 || moonAge > 27.68) { phase = "New Moon"; desc = "New beginnings. Good time to start a budget."; }
  else if (moonAge < 5.54) { phase = "Waxing Crescent"; desc = "Energy building. Avoid large purchases."; }
  else if (moonAge < 9.22) { phase = "First Quarter"; desc = "Decision time. Review your expenses."; }
  else if (moonAge < 12.91) { phase = "Waxing Gibbous"; desc = "Refine your spending plan today."; }
  else if (moonAge < 16.61) { phase = "Full Moon"; desc = "Peak energy. Impulsive spending risk is high."; }
  else if (moonAge < 20.30) { phase = "Waning Gibbous"; desc = "Share financial wisdom. Pay off debts."; }
  else if (moonAge < 23.99) { phase = "Last Quarter"; desc = "Release bad spending habits now."; }
  else { phase = "Waning Crescent"; desc = "Rest and reflect. No big purchases."; }

  document.getElementById('moon-phase-name').textContent = phase;
  document.getElementById('moon-phase-desc').textContent = desc;
  document.getElementById('moon-insight').textContent = desc;

  // Draw Moon
  const canvas = document.getElementById('moon-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const cx = 22, cy = 22, r = 18;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 44, 44);

    // Draw dark base
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#222222';
    ctx.fill();

    // White illumination
    ctx.fillStyle = '#ffffff';
    if (moonAge <= 14.77) {
      // Waxing: Light from right
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.fill();

      const ellipseW = Math.abs(Math.cos(illum * Math.PI * 2)) * r;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ellipseW, r, 0, -Math.PI / 2, Math.PI / 2, true);
      ctx.fillStyle = (moonAge < 7.38) ? '#222222' : '#ffffff';
      ctx.fill();
    } else {
      // Waning: Light from left
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI / 2, 3 * Math.PI / 2, false);
      ctx.fill();

      const ellipseW = Math.abs(Math.cos(illum * Math.PI * 2)) * r;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ellipseW, r, 0, Math.PI / 2, 3 * Math.PI / 2, true);
      ctx.fillStyle = (moonAge < 22.15) ? '#ffffff' : '#222222';
      ctx.fill();
    }
  }

  // Spending correlation
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const todayStr = now.toISOString().split('T')[0];
  const todayTotal = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

  let moonLog = JSON.parse(localStorage.getItem('moneverMoonLog') || '[]');
  if (!moonLog.some(l => l.date === todayStr)) {
    moonLog.push({ date: todayStr, phase: phase, amount: todayTotal });
    localStorage.setItem('moneverMoonLog', JSON.stringify(moonLog));
  }

  const phaseEntries = moonLog.filter(l => l.phase === phase);
  const phaseAvg = phaseEntries.reduce((sum, l) => sum + l.amount, 0) / (phaseEntries.length || 1);

  document.getElementById('moon-today-spend').textContent = getCurrency() + formatMoney(todayTotal);
  document.getElementById('moon-phase-avg').textContent = phaseEntries.length >= 3 ? getCurrency() + formatMoney(Math.round(phaseAvg)) : "Data...";

  const verdictEl = document.getElementById('moon-verdict');
  if (phaseEntries.length >= 3) {
    if (todayTotal > phaseAvg * 1.1) verdictEl.textContent = "Spend ↑";
    else if (todayTotal < phaseAvg * 0.9) verdictEl.textContent = "Spend ↓";
    else verdictEl.textContent = "Neutral";
  } else {
    verdictEl.textContent = "Wait...";
  }
}

const festivals2026 = [
  { name: "Makar Sankranti", date: "2026-01-14", emoji: "🪁", spendingWarning: "Kite & sweets spending peaks today." },
  { name: "Republic Day", date: "2026-01-26", emoji: "🇮🇳", spendingWarning: "Sales and offers spike this week." },
  { name: "Valentine's Day", date: "2026-02-14", emoji: "💝", spendingWarning: "Avg spend 3× on gifts and dining." },
  { name: "Holi", date: "2026-03-03", emoji: "🎨", spendingWarning: "Colors, sweets, celebrations. Budget ₹2K." },
  { name: "Gudi Padwa", date: "2026-03-19", emoji: "🪔", spendingWarning: "New year purchases. Auspicious buying day." },
  { name: "Ram Navami", date: "2026-03-28", emoji: "🙏", spendingWarning: "Religious spending increases this week." },
  { name: "Eid ul-Fitr", date: "2026-03-31", emoji: "🌙", spendingWarning: "Clothing and food gifts. Plan ahead." },
  { name: "Ambedkar Jayanti", date: "2026-04-14", emoji: "📚", spendingWarning: "Public holiday. Leisure spending rises." },
  { name: "Good Friday", date: "2026-04-03", emoji: "✝️", spendingWarning: "Long weekend ahead. Travel costs up." },
  { name: "Akshaya Tritiya", date: "2026-04-21", emoji: "🥇", spendingWarning: "Auspicious gold buying day. Prices peak." },
  { name: "Mother's Day", date: "2026-05-10", emoji: "💐", spendingWarning: "Gifts and dining out spike this weekend." },
  { name: "Eid ul-Adha", date: "2026-06-07", emoji: "🐑", spendingWarning: "Celebration expenses. Budget for gifts." },
  { name: "Independence Day", date: "2026-08-15", emoji: "🇮🇳", spendingWarning: "Sales everywhere. Avoid impulse buys." },
  { name: "Janmashtami", date: "2026-08-23", emoji: "🦚", spendingWarning: "Decorations and prasad spending rises." },
  { name: "Ganesh Chaturthi", date: "2026-08-26", emoji: "🐘", spendingWarning: "Idol, sweets, decorations. Plan ₹3–5K." },
  { name: "Navratri", date: "2026-10-09", emoji: "💃", spendingWarning: "Clothes and garba events. 9-day spend." },
  { name: "Dussehra", date: "2026-10-18", emoji: "🏹", spendingWarning: "Shopping season begins. Stay disciplined." },
  { name: "Dhanteras", date: "2026-10-28", emoji: "🪙", spendingWarning: "Auspicious to buy gold/silver. Big spend day." },
  { name: "Diwali", date: "2026-10-29", emoji: "🎆", spendingWarning: "Biggest spending day of the year. Budget carefully." },
  { name: "Bhai Dooj", date: "2026-10-31", emoji: "🎁", spendingWarning: "Gifts for siblings. Small but sweet expense." },
  { name: "Chhath Puja", date: "2026-11-03", emoji: "🌅", spendingWarning: "Ritual offerings and travel back home." },
  { name: "Christmas", date: "2026-12-25", emoji: "🎄", spendingWarning: "Gifts, parties, travel. December is expensive." },
  { name: "New Year's Eve", date: "2026-12-31", emoji: "🎉", spendingWarning: "Parties and plans. Most expensive night." }
];

function initFestivalCalendar() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcoming = festivals2026.filter(f => new Date(f.date) >= now);

  if (upcoming.length === 0) {
    document.getElementById('fest-next-banner').textContent = "No festivals left in 2026";
    document.getElementById('fest-countdown').textContent = "";
    document.getElementById('fest-warning').textContent = "Relax your wallet... for now.";
    return;
  }

  const next = upcoming[0];
  const daysAway = Math.ceil((new Date(next.date) - now) / (1000 * 60 * 60 * 24));

  const banner = document.getElementById('fest-next-banner');
  const countdown = document.getElementById('fest-countdown');
  const warning = document.getElementById('fest-warning');
  const listEl = document.getElementById('fest-upcoming-list');

  if (banner) banner.textContent = `${next.emoji} ${next.name}`;
  if (countdown) {
    if (daysAway === 0) countdown.textContent = "TODAY! 🎉";
    else if (daysAway === 1) countdown.textContent = "TOMORROW";
    else countdown.textContent = `${daysAway} DAYS AWAY`;
  }
  if (warning) warning.textContent = next.spendingWarning;

  if (listEl) {
    listEl.innerHTML = '';
    upcoming.slice(1, 3).forEach(f => {
      const d = Math.ceil((new Date(f.date) - now) / (1000 * 60 * 60 * 24));
      const div = document.createElement('div');
      div.style.fontSize = '0.6rem';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.padding = '1px 0';
      div.style.borderBottom = '1px solid #eeeeee';
      div.innerHTML = `<span>${f.emoji} ${f.name}</span><span style="color: #555;">${d}d</span>`;
      listEl.appendChild(div);
    });
    if (upcoming.length <= 1) {
      listEl.innerHTML = '<div style="font-size: 0.6rem; color: #555; text-align: center;">End of festival year.</div>';
    }
  }
}

function initAlterEgo() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const goals = JSON.parse(localStorage.getItem('moneverGoals') || '[]');
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  if (income === 0) income = parseFloat(profile.profInHand || '0') || 50000;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);
  const monthExps = expenses.filter(e => e.date.startsWith(currentMonth));
  const todayExps = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExps.reduce((sum, e) => sum + e.amount, 0);

  // Stats
  const spent = monthExps.reduce((sum, e) => sum + e.amount, 0);
  const uniqueDays = new Set(monthExps.map(e => e.date)).size;
  const catTotals = {};
  monthExps.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + e.amount);
  const topCatVal = Math.max(...Object.values(catTotals), 0);

  const dailyTotals = {};
  monthExps.forEach(e => dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount);
  const maxDaySpend = Math.max(...Object.values(dailyTotals), 0);
  const avgDaySpend = spent / (uniqueDays || 1);

  const weekendSpend = monthExps.filter(e => {
    const d = new Date(e.date).getDay();
    return d === 0 || d === 6;
  }).reduce((sum, e) => sum + e.amount, 0);

  const dayCounts = {};
  monthExps.forEach(e => dayCounts[e.date] = (dayCounts[e.date] || 0) + 1);
  const maxTransOnDay = Math.max(...Object.values(dayCounts), 0);

  // Scoring
  let resScore = 1; // Base 1 to avoid div by zero
  let impScore = 1;

  // Responsible Points
  if (budget > 0 && spent < budget) resScore += 25;
  if (income > 0 && ((income - spent) / income) > 0.15) resScore += 25;
  if (uniqueDays >= 15) resScore += 20;
  if (maxDaySpend <= 3 * avgDaySpend && spent > 0) resScore += 15;
  if (goals.length > 0) resScore += 15;

  // Impulsive Points
  if (budget > 0 && spent > budget) impScore += 25;
  if (spent > 0 && (weekendSpend / spent) > 0.5) impScore += 20;
  if (maxTransOnDay > 3) impScore += 20;
  if (spent > 0 && (topCatVal / spent) > 0.4) impScore += 20;
  if (budget === 0) impScore += 15;

  // Normalize
  const totalScore = resScore + impScore;
  const resPct = Math.round((resScore / totalScore) * 100);
  const impPct = 100 - resPct;

  // Render
  document.getElementById('ae-responsible-score').textContent = resPct + "%";
  document.getElementById('ae-impulsive-score').textContent = impPct + "%";

  const resLabel = document.getElementById('ae-responsible-label');
  const impLabel = document.getElementById('ae-impulsive-label');
  resLabel.textContent = resPct > 70 ? "Winning" : (resPct >= 50 ? "Holding" : "Losing");
  impLabel.textContent = impPct > 70 ? "Winning" : (impPct >= 50 ? "Holding" : "Losing");

  document.getElementById('ae-responsible-bar').style.width = resPct + "%";
  document.getElementById('ae-impulsive-bar').style.width = impPct + "%";

  const verdict = document.getElementById('ae-verdict');
  if (resPct > 65) verdict.textContent = "✅ Responsible You is winning!";
  else if (impPct > 65) verdict.textContent = "😈 Impulsive You is taking over.";
  else verdict.textContent = "⚔️ Neck and neck battle!";

  const action = document.getElementById('ae-today-action');
  if (todayTotal > avgDaySpend && avgDaySpend > 0) action.textContent = "Impulsive You scored today with high spend.";
  else if (todayTotal === 0) action.textContent = "Responsible You scores today. Zero spend!";
  else action.textContent = "Responsible You is ahead today.";
}

function initDoppelganger() {
  const impulseCategories = ['Shopping', 'Entertainment', 'Dining', 'Food', 'Subscriptions', 'Snacks', 'Eating Out', 'Online Shopping', 'Gaming', 'Movies'];
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');

  if (expenses.length === 0) {
    document.getElementById('dg-real-spent').textContent = getCurrency() + "0";
    document.getElementById('dg-invested-value').textContent = getCurrency() + "0";
    document.getElementById('dg-impulse-cats').textContent = "";
    document.getElementById('dg-punchline').textContent = "Add expenses to meet your Doppelganger.";
    return;
  }

  const impulsiveExps = expenses.filter(e =>
    impulseCategories.some(cat => cat.toLowerCase() === e.category.toLowerCase())
  );

  const totalImpulsiveSpend = impulsiveExps.reduce((sum, e) => sum + e.amount, 0);

  const matchedCats = [...new Set(impulsiveExps.map(e => e.category))];
  const catString = matchedCats.length > 0
    ? (matchedCats.slice(0, 3).join(', ') + (matchedCats.length > 3 ? '...' : ''))
    : "None detected 🎉";

  // Calculations
  const monthlyP = totalImpulsiveSpend / 12;
  const r = 0.12 / 12; // 1% per month
  const n = 12; // 1 year
  // SIP FV = P * [ ((1 + r)^n - 1) / r ] * (1 + r)
  const currentInvestedValue = totalImpulsiveSpend > 0
    ? monthlyP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
    : 0;

  const val5yr = totalImpulsiveSpend * Math.pow(1.12, 5);
  const val10yr = totalImpulsiveSpend * Math.pow(1.12, 10);

  document.getElementById('dg-real-spent').textContent = getCurrency() + formatMoney(Math.round(totalImpulsiveSpend));
  document.getElementById('dg-invested-value').textContent = getCurrency() + formatMoney(Math.round(currentInvestedValue));
  document.getElementById('dg-impulse-cats').textContent = catString;
  document.getElementById('dg-5yr-value').textContent = getCurrency() + formatMoney(Math.round(val5yr));
  document.getElementById('dg-10yr-value').textContent = getCurrency() + formatMoney(Math.round(val10yr));

  const punchline = document.getElementById('dg-punchline');
  if (totalImpulsiveSpend === 0) punchline.textContent = "No impulse spending detected. Investor You approves.";
  else if (totalImpulsiveSpend < 5000) punchline.textContent = "Small leaks sink big ships. Start plugging them.";
  else if (totalImpulsiveSpend < 20000) punchline.textContent = "That's a SIP you could have started.";
  else if (totalImpulsiveSpend < 50000) punchline.textContent = "Investor You is crying in a corner.";
  else punchline.textContent = "Investor You has left the building.";
}

function initializeSlots() {
  // This is now integrated into loadWidgetAssignments for better sync
  loadWidgetAssignments();
}

window.addEventListener('storage', (e) => {
  if (e.key === getWidgetStorageKey() || e.key === 'moneverProfile') {
    loadWidgetAssignments();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initializeSlots();

  document.addEventListener('visibilitychange', () => {
    const allStates = [
      typeof ssState !== 'undefined' ? ssState : null,
      typeof gcState !== 'undefined' ? gcState : null,
      typeof vrState !== 'undefined' ? vrState : null,
      typeof klState !== 'undefined' ? klState : null,
      typeof llState !== 'undefined' ? llState : null,
      typeof lcState !== 'undefined' ? lcState : null,
      typeof bhState !== 'undefined' ? bhState : null,
      typeof pnState !== 'undefined' ? pnState : null,
      typeof fbState !== 'undefined' ? fbState : null,
      typeof cftState !== 'undefined' ? cftState : null
    ].filter(Boolean);

    if (document.hidden) {
      allStates.forEach(state => {
        if (state && state.intervalId) {
          clearInterval(state.intervalId);
          state.intervalId = null;
          state._wasPaused = true;
        }
      });
    } else {
      allStates.forEach(state => {
        if (state && state._wasPaused) {
          state._wasPaused = false;
        }
      });
      // Re-render all currently assigned animated widgets
      const animatedIds = [
        'screensaver', 'grandfather-clock', 'vinyl-record', 'kaleidoscope',
        'lava-lamp', 'lucky-cat', 'black-hole', 'pinball',
        'financial-butterfly', 'cashflow-tide', 'combo-streak', 'tamagotchi'
      ];
      Object.entries(widgetSlotAssignments).forEach(([slotId, widgetId]) => {
        if (animatedIds.includes(widgetId)) {
          const slot = document.getElementById(slotId);
          if (slot && slot.querySelector('.widget-window')) {
            initWidget(widgetId);
          }
        }
      });
    }
  });
  if (typeof applyAppearance === 'function') {
    applyAppearance();
  }

  const wpModal = document.getElementById('widgetPickerModal');
  if (wpModal) {
    wpModal.addEventListener('hidden.bs.modal', () => {
      const searchInput = document.getElementById('widgetSearchInput');
      if (searchInput) {
        searchInput.value = '';
        filterWidgetPicker('');
      }
    });
  }
});

function initTamagotchi() {
  const tamaMoodEl = document.getElementById('tama-mood');
  const tamaHealthEl = document.getElementById('tama-health');
  const tamaPetEl = document.getElementById('tama-pet');
  const tamaSpeechEl = document.getElementById('tama-speech');
  const tamaHealthBarEl = document.getElementById('tama-health-bar');
  const tamaMonthsHealthyEl = document.getElementById('tama-months-healthy');
  const tamaStatusEl = document.getElementById('tama-status');

  if (!tamaMoodEl) return;

  const petStates = [
    {
      name: "Thriving",
      ascii: " /\\_/\\\n( ^.^ )\n > ₹ <\n(__U__)",
      speech: "I am so healthy! Keep saving!",
      barColor: "#000000",
      threshold: 80
    },
    {
      name: "Happy",
      ascii: " /\\_/\\\n( o.o )\n > ₹ <\n(__U__)",
      speech: "Doing well! Watch the budget.",
      barColor: "#000000",
      threshold: 60
    },
    {
      name: "Hungry",
      ascii: " /\\_/\\\n( -.- )\n > ₹ <\n(__U__)",
      speech: "Feed me savings please...",
      barColor: "#444444",
      threshold: 40
    },
    {
      name: "Sick",
      ascii: " /\\_/\\\n( x.x )\n > ₹ <\n(__U__)",
      speech: "Overspending hurts me...",
      barColor: "#888888",
      threshold: 20
    },
    {
      name: "Critical",
      ascii: " /\\_/\\\n( @.@ )\n > ₹ <\n(___U_)",
      speech: "HELP. Budget breached 3 months.",
      barColor: "#aaaaaa",
      threshold: 0
    }
  ];

  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  let tamaData = JSON.parse(localStorage.getItem('tamaData') || '{"monthsOverBudget":0,"monthsUnderBudget":0,"lastCheckedMonth":""}');

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  if (tamaData.lastCheckedMonth !== currentMonth) {
    const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (monthlyBudget > 0) {
      if (monthTotal <= monthlyBudget) {
        tamaData.monthsUnderBudget++;
        tamaData.monthsOverBudget = 0;
      } else {
        tamaData.monthsOverBudget++;
        // Reset months healthy? User didn't specify resetting monthsUnderBudget on breach, 
        // but usually streaks break. Let's keep it as is or maybe reset it.
        // User said: "If under: increment monthsUnderBudget, reset monthsOverBudget to 0. If over: increment monthsOverBudget."
        // It didn't say reset monthsUnderBudget if over. So I'll follow exactly.
      }
    }
    tamaData.lastCheckedMonth = currentMonth;
    localStorage.setItem('tamaData', JSON.stringify(tamaData));
  }

  let health = 60; // Neutral if no budget
  if (monthlyBudget > 0) {
    health = 100 - (tamaData.monthsOverBudget * 25);
    health = Math.max(0, Math.min(100, health));
  }

  const state = petStates.find(s => health >= s.threshold) || petStates[petStates.length - 1];

  tamaMoodEl.textContent = state.name;
  tamaHealthEl.textContent = health + " / 100";
  tamaPetEl.innerHTML = state.ascii.replace(/\n/g, '<br>');
  
  let speech = state.speech;
  if (tamaData.monthsOverBudget >= 3) {
    speech = petStates[4].speech;
  }
  tamaSpeechEl.textContent = speech;
  
  tamaHealthBarEl.style.width = health + "%";
  tamaHealthBarEl.style.backgroundColor = state.barColor;
  
  tamaMonthsHealthyEl.textContent = tamaData.monthsUnderBudget + " months";
  
  let statusText = "Stable 🙂";
  if (health >= 80) statusText = "Well-fed 🌱";
  else if (health >= 60) statusText = "Stable 🙂";
  else if (health >= 40) statusText = "Hungry 😟";
  else if (health >= 20) statusText = "Sick 🤒";
  else statusText = "Critical ⚠️";
  
  tamaStatusEl.textContent = statusText;
}

function initComboStreak() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const comboLabelEl = document.getElementById('combo-label');
  const comboNumberEl = document.getElementById('combo-number');
  const comboSublabelEl = document.getElementById('combo-sublabel');
  const comboBestEl = document.getElementById('combo-best');
  const comboTodayEl = document.getElementById('combo-today');
  const comboAvgEl = document.getElementById('combo-avg');
  const comboDotsEl = document.getElementById('combo-dots');

  if (!comboLabelEl) return;

  if (expenses.length === 0) {
    comboNumberEl.textContent = "0";
    comboLabelEl.textContent = "NO DATA YET";
    comboSublabelEl.textContent = "Add expenses to start!";
    comboBestEl.textContent = "0 days";
    comboTodayEl.textContent = getCurrency() + "0";
    comboAvgEl.textContent = getCurrency() + "0";
    comboDotsEl.innerHTML = Array(7).fill(0).map(() => `
      <div style="width: 16px; height: 16px; border: 1px solid #808080; background-color: #c0c0c0; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; color: #ffffff;">·</div>
    `).join('');
    return;
  }

  // overallDailyAverage: total of all / total days with any expense (min 1)
  const dayMap = {};
  expenses.forEach(e => {
    dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenseDays = Object.keys(dayMap).length;
  const overallDailyAverage = totalExpenses / Math.max(1, totalExpenseDays);

  // dailyAverage for comparison: last 30 days total / 30
  const now = new Date();
  let last30Total = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    last30Total += dayMap[dStr] || 0;
  }
  const dailyAverageCompare = last30Total / 30;

  // currentStreak: Go back day by day
  let currentStreak = 0;
  let checkDate = new Date(now);
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    const dayTotal = dayMap[dStr] || 0;
    if (dayTotal <= dailyAverageCompare) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
    // Safety break
    if (currentStreak > 1000) break;
  }

  // bestStreak
  let bestStreak = parseInt(localStorage.getItem('comboStreakBest') || '0');
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
    localStorage.setItem('comboStreakBest', bestStreak.toString());
  }

  // Label & Sublabel
  let label = "";
  let sublabel = "";
  if (currentStreak === 0) {
    label = "STREAK BROKEN";
    sublabel = "Start again tomorrow";
  } else if (currentStreak <= 2) {
    label = "COMBO x" + currentStreak;
    sublabel = "Just getting started...";
  } else if (currentStreak <= 6) {
    label = "COMBO x" + currentStreak;
    sublabel = "Nice! Keep it going!";
  } else if (currentStreak <= 13) {
    label = "🔥 COMBO x" + currentStreak;
    sublabel = "You're on fire!";
  } else if (currentStreak <= 29) {
    label = "⚡ MEGA COMBO x" + currentStreak;
    sublabel = "Incredible discipline!";
  } else {
    label = "👑 ULTRA COMBO x" + currentStreak;
    sublabel = "Legendary status!";
  }

  comboNumberEl.textContent = currentStreak;
  comboLabelEl.textContent = label;
  comboSublabelEl.textContent = sublabel;
  comboBestEl.textContent = bestStreak + " days";
  
  const todayStr = now.toISOString().split('T')[0];
  comboTodayEl.textContent = getCurrency() + formatMoney(dayMap[todayStr] || 0);
  comboAvgEl.textContent = getCurrency() + formatMoney(Math.round(dailyAverageCompare));

  // Dots for last 7 days
  let dotsHTML = "";
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const amt = dayMap[dStr] || 0;
    const hasData = expenses.some(e => e.date <= dStr); // If we have any data from this or earlier
    
    let bgColor = "#c0c0c0";
    let symbol = "·";
    if (dayMap[dStr] !== undefined || hasData) {
      if (amt <= dailyAverageCompare) {
        bgColor = "#404040";
        symbol = "✓";
      } else {
        bgColor = "#606060";
        symbol = "✗";
      }
    }

    const isToday = i === 0;
    const todayStyle = isToday ? 'outline: 1px solid #404040; outline-offset: 1px;' : '';
    const dayName = dayNames[d.getDay()];

    dotsHTML += `
      <div style="width: 16px; height: 16px; border: 1px solid #808080; background-color: ${bgColor}; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; color: #ffffff; ${todayStyle}"
        title="${dayName}: ${getCurrency()}${formatMoney(amt)}">
        ${symbol}
      </div>
    `;
  }
  comboDotsEl.innerHTML = dotsHTML;
}

// Screensaver Widget Logic
let ssColors = ['#000000', '#404040', '#606060', '#808080', '#aaaaaa', '#cccccc', '#eeeeee'];
let ssState = {
  x: 10, y: 10,
  vx: 1.2, vy: 0.9,
  colorIndex: 0,
  bounces: 0,
  paused: false,
  intervalId: null,
  cornerHit: false
};

function initScreensaver() {
  const viewport = document.getElementById('ss-viewport');
  const logo = document.getElementById('ss-logo');
  const bounceCountEl = document.getElementById('ss-bounce-count');
  const cornerMsgEl = document.getElementById('ss-corner-msg');
  const pauseBtn = document.getElementById('ss-pause-btn');

  if (!viewport || !logo) return;

  // Clear existing interval if any
  if (ssState.intervalId) {
    clearInterval(ssState.intervalId);
    ssState.intervalId = null;
  }

  // Reset state for new start
  ssState.x = 10;
  ssState.y = 10;
  ssState.bounces = 0;
  ssState.paused = false;
  if (bounceCountEl) bounceCountEl.textContent = "Bounces: 0";
  if (cornerMsgEl) cornerMsgEl.textContent = "";
  if (pauseBtn) pauseBtn.textContent = "Pause";

  ssState.intervalId = setInterval(() => {
    if (ssState.paused) return;

    // Update position
    ssState.x += ssState.vx;
    ssState.y += ssState.vy;

    const vpW = viewport.offsetWidth;
    const vpH = viewport.offsetHeight;
    const logoW = logo.offsetWidth || 70;
    const logoH = logo.offsetHeight || 14;

    let hit = false;
    // Boundary check X
    if (ssState.x <= 0) {
      ssState.x = 0;
      ssState.vx = Math.abs(ssState.vx);
      hit = true;
    } else if (ssState.x + logoW >= vpW) {
      ssState.x = vpW - logoW;
      ssState.vx = -Math.abs(ssState.vx);
      hit = true;
    }

    // Boundary check Y
    if (ssState.y <= 0) {
      ssState.y = 0;
      ssState.vy = Math.abs(ssState.vy);
      hit = true;
    } else if (ssState.y + logoH >= vpH) {
      ssState.y = vpH - logoH;
      ssState.vy = -Math.abs(ssState.vy);
      hit = true;
    }

    if (hit) {
      ssState.bounces++;
      if (bounceCountEl) bounceCountEl.textContent = "Bounces: " + ssState.bounces;
      
      // Check for corner hit (within 5px of any corner)
      const isNearLeft = ssState.x <= 5;
      const isNearRight = ssState.x + logoW >= vpW - 5;
      const isNearTop = ssState.y <= 5;
      const isNearBottom = ssState.y + logoH >= vpH - 5;

      if ((isNearLeft || isNearRight) && (isNearTop || isNearBottom)) {
        if (cornerMsgEl) {
          cornerMsgEl.textContent = "Corner! 🎉";
          setTimeout(() => { if (cornerMsgEl) cornerMsgEl.textContent = ""; }, 2000);
        }
      }
    }

    // Apply position and color
    logo.style.left = ssState.x + 'px';
    logo.style.top = ssState.y + 'px';
    logo.style.color = ssColors[ssState.colorIndex];
  }, 16);
}

function ssChangeColor() {
  ssState.colorIndex = (ssState.colorIndex + 1) % ssColors.length;
  const logo = document.getElementById('ss-logo');
  if (logo) logo.style.color = ssColors[ssState.colorIndex];
}

function ssTogglePause() {
  ssState.paused = !ssState.paused;
  const pauseBtn = document.getElementById('ss-pause-btn');
  if (pauseBtn) pauseBtn.textContent = ssState.paused ? "Resume" : "Pause";
}

function initMoneyTree() {
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const people = JSON.parse(localStorage.getItem('people') || '[]');
  
  let totalAssets = parseFloat(profile.profCorpus || '0');
  totalAssets += people.filter(p => p.type === 'lent' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  
  const totalLiabilities = people.filter(p => p.type === 'borrowed' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  let stage = 1;
  let stageName = "Bare Ground";

  if (netWorth > 5000000) { stage = 7; stageName = "Ancient Tree"; }
  else if (netWorth >= 1000000) { stage = 6; stageName = "Full Tree"; }
  else if (netWorth >= 200000) { stage = 5; stageName = "Mature Tree"; }
  else if (netWorth >= 50000) { stage = 4; stageName = "Young Tree"; }
  else if (netWorth >= 10000) { stage = 3; stageName = "Sapling"; }
  else if (netWorth > 0) { stage = 2; stageName = "Sprout"; }

  const labelEl = document.getElementById('mt-stage-label');
  const nwEl = document.getElementById('mt-networth');
  const numEl = document.getElementById('mt-stage-num');
  const canvas = document.getElementById('mt-canvas');

  if (labelEl) labelEl.textContent = stageName;
  if (nwEl) nwEl.textContent = getCurrency() + formatMoney(netWorth);
  if (numEl) numEl.textContent = stage + " of 7";

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Clear / Background
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, 150, 100);

  // Ground line
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 90);
  ctx.lineTo(150, 90);
  ctx.stroke();

  if (stage === 1) {
    ctx.fillStyle = '#000000';
    ctx.font = '8px Courier New';
    ctx.fillText('No net worth yet', 10, 80);
  } else if (stage === 2) {
    // Sprout
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.lineTo(75, 75);
    ctx.stroke();
    ctx.fillStyle = '#000000';
    ctx.fillRect(72, 73, 3, 3);
    ctx.fillRect(75, 71, 3, 3);
  } else if (stage === 3) {
    // Sapling
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.lineTo(75, 65);
    ctx.stroke();
    // Branches
    const drawBranch = (y, len, angle) => {
      ctx.beginPath();
      ctx.moveTo(75, y);
      const bx = 75 + len * Math.cos(angle);
      const by = y + len * Math.sin(angle);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx - 1, by - 1, 3, 3);
    };
    drawBranch(80, 8, -Math.PI/4); // Right
    drawBranch(80, 8, -3*Math.PI/4); // Left
    drawBranch(70, 8, -Math.PI/4);
    drawBranch(70, 8, -3*Math.PI/4);
  } else if (stage === 4) {
    // Young Tree
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.lineTo(75, 50);
    ctx.stroke();
    // Branches & leaves
    const heights = [85, 75, 65, 55];
    heights.forEach((y, i) => {
      const dir = (i % 2 === 0) ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(75, y);
      const bx = 75 + 12 * dir;
      const by = y - 8;
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx - 2, by - 2, 4, 4);
      ctx.fillRect(75 + (6 * dir) - 2, y - 4 - 2, 4, 4);
    });
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.arc(75, 45, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (stage === 5) {
    // Mature Tree
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.lineTo(75, 40);
    ctx.stroke();
    // Canopy
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(75, 35, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.arc(68, 32, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(82, 30, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (stage === 6) {
    // Full Tree
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.lineTo(75, 30);
    ctx.stroke();
    // Roots
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.quadraticCurveTo(60, 95, 45, 90);
    ctx.moveTo(75, 90);
    ctx.quadraticCurveTo(90, 95, 105, 90);
    ctx.stroke();
    // Large Canopy
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(75, 25, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#555555';
    [ [60,20,10], [85,15,8], [75,10,12] ].forEach(c => {
      ctx.beginPath();
      ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (stage === 7) {
    // Ancient Tree
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(75, 90);
    ctx.lineTo(75, 20);
    ctx.stroke();
    // Thick side branches
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(75, 60); ctx.lineTo(45, 50);
    ctx.moveTo(75, 50); ctx.lineTo(105, 40);
    ctx.stroke();
    // Main Canopy
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(75, 18, 30, 0, Math.PI * 2);
    ctx.fill();
    // Sub-canopies for branches
    ctx.beginPath(); ctx.arc(45, 50, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(105, 40, 10, 0, Math.PI*2); ctx.fill();
    // High-lights
    ctx.fillStyle = '#444444';
    [ [60,10,10], [90,15,8] ].forEach(c => {
      ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = '#777777';
    ctx.beginPath(); ctx.arc(75, 5, 10, 0, Math.PI*2); ctx.fill();
    // Roots
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for(let i=0; i<4; i++) {
       const xOff = (i-1.5)*20;
       ctx.beginPath();
       ctx.moveTo(75,90);
       ctx.quadraticCurveTo(75 + xOff/2, 95, 75 + xOff, 90);
       ctx.stroke();
    }
    // Coins
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 86, 4, 4);
    ctx.fillRect(30, 87, 4, 4);
    ctx.fillRect(110, 86, 4, 4);
  }
}

function initSavingsGarden() {
  const goals = JSON.parse(localStorage.getItem('financialGoals') || '[]');
  const statusLabel = document.getElementById('sg-status-label');
  const goalCount = document.getElementById('sg-goal-count');
  const canvas = document.getElementById('sg-canvas');

  const countFlourishing = goals.filter(g => (Number(g.saved)/Number(g.target)) >= 1).length;
  if (statusLabel) statusLabel.textContent = `Garden: ${countFlourishing} of ${goals.length} goals flourishing`;
  
  const names = goals.map(g => (g.name || "Goal").substring(0, 8)).slice(0, 3);
  if (goalCount) goalCount.textContent = names.length > 0 ? names.join(", ") : "No goals set";

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, 150, 90);

  // Ground
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 75, 150, 15);

  // Seeded Stars (Now small black specks or light twinkles)
  const stars = [[10,10], [45,20], [130,15], [90,30], [25,45], [140,50], [60,10], [110,40], [15,25], [80,5]];
  ctx.fillStyle = '#909090';
  stars.forEach(s => ctx.fillRect(s[0], s[1], 1, 1));

  const goalsToRender = goals.slice(0, 5);
  const xPositions = [
    [75],
    [45, 105],
    [30, 75, 120],
    [20, 55, 95, 130],
    [15, 45, 75, 105, 135]
  ];

  if (goals.length === 0) {
    ctx.fillStyle = '#000000';
    ctx.font = '8px Courier New';
    ctx.fillText('Add goals', 50, 20);
    
    [30, 75, 120].forEach(px => {
      ctx.beginPath();
      ctx.moveTo(px-8, 75);
      ctx.lineTo(px+8, 75);
      ctx.lineTo(px+6, 65);
      ctx.lineTo(px-6, 65);
      ctx.closePath();
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      ctx.fillStyle = '#555555';
      ctx.fill();
    });
  } else {
    const pxs = xPositions[goalsToRender.length - 1];
    goalsToRender.forEach((g, i) => {
      const px = pxs[i];
      const pct = (Number(g.saved) / Number(g.target)) * 100 || 0;
      
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';

      if (pct === 0) {
        // Seed
        ctx.fillRect(px-2, 72, 4, 3);
      } else if (pct <= 25) {
        // Sprout
        ctx.fillRect(px-1, 65, 2, 10);
        ctx.fillRect(px-3, 67, 3, 2);
        ctx.fillRect(px, 67, 3, 2);
      } else if (pct <= 50) {
        // Stem with buds
        ctx.fillRect(px-1, 58, 2, 17);
        ctx.fillRect(px-4, 68, 4, 2);
        ctx.fillRect(px, 68, 4, 2);
        ctx.beginPath(); ctx.arc(px-3, 60, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(px+3, 60, 2, 0, Math.PI*2); ctx.fill();
      } else if (pct <= 75) {
        // Flowering
        ctx.fillRect(px-1, 52, 2, 23);
        ctx.beginPath(); ctx.arc(px, 52, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#333333';
        for(let a=0; a<6; a++) {
          const ang = a * (Math.PI/3);
          ctx.beginPath();
          ctx.arc(px + 5*Math.cos(ang), 52 + 5*Math.sin(ang), 2, 0, Math.PI*2);
          ctx.fill();
        }
      } else if (pct < 100) {
        // Full bloom
        ctx.fillRect(px-1, 50, 2, 25);
        ctx.beginPath(); ctx.arc(px, 50, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#222222';
        for(let a=0; a<8; a++) {
          const ang = a * (Math.PI/4);
          ctx.beginPath();
          ctx.arc(px + 6*Math.cos(ang), 50 + 6*Math.sin(ang), 3, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(px, 50, 1.5, 0, Math.PI*2); ctx.fill();
      } else {
        // Complete
        ctx.fillRect(px-1, 50, 2, 25);
        ctx.beginPath(); ctx.arc(px, 50, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#222222';
        for(let a=0; a<8; a++) {
          const ang = a * (Math.PI/4);
          ctx.beginPath();
          ctx.arc(px + 6*Math.cos(ang), 50 + 6*Math.sin(ang), 3, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(px, 50, 1.5, 0, Math.PI*2); ctx.fill();
        // Sparkle
        ctx.fillStyle = '#000000';
        ctx.fillRect(px-4, 40, 2, 2);
        ctx.fillRect(px, 38, 2, 2);
        ctx.fillRect(px+4, 40, 2, 2);
      }
    });
  }
}

function initCoralReef() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const goals = JSON.parse(localStorage.getItem('financialGoals') || '[]');

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  let score = 0;

  // Budget adherence (25pts)
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(monthStr));
  const monthlySpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  if (budget > 0) {
    const ratio = monthlySpent / budget;
    if (ratio < 0.8) score += 25;
    else if (ratio <= 1.0) score += 15;
    else score += 5;
  } else score += 10;

  // Savings rate (25pts)
  if (income > 0) {
    const savingsRate = ((income - monthlySpent) / income) * 100;
    if (savingsRate > 30) score += 25;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 12;
    else if (savingsRate >= 0) score += 5;
  } else score += 10;

  // Tracking consistency (20pts)
  const last30 = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last30.push(d.toISOString().split('T')[0]);
  }
  const entryDays = last30.filter(ds => expenses.some(e => e.date === ds)).length;
  if (entryDays >= 20) score += 20;
  else if (entryDays >= 10) score += 12;
  else score += 2;

  // EMI burden (15pts)
  const totalEmi = emis.reduce((sum, e) => sum + e.amount, 0);
  if (income > 0) {
    const emiBurden = (totalEmi / income) * 100;
    if (emiBurden < 20) score += 15;
    else if (emiBurden <= 35) score += 10;
    else score += 3;
  } else score += 3;

  // Goals (15pts)
  if (goals.length >= 2) score += 15;
  else if (goals.length === 1) score += 10;

  // Elements
  const labelEl = document.getElementById('cr-health-label');
  const barEl = document.getElementById('cr-health-bar');
  const canvas = document.getElementById('cr-canvas');

  let status = "Dead";
  if (score > 80) status = "Thriving";
  else if (score > 60) status = "Healthy";
  else if (score > 40) status = "Recovering";
  else if (score > 20) status = "Bleached";

  if (labelEl) labelEl.textContent = `${score}%  ${status}`;
  if (barEl) barEl.style.width = score + "%";

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Water bands
  const bands = ['#151515', '#1a1a1a', '#202020', '#252525', '#2a2a2a'];
  bands.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i*20, 150, 20);
  });

  // Floor
  ctx.fillStyle = '#404040';
  ctx.fillRect(0, 85, 150, 15);
  // Sand texture
  ctx.fillStyle = '#505050';
  const sandSeeds = [20, 45, 70, 95, 120, 30, 80, 110, 140, 5, 55, 65, 100, 130, 15];
  sandSeeds.forEach((x, i) => ctx.fillRect(x, 86 + (i%4), 1, 1));

  // Bubbles
  ctx.fillStyle = 'rgba(180, 180, 180, 0.3)';
  const bubbleCoords = [[20,60,2], [40,40,1], [110,70,3], [130,30,2], [70,50,1], [90,80,2], [30,20,1], [140,75,2]];
  bubbleCoords.forEach(b => {
    ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, Math.PI*2); ctx.fill();
  });

  const drawCoral = (x, h, color, levels) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, 85); ctx.lineTo(x, 85-h); ctx.stroke();
    const branch = (bx, by, bl, ba, lvl) => {
      if (lvl <= 0) return;
      const tx = bx + bl * Math.cos(ba);
      const ty = by + bl * Math.sin(ba);
      ctx.lineWidth = Math.max(1, lvl);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
      branch(tx, ty, bl*0.7, ba-0.4, lvl-1);
      branch(tx, ty, bl*0.7, ba+0.4, lvl-1);
    };
    if (levels > 0) {
      branch(x, 85-h, h*0.5, -Math.PI/2 - 0.5, levels);
      branch(x, 85-h, h*0.5, -Math.PI/2 + 0.5, levels);
    }
  };

  const drawFish = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 6, 4);
    ctx.beginPath(); ctx.moveTo(x, y+2); ctx.lineTo(x-3, y); ctx.lineTo(x-3, y+4); ctx.closePath(); ctx.fill();
  };

  if (score <= 20) {
    [[20,8], [50,12], [80,10], [120,15]].forEach(c => drawCoral(c[0], c[1], '#303030', 0));
  } else if (score <= 40) {
    [[20,10], [50,15], [80,12], [120,18]].forEach(c => drawCoral(c[0], c[1], '#404040', 0.5));
    ctx.strokeStyle = '#404040';
    ctx.beginPath(); ctx.moveTo(100, 85); ctx.lineTo(102, 75); ctx.stroke();
  } else if (score <= 60) {
    drawCoral(30, 20, '#555555', 2);
    drawCoral(110, 20, '#555555', 2);
    ctx.strokeStyle = '#606060';
    [40, 45, 90, 95].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 85); ctx.lineTo(x+2, 70); ctx.stroke(); });
  } else if (score <= 80) {
    drawCoral(30, 25, '#707070', 3);
    drawCoral(75, 25, '#707070', 3);
    drawCoral(110, 25, '#707070', 3);
    drawFish(100, 50, '#aaaaaa');
  } else {
    drawCoral(20, 28, '#888888', 4);
    drawCoral(50, 25, '#aaaaaa', 4);
    drawCoral(90, 28, '#888888', 4);
    drawCoral(130, 25, '#aaaaaa', 4);
    drawFish(40, 40, '#aaaaaa');
    drawFish(110, 60, '#aaaaaa');
    // Brain coral
    ctx.fillStyle = '#606060';
    ctx.beginPath(); ctx.arc(60, 80, 8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#404040'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(60, 80, 5, 0, 1); ctx.stroke();
    // Starfish
    ctx.fillStyle = '#aaaaaa';
    const sx = 100, sy = 82;
    ctx.beginPath();
    for(let i=0; i<5; i++) {
      const a = (i * 0.4 * Math.PI) - Math.PI/2;
      ctx.lineTo(sx + 5*Math.cos(a), sy + 5*Math.sin(a));
      const a2 = a + 0.2*Math.PI;
      ctx.lineTo(sx + 2*Math.cos(a2), sy + 2*Math.sin(a2));
    }
    ctx.closePath(); ctx.fill();
  }
}

function initCitySkyline() {
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const people = JSON.parse(localStorage.getItem('people') || '[]');
  
  let totalAssets = parseFloat(profile.profCorpus || '0');
  totalAssets += people.filter(p => p.type === 'lent' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  
  const totalLiabilities = people.filter(p => p.type === 'borrowed' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  let stage = 1;
  let stageName = "Empty Land";

  if (netWorth >= 10000000) { stage = 6; stageName = "Megacity"; }
  else if (netWorth >= 1000000) { stage = 5; stageName = "Metropolis"; }
  else if (netWorth >= 100000) { stage = 4; stageName = "City"; }
  else if (netWorth >= 10000) { stage = 3; stageName = "Town"; }
  else if (netWorth > 0) { stage = 2; stageName = "Village"; }

  const nameEl = document.getElementById('cs-city-name');
  const popEl = document.getElementById('cs-pop-label');
  const canvas = document.getElementById('cs-canvas');

  if (nameEl) nameEl.textContent = stageName;
  if (popEl) {
    let abbreviated = "0";
    if (netWorth >= 10000000) abbreviated = (netWorth / 10000000).toFixed(1) + "Cr";
    else if (netWorth >= 100000) abbreviated = (netWorth / 100000).toFixed(1) + "L";
    else if (netWorth >= 1000) abbreviated = (netWorth / 1000).toFixed(1) + "K";
    else abbreviated = netWorth.toString();
    popEl.textContent = "₹" + abbreviated.replace(".0", "");
  }

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 150, 100);

  // Ground & Road
  ctx.fillStyle = '#303030';
  ctx.fillRect(0, 88, 150, 12);
  ctx.fillStyle = '#252525';
  ctx.fillRect(0, 86, 150, 4);
  ctx.fillStyle = '#505050';
  for(let x=0; x<150; x+=12) ctx.fillRect(x, 87.5, 6, 1);

  const drawBuilding = (x, w, h, rows, cols) => {
    const seed = x + h;
    ctx.fillStyle = '#505050';
    ctx.fillRect(x, 88-h, w, h);
    ctx.fillStyle = '#707070';
    ctx.fillRect(x, 88-h, w, 1); // Edge
    
    const winW = 2, winH = 2;
    const padX = (w - (cols * winW)) / (cols + 1);
    const padY = (h - (rows * winH)) / (rows + 1);
    
    for(let r=0; r<rows; r++) {
      for(let c=0; c<cols; c++) {
        // Deterministic randomness
        const lit = (Math.sin(seed + r*cols + c) > 0);
        ctx.fillStyle = lit ? '#aaaaaa' : '#303030';
        ctx.fillRect(x + padX + c*(winW+padX), 88 - h + padY + r*(winH+padY), winW, winH);
      }
    }
  };

  if (stage === 1) {
    ctx.fillStyle = '#404040';
    ctx.fillRect(65, 80, 10, 8);
    ctx.beginPath(); ctx.moveTo(65, 80); ctx.lineTo(70, 75); ctx.lineTo(75, 80); ctx.fill();
  } else if (stage === 2) {
    drawBuilding(20, 15, 20, 2, 2);
    drawBuilding(65, 12, 15, 1, 2);
    drawBuilding(110, 14, 18, 2, 2);
    // Tree
    ctx.strokeStyle = '#606060';
    ctx.beginPath(); ctx.moveTo(45, 88); ctx.lineTo(45, 75); ctx.stroke();
    ctx.beginPath(); ctx.arc(45, 72, 4, 0, Math.PI*2); ctx.fill();
  } else if (stage === 3) {
    [ [10,12,25,3,2], [30,15,35,4,2], [60,10,30,3,1], [85,18,28,3,3], [120,12,22,2,2] ].forEach(b => drawBuilding(...b));
    ctx.fillStyle = '#606060';
    ctx.fillRect(52, 70, 2, 18); ctx.fillRect(50, 74, 6, 2); // Church steeple
  } else if (stage === 4) {
    [ [5,12,30,3,2], [20,15,50,6,2], [45,10,40,4,1], [65,20,60,8,3], [95,12,35,4,2], [115,15,45,5,2], [135,10,30,3,1] ].forEach(b => drawBuilding(...b));
    // Antenna
    ctx.strokeStyle = '#707070';
    ctx.beginPath(); ctx.moveTo(75, 28); ctx.lineTo(75, 20); ctx.stroke();
    // Bridge
    ctx.fillStyle = '#303030';
    ctx.fillRect(85, 80, 4, 8); ctx.fillRect(105, 80, 4, 8);
    ctx.fillRect(80, 78, 35, 3);
  } else if (stage === 5) {
    [ [5,10,40,4,1], [18,12,65,9,2], [35,15,50,6,2], [55,18,75,10,3], [78,12,55,7,2], [95,20,70,9,3], [120,12,45,5,2], [135,10,35,4,1] ].forEach(b => drawBuilding(...b));
    ctx.beginPath(); ctx.moveTo(64, 13); ctx.lineTo(64, 5); ctx.lineTo(60, 13); ctx.fillStyle='#505050'; ctx.fill(); // Spire
    // Airplane
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(120, 15, 6, 1); ctx.fillRect(122, 13, 1, 5);
  } else if (stage === 6) {
    const buildings = [ [0,12,60,7,2], [12,10,75,10,1], [22,15,90,12,2], [37,12,80,10,2], [49,15,85,11,2], [64,18,92,13,3], [82,12,70,9,2], [94,15,88,11,2], [109,12,75,10,2], [121,15,65,8,2], [136,14,55,7,2] ];
    buildings.forEach(b => drawBuilding(...b));
    // Supertall detail
    ctx.strokeStyle = '#707070';
    ctx.beginPath(); ctx.moveTo(73, 20); ctx.lineTo(73, 5); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(72, 5, 2, 2);
    // Moon
    ctx.beginPath(); ctx.arc(12, 12, 8, 0, Math.PI*2); ctx.fillStyle='#aaaaaa'; ctx.fill();
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(16, 10, 6, 0, Math.PI*2); ctx.fill();
  }
}

function initSpaceColony() {
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const people = JSON.parse(localStorage.getItem('people') || '[]');
  
  let totalAssets = parseFloat(profile.profCorpus || '0');
  totalAssets += people.filter(p => p.type === 'lent' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  
  const totalLiabilities = people.filter(p => p.type === 'borrowed' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  let stage = 1;
  let stageName = "Barren";

  if (netWorth >= 5000000) { stage = 6; stageName = "Space City"; }
  else if (netWorth >= 1000000) { stage = 5; stageName = "Colony"; }
  else if (netWorth >= 200000) { stage = 4; stageName = "Settlement"; }
  else if (netWorth >= 25000) { stage = 3; stageName = "Base Camp"; }
  else if (netWorth > 0) { stage = 2; stageName = "Outpost"; }

  const stageEl = document.getElementById('sc-stage-label');
  const nwEl = document.getElementById('sc-nw-label');
  const canvas = document.getElementById('sc-canvas');

  if (stageEl) stageEl.textContent = stageName;
  if (nwEl) nwEl.textContent = getCurrency() + formatMoney(netWorth);

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 150, 100);

  // Starfield
  const stars = [
    [10,10,1,'#404040'], [25,45,1,'#404040'], [40,20,1,'#404040'], [55,60,1,'#404040'], [70,15,1,'#404040'],
    [85,40,1,'#404040'], [100,5,1,'#404040'], [115,30,1,'#404040'], [130,55,1,'#404040'], [145,10,1,'#404040'],
    [5,50,1,'#404040'], [35,5,1,'#404040'], [65,45,1,'#404040'], [95,25,1,'#404040'], [125,5,1,'#404040'],
    [15,70,1,'#404040'], [45,65,1,'#404040'], [75,35,1,'#404040'], [105,60,1,'#404040'], [135,45,1,'#404040'],
    [20,15,1,'#606060'], [50,10,1,'#606060'], [80,50,1,'#606060'], [110,20,1,'#606060'], [140,40,1,'#606060'],
    [30,60,1,'#606060'], [60,5,1,'#606060'], [90,30,1,'#606060'], [12,35,2,'#808080'], [82,12,2,'#808080']
  ];
  stars.forEach(s => {
    ctx.fillStyle = s[3];
    ctx.fillRect(s[0], s[1], s[2], s[2]);
  });

  // Surface
  ctx.fillStyle = '#303030';
  ctx.fillRect(0, 75, 150, 25);
  ctx.strokeStyle = '#252525';
  ctx.lineWidth = 1;
  [ [25,80,8,3], [60,85,12,4], [100,82,10,3], [130,88,6,2], [45,92,9,3] ].forEach(c => {
    ctx.beginPath(); ctx.ellipse(c[0], c[1], c[2], c[3], 0, 0, Math.PI*2); ctx.stroke();
  });

  // Planet with Rings
  ctx.beginPath(); ctx.arc(130, 20, 15, 0, Math.PI*2); ctx.fillStyle = '#252525'; ctx.fill();
  ctx.strokeStyle = '#505050'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(130, 20, 25, 5, -0.2, 0, Math.PI*2); ctx.stroke();

  const drawDome = (x, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, 75, r, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#404040';
    ctx.fillRect(x - r, 74, r*2, 2);
  };

  if (stage === 1) {
    ctx.fillStyle = '#404040';
    ctx.beginPath(); ctx.moveTo(60, 75); ctx.lineTo(80, 70); ctx.lineTo(85, 75); ctx.closePath(); ctx.fill();
  } else if (stage === 2) {
    drawDome(75, 12, '#505050');
    ctx.fillStyle = '#808080'; ctx.fillRect(74, 75, 2, 4); // door
    ctx.strokeStyle = '#808080'; ctx.beginPath(); ctx.moveTo(90, 75); ctx.lineTo(90, 65); ctx.stroke();
    ctx.fillRect(90, 65, 4, 3); // flag
  } else if (stage === 3) {
    drawDome(45, 12, '#505050');
    drawDome(75, 8, '#505050');
    ctx.fillStyle = '#404040'; ctx.fillRect(57, 72, 10, 3); // tunnel
    ctx.strokeStyle = '#606060'; ctx.beginPath(); ctx.moveTo(95, 75); ctx.lineTo(95, 68); ctx.stroke();
    ctx.beginPath(); ctx.arc(95, 65, 4, Math.PI, 0, true); ctx.stroke(); // dish
  } else if (stage === 4) {
    [30, 60, 90].forEach(x => drawDome(x, 10, '#505050'));
    ctx.fillStyle = '#404040';
    for(let x=105; x<140; x+=8) ctx.fillRect(x, 70, 6, 4); // solar panels
    ctx.strokeStyle = '#606060'; ctx.beginPath(); ctx.moveTo(10, 75); ctx.lineTo(10, 50); ctx.stroke();
    for(let y=55; y<75; y+=5) { ctx.beginPath(); ctx.moveTo(7,y); ctx.lineTo(13,y); ctx.stroke(); }
  } else if (stage === 5) {
    [25, 50, 75, 100].forEach(x => drawDome(x, 10, '#505050'));
    for(let x=115; x<145; x+=8) ctx.fillRect(x, 70, 6, 4);
    // Rocket
    ctx.fillStyle = '#707070'; ctx.fillRect(125, 50, 6, 20); ctx.beginPath(); ctx.moveTo(125, 50); ctx.lineTo(128, 45); ctx.lineTo(131, 50); ctx.fill();
    // Rover
    ctx.fillStyle = '#404040'; ctx.fillRect(50, 85, 10, 5); ctx.beginPath(); ctx.arc(52, 91, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(58, 91, 2, 0, Math.PI*2); ctx.fill();
  } else if (stage === 6) {
    [20, 45, 70, 95, 120].forEach(x => drawDome(x, 12, '#606060'));
    ctx.fillStyle = '#404040'; ctx.fillRect(15, 63, 120, 2); // Walkway
    // Orbital ring
    ctx.strokeStyle = '#707070'; ctx.beginPath(); ctx.ellipse(75, 30, 40, 10, 0, 0, Math.PI*2); ctx.stroke();
    for(let i=0; i<4; i++) {
       const a = i * Math.PI/2;
       ctx.beginPath(); ctx.moveTo(75, 30); ctx.lineTo(75 + 40*Math.cos(a), 30 + 10*Math.sin(a)); ctx.stroke();
    }
    // Supply pods
    [[40,15], [100,10], [60,20]].forEach(p => {
       ctx.fillStyle = '#aaaaaa'; ctx.fillRect(p[0], p[1], 4, 3);
       ctx.fillStyle = '#404040'; ctx.fillRect(p[0], p[1]+3, 1, 1); ctx.fillRect(p[0]+3, p[1]+3, 1, 1);
    });
    // Launchpad
    ctx.fillStyle = '#404040'; ctx.fillRect(130, 65, 15, 10);
    ctx.fillStyle = '#808080'; ctx.fillRect(135, 45, 5, 20);
  }
}

function initHourglass() {
  const expensesData = JSON.parse(localStorage.getItem('moneverExpenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthlySpent = expensesData.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + e.amount, 0);
  
  const monthProgress = day / daysInMonth;
  const budgetPct = budget > 0 ? Math.min(1, monthlySpent / budget) : monthProgress;
  const sandFallen = Math.max(monthProgress, budgetPct);

  const canvas = document.getElementById('hg-canvas');
  const daysEl = document.getElementById('hg-days-label');
  const budgetEl = document.getElementById('hg-budget-label');

  if (daysEl) daysEl.textContent = `${day} of ${daysInMonth} days`;
  if (budgetEl) budgetEl.textContent = budget > 0 ? `${Math.round(budgetPct*100)}% spent` : "No budget set";

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 150, 100);

  // Outline Paths
  const topPath = new Path2D();
  topPath.moveTo(35, 5); topPath.lineTo(115, 5); topPath.lineTo(75, 52); topPath.closePath();
  
  const bottomPath = new Path2D();
  bottomPath.moveTo(35, 95); bottomPath.lineTo(115, 95); bottomPath.lineTo(75, 48); bottomPath.closePath();

  // Draw Sand
  // Top chamber
  const sandTopLevel = 52 - (52 - 5) * (1 - sandFallen); 
  ctx.save();
  ctx.clip(topPath);
  ctx.fillStyle = '#808080';
  ctx.fillRect(35, sandTopLevel, 80, 52 - sandTopLevel);
  // Texture
  ctx.fillStyle = '#606060';
  [[45,45],[70,40],[100,48],[55,30],[85,25],[75,45]].forEach(p => ctx.fillRect(p[0],p[1],1,1));
  ctx.restore();

  // Bottom chamber
  const sandBottomLevel = 95 - (95 - 48) * sandFallen;
  ctx.save();
  ctx.clip(bottomPath);
  ctx.fillStyle = '#606060';
  ctx.fillRect(35, sandBottomLevel, 80, 95 - sandBottomLevel);
  // Texture
  ctx.fillStyle = '#505050';
  [[40,85],[75,90],[110,88],[60,75],[90,80],[70,92]].forEach(p => ctx.fillRect(p[0],p[1],1,1));
  ctx.restore();

  // Falling stream
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(75, 52); ctx.lineTo(75, sandBottomLevel); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(74, 51, 2, 2);

  // Outer frame
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 2;
  ctx.stroke(topPath);
  ctx.stroke(bottomPath);

  // Wooden frame
  ctx.fillStyle = '#505050';
  ctx.fillRect(32, 0, 3, 100);
  ctx.fillRect(115, 0, 3, 100);
  ctx.fillStyle = '#606060';
  ctx.fillRect(30, 0, 90, 4);
  ctx.fillRect(30, 97, 90, 4);
}

let gcState = { angle: 0, direction: 1, intervalId: null };

function initGrandfatherClock() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlySpent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + e.amount, 0);
  
  const budgetPct = budget > 0 ? Math.min(100, (monthlySpent / budget) * 100) : 0;
  const swingSpeed = 0.02 + (budgetPct / 100) * 0.04;

  const canvas = document.getElementById('gc-canvas');
  const timeEl = document.getElementById('gc-time-label');
  const budgetEl = document.getElementById('gc-budget-label');

  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (gcState.intervalId) clearInterval(gcState.intervalId);

  const drawClockFrame = () => {
    // Outer case
    ctx.fillStyle = '#404040';
    ctx.fillRect(45, 0, 60, 110);
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1;
    ctx.strokeRect(47, 2, 56, 106);
    
    // Hood
    ctx.fillStyle = '#505050';
    ctx.fillRect(43, 0, 64, 30);
    ctx.fillStyle = '#606060';
    ctx.fillRect(40, 0, 70, 5);
    
    // Face background
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(75, 20, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#808080';
    ctx.stroke();
    
    // Numerals (Ticks)
    for(let i=0; i<12; i++) {
      const a = (i * Math.PI / 6) - Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(75 + 11*Math.cos(a), 20 + 11*Math.sin(a));
      ctx.lineTo(75 + 13*Math.cos(a), 20 + 13*Math.sin(a));
      ctx.stroke();
    }

    // Pendulum Housing
    ctx.fillStyle = '#000000';
    ctx.fillRect(58, 35, 34, 45);
    ctx.strokeStyle = '#606060';
    ctx.strokeRect(58, 35, 34, 45);
    
    // Base
    ctx.fillStyle = '#505050';
    ctx.fillRect(43, 85, 64, 25);
    // Feet
    ctx.fillRect(43, 108, 10, 2);
    ctx.fillRect(97, 108, 10, 2);
  };

  const drawHands = (t) => {
    const hrs = t.getHours();
    const mins = t.getMinutes();
    const secs = t.getSeconds();

    const cx = 75, cy = 20;

    // Clear face interior
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();

    // Minute Hand
    const mA = ((mins + secs/60) / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 10*Math.cos(mA), cy + 10*Math.sin(mA)); ctx.stroke();

    // Hour Hand
    const hA = ((hrs % 12 + mins/60) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 7*Math.cos(hA), cy + 7*Math.sin(hA)); ctx.stroke();

    // Center Dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, Math.PI*2); ctx.fill();
  };

  const drawPendulum = (angle) => {
    const px = 75, py = 40;
    // Clear housing interior
    ctx.fillStyle = '#000000';
    ctx.fillRect(59, 36, 32, 43);

    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1.5;
    const bx = px + Math.sin(angle) * 30;
    const by = py + Math.cos(angle) * 30;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
    
    ctx.fillStyle = '#808080';
    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI*2); ctx.fill();
  };

  // Initial Draw
  ctx.fillStyle = '#000000';
  ctx.fillRect(0,0,150,110);
  drawClockFrame();

  gcState.intervalId = setInterval(() => {
    const t = new Date();
    if (timeEl) timeEl.textContent = t.toTimeString().split(' ')[0];
    if (budgetEl) budgetEl.textContent = budgetPct.toFixed(0) + "% budget used";

    drawHands(t);
    
    gcState.angle += gcState.direction * swingSpeed;
    if (Math.abs(gcState.angle) > 0.3) gcState.direction *= -1;
    drawPendulum(gcState.angle);
  }, 50)
}

function initTimeCapsule() {
  const capsule = JSON.parse(localStorage.getItem('moneverTimeCapsule'));
  const writeSec = document.getElementById('tc-write-section');
  const sealedSec = document.getElementById('tc-sealed-section');
  
  if (!writeSec || !sealedSec) return;

  if (capsule) {
    writeSec.style.display = 'none';
    sealedSec.style.display = 'block';
    renderTimeCapsule();
  } else {
    writeSec.style.display = 'block';
    sealedSec.style.display = 'none';
  }
}

function renderTimeCapsule() {
  const capsule = JSON.parse(localStorage.getItem('moneverTimeCapsule'));
  if (!capsule) return;

  const openDate = new Date(capsule.openDate);
  const today = new Date();
  const diffTime = openDate - today;
  const daysRemaining = Math.ceil(diffTime / 86400000);

  const sealedDateEl = document.getElementById('tc-sealed-date');
  const countdownEl = document.getElementById('tc-countdown');
  const opensLabelEl = document.getElementById('tc-opens-label');
  const openSec = document.getElementById('tc-open-section');
  const msgDisplayEl = document.getElementById('tc-message-display');
  const resetBtn = document.getElementById('tc-reset-btn');

  if (sealedDateEl) sealedDateEl.textContent = new Date(capsule.sealedDate).toLocaleDateString();
  
  if (daysRemaining > 0) {
    if (countdownEl) countdownEl.textContent = `${daysRemaining} days remaining`;
    if (opensLabelEl) opensLabelEl.textContent = `Opens on ${openDate.toLocaleDateString()}`;
    if (openSec) openSec.style.display = 'none';
    if (resetBtn) resetBtn.textContent = '🗑️ Discard Capsule';
  } else {
    if (countdownEl) countdownEl.textContent = '🎉 OPEN NOW!';
    if (opensLabelEl) opensLabelEl.textContent = '';
    if (openSec) {
      openSec.style.display = 'block';
      if (msgDisplayEl) msgDisplayEl.textContent = capsule.message;
    }
    if (resetBtn) resetBtn.textContent = '✉️ Write New Capsule';
  }
}

function sealTimeCapsule() {
  const input = document.getElementById('tc-message-input');
  if (!input || !input.value.trim()) {
    if (typeof showToast === 'function') showToast('Write a message first.');
    return;
  }

  const today = new Date();
  const openDate = new Date(today);
  openDate.setFullYear(today.getFullYear() + 1);

  const capsule = {
    message: input.value.trim(),
    sealedDate: today.toISOString(),
    openDate: openDate.toISOString()
  };

  localStorage.setItem('moneverTimeCapsule', JSON.stringify(capsule));
  initTimeCapsule();
}

function resetTimeCapsule() {
  localStorage.removeItem('moneverTimeCapsule');
  const input = document.getElementById('tc-message-input');
  if (input) input.value = '';
  initTimeCapsule();
}

function initPixelPortrait() {
  const name = getProfileValue('profName') || "ANONYMOUS";
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  
  let nameCharSum = 0;
  for (let i = 0; i < name.length; i++) {
    nameCharSum += name.charCodeAt(i);
  }
  
  const totalExpenses = Math.floor(expenses.reduce((sum, e) => sum + e.amount, 0));
  const transactionCount = expenses.length;
  const seed = (nameCharSum * 31 + totalExpenses + transactionCount) % 10000;
  
  const canvas = document.getElementById('pp-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const grays = ['#000000', '#404040', '#808080', '#cccccc'];
  
  let s = seed;
  function seededRand() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }
  
  const grid = [];
  for (let r = 0; r < 16; r++) {
    grid[r] = [];
    for (let c = 0; c < 8; c++) {
      const rand = seededRand();
      let colorIdx = 0;
      
      if (r <= 2) { // Hair area
        colorIdx = rand < 0.7 ? 0 : (rand < 0.9 ? 1 : 2);
      } else if (r <= 4) { // Forehead
        colorIdx = rand < 0.2 ? 2 : 3;
      } else if (r <= 11) { // Face / Chin
        colorIdx = rand < 0.1 ? 1 : (rand < 0.3 ? 2 : 3);
      } else { // Shoulders / Body
        colorIdx = rand < 0.3 ? 1 : (rand < 0.7 ? 2 : 3);
      }
      grid[r][c] = grays[colorIdx];
    }
    // Horizontal mirror
    for (let c = 8; c < 16; c++) {
      grid[r][c] = grid[r][15 - c];
    }
  }
  
  // Forced features for face-like structure
  // Eyes at row 5, columns 2-4
  grid[5][3] = '#000000'; grid[5][12] = '#000000'; // Pupils
  grid[5][4] = '#000000'; grid[5][11] = '#000000'; // Pupils
  grid[5][2] = '#cccccc'; grid[5][13] = '#cccccc'; // Whites
  
  // Nose bridge at row 7, columns 3-4
  grid[7][3] = '#808080'; grid[7][12] = '#808080';
  grid[7][4] = '#808080'; grid[7][11] = '#808080';
  
  // Mouth at row 9, columns 2-5
  for (let c = 2; c <= 5; c++) {
    grid[9][c] = '#000000';
    grid[9][15 - c] = '#000000';
  }
  
  // Render grid to 80x80 canvas (5x scale)
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      ctx.fillStyle = grid[r][c];
      ctx.fillRect(c * 5, r * 5, 5, 5);
    }
  }
  
  // UI Updates
  const nameEl = document.getElementById('pp-name');
  if (nameEl) nameEl.textContent = name.toUpperCase();
  
  const seedEl = document.getElementById('pp-seed');
  if (seedEl) seedEl.textContent = "#" + seed.toString().padStart(4, '0');
  
  const personalityEl = document.getElementById('pp-personality');
  if (personalityEl) {
    if (expenses.length > 0) {
      const catTotals = {};
      expenses.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + e.amount);
      let topCat = "";
      let maxAmt = 0;
      Object.entries(catTotals).forEach(([cat, amt]) => {
        if (amt > maxAmt) {
          maxAmt = amt;
          topCat = cat;
        }
      });
      personalityEl.textContent = topCat || "Balanced";
    } else {
      personalityEl.textContent = "Minimalist";
    }
  }
}

let vrState = { angle: 0, rpm: 0, intervalId: null };

function initVinylRecord() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todaySpend = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
  
  const dayMap = {};
  expenses.forEach(e => dayMap[e.date] = (dayMap[e.date] || 0) + e.amount);
  const totalExpenseDays = Object.keys(dayMap).length;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAvg = totalSpent / Math.max(1, totalExpenseDays);
  
  let spendRatio = todaySpend / (dailyAvg || 1);
  spendRatio = Math.max(0, Math.min(3, spendRatio));
  
  let RPM = spendRatio * 33;
  if (todaySpend === 0) RPM = 0;
  RPM = Math.max(0, Math.min(45, RPM));
  
  const rpmLabel = document.getElementById('vr-rpm-label');
  if (rpmLabel) {
    rpmLabel.textContent = RPM > 0 ? RPM.toFixed(1) + " RPM" : "STOPPED";
  }
  
  // Track name based on top category
  const catTotals = {};
  expenses.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + e.amount);
  let topCat = "";
  let maxAmt = 0;
  Object.entries(catTotals).forEach(([cat, amt]) => {
    if (amt > maxAmt) {
      maxAmt = amt;
      topCat = cat;
    }
  });
  
  let trackName = "MISC JAZZ";
  if (topCat) {
    const tc = topCat.toLowerCase();
    if (tc.includes('food') || tc.includes('dining') || tc.includes('eat')) trackName = "FOOD BLUES";
    else if (tc.includes('transport') || tc.includes('travel') || tc.includes('fuel')) trackName = "TRANSPORT JAM";
    else if (tc.includes('shop') || tc.includes('entert') || tc.includes('cloth')) trackName = "SHOPPING ROCK";
    else if (tc.includes('bill') || tc.includes('utilit') || tc.includes('rent') || tc.includes('emi')) trackName = "BILLS CLASSICAL";
  }
  
  const trackLabel = document.getElementById('vr-track-label');
  if (trackLabel) trackLabel.textContent = trackName;
  
  const canvas = document.getElementById('vr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (vrState.intervalId) {
    clearInterval(vrState.intervalId);
    vrState.intervalId = null;
  }
  
  vrState.rpm = RPM;
  const intervalMs = RPM > 0 ? Math.max(16, 1000 / RPM) : 9999;
  
  const tick = () => {
    if (vrState.rpm > 0) {
      vrState.angle += (vrState.rpm / 60) * (2 * Math.PI) * (intervalMs / 1000);
    }
    drawVinylRecord(ctx, vrState.angle);
  };
  
  if (RPM > 0) {
    vrState.intervalId = setInterval(tick, intervalMs);
  } else {
    tick(); // Draw once static
  }
}

function drawVinylRecord(ctx, angle) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 90, 90);
  
  // Outer record edge
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(45, 45, 42, 0, Math.PI * 2);
  ctx.fill();
  
  // Vinyl grooves
  for (let r = 15; r <= 40; r += 2) {
    ctx.beginPath();
    ctx.arc(45, 45, r, 0, Math.PI * 2);
    ctx.strokeStyle = r % 4 === 0 ? '#2a2a2a' : '#222222';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  
  // Label in center
  ctx.fillStyle = '#404040';
  ctx.beginPath();
  ctx.arc(45, 45, 13, 0, Math.PI * 2);
  ctx.fill();
  
  // Rotated label content
  ctx.save();
  ctx.translate(45, 45);
  ctx.rotate(angle);
  
  // Center hole
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Label text
  ctx.fillStyle = '#808080';
  ctx.font = '4px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('MONEVER', 0, -5);
  ctx.fillText('FM', 0, 0);
  ctx.fillText('◆', 0, 5);
  ctx.restore();
  
  // Needle arm
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 10);
  ctx.lineTo(58, 38);
  ctx.stroke();
  
  // Needle head
  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.arc(58, 38, 2, 0, Math.PI * 2);
  ctx.fill();
}

let klState = { angle: 0, intervalId: null };

function initKaleidoscope() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);
  const monthExps = expenses.filter(e => e.date.startsWith(currentMonth));
  
  const catTotals = {};
  monthExps.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + e.amount);
  
  const totalSpend = Object.values(catTotals).reduce((sum, a) => sum + a, 0);
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  
  // Percentages for top 3
  const cat1Pct = totalSpend > 0 ? ((sortedCats[0]?.[1] || 0) / totalSpend) * 100 : 0;
  const cat2Pct = totalSpend > 0 ? ((sortedCats[1]?.[1] || 0) / totalSpend) * 100 : 0;
  const cat3Pct = totalSpend > 0 ? ((sortedCats[2]?.[1] || 0) / totalSpend) * 100 : 0;
  
  const numUniqueCats = sortedCats.length;
  const N = Math.max(3, Math.min(8, numUniqueCats || 3));
  
  const descLabel = document.getElementById('kl-desc-label');
  if (descLabel) {
    descLabel.textContent = `Segments: ${N} · Based on ${numUniqueCats} categories`;
  }
  
  const canvas = document.getElementById('kl-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (klState.intervalId) {
    clearInterval(klState.intervalId);
    klState.intervalId = null;
  }
  
  const r1 = 10 + (cat1Pct / 100) * 30;
  const r2 = r1 + (cat2Pct / 100) * 20;
  const r3 = r2 + (cat3Pct / 100) * 10;
  
  const tick = () => {
    klState.angle += 0.008;
    drawKaleidoscope(ctx, klState.angle, N, r1, r2, r3);
  };
  
  klState.intervalId = setInterval(tick, 50);
  tick();
}

function drawKaleidoscope(ctx, rotAngle, N, r1, r2, r3) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 110, 110);
  
  for (let i = 0; i < N; i++) {
    const rotation = (i / N) * 2 * Math.PI + rotAngle;
    
    ctx.save();
    ctx.translate(55, 55);
    ctx.rotate(rotation);
    
    // Wedge clipping
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 50, 0, (2 * Math.PI) / N);
    ctx.closePath();
    ctx.clip();
    
    // Patterns
    const wedgeAngle = (2 * Math.PI) / N;
    
    // Inner diamond
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r1 * 0.5, r1);
    ctx.lineTo(0, r1 * 2);
    ctx.lineTo(-r1 * 0.5, r1);
    ctx.closePath();
    ctx.fill();
    
    // Mid circle cluster
    const radii = [r1, r2, r3];
    const colors = ['#808080', '#606060', '#aaaaaa'];
    radii.forEach((r, idx) => {
      ctx.fillStyle = colors[idx];
      ctx.beginPath();
      ctx.arc(r * Math.cos(wedgeAngle / 2), r * Math.sin(wedgeAngle / 2), 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Outer triangle
    ctx.fillStyle = '#505050';
    ctx.beginPath();
    ctx.moveTo(r3 * Math.cos(wedgeAngle * 0.2), r3 * Math.sin(wedgeAngle * 0.2));
    ctx.lineTo(r3 * Math.cos(wedgeAngle * 0.5), r3 * Math.sin(wedgeAngle * 0.5));
    ctx.lineTo(r3 * Math.cos(wedgeAngle * 0.8), r3 * Math.sin(wedgeAngle * 0.8));
    ctx.closePath();
    ctx.fill();
    
    // Fine lines
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r3 * Math.cos(wedgeAngle / 2), r3 * Math.sin(wedgeAngle / 2));
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Center join cover
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(55, 55, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Center dot
  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.arc(55, 55, 2, 0, Math.PI * 2);
  ctx.fill();
}

let llState = { blobs: [], intervalId: null, temp: 0 };

function initLavaLamp() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayTotal = expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);
  
  const dayMap = {};
  expenses.forEach(e => dayMap[e.date] = (dayMap[e.date] || 0) + e.amount);
  const totalDays = Object.keys(dayMap).length || 1;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avg = totalSpent / totalDays;
  
  const temp = todayTotal / (avg || 1);
  llState.temp = temp;
  
  const label = document.getElementById('ll-temp-label');
  if (label) {
    if (temp > 1.5) { 
      label.textContent = "OVERHEATING"; 
      label.style.color = "#606060"; 
    } else if (temp > 0.8) { 
      label.textContent = "WARM"; 
      label.style.color = "#444"; 
    } else { 
      label.textContent = "COLD / STABLE"; 
      label.style.color = "#404040"; 
    }
  }
  
  const canvas = document.getElementById('ll-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Initialize blobs based on temperature
  const blobCount = Math.max(3, Math.min(7, Math.floor(temp * 3) + 2));
  llState.blobs = [];
  for (let i = 0; i < blobCount; i++) {
    llState.blobs.push({
      x: 15 + Math.random() * 30,
      y: 20 + Math.random() * 70,
      r: 6 + Math.random() * 10,
      vy: (Math.random() - 0.5) * (0.3 + temp * 0.4),
      phase: Math.random() * Math.PI * 2,
      baseX: 15 + Math.random() * 30
    });
  }
  
  if (llState.intervalId) {
    clearInterval(llState.intervalId);
    llState.intervalId = null;
  }
  
  const tick = () => {
    // Update
    llState.blobs.forEach(b => {
      b.y += b.vy;
      b.phase += 0.03;
      b.x = b.baseX + Math.sin(b.phase) * 5;
      
      // Bounce with slight randomness
      if (b.y < 15 || b.y > 95) {
        b.vy *= -1;
        b.y = Math.max(15, Math.min(95, b.y));
      }
    });
    
    // Draw
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 60, 110);
    
    // Lamp body inner glow
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(5, 10, 50, 90);
    
    llState.blobs.forEach(b => {
      const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#cccccc');
      grad.addColorStop(0.7, '#808080');
      grad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Caps
    ctx.fillStyle = '#808080';
    // Top cap
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.lineTo(50, 0); ctx.lineTo(55, 10); ctx.lineTo(5, 10); ctx.closePath();
    ctx.fill();
    // Bottom cap
    ctx.beginPath();
    ctx.moveTo(5, 100); ctx.lineTo(55, 100); ctx.lineTo(60, 110); ctx.lineTo(0, 110); ctx.closePath();
    ctx.fill();
    
    // Highlight on caps
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(12, 2); ctx.lineTo(48, 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, 102); ctx.lineTo(55, 102); ctx.stroke();
  };
  
  llState.intervalId = setInterval(tick, 40);
  tick();
}

let lcState = { armAngle: 0, armDir: 1, intervalId: null };

function initLuckyCat() {
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const monthSpent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + e.amount, 0);
  
  const budgetPct = budget > 0 ? (monthSpent / budget) * 100 : 0;
  
  let waveSpeed = 0; // 0 = stopped
  let mood = "Happy 😊";
  let speedDesc = "Calm";
  
  if (budget <= 0) {
    waveSpeed = 1.25; // slow if no budget set
  } else if (budgetPct < 60) {
    waveSpeed = 1.25; speedDesc = "Slow & Happy"; mood = "Happy 😊";
  } else if (budgetPct < 85) {
    waveSpeed = 2.5; speedDesc = "Medium"; mood = "Content 🙂";
  } else if (budgetPct <= 100) {
    waveSpeed = 6.6; speedDesc = "Fast (Nervous)"; mood = "Nervous 😰";
  } else {
    waveSpeed = 0; speedDesc = "Stopped"; mood = "Sad 😢";
  }
  
  const moodLabel = document.getElementById('lc-mood-label');
  if (moodLabel) moodLabel.textContent = mood;
  const speedLabel = document.getElementById('lc-wave-speed');
  if (speedLabel) speedLabel.textContent = speedDesc;
  
  const canvas = document.getElementById('lc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (lcState.intervalId) {
    clearInterval(lcState.intervalId);
    lcState.intervalId = null;
  }
  
  const intervalMs = waveSpeed > 0 ? (waveSpeed === 1.25 ? 800 : (waveSpeed === 2.5 ? 400 : 150)) : 0;
  
  const tick = () => {
    if (waveSpeed > 0) {
      lcState.armAngle += lcState.armDir * 0.08;
      if (lcState.armAngle > 0.6 || lcState.armAngle < -0.3) {
        lcState.armDir *= -1;
      }
    } else {
      lcState.armAngle = 0.5; // Sad/Stopped arm position
    }
    drawLuckyCat(ctx, lcState.armAngle, budgetPct > 100);
  };
  
  if (waveSpeed > 0) {
    lcState.intervalId = setInterval(tick, intervalMs / 10); // Smoother animation by dividing interval
  }
  tick();
}

function drawLuckyCat(ctx, armAngle, isSad) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 80, 95);
  
  // Base
  ctx.fillStyle = '#404040';
  ctx.fillRect(10, 82, 60, 10);
  ctx.strokeStyle = '#606060';
  ctx.strokeRect(10, 82, 60, 10);
  ctx.beginPath(); ctx.moveTo(35, 82); ctx.lineTo(45, 82); ctx.stroke(); // Coin slot
  
  // Tail
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(55, 75);
  ctx.bezierCurveTo(75, 75, 75, 50, 60, 45);
  ctx.stroke();
  
  // Body
  ctx.fillStyle = '#808080';
  ctx.beginPath();
  ctx.ellipse(40, 68, 20, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Bib
  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.ellipse(40, 70, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = '#808080';
  ctx.beginPath();
  ctx.arc(40, 42, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears
  const drawEar = (x1, y1, x2, y2, x3, y3) => {
    ctx.fillStyle = '#808080';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#606060';
    ctx.beginPath(); ctx.moveTo(x1 + (x2 - x1) * 0.2, y1 + (y2 - y1) * 0.2);
    ctx.lineTo(x2, y2 + 2);
    ctx.lineTo(x3 - (x3 - x2) * 0.2, y3 + (y3 - y2) * 0.2);
    ctx.closePath(); ctx.fill();
  };
  drawEar(22, 28, 28, 20, 34, 30); // Left
  drawEar(58, 28, 52, 20, 46, 30); // Right
  
  // Face
  ctx.fillStyle = '#000000';
  ctx.beginPath(); ctx.arc(33, 40, 3, 0, Math.PI * 2); ctx.fill(); // Left eye
  ctx.beginPath(); ctx.arc(47, 40, 3, 0, Math.PI * 2); ctx.fill(); // Right eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(34, 39, 1, 0, Math.PI * 2); ctx.fill(); // Highlights
  ctx.beginPath(); ctx.arc(48, 39, 1, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = '#606060';
  ctx.beginPath(); ctx.moveTo(40, 46); ctx.lineTo(38, 44); ctx.lineTo(42, 44); ctx.closePath(); ctx.fill(); // Nose
  
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(35, 45 + i * 2); ctx.lineTo(25, 44 + i * 4); ctx.stroke(); // Left whiskers
    ctx.beginPath(); ctx.moveTo(45, 45 + i * 2); ctx.lineTo(55, 44 + i * 4); ctx.stroke(); // Right whiskers
  }
  
  // Mouth
  ctx.beginPath();
  if (isSad) {
    ctx.moveTo(36, 52); ctx.quadraticCurveTo(40, 48, 44, 52);
  } else {
    ctx.moveTo(36, 50); ctx.quadraticCurveTo(40, 54, 44, 50);
  }
  ctx.stroke();
  
  // Right Paw (Stationary)
  ctx.fillStyle = '#808080';
  ctx.beginPath();
  ctx.ellipse(55, 80, 8, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Waving Arm (Left)
  ctx.save();
  ctx.translate(25, 60);
  ctx.rotate(armAngle);
  ctx.fillStyle = '#808080';
  ctx.fillRect(-4, -22, 8, 22);
  ctx.beginPath();
  ctx.ellipse(0, -22, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Coin
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(40, 70, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(getCurrency(), 40, 73);
}

function initPiggyBank() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const monthSpent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + e.amount, 0);
  
  const monthlySavings = income - monthSpent;
  let fillPct = 50;
  if (income > 0) {
    fillPct = Math.max(0, Math.min(100, (monthlySavings / income) * 100));
  }
  
  const tamaData = JSON.parse(localStorage.getItem('moneverTamaData') || '{}');
  const monthsOverBudget = tamaData.monthsOverBudget || 0;
  const isBroken = monthsOverBudget >= 3;
  
  const fillLabel = document.getElementById('pb-fill-label');
  if (fillLabel) fillLabel.textContent = fillPct.toFixed(0) + "% full";
  const amountLabel = document.getElementById('pb-amount-label');
  if (amountLabel) amountLabel.textContent = (monthlySavings >= 0 ? "" : "-") + getCurrency() + formatMoney(Math.abs(monthlySavings)) + " saved";
  const barEl = document.getElementById('pb-fill-bar');
  if (barEl) barEl.style.width = fillPct + "%";
  
  const canvas = document.getElementById('pb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  drawPiggyBank(ctx, fillPct, isBroken);
}

function drawPiggyBank(ctx, fillPct, isBroken) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 120, 90);
  
  // Body
  ctx.fillStyle = '#707070';
  ctx.beginPath();
  ctx.ellipse(58, 52, 32, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Fill indicator
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(58, 52, 32, 26, 0, 0, Math.PI * 2);
  ctx.clip();
  let fillHeight = 52 * (fillPct / 100);
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(26, 78 - fillHeight, 64, fillHeight);
  // Texture lines
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 0.5;
  for (let y = 78 - fillHeight; y <= 78; y += 4) {
    ctx.beginPath(); ctx.moveTo(26, y); ctx.lineTo(90, y); ctx.stroke();
  }
  ctx.restore();
  
  // Head
  ctx.fillStyle = '#707070';
  ctx.beginPath();
  ctx.arc(84, 46, 14, 0, Math.PI * 2);
  ctx.fill();
  
  // Snout
  ctx.fillStyle = '#909090';
  ctx.beginPath();
  ctx.ellipse(92, 50, 6, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#505050';
  ctx.beginPath(); ctx.arc(90, 50, 1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(94, 51, 1, 0, Math.PI * 2); ctx.fill();
  
  // Eye
  ctx.fillStyle = '#000000';
  ctx.beginPath(); ctx.arc(87, 42, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(88, 41, 0.5, 0, Math.PI * 2); ctx.fill();
  
  // Ear
  ctx.fillStyle = '#606060';
  ctx.beginPath();
  ctx.ellipse(80, 36, 5, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs
  ctx.fillStyle = '#707070';
  [35, 45, 62, 72].forEach(x => {
    ctx.fillRect(x, 74, 8, 8);
    ctx.beginPath(); ctx.arc(x + 4, 82, 4, 0, Math.PI); ctx.fill();
  });
  
  // Tail
  ctx.strokeStyle = '#707070';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 50);
  ctx.bezierCurveTo(20, 50, 20, 40, 25, 40);
  ctx.bezierCurveTo(30, 40, 30, 45, 28, 45);
  ctx.stroke();
  
  // Slot
  ctx.fillStyle = '#000000';
  ctx.fillRect(50, 28, 12, 2);
  
  // Broken state
  if (isBroken) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    // Cracks
    const drawCrack = (x, y, ang, len) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      let curX = x, curY = y;
      for (let i = 0; i < 3; i++) {
        curX += Math.cos(ang) * (len / 3) + (Math.random() - 0.5) * 5;
        curY += Math.sin(ang) * (len / 3) + (Math.random() - 0.5) * 5;
        ctx.lineTo(curX, curY);
      }
      ctx.stroke();
    };
    drawCrack(58, 52, 0.5, 15);
    drawCrack(58, 52, 2.1, 12);
    drawCrack(58, 52, 4.5, 18);
    
    // Chips
    ctx.fillStyle = '#606060';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(50 + i * 10, 60 + i * 5);
      ctx.lineTo(54 + i * 10, 58 + i * 5);
      ctx.lineTo(52 + i * 10, 62 + i * 5);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Sparkles
  if (fillPct >= 100) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    const pos = [[20, 20], [100, 20], [10, 50], [110, 50], [30, 80], [90, 80]];
    pos.forEach(p => {
      ctx.beginPath(); ctx.moveTo(p[0] - 2, p[1]); ctx.lineTo(p[0] + 2, p[1]); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p[0], p[1] - 2); ctx.lineTo(p[0], p[1] + 2); ctx.stroke();
    });
  }
}

function initWallOfFame() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const goals = JSON.parse(localStorage.getItem('financialGoals') || '[]');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const profile = JSON.parse(localStorage.getItem('moneverProfile') || '{}');
  const notes = JSON.parse(localStorage.getItem('quickNotes') || '[]');

  let income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  if (income === 0) income = parseFloat(profile.profInHand || '0');

  const now = new Date();
  const currentMonthPrefix = now.toISOString().substring(0, 7);
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const currentSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const uniqueCats = new Set(expenses.map(e => e.category));

  const getStreak = (dates) => {
    if (dates.length === 0) return 0;
    const sorted = [...new Set(dates)].sort();
    let max = 0, current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const d1 = new Date(sorted[i - 1]);
      const d2 = new Date(sorted[i]);
      if ((d2 - d1) / (1000 * 60 * 60 * 24) === 1) current++;
      else { max = Math.max(max, current); current = 1; }
    }
    return Math.max(max, current);
  };
  const streak = getStreak(expenses.map(e => e.date));

  const achs = [
    { name: "Step", check: () => expenses.length >= 1 },
    { name: "Ten", check: () => expenses.length >= 10 },
    { name: "Fifty", check: () => expenses.length >= 50 },
    { name: "Boss", check: () => budget > 0 },
    { name: "Means", check: () => budget > 0 && currentSpent < budget },
    { name: "Dream", check: () => goals.length >= 1 },
    { name: "Tamer", check: () => emis.length >= 1 },
    { name: "Fire", check: () => streak >= 7 },
    { name: "Five", check: () => uniqueCats.size >= 5 },
    { name: "ID", check: () => profile.profName && profile.profName !== "" },
    { name: "Black", check: () => income > 0 && currentSpent < income },
    { name: "Noted", check: () => notes.length >= 1 }
  ];

  const unlockedCount = achs.filter(a => a.check()).length;
  const label = document.getElementById('wf-count-label');
  if (label) label.textContent = unlockedCount + " of 12 milestones achieved";

  const canvas = document.getElementById('wf-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  drawWallOfFame(ctx, achs);
}

function drawWallOfFame(ctx, achs) {
  // Wall texture
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 150, 90);
  
  ctx.strokeStyle = '#252525';
  ctx.lineWidth = 1;
  // Bricks
  for (let y = 6; y <= 84; y += 12) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(150, y); ctx.stroke();
    const offset = (y / 12) % 2 === 0 ? 0 : 15;
    for (let x = offset; x <= 150; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 12); ctx.stroke();
    }
  }

  const framePos = [
    { x: 20, y: 15 }, { x: 62, y: 15 }, { x: 104, y: 15 },
    { x: 20, y: 52 }, { x: 62, y: 52 }, { x: 104, y: 52 }
  ];

  framePos.forEach((pos, i) => {
    const ach = achs[i];
    if (!ach) return;
    const isUnlocked = ach.check();
    const fx = pos.x, fy = pos.y;
    
    // Hanging wire
    ctx.strokeStyle = isUnlocked ? '#606060' : '#252525';
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 14, fy - 6);
    ctx.lineTo(fx + 28, fy);
    ctx.stroke();

    if (isUnlocked) {
      // Ornate frame
      ctx.fillStyle = '#808080';
      ctx.fillRect(fx, fy, 28, 28);
      ctx.fillStyle = '#606060';
      ctx.fillRect(fx + 2, fy + 2, 24, 24);
      
      // Corner ornaments
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(fx, fy, 3, 3);
      ctx.fillRect(fx + 25, fy, 3, 3);
      ctx.fillRect(fx, fy + 25, 3, 3);
      ctx.fillRect(fx + 25, fy + 25, 3, 3);
      
      // Inside
      ctx.fillStyle = '#303030';
      ctx.fillRect(fx + 4, fy + 4, 20, 20);
      
      // Achievement Icon
      ctx.strokeStyle = '#aaaaaa';
      ctx.fillStyle = '#aaaaaa';
      ctx.lineWidth = 1;
      const ix = fx + 10, iy = fy + 10;
      
      if (i === 0) { // Pencil
        ctx.beginPath(); ctx.moveTo(ix, iy + 8); ctx.lineTo(ix + 8, iy); ctx.stroke();
      } else if (i === 1) { // Ten
        for(let j=0; j<3; j++) ctx.fillRect(ix, iy + j*3, 8, 1);
      } else if (i === 2) { // Fifty
        ctx.strokeRect(ix, iy, 8, 8); ctx.fillRect(ix + 2, iy, 1, 8);
      } else if (i === 3) { // Boss
        ctx.strokeRect(ix, iy + 2, 8, 5); ctx.fillRect(ix + 6, iy + 4, 2, 1);
      } else if (i === 4) { // Means
        ctx.beginPath(); ctx.moveTo(ix, iy+4); ctx.lineTo(ix+3, iy+7); ctx.lineTo(ix+8, iy); ctx.stroke();
      } else if (i === 5) { // Dream
        ctx.fillRect(ix, iy, 1, 8);
        ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix+7, iy+3); ctx.lineTo(ix, iy+6); ctx.fill();
      }
      
      // Nameplate
      ctx.fillStyle = '#404040';
      ctx.fillRect(fx + 2, fy + 29, 24, 5);
      ctx.fillStyle = '#cccccc';
      ctx.font = '4px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(ach.name.substring(0, 5).toUpperCase(), fx + 14, fy + 33);
      
    } else {
      // Locked
      ctx.fillStyle = '#303030';
      ctx.fillRect(fx, fy, 28, 28);
      ctx.fillStyle = '#111111';
      ctx.fillRect(fx + 4, fy + 4, 20, 20);
      
      // Padlock
      ctx.fillStyle = '#404040';
      ctx.fillRect(fx + 11, fy + 13, 6, 4);
      ctx.strokeStyle = '#404040';
      ctx.beginPath(); ctx.arc(fx + 14, fy + 13, 3, Math.PI, 0); ctx.stroke();
    }
  });
}

let bhState = { rotation: 0, intervalId: null };

function initBlackHole() {
  const people = JSON.parse(localStorage.getItem('people') || '[]');
  const totalDebt = people.filter(p => p.type === 'borrowed' && p.status === 'open').reduce((sum, p) => sum + p.amount, 0);
  
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const monthSpent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((sum, e) => sum + e.amount, 0);
  
  const overspend = budget > 0 ? Math.max(0, monthSpent - budget) : 0;
  const totalNegativeForce = totalDebt + overspend;
  
  const bhRadius = 8 + Math.min(totalNegativeForce / 10000 * 25, 35);
  
  const sizeLabel = document.getElementById('bh-size-label');
  if (sizeLabel) sizeLabel.textContent = totalDebt === 0 ? "No debt" : "Debt: " + getCurrency() + formatMoney(totalDebt);
  const debtLabel = document.getElementById('bh-debt-label');
  if (debtLabel) debtLabel.textContent = "Radius: " + bhRadius.toFixed(0) + "px";
  
  const canvas = document.getElementById('bh-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (bhState.intervalId) {
    clearInterval(bhState.intervalId);
    bhState.intervalId = null;
  }
  
  const tick = () => {
    bhState.rotation += 0.01;
    drawBlackHole(ctx, bhState.rotation, bhRadius);
  };
  
  bhState.intervalId = setInterval(tick, 50);
  tick();
}

function drawBlackHole(ctx, rotation, bhRadius) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 120, 100);
  
  const cx = 60, cy = 50;
  
  // Accretion disk
  for (let i = 0; i < 8; i++) {
    let diskR = bhRadius + 5 + i * 3;
    let tiltAngle = rotation + i * 0.05;
    ctx.beginPath();
    ctx.ellipse(cx, cy, diskR, diskR * 0.15, tiltAngle, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${60 + i * 10}, ${60 + i * 10}, ${60 + i * 10}, ${0.8 - i * 0.08})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  
  // Distortion lines (gravitational lensing)
  if (bhRadius > 25) {
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI / 2) + rotation;
      const startX = cx + Math.cos(ang) * 50;
      const startY = cy + Math.sin(ang) * 50;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cx + Math.cos(ang) * 30, cy + Math.sin(ang) * 30, cx + Math.cos(ang + 0.5) * (bhRadius + 2), cy + Math.sin(ang + 0.5) * (bhRadius + 2));
      ctx.stroke();
    }
  }
  
  // Event Horizon
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, bhRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Lensing glow
  ctx.strokeStyle = 'rgba(180, 180, 180, 0.3)';
  ctx.beginPath();
  ctx.arc(cx, cy, bhRadius + 2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Sucking matter
  for (let i = 0; i < 6; i++) {
    const ang = i * (Math.PI / 3) + rotation * 5;
    const dist = bhRadius + 15 + Math.sin(rotation + i) * 10;
    const dotX = cx + Math.cos(ang) * dist;
    const dotY = cy + Math.sin(ang) * dist;
    const size = Math.max(1, (dist - bhRadius) / 10);
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(dotX, dotY, size, size);
  }
  
  // Zero debt indicator
  if (bhRadius <= 8.5) {
    ctx.fillStyle = '#404040';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('✓', cx, cy + 3);
  }
}

let pnState = { balls: [], score: 0, intervalId: null, bumperHits: {} };

function initPinball() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const monthExps = expenses.filter(e => e.date.startsWith(monthStr));
  
  pnState.score = Math.floor(monthExps.reduce((sum, e) => sum + e.amount, 0));
  pnState.balls = [];
  
  const scoreLabel = document.getElementById('pn-score-label');
  if (scoreLabel) scoreLabel.textContent = pnState.score;
  const ballsLabel = document.getElementById('pn-balls-label');
  if (ballsLabel) ballsLabel.textContent = monthExps.length + " expenses this month";
  
  const canvas = document.getElementById('pn-canvas');
  if (!canvas) return;
  
  if (pnState.intervalId) {
    clearInterval(pnState.intervalId);
    pnState.intervalId = null;
  }
  
  // Launch initial ball
  pinballLaunch();
}

function pinballLaunch() {
  const canvas = document.getElementById('pn-canvas');
  if (!canvas) return;
  
  pnState.balls.push({
    x: 82, y: 70,
    vx: -1.5 + Math.random() * 1,
    vy: -5 - Math.random() * 2,
    active: true
  });
  
  if (!pnState.intervalId) {
    pnState.intervalId = setInterval(() => {
      updatePinball();
      const ctx = canvas.getContext('2d');
      drawPinball(ctx);
      
      if (pnState.balls.filter(b => b.active).length === 0) {
        clearInterval(pnState.intervalId);
        pnState.intervalId = null;
      }
    }, 33);
  }
}

function updatePinball() {
  const bumpers = [{x:30,y:30}, {x:60,y:30}, {x:45,y:50}];
  
  pnState.balls.forEach(b => {
    if (!b.active) return;
    
    // Physics
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.2; // gravity
    
    // Wall bounce
    if (b.x < 9 || b.x > 81) {
      b.vx *= -0.8;
      b.x = b.x < 9 ? 9 : 81;
    }
    if (b.y < 9) {
      b.vy *= -0.8;
      b.y = 9;
    }
    
    // Bumper collision
    bumpers.forEach((bp, i) => {
      const dx = b.x - bp.x;
      const dy = b.y - bp.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 11) {
        // Reflect
        const angle = Math.atan2(dy, dx);
        const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy) + 0.5;
        b.vx = Math.cos(angle) * speed;
        b.vy = Math.sin(angle) * speed;
        pnState.bumperHits[i] = Date.now();
      }
    });
    
    // Drain
    if (b.y > 95) b.active = false;
  });
}

function drawPinball(ctx) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 90, 95);
  
  // Table outline
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 2;
  ctx.strokeRect(5, 5, 80, 90);
  
  // Bumpers
  const bumpers = [{x:30,y:30}, {x:60,y:30}, {x:45,y:50}];
  bumpers.forEach((bp, i) => {
    const isHit = pnState.bumperHits[i] && (Date.now() - pnState.bumperHits[i] < 200);
    ctx.fillStyle = isHit ? '#aaaaaa' : '#404040';
    ctx.beginPath(); ctx.arc(bp.x, bp.y, 7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  // Flippers (static at rest)
  const drawFlipper = (x, y, ang) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, -2, 20, 4);
    ctx.restore();
  };
  drawFlipper(20, 82, 0.5); // Left
  drawFlipper(70, 82, Math.PI - 0.5); // Right
  
  // Slingshots
  ctx.fillStyle = '#303030';
  ctx.beginPath(); ctx.moveTo(10, 60); ctx.lineTo(15, 75); ctx.lineTo(10, 75); ctx.fill();
  ctx.beginPath(); ctx.moveTo(80, 60); ctx.lineTo(75, 75); ctx.lineTo(80, 75); ctx.fill();
  
  // Score on table
  ctx.fillStyle = '#222222';
  ctx.font = '12px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(pnState.score, 45, 20);
  
  // Balls
  pnState.balls.forEach(b => {
    if (!b.active) return;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill();
    // Shine
    ctx.fillStyle = '#cccccc';
    ctx.beginPath(); ctx.arc(b.x-1, b.y-1, 1, 0, Math.PI*2); ctx.fill();
  });
}

const financialFortunes = [
  "The coin you save today becomes the freedom you spend tomorrow.",
  "Beware the small expense. A small leak sinks a great ship.",
  "Your greatest investment is the one you make in your future self.",
  "One who spends before earning will soon earn less than they spend.",
  "The budget you make in peace prepares you for financial storms.",
  "Discipline in small things leads to abundance in large things.",
  "The best time to start saving was yesterday. The second best time is now.",
  "Wealth is not about having more. It is about needing less.",
  "Patience is the gardener that grows the tree of compound interest.",
  "Financial peace is not the acquisition of stuff. It's learning to live on less.",
  "A wise person carries their budget in their head, not just their pocket.",
  "The goal is not to look rich, but to be wealthy in spirit and means.",
  "Do not save what is left after spending; spend what is left after saving.",
  "Interest is the price you pay for not being able to wait.",
  "An empty pocket is a heavy burden, but a full heart is light.",
  "He who buys what he does not need, steals from himself.",
  "Your net worth is not your self-worth, but it provides peace of mind.",
  "The road to wealth is paved with consistent, tiny steps.",
  "A budget is telling your money where to go instead of wondering where it went.",
  "Fortune favors the prepared mind and the disciplined wallet.",
  "Contentment is a natural wealth; luxury is an artificial poverty.",
  "The simplest way to double your money is to fold it and put it in your pocket.",
  "Frugality is the daughter of prudence and the sister of temperance.",
  "Money is a great servant but a bad master.",
  "He who is content with what he has is truly rich.",
  "Live like no one else today, so you can live like no one else tomorrow.",
  "Opportunities are often disguised as hard work and savings.",
  "The richest man is not he who has the most, but he who needs the least.",
  "Investing in knowledge always pays the best interest.",
  "A good reputation is more valuable than money, but money helps protect it."
];

function initFortuneCookie() {
  const data = JSON.parse(localStorage.getItem('moneverFortuneCookie') || '{}');
  const today = new Date().toDateString();
  
  const closedState = document.getElementById('fc-closed-state');
  const openState = document.getElementById('fc-open-state');
  const dateLabel = document.getElementById('fc-date-label');
  const canvas = document.getElementById('fc-canvas');
  
  if (dateLabel) dateLabel.textContent = "Today: " + new Date().toLocaleDateString();

  if (data.date === today && data.cracked) {
    if (closedState) closedState.style.display = 'none';
    if (openState) openState.style.display = 'block';
    const textEl = document.getElementById('fc-fortune-text');
    const numbersEl = document.getElementById('fc-lucky-numbers');
    if (textEl) textEl.textContent = data.fortune;
    if (numbersEl) numbersEl.textContent = "Lucky: " + data.luckyNumbers.join(" · ");
  } else {
    if (closedState) closedState.style.display = 'block';
    if (openState) openState.style.display = 'none';
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawFortuneCookie(ctx, false);
    }
  }
}

function crackFortuneCookie() {
  const canvas = document.getElementById('fc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Animate crack
  drawFortuneCookie(ctx, true);
  
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const today = now.toDateString();
  
  const fortuneIdx = (day + month) % 30;
  const fortune = financialFortunes[fortuneIdx];
  
  // Generate 6 lucky numbers between 1-49
  const luckyNumbers = [];
  let seed = day * 100 + month;
  for (let i = 0; i < 6; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    luckyNumbers.push(Math.floor((seed / 233280) * 49) + 1);
  }
  
  const data = {
    date: today,
    fortune: fortune,
    luckyNumbers: luckyNumbers,
    cracked: true
  };
  
  localStorage.setItem('moneverFortuneCookie', JSON.stringify(data));
  
  setTimeout(() => {
    initFortuneCookie();
  }, 300);
}

function resetFortuneCookie() {
  localStorage.removeItem('moneverFortuneCookie');
  initFortuneCookie();
  if (typeof showToast === 'function') showToast("Come back tomorrow for a new fortune.");
}

function drawFortuneCookie(ctx, cracked) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 80, 65);
  
  const cx = 40, cy = 35;
  
  const drawHalf = (dir) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dir, 1);
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.quadraticCurveTo(-22, -10, -24, 3);
    ctx.quadraticCurveTo(-20, 17, 0, 13);
    ctx.lineTo(0, -13);
    ctx.closePath();
    ctx.fill();
    
    // Surface detail
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-5 - i * 5, -8 + i * 2);
      ctx.quadraticCurveTo(-15 - i * 2, 0, -5 - i * 5, 8 - i * 2);
      ctx.stroke();
    }
    ctx.restore();
  };
  
  drawHalf(1);  // Left
  drawHalf(-1); // Right
  
  // Fold line
  ctx.strokeStyle = '#606060';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 13);
  ctx.quadraticCurveTo(cx - 4, cy, cx, cy + 13);
  ctx.stroke();
  
  if (cracked) {
    // Crack lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 13);
    ctx.lineTo(cx - 8, cy - 23);
    ctx.moveTo(cx, cy - 13);
    ctx.lineTo(cx + 10, cy - 25);
    ctx.stroke();
    
    // Slip of paper
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 4, cy - 27, 8, 6);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx - 4, cy - 27, 8, 6);
  }
}

let fbState = { wingAngle: 0, wingDir: 1, intervalId: null };

function initFinancialButterfly() {
  const corpus = parseFloat(getProfileValue('profCorpus') || '0');
  const totalSaved = corpus;
  
  let stage = 1;
  let stageName = "Egg";
  let nextThreshold = 1000;
  let prevThreshold = 0;
  
  if (totalSaved >= 500000) {
    stage = 5; stageName = "Monarch"; nextThreshold = totalSaved; prevThreshold = 500000;
  } else if (totalSaved >= 50000) {
    stage = 4; stageName = "Butterfly"; nextThreshold = 500000; prevThreshold = 50000;
  } else if (totalSaved >= 10000) {
    stage = 3; stageName = "Chrysalis"; nextThreshold = 50000; prevThreshold = 10000;
  } else if (totalSaved >= 1000) {
    stage = 2; stageName = "Caterpillar"; nextThreshold = 10000; prevThreshold = 1000;
  }
  
  let stagePct = 100;
  if (stage < 5) {
    stagePct = Math.min(100, ((totalSaved - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
  }
  
  const stageLabel = document.getElementById('fb-stage-label');
  if (stageLabel) stageLabel.textContent = stageName + "  Stage " + stage + " of 5";
  const progressLabel = document.getElementById('fb-progress-label');
  if (progressLabel) progressLabel.textContent = getCurrency() + formatMoney(totalSaved) + " saved";
  const nextLabel = document.getElementById('fb-next-label');
  if (nextLabel) nextLabel.textContent = stage < 5 ? "Next: " + getCurrency() + formatMoney(nextThreshold) : "Max stage!";
  const barEl = document.getElementById('fb-stage-bar');
  if (barEl) barEl.style.width = stagePct + "%";
  
  const canvas = document.getElementById('fb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (fbState.intervalId) {
    clearInterval(fbState.intervalId);
    fbState.intervalId = null;
  }
  
  const tick = () => {
    if (stage >= 4) {
      fbState.wingAngle += fbState.wingDir * 0.12;
      if (Math.abs(fbState.wingAngle) > 0.8) fbState.wingDir *= -1;
    }
    drawButterfly(ctx, fbState.wingAngle, stage);
  };
  
  if (stage >= 4) {
    fbState.intervalId = setInterval(tick, 60);
  }
  tick();
}

function drawButterfly(ctx, wingAngle, stage) {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 130, 85);
  
  const cx = 65, cy = 45;
  
  // Branch for stages 1-3
  if (stage <= 3) {
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(20, 70); ctx.lineTo(110, 70); ctx.stroke();
    // Texture
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;
    for (let x = 30; x < 100; x += 15) {
      ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x + 5, 68); ctx.stroke();
    }
  }
  
  if (stage === 1) { // Egg
    ctx.fillStyle = '#606060';
    ctx.beginPath(); ctx.ellipse(cx, 70, 12, 4, 0, 0, Math.PI * 2); ctx.fill(); // leaf
    ctx.fillStyle = '#808080';
    ctx.beginPath(); ctx.ellipse(cx, 66, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#707070';
    ctx.beginPath(); ctx.ellipse(cx, 66, 3, 5, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (stage === 2) { // Caterpillar
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#808080';
      const x = 35 + i * 11;
      const r = i === 5 ? 6 : 5;
      ctx.beginPath(); ctx.arc(x, 66, r, 0, Math.PI * 2); ctx.fill();
      // Legs
      ctx.strokeStyle = '#606060';
      ctx.beginPath(); ctx.moveTo(x - 2, 71); ctx.lineTo(x - 2, 75); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 2, 71); ctx.lineTo(x + 2, 75); ctx.stroke();
      if (i === 5) { // Head details
        ctx.strokeStyle = '#aaaaaa';
        ctx.beginPath(); ctx.moveTo(x - 2, 60); ctx.quadraticCurveTo(x - 5, 55, x - 3, 52); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 2, 60); ctx.quadraticCurveTo(x + 5, 55, x + 3, 52); ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 1, 64, 1.5, 1.5);
        ctx.fillRect(x + 3, 64, 1.5, 1.5);
      }
    }
  } else if (stage === 3) { // Chrysalis
    ctx.strokeStyle = '#808080';
    ctx.beginPath(); ctx.moveTo(cx, 58); ctx.lineTo(cx, 70); ctx.stroke();
    ctx.fillStyle = '#505050';
    ctx.beginPath();
    ctx.moveTo(cx, 70);
    ctx.bezierCurveTo(cx + 13, 70, cx + 15, 88, cx, 90);
    ctx.bezierCurveTo(cx - 15, 88, cx - 13, 70, cx, 70);
    ctx.fill();
    ctx.strokeStyle = '#666666';
    ctx.beginPath(); ctx.moveTo(cx - 8, 78); ctx.lineTo(cx + 8, 78); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, 83); ctx.lineTo(cx + 10, 83); ctx.stroke();
  } else { // Butterfly / Monarch
    const scale = stage === 5 ? 1.3 : 1.0;
    
    // Trailing lines for Monarch
    if (stage === 5) {
      ctx.strokeStyle = '#303030';
      ctx.beginPath(); ctx.moveTo(cx - 30, cy - 10); ctx.quadraticCurveTo(cx - 50, cy, cx - 60, cy + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 25, cy); ctx.quadraticCurveTo(cx - 45, cy + 10, cx - 55, cy + 20); ctx.stroke();
      // Sparkles
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<3; i++) ctx.fillRect(cx + 40 + i*10, cy - 20 + i*15, 1, 1);
    }

    const drawWings = (dir) => {
      ctx.save();
      ctx.translate(cx, cy - 3);
      ctx.scale(dir * Math.cos(wingAngle), 1);
      
      // Upper Wing
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(15 * scale, -5 * scale, 35 * scale, -20 * scale, 30 * scale, -10 * scale);
      ctx.bezierCurveTo(40 * scale, 5 * scale, 25 * scale, 20 * scale, 0, 15 * scale);
      ctx.fill();
      
      // Pattern
      ctx.strokeStyle = '#606060';
      ctx.beginPath(); ctx.ellipse(15 * scale, 0, 8 * scale, 5 * scale, 0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath(); ctx.arc(28 * scale, -5 * scale, 2 * scale, 0, Math.PI * 2); ctx.fill();
      
      // Lower Wing
      ctx.beginPath();
      ctx.moveTo(0, 12 * scale);
      ctx.bezierCurveTo(20 * scale, 10 * scale, 30 * scale, 25 * scale, 20 * scale, 30 * scale);
      ctx.bezierCurveTo(10 * scale, 35 * scale, 0, 30 * scale, 0, 20 * scale);
      ctx.fill();
      
      ctx.restore();
    };
    
    drawWings(1);
    drawWings(-1);
    
    // Body
    ctx.fillStyle = '#606060';
    ctx.beginPath(); ctx.ellipse(cx, cy, 3 * scale, 10 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy - 12 * scale, 3 * scale, 0, Math.PI * 2); ctx.fill();
    // Antennae
    ctx.strokeStyle = '#808080';
    ctx.beginPath(); ctx.moveTo(cx - 1, cy - 14 * scale); ctx.lineTo(cx - 6 * scale, cy - 22 * scale); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 1, cy - 14 * scale); ctx.lineTo(cx + 6 * scale, cy - 22 * scale); ctx.stroke();
  }
}

// ════════════════════════════════════════════════════════════════════════════
// NEW FINANCIAL WIDGETS
// ════════════════════════════════════════════════════════════════════════════

function initBurnRateClock() {
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const hourOfMonth = (dayOfMonth - 1) * 24 + now.getHours() + 1;
  const totalHoursInMonth = daysInMonth * 24;

  const perHour = hourOfMonth > 0 ? spent / hourOfMonth : 0;
  const perDay = dayOfMonth > 0 ? spent / dayOfMonth : 0;

  const hourEl = document.getElementById('brc-hour');
  const dayEl = document.getElementById('brc-day');
  if (hourEl) hourEl.textContent = getCurrency() + formatMoney(Math.round(perHour));
  if (dayEl) dayEl.textContent = getCurrency() + formatMoney(Math.round(perDay));

  const canvas = document.getElementById('brc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 110, H = 80;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Speedometer arc
  const cx = W / 2, cy = H - 8;
  const r = 55;
  const startAng = Math.PI, endAng = 0;
  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0, false);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Filled arc based on spend pct
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const fillAng = Math.PI + pct * Math.PI;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, fillAng, false);
  const shade = pct > 0.85 ? '#ffffff' : (pct > 0.6 ? '#aaaaaa' : '#606060');
  ctx.strokeStyle = shade;
  ctx.lineWidth = 8;
  ctx.stroke();

  // Tick marks
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    const inner = i % 5 === 0 ? r - 14 : r - 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10));
    ctx.lineTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.stroke();
  }

  // Needle
  const needleAng = Math.PI + pct * Math.PI;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleAng) * (r - 18), cy + Math.sin(needleAng) * (r - 18));
  ctx.stroke();

  // Center pivot
  ctx.fillStyle = '#808080';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();

  // Percent label
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(pct * 100) + '%', cx, cy - 20);
}

function initPaydayCountdown() {
  const now = new Date();
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);

  // Assume payday = 1st of next month
  const nextPayday = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysLeft = Math.max(0, Math.ceil((nextPayday - now) / (1000 * 60 * 60 * 24)));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = daysInMonth - daysLeft;
  const monthProgress = Math.min(100, Math.round((daysPassed / daysInMonth) * 100));

  const budgetLeft = Math.max(0, budget - spent);
  const perDayLeft = daysLeft > 0 ? budgetLeft / daysLeft : 0;

  const daysEl = document.getElementById('pdc-days');
  const barEl = document.getElementById('pdc-bar');
  const budgetLeftEl = document.getElementById('pdc-budget-left');
  const perDayEl = document.getElementById('pdc-per-day');

  if (daysEl) daysEl.textContent = daysLeft;
  if (barEl) barEl.style.width = monthProgress + '%';
  if (budgetLeftEl) budgetLeftEl.textContent = budget > 0 ? getCurrency() + formatMoney(Math.round(budgetLeft)) : '';
  if (perDayEl) perDayEl.textContent = budget > 0 ? getCurrency() + formatMoney(Math.round(perDayLeft)) : '';
}

function initSubscriptionDrain() {
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');

  const listEl = document.getElementById('sd-list');
  const totalEl = document.getElementById('sd-total');
  const barEl = document.getElementById('sd-bar');

  if (!listEl) return;

  // Filter recurring/subscription type items
  const subs = emis.filter(e => e.status !== 'closed').slice(0, 4);
  const total = subs.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  if (subs.length === 0) {
    listEl.innerHTML = '<div style="font-size:0.6rem;color:#808080;margin-top:4px;">No EMIs/subscriptions found.</div>';
  } else {
    listEl.innerHTML = subs.map(e => {
      const name = (e.name || e.description || 'EMI').substring(0, 14);
      const amt = parseFloat(e.amount || 0);
      return `<div style="display:flex;justify-content:space-between;font-size:0.6rem;border-bottom:1px solid #eee;padding:1px 0;">
        <span style="color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px;">${name}</span>
        <span style="font-weight:bold;white-space:nowrap;">${getCurrency()}${formatMoney(amt)}</span>
      </div>`;
    }).join('');
  }

  if (totalEl) totalEl.textContent = getCurrency() + formatMoney(total);
  const pct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;
  if (barEl) barEl.style.width = pct + '%';
}

function initImpulseTaxJar() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const impulseCategories = ['Entertainment', 'Shopping', 'Dining', 'Food', 'Fun', 'Impulse', 'Lifestyle'];
  const monthExp = expenses.filter(e => e.date.startsWith(monthStr));
  const impulseExp = monthExp.filter(e => impulseCategories.some(cat => (e.category || '').toLowerCase().includes(cat.toLowerCase())));
  const impulseTotal = impulseExp.reduce((s, e) => s + e.amount, 0);
  const jarSaved = impulseTotal * 0.1;

  const maxJar = 5000;
  const fillPct = Math.min(100, (jarSaved / maxJar) * 100);

  const spentEl = document.getElementById('itj-spent');
  const jarEl = document.getElementById('itj-jar');
  if (spentEl) spentEl.textContent = getCurrency() + formatMoney(Math.round(impulseTotal));
  if (jarEl) jarEl.textContent = getCurrency() + formatMoney(Math.round(jarSaved));

  const canvas = document.getElementById('itj-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 80, 80);

  // Jar body
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(15, 20); ctx.lineTo(65, 20);
  ctx.lineTo(70, 72); ctx.lineTo(10, 72);
  ctx.closePath(); ctx.fill();

  // Fill level (coins inside)
  if (fillPct > 0) {
    const fillH = Math.round((fillPct / 100) * 48);
    ctx.fillStyle = '#888';
    ctx.fillRect(12, 72 - fillH, 56, fillH);
    // Wave top
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(12, 72 - fillH - 2, 56, 3);
  }

  // Jar border (overlay)
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(15, 20); ctx.lineTo(65, 20);
  ctx.lineTo(70, 72); ctx.lineTo(10, 72);
  ctx.closePath(); ctx.stroke();

  // Lid
  ctx.fillStyle = '#606060';
  ctx.fillRect(12, 12, 56, 10);
  ctx.strokeStyle = '#aaaaaa';
  ctx.strokeRect(12, 12, 56, 10);

  // Coin slot
  ctx.fillStyle = '#000';
  ctx.fillRect(34, 12, 12, 2);

  // Coin count label
  ctx.fillStyle = '#cccccc';
  ctx.font = '9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(fillPct) + '%', 40, 55);
}

function initZeroDayTracker() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStr = now.toISOString().substring(0, 7);

  // Build a set of days with spending
  const spendDays = new Set(
    expenses.filter(e => e.date.startsWith(monthStr)).map(e => parseInt(e.date.split('-')[2]))
  );

  const gridEl = document.getElementById('zdt-grid');
  const countEl = document.getElementById('zdt-count');
  const streakEl = document.getElementById('zdt-streak');
  if (!gridEl) return;

  let zeroDays = 0, currentStreak = 0, bestStreak = 0, tempStreak = 0;
  const today = now.getDate();

  gridEl.innerHTML = '';
  for (let d = 1; d <= daysInMonth; d++) {
    const isPast = d <= today;
    const hasSpend = spendDays.has(d);
    const isZero = isPast && !hasSpend;
    const isFuture = d > today;

    if (isZero) { zeroDays++; tempStreak++; bestStreak = Math.max(bestStreak, tempStreak); }
    else if (isPast) { tempStreak = 0; }

    const cell = document.createElement('div');
    cell.style.cssText = `height:10px;border-radius:1px;font-size:0.45rem;display:flex;align-items:center;justify-content:center;`;
    if (isFuture) { cell.style.background = '#111'; cell.style.color = '#333'; cell.textContent = d; }
    else if (isZero) { cell.style.background = '#aaaaaa'; cell.style.color = '#000'; cell.textContent = d; }
    else { cell.style.background = '#333'; cell.style.color = '#777'; cell.textContent = d; }
    gridEl.appendChild(cell);
  }

  if (countEl) countEl.textContent = zeroDays + ' / ' + today;
  if (streakEl) streakEl.textContent = bestStreak + ' days';
}

let cftState = { phase: 0, intervalId: null };

function initCashflowTide() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);

  const incomeEl = document.getElementById('cft-income');
  const spentEl = document.getElementById('cft-spent');
  const labelEl = document.getElementById('cft-label');
  if (incomeEl) incomeEl.textContent = income > 0 ? getCurrency() + formatMoney(income) : 'Not set';
  if (spentEl) spentEl.textContent = getCurrency() + formatMoney(Math.round(spent));

  const surplus = income - spent;
  if (labelEl) labelEl.textContent = surplus >= 0 ? 'Surplus' : 'Deficit';

  const canvas = document.getElementById('cft-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (cftState.intervalId) { clearInterval(cftState.intervalId); cftState.intervalId = null; }

  const tideHeight = income > 0 ? Math.max(0.05, Math.min(0.95, 1 - (spent / income))) : 0.5;

  const draw = () => {
    cftState.phase += 0.04;
    const W = 130, H = 80;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let y = 10; y < H; y += 15) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Water level
    const waterY = H * (1 - tideHeight);
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x++) {
      const wave = Math.sin((x / W) * Math.PI * 4 + cftState.phase) * 4 +
                   Math.sin((x / W) * Math.PI * 2 + cftState.phase * 0.7) * 2;
      ctx.lineTo(x, waterY + wave);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    // Second lighter wave
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x++) {
      const wave = Math.sin((x / W) * Math.PI * 3 + cftState.phase * 1.2 + 1) * 3;
      ctx.lineTo(x, waterY + 6 + wave);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    // Income line
    if (income > 0) {
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(0, waterY); ctx.lineTo(W, waterY); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Tide level text
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(tideHeight * 100) + '%', W - 3, waterY - 3);
  };

  cftState.intervalId = setInterval(draw, 50);
  draw();
}

// ════════════════════════════════════════════════════════════════════════════
// NEW ANALYTICAL WIDGETS
// ════════════════════════════════════════════════════════════════════════════

function initCategoryDrift() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const thisMonth = now.toISOString().substring(0, 7);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 7);

  const totals = (prefix) => {
    const map = {};
    expenses.filter(e => e.date.startsWith(prefix)).forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  };

  const thisM = totals(thisMonth);
  const lastM = totals(lastMonth);
  const allCats = [...new Set([...Object.keys(thisM), ...Object.keys(lastM)])];

  const el = document.getElementById('cdr-content');
  if (!el) return;

  if (allCats.length === 0) {
    el.innerHTML = '<div style="font-size:0.6rem;color:#808080;margin-top:4px;">No expense data yet.</div>';
    return;
  }

  // Sort by absolute change
  const rows = allCats.map(cat => ({
    cat,
    now: thisM[cat] || 0,
    prev: lastM[cat] || 0,
    delta: (thisM[cat] || 0) - (lastM[cat] || 0)
  })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5);

  el.innerHTML = rows.map(r => {
    const arrow = r.delta > 0 ? '▲' : (r.delta < 0 ? '▼' : '');
    const clr = r.delta > 0 ? '#888' : (r.delta < 0 ? '#aaa' : '#555');
    const name = (r.cat || 'Other').substring(0, 11);
    return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.58rem;border-bottom:1px solid #eee;padding:1px 0;">
      <span style="color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70px;">${name}</span>
      <span style="color:${clr};font-weight:bold;white-space:nowrap;">${arrow} ${getCurrency()}${formatMoney(Math.abs(Math.round(r.delta)))}</span>
    </div>`;
  }).join('');
}

function initSpendingClock() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  // expenses may not have time  use random distribution seeded by amount for demo
  // Group by hour bucket (0-23) using a hash of amount if no time
  const hourTotals = new Array(24).fill(0);
  expenses.forEach(e => {
    // If time is stored use it, else bucket by day-of-month mod 24
    let hour = 12;
    if (e.time) {
      hour = parseInt(e.time.split(':')[0]);
    } else {
      const day = parseInt((e.date || '01').split('-')[2] || '1');
      hour = (day + Math.floor(e.amount)) % 24;
    }
    hourTotals[hour] = (hourTotals[hour] || 0) + e.amount;
  });

  const peakHour = hourTotals.indexOf(Math.max(...hourTotals));
  const peakLabel = document.getElementById('sck-peak-label');
  const periods = ['Midnight', 'Late Night', 'Early AM', 'Morning', 'Mid Morning', 'Noon',
                   'Afternoon', 'Late Afternoon', 'Evening', 'Night'];
  const period = periods[Math.floor(peakHour / 2.4)] || 'Night';
  if (peakLabel) peakLabel.textContent = `Peak: ${peakHour}:00 (${period})`;

  const canvas = document.getElementById('sck-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 110, H = 110;
  const cx = W / 2, cy = H / 2, r = 46;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Clock face
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const maxVal = Math.max(...hourTotals, 1);

  // Draw 24 hour segments
  for (let h = 0; h < 24; h++) {
    const startA = (h / 24) * Math.PI * 2 - Math.PI / 2;
    const endA = ((h + 1) / 24) * Math.PI * 2 - Math.PI / 2;
    const val = hourTotals[h];
    const segR = val > 0 ? 12 + (val / maxVal) * 28 : 4;
    const intensity = val > 0 ? Math.round(80 + (val / maxVal) * 175) : 30;
    const hex = intensity.toString(16).padStart(2, '0');
    ctx.fillStyle = `#${hex}${hex}${hex}`;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, segR, startA, endA, false);
    ctx.closePath();
    ctx.fill();
  }

  // Hour labels (4 cardinal)
  ctx.fillStyle = '#808080';
  ctx.font = '7px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('12', cx, cy - r + 9);
  ctx.fillText('6', cx, cy + r - 3);
  ctx.textAlign = 'left';
  ctx.fillText('18', cx + r - 13, cy + 3);
  ctx.textAlign = 'right';
  ctx.fillText('6', cx - r + 10, cy + 3);

  // Center dot
  ctx.fillStyle = '#aaaaaa';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}

function initMerchantLoyalty() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const catMap = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 };
    catMap[cat].count++;
    catMap[cat].total += e.amount;
  });

  const sorted = Object.entries(catMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  const el = document.getElementById('ml-content');
  const footerEl = document.getElementById('ml-footer');
  if (!el) return;

  if (sorted.length === 0) {
    el.innerHTML = '<div style="font-size:0.6rem;color:#808080;margin-top:4px;">No expense data yet.</div>';
    return;
  }

  const totalAll = Object.values(catMap).reduce((s, v) => s + v.total, 0);
  const stamps = ['★★★', '★★☆', '★☆☆'];

  el.innerHTML = sorted.map(([cat, data], i) => {
    const pct = totalAll > 0 ? Math.round((data.total / totalAll) * 100) : 0;
    const name = cat.substring(0, 13);
    return `<div style="margin-bottom:4px;">
      <div style="display:flex;justify-content:space-between;font-size:0.6rem;">
        <span style="font-weight:bold;color:#333;">${stamps[i]} ${name}</span>
        <span style="color:#555;">${pct}%</span>
      </div>
      <div style="border:1px solid #808080;background:#000;height:5px;margin-top:1px;">
        <div style="height:100%;width:${pct}%;background:#888;"></div>
      </div>
      <div style="font-size:0.55rem;color:#808080;">${data.count} txns · ${getCurrency()}${formatMoney(Math.round(data.total))}</div>
    </div>`;
  }).join('');

  if (footerEl) footerEl.textContent = sorted.length + ' top categories · ' + Object.keys(catMap).length + ' total';
}

function initFiftyThirtyTwenty() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const monthExp = expenses.filter(e => e.date.startsWith(monthStr));
  const totalSpent = monthExp.reduce((s, e) => s + e.amount, 0);
  const savings = income > 0 ? Math.max(0, income - totalSpent) : 0;

  // Bucket categories into Needs / Wants
  const needsCats = ['Rent', 'Groceries', 'Transport', 'Utilities', 'Health', 'Insurance', 'Bills', 'Medical'];
  let needsSpent = 0, wantsSpent = 0;
  monthExp.forEach(e => {
    const isNeed = needsCats.some(n => (e.category || '').toLowerCase().includes(n.toLowerCase()));
    if (isNeed) needsSpent += e.amount; else wantsSpent += e.amount;
  });

  const needsEl = document.getElementById('ftw-needs');
  const wantsEl = document.getElementById('ftw-wants');
  const savingsEl = document.getElementById('ftw-savings');

  const idealNeeds = income * 0.5;
  const idealWants = income * 0.3;
  const idealSavings = income * 0.2;

  const fmt = (actual, ideal) => {
    if (income <= 0) return '';
    const pct = ideal > 0 ? Math.round((actual / ideal) * 100) : 0;
    return `${getCurrency()}${formatMoney(Math.round(actual))} (${pct}%)`;
  };

  if (needsEl) needsEl.textContent = fmt(needsSpent, idealNeeds);
  if (wantsEl) wantsEl.textContent = fmt(wantsSpent, idealWants);
  if (savingsEl) savingsEl.textContent = fmt(savings, idealSavings);

  const canvas = document.getElementById('ftw-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 110, 75);

  const total = needsSpent + wantsSpent + savings;
  if (total <= 0) {
    ctx.fillStyle = '#333';
    ctx.fillRect(5, 20, 100, 35);
    ctx.fillStyle = '#555';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', 55, 42);
    return;
  }

  // Three bars side by side
  const bars = [
    { label: 'Needs', actual: needsSpent, ideal: income * 0.5, x: 8 },
    { label: 'Wants', actual: wantsSpent, ideal: income * 0.3, x: 42 },
    { label: 'Save', actual: savings, ideal: income * 0.2, x: 76 }
  ];

  const barW = 26, maxH = 52;

  bars.forEach(b => {
    const idealH = income > 0 ? (b.ideal / income) * maxH : maxH / 3;
    const actualH = income > 0 ? Math.min((b.actual / income) * maxH, maxH) : 0;
    const baseY = 68;

    // Ideal outline
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x, baseY - idealH, barW, idealH);

    // Actual fill
    const over = b.actual > b.ideal;
    ctx.fillStyle = over ? '#aaaaaa' : '#666';
    ctx.fillRect(b.x + 1, baseY - actualH, barW - 2, actualH);

    // Label
    ctx.fillStyle = '#888';
    ctx.font = '6px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x + barW / 2, 75);
  });
}

function initExpenseVolatility() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const today = now.getDate();

  // Build daily totals for this month
  const dayMap = {};
  expenses.filter(e => e.date.startsWith(monthStr)).forEach(e => {
    const d = parseInt(e.date.split('-')[2]);
    dayMap[d] = (dayMap[d] || 0) + e.amount;
  });

  const vals = [];
  for (let d = 1; d <= today; d++) vals.push(dayMap[d] || 0);

  const scoreEl = document.getElementById('ev-score');
  const verdictEl = document.getElementById('ev-verdict');

  if (vals.length < 2) {
    if (scoreEl) scoreEl.textContent = '';
    if (verdictEl) verdictEl.textContent = 'Need more data';
    const canvas = document.getElementById('ev-canvas');
    if (canvas) { const ctx = canvas.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 130, 70); }
    return;
  }

  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) : 0; // coefficient of variation
  const stabilityScore = Math.max(0, Math.round((1 - Math.min(cv, 1)) * 100));

  if (scoreEl) scoreEl.textContent = stabilityScore + '/100';
  const verdict = stabilityScore >= 80 ? 'Very Stable' : stabilityScore >= 60 ? 'Moderate' : stabilityScore >= 40 ? 'Volatile' : 'Very Volatile';
  if (verdictEl) verdictEl.textContent = verdict;

  const canvas = document.getElementById('ev-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 130, H = 70;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const maxV = Math.max(...vals, 1);
  const step = W / (vals.length - 1 || 1);

  // Mean line
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  const meanY = H - (mean / maxV) * (H - 10) - 5;
  ctx.beginPath(); ctx.moveTo(0, meanY); ctx.lineTo(W, meanY); ctx.stroke();
  ctx.setLineDash([]);

  // Spend line
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  vals.forEach((v, i) => {
    const x = i * step;
    const y = H - (v / maxV) * (H - 10) - 5;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots at spikes
  vals.forEach((v, i) => {
    if (Math.abs(v - mean) > stdDev) {
      const x = i * step;
      const y = H - (v / maxV) * (H - 10) - 5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function initNightOwl() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');

  // 4 buckets: Morning(6-12), Afternoon(12-18), Evening(18-22), Night(22-6)
  const buckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

  expenses.forEach(e => {
    let hour = 12; // default afternoon if no time
    if (e.time) hour = parseInt(e.time.split(':')[0]);
    else {
      const day = parseInt((e.date || '01').split('-')[2] || '1');
      hour = (day * 3 + Math.floor(e.amount * 0.01)) % 24;
    }
    if (hour >= 6 && hour < 12) buckets.Morning += e.amount;
    else if (hour >= 12 && hour < 18) buckets.Afternoon += e.amount;
    else if (hour >= 18 && hour < 22) buckets.Evening += e.amount;
    else buckets.Night += e.amount;
  });

  const entries = Object.entries(buckets);
  const peakEntry = entries.reduce((a, b) => b[1] > a[1] ? b : a, ['', 0]);

  const peakEl = document.getElementById('now-peak');
  const verdictEl = document.getElementById('now-verdict');
  if (peakEl) peakEl.textContent = peakEntry[0];

  const verdicts = {
    Morning: 'Early bird spender 🌅',
    Afternoon: 'Daytime shopper ☀️',
    Evening: 'After-work spender 🌇',
    Night: 'Night owl! Impulse risk 🦉'
  };
  if (verdictEl) verdictEl.textContent = verdicts[peakEntry[0]] || '';

  const canvas = document.getElementById('now-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 130, H = 70;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const barW = 26, gap = 6, startX = 8;
  const maxH = H - 18;
  const labels = ['Morn', 'Aftn', 'Evng', 'Night'];
  const shades = ['#666', '#888', '#aaaaaa', '#555'];

  entries.forEach(([key, val], i) => {
    const barH = Math.max(2, (val / total) * maxH);
    const x = startX + i * (barW + gap);
    const y = H - 12 - barH;
    const isPeak = key === peakEntry[0];

    ctx.fillStyle = isPeak ? '#dddddd' : shades[i];
    ctx.fillRect(x, y, barW, barH);

    // Border on peak
    if (isPeak) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barW, barH);
    }

    // Pct label inside bar if tall enough
    if (barH > 14) {
      ctx.fillStyle = '#000';
      ctx.font = '7px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round((val / total) * 100) + '%', x + barW / 2, y + barH / 2 + 3);
    }

    // Label below
    ctx.fillStyle = '#808080';
    ctx.font = '6px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, H - 2);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// DATA-HEAVY WIDGETS (NUMBERS & CALCS)
// ════════════════════════════════════════════════════════════════════════════

function initSavingsRate() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  
  const saved = Math.max(0, income - spent);
  const rate = income > 0 ? (saved / income) * 100 : 0;
  
  const valEl = document.getElementById('sr-value');
  const labelEl = document.getElementById('sr-label');
  const lastEl = document.getElementById('sr-last');
  
  if (valEl) valEl.textContent = rate.toFixed(1) + '%';
  if (labelEl) {
    labelEl.textContent = rate >= 20 ? 'Above target ✅' : 'Below 20% target ⚠️';
    labelEl.style.color = rate >= 20 ? '#000' : '#800';
  }
  
  // Last month calc
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = lastMonth.toISOString().substring(0, 7);
  const lastSpent = expenses.filter(e => e.date.startsWith(lastMonthStr)).reduce((s, e) => s + e.amount, 0);
  const lastRate = income > 0 ? (Math.max(0, income - lastSpent) / income) * 100 : 0;
  if (lastEl) lastEl.textContent = lastRate.toFixed(1) + '%';
}

function initFireNumber() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  
  // Est annual expenses = this month * 12 (fallback if 0)
  const annualExp = spent > 0 ? spent * 12 : 50000 * 12; 
  const fireNumber = annualExp * 25;
  
  // Current corpus (use net worth if available)
  const assets = JSON.parse(localStorage.getItem('assets') || '[]');
  const liabs = JSON.parse(localStorage.getItem('liabilities') || '[]');
  const totalAssets = assets.reduce((s, a) => s + parseFloat(a.value || 0), 0);
  const totalLiabs = liabs.reduce((s, l) => s + parseFloat(l.value || 0), 0);
  const corpus = Math.max(0, totalAssets - totalLiabs);
  
  const numEl = document.getElementById('fire-num');
  const barEl = document.getElementById('fire-bar');
  const pctEl = document.getElementById('fire-pct');
  
  if (numEl) numEl.textContent = getCurrency() + formatMoney(Math.round(fireNumber));
  const progress = fireNumber > 0 ? Math.min(100, (corpus / fireNumber) * 100) : 0;
  if (barEl) barEl.style.width = progress + '%';
  if (pctEl) pctEl.textContent = progress.toFixed(2) + '%';
}

function initTaxEstimator() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const annualIncome = income * 12;
  
  // Simplified Indian New Tax Regime FY 24-25 (Standard deduction 75k ignored for simple monthly est)
  let tax = 0;
  if (annualIncome > 1200000) tax = (annualIncome - 1200000) * 0.20 + 60000 + 30000;
  else if (annualIncome > 900000) tax = (annualIncome - 900000) * 0.15 + 30000 + 15000;
  else if (annualIncome > 600000) tax = (annualIncome - 600000) * 0.10 + 15000;
  else if (annualIncome > 300000) tax = (annualIncome - 300000) * 0.05;
  
  // Rebate up to 7L (simplified)
  if (annualIncome <= 700000) tax = 0;

  const monthlyTax = tax / 12;
  const rate = income > 0 ? (monthlyTax / income) * 100 : 0;
  
  const taxEl = document.getElementById('te-tax');
  const rateEl = document.getElementById('te-rate');
  const netEl = document.getElementById('te-net');
  
  if (taxEl) taxEl.textContent = getCurrency() + formatMoney(Math.round(monthlyTax));
  if (rateEl) rateEl.textContent = rate.toFixed(1) + '%';
  if (netEl) netEl.textContent = getCurrency() + formatMoney(Math.round(income - monthlyTax));
}

function initDebtPayoff() {
  const liabs = JSON.parse(localStorage.getItem('liabilities') || '[]');
  const totalDebt = liabs.reduce((s, l) => s + parseFloat(l.value || 0), 0);
  
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  const monthlySavings = Math.max(1000, income - spent); // assume at least 1k payoff
  
  const months = totalDebt > 0 ? Math.ceil(totalDebt / monthlySavings) : 0;
  
  const monthsEl = document.getElementById('dp-months');
  const totalEl = document.getElementById('dp-total');
  const avgEl = document.getElementById('dp-avg');
  
  if (monthsEl) monthsEl.textContent = totalDebt > 0 ? months : '0';
  if (totalEl) totalEl.textContent = getCurrency() + formatMoney(totalDebt);
  if (avgEl) avgEl.textContent = getCurrency() + formatMoney(Math.round(monthlySavings)) + '/mo';
}

function initMonthlyPNL() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  
  const varSpent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  const fixedSpent = emis.filter(e => e.status !== 'closed').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const net = income - varSpent - fixedSpent;
  
  const incEl = document.getElementById('pnl-income');
  const spentEl = document.getElementById('pnl-spent');
  const fixedEl = document.getElementById('pnl-fixed');
  const netEl = document.getElementById('pnl-net');
  
  if (incEl) incEl.textContent = getCurrency() + formatMoney(income);
  if (spentEl) spentEl.textContent = '-' + getCurrency() + formatMoney(Math.round(varSpent));
  if (fixedEl) fixedEl.textContent = '-' + getCurrency() + formatMoney(Math.round(fixedSpent));
  if (netEl) {
    netEl.textContent = (net >= 0 ? '+' : '') + getCurrency() + formatMoney(Math.round(net));
    netEl.style.color = net >= 0 ? '#000' : '#800';
  }
}

function initEMIBurden() {
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const emis = JSON.parse(localStorage.getItem('moneverEMIs') || localStorage.getItem('emis') || '[]');
  const totalEMI = emis.filter(e => e.status !== 'closed').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  
  const ratio = income > 0 ? (totalEMI / income) * 100 : 0;
  
  const pctEl = document.getElementById('eb-pct');
  const verdEl = document.getElementById('eb-verdict');
  const barEl = document.getElementById('eb-bar');
  
  if (pctEl) pctEl.textContent = ratio.toFixed(1) + '%';
  if (verdEl) {
    if (ratio > 40) { verdEl.textContent = 'DANGEROUS 🚨'; verdEl.style.color = '#800'; }
    else if (ratio > 30) { verdEl.textContent = 'Warning ⚠️'; verdEl.style.color = '#550'; }
    else { verdEl.textContent = 'Safe ✅'; verdEl.style.color = '#000'; }
  }
  if (barEl) {
    barEl.style.width = Math.min(100, ratio) + '%';
    barEl.style.background = ratio > 40 ? '#000' : (ratio > 30 ? '#555' : '#aaa');
  }
}

function initBreakevenDay() {
  const budget = parseFloat(localStorage.getItem('monthlyBudget') || '0');
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  const spent = expenses.filter(e => e.date.startsWith(monthStr)).reduce((s, e) => s + e.amount, 0);
  const day = now.getDate();
  
  const avgBurn = day > 0 ? spent / day : 0;
  const remaining = Math.max(0, budget - spent);
  
  const daysLeft = avgBurn > 0 ? Math.floor(remaining / avgBurn) : 99;
  const beDay = Math.min(31, day + daysLeft);
  
  const dayEl = document.getElementById('be-day');
  const monthEl = document.getElementById('be-month');
  const burnEl = document.getElementById('be-burn');
  
  if (dayEl) dayEl.textContent = budget > 0 ? beDay : '';
  if (monthEl) monthEl.textContent = budget > 0 ? now.toLocaleString('default', { month: 'long' }) : 'Set budget first';
  if (burnEl) burnEl.textContent = getCurrency() + formatMoney(Math.round(avgBurn)) + '/day';
}

function initRuleOf72() {
  const rate = 12; // Assume 12% avg market return
  const years = 72 / rate;
  
  const assets = JSON.parse(localStorage.getItem('assets') || '[]');
  const totalAssets = assets.reduce((s, a) => s + parseFloat(a.value || 0), 0);
  
  const yearsEl = document.getElementById('r72-years');
  const targetEl = document.getElementById('r72-target');
  
  if (yearsEl) yearsEl.textContent = years.toFixed(1);
  if (targetEl) targetEl.textContent = getCurrency() + formatMoney(totalAssets * 2);
}

function initExpenseRatio() {
  const expenses = JSON.parse(localStorage.getItem('moneverExpenses') || localStorage.getItem('expenses') || '[]');
  const income = parseFloat(localStorage.getItem('monthlyIncome') || '0');
  const now = new Date();
  const monthStr = now.toISOString().substring(0, 7);
  
  const cats = {};
  expenses.filter(e => e.date.startsWith(monthStr)).forEach(e => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });
  
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const listEl = document.getElementById('er-list');
  if (!listEl) return;
  
  if (sorted.length === 0 || income === 0) {
    listEl.innerHTML = '<div style="font-size:0.6rem;color:#888;margin-top:10px;text-align:center;">No data or income not set</div>';
    return;
  }
  
  listEl.innerHTML = sorted.map(([cat, amt]) => {
    const pct = (amt / income) * 100;
    return `
      <div style="display:flex;justify-content:space-between;font-size:0.6rem;border-bottom:1px solid #eee;padding:2px 0;">
        <span style="color:#555;">${cat.substring(0, 12)}</span>
        <span style="font-weight:bold;">${pct.toFixed(1)}%</span>
      </div>
    `;
  }).join('');
}

function initInflationEroder() {
  const val5 = 1000 / Math.pow(1.06, 5);
  const val10 = 1000 / Math.pow(1.06, 10);
  const val20 = 1000 / Math.pow(1.06, 20);
  
  const e5 = document.getElementById('ie-5');
  const e10 = document.getElementById('ie-10');
  const e20 = document.getElementById('ie-20');
  
  if (e5) e5.textContent = getCurrency() + Math.round(val5);
  if (e10) e10.textContent = getCurrency() + Math.round(val10);
  if (e20) e20.textContent = getCurrency() + Math.round(val20);
}
