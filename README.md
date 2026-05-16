# 💾 Monever :- Money Saver, Forever

![Version](https://img.shields.io/badge/version-2.4.0--Classic%20Edition-black?style=flat-square)
![Status](https://img.shields.io/badge/status-complete-black?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-gray?style=flat-square)
![Made With](https://img.shields.io/badge/made%20with-Vanilla%20JS-black?style=flat-square)
![No Framework](https://img.shields.io/badge/framework-none-lightgray?style=flat-square)
![Lines](https://img.shields.io/badge/lines%20of%20code-23%2C000%2B-black?style=flat-square)

> A personal finance management platform with a Windows 95 aesthetic.
> No account. No server. No cloud. Just your money, your device, your data.

---

## What is Monever?

Monever is a fully-featured personal finance web application that runs entirely in the browser with zero backend infrastructure. It requires no account, no login, no internet connection, and stores all data locally using the browser's `localStorage`. Nothing you enter is ever transmitted anywhere.

The application is built with a deliberate **Windows 95 / late-1990s desktop aesthetic**, not as a gimmick, but as a product decision. Software from that era was direct, functional, and free of dark patterns, subscription walls, and data harvesting. Monever tries to carry that spirit into personal finance in 2026.

Built entirely with **vanilla HTML, CSS, and JavaScript**, no React, no Vue, no Node.js, no npm, no build step, no dependencies beyond Bootstrap 5 and Chart.js loaded from CDN. Open `index.html` in any modern browser and it works.

---

## Live Demo

> 🚀 **[Try Monever Live →](https://your-github-username.github.io/monever)**

Or clone the repo and open `index.html` directly in your browser, no server required.

---

## Pages & Features

Monever is organised across six pages, each with a distinct purpose:

| Page | Purpose | Highlights |
|------|---------|------------|
| 🏠 **Home** | Add and manage financial data | Expenses, EMI tracker, People Ledger, Quick Notes, Reminders, Bill Splitter, Recurring Expenses |
| 📊 **Insights** | Analyse and understand your data | Spending charts, Category breakdown, Expense history, Financial Goals, Net Worth tracker, Summary reports |
| 🔧 **Tools** | Run financial calculations | 16 calculators :- EMI, SIP, FD, PPF, NPS, ELSS, Rent vs Buy, Salary Breakup, Job Comparator, Wealth Timeline and more |
| 🧪 **Lab** | Interactive financial experiences | 9 experimental tools :- Financial Age Test, Time to Freedom, Daily Briefing, Compatibility Test, Fortune Teller and more |
| ℹ️ **About** | Project story and credits | Feature manifest, tech stack, built-by section |
| ❓ **Help** | Complete documentation | 53 sections covering every feature, MDN-style sidebar navigation, full-text search |

---

## Widget System

The Home and Insights pages feature a **customisable widget dashboard**, six slots per page (three left, three right) that can be filled with any of **67 available widgets** across three categories:

**Financial Widgets** :- Smart Insights, Budget Tracker, Upcoming Payments, Financial Health Score, Spending Heatmap, Suspicious Spending Alert

**Analytical Widgets** :- Expense DNA, Daily Average Tracker, Weekend vs Weekday, Savings XP Bar, Daily Horoscope, Achievements, Spending Personality, Peer Comparison, Net Worth Snapshot, Weather & Spend

**Visual & Fun Widgets** :- Money Tree, Savings Garden, Coral Reef, City Skyline, Space Colony, Grandfather Clock, Hourglass, Time Capsule, Pixel Portrait, Lava Lamp, Vinyl Record, Kaleidoscope, Lucky Cat, Piggy Bank, Wall of Fame, Black Hole, Budget Pinball, Fortune Cookie, Financial Butterfly, Tamagotchi Pet, Combo Streak, Screensaver, and more

All widgets read live data from your localStorage, no separate data entry required. Widget layouts are saved and persist across sessions.

---

## Financial Calculators (Tools Page)

| Calculator | What it computes |
|-----------|-----------------|
| EMI Calculator | Monthly instalment, total interest, total payable for any loan |
| FD Calculator | Fixed Deposit maturity with compounding frequency options |
| SIP Calculator | Mutual fund SIP maturity with lump sum comparison |
| Step-up SIP | SIP with annual investment increment, shows the real power of growing with your income |
| PPF Calculator | 15-year Public Provident Fund with extension toggle |
| NPS Calculator | National Pension System corpus and monthly pension estimate with 80CCD tax benefits |
| ELSS Calculator | Tax-saving mutual fund returns with effective post-tax return calculation |
| Rent vs Buy | Complete rent vs home purchase comparison over a custom analysis period |
| 50/30/20 Planner | Budget allocation framework with editable per-category plan and live running total |
| Inflation Calculator | Future value, past value, real-world expense projection, inflation vs investment comparison |
| Salary Breakup | CTC to in-hand calculation with HRA exemption, PF deduction, and TDS estimate |
| Money Clock | Live ticking earnings display, per second, per minute, per hour, and price-to-hours converter |
| Procrastination Cost | Exact rupee cost of delaying investments by 1, 2, 5, or 10 years |
| Wealth Timeline | When you will cross each wealth milestone :- ₹1L through ₹10Cr |
| Crore Counter | Time to any savings target with retro progress bars and milestone table |
| Job Comparator | Two-offer comparison across salary, growth, WFH, and work-life balance with 5-year projection |

---

## Monever Lab

The Lab is Monever's experimental wing, tools for financial self-awareness rather than calculation:

| Tool | What it does |
|------|-------------|
| Should I Quit? | Financial runway calculator, are you ready to quit your job today? |
| Lifestyle Inflation | Tracks what percentage of every salary hike was absorbed by lifestyle upgrades |
| Time to Financial Freedom | Calculates your FIRE number and exactly how many years until you never need to work again |
| Financial Age Test | 10-question assessment, are your finances ahead of or behind your real age? |
| Salary to Hours | Converts any price into hours of your working life at your actual salary |
| Fortune Teller | The Monever 3000 Oracle, deterministic financial predictions seeded by your real spending data |
| Stock Ticker | Retro Bloomberg-style scrolling terminal for your manually entered portfolio |
| Compatibility Test | Two people answer 8 financial questions, get a compatibility score with specific conversation starters for differences |
| Daily Briefing | Your monthly expense data rendered as a retro newspaper front page with auto-generated headlines |

---

## Tech Stack

```
Frontend    HTML5, CSS3, Vanilla JavaScript (ES6+)
UI Library  Bootstrap 5.3 (CDN)
Charts      Chart.js (CDN)
Icons       Bootstrap Icons (CDN)
Storage     Browser localStorage, no database, no server
Deployment  Static files, any web server or GitHub Pages
Build tool  None, open index.html and it works
```

**No npm. No node_modules. No webpack. No transpiler. No framework.**
The entire application is plain HTML, CSS, and JavaScript files that run directly in any modern browser.

---

## Project Scale

| Metric | Value |
|--------|-------|
| Total lines of code | 23,000+ |
| JavaScript files | 7 |
| HTML pages | 6 |
| CSS | 926 lines |
| Widgets available | 67 |
| Financial calculators | 16 |
| Lab tools | 9 |
| Help documentation sections | 53 |
| localStorage keys managed | 15 |
| External dependencies | 3 (Bootstrap, Chart.js, Bootstrap Icons, all CDN) |

---

## File Structure

```
monever/
├── index.html          # Home page :- expense entry, EMI, ledger, notes, reminders
├── data.html           # Insights page :- charts, history, goals, net worth
├── tools.html          # Tools page :- 16 financial calculators
├── lab.html            # Lab page :- 9 experimental finance experiences
├── about.html          # About page :- project story and credits
├── help.html           # Help page :- complete documentation (53 sections)
├── style.css           # Global stylesheet, Windows 95 theme
├── utils.js            # Shared utilities, save/load data, formatting, demo data, toast
├── home.js             # Home page logic, expense, EMI, ledger, notes, reminders
├── insights.js         # Insights logic, charts, goals, net worth, history
├── tools.js            # Tools page logic, all 16 calculators
├── lab.js              # Lab page logic, all 9 lab tools
├── profile.js          # Profile system, save/load profile, auto-fill across all pages
├── widget.js           # Widget system, 67 widgets, picker, slot management, animations
├── assets/
│   └── Monever Logo.png
└── README.md
```

---

## Architecture Decisions

**Why vanilla JS?**
The decision to use no framework was intentional. Every feature, canvas animations, the widget system, the profile auto-fill, the lab tools, is built from scratch using browser APIs. This demonstrates a genuine understanding of JavaScript rather than framework familiarity.

**Why localStorage?**
Local-first storage matches the 90s aesthetic philosophy: your data is yours, on your device, under your control. No server means no breach, no downtime, no subscription, no account deletion taking your data with it.

**Why modular JS files?**
The codebase was originally a single `script.js` and was refactored into seven purpose-specific files as the project grew. Each file has a single responsibility, no file depends on another except `utils.js` which is the shared utility layer loaded on every page.

**Why Bootstrap for a 90s theme?**
Bootstrap handles responsive grid, modal, and tab primitives. The entire Bootstrap color system is overridden in `style.css` with Win95-accurate grays. Bootstrap is infrastructure; the aesthetic is applied on top.

---

## Getting Started

### Option 1 :- Open directly (simplest)

```bash
# Clone the repository
git clone https://github.com/your-username/monever.git

# Open in browser, no server needed
open monever/index.html
# or simply double-click index.html in your file explorer
```

### Option 2 :- Local server (optional, for development)

```bash
# Using Python
cd monever
python -m http.server 8000
# Open http://localhost:8000

# Using Node.js (if installed)
npx serve monever
```

### Option 3 :- GitHub Pages (live URL)

1. Fork or push this repository to GitHub
2. Go to repository **Settings → Pages**
3. Set source to `main` branch, root folder
4. Your live URL will be `https://your-username.github.io/monever`

> There is no build step, no `npm install`, no configuration. The project runs exactly as the files are.

---

## First Steps After Opening

1. **Load Demo Data** :- Click `▶ Load Demo Data` on the Home page hero to populate the app with 12 months of realistic sample data. Every chart, widget, and tool comes alive immediately.
2. **Fill Your Profile** :- Click `My Profile` in the navbar. Your salary, age, city, and preferences auto-fill into all 16 calculators and tools across the site.
3. **Add a Widget** :- Click any `+` placeholder on the Home page. Choose from 67 widgets in the picker. The Budget Tracker or Financial Health Score are good starting points.
4. **Explore the Lab** :- Navigate to the Lab page and try the Financial Age Test. It takes 2 minutes and the result is usually surprising.
5. **Read the Docs** :- Click `Help` in the navbar for the complete documentation covering every feature in detail.

---

## Data & Privacy

Monever is built on a strict local-first principle:

- ✅ All data stored in **browser localStorage only**
- ✅ **Zero network requests** for core functionality (weather widget uses Open-Meteo public API optionally)
- ✅ **No analytics, no tracking, no telemetry** of any kind
- ✅ **No account required**, ever
- ✅ **No cookies** set by the application
- ✅ Works completely **offline** after first page load
- ⚠️ Data is **browser-specific**, Chrome and Firefox have separate storage
- ⚠️ Clearing browser cache **will erase your data**, export a JSON backup regularly

### Backup Your Data

Export a JSON backup anytime from **Profile → Settings → Export JSON**. Store it somewhere safe. Import it on any device to restore your full data.

---

## Key Features Checklist

### Core Finance
- [x] Expense logging with category, description, date, and recurring option
- [x] EMI tracker with mark-as-paid functionality
- [x] People Ledger for tracking money lent and borrowed
- [x] Quick Notes with timestamped multi-note system
- [x] Reminders with overdue detection
- [x] Bill Splitter :- equal and custom split modes
- [x] Financial Goals with contribution tracking and progress bars
- [x] Net Worth Tracker :- assets, liabilities, net worth calculation

### Dashboard & Analytics
- [x] Monthly spending overview with budget alerts
- [x] Category doughnut chart
- [x] Monthly trend bar chart
- [x] Spending heatmap calendar
- [x] Searchable expense history (category, amount, date, description)
- [x] Per-category budget limits
- [x] Savings rate tracking

### Widgets
- [x] 67 widgets across Financial, Analytical, and Visual categories
- [x] Drag-and-drop style slot system with picker modal
- [x] Search within widget picker
- [x] Global / Local layout mode per page
- [x] Widget state persistence in localStorage
- [x] Page Visibility API :- animated widgets pause when tab is inactive
- [x] Maximum 4 animated widgets guard for performance

### Tools & Calculators
- [x] 16 financial calculators with profile auto-fill
- [x] Step-up SIP (investment grows with income)
- [x] Salary Breakup with HRA exemption and TDS estimate
- [x] Job Offer Comparator with 5-year projection
- [x] Rent vs Buy with year-by-year comparison table

### Lab
- [x] 9 experimental tools
- [x] Financial Age Test with actionable improvement tips
- [x] FIRE / Financial Freedom calculator
- [x] Daily Briefing newspaper generated from real expense data

### System
- [x] Profile system with auto-fill across all pages
- [x] Demo Data (12 months of realistic sample data, one-click load and clear)
- [x] JSON export / import for data portability
- [x] CSV export for spreadsheet analysis
- [x] Factory Reset with confirmation
- [x] Compact DB and Rebuild Index maintenance tools
- [x] Currency symbol customisation
- [x] Complete Help documentation, 53 sections

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Opera 76+ | ✅ Full support |
| Mobile browsers | ❌ Not supported (intentional, desktop only by design) |

Monever is intentionally a **desktop-only application**. A blocking screen appears on mobile devices explaining the design philosophy. Use a laptop or desktop for the full experience.

---

## What Makes This Different

Most personal finance apps in 2026 require you to:
- Create an account
- Connect your bank (and trust them with credentials)
- Pay a monthly subscription
- Accept that your data lives on their servers
- Hope they don't get breached or shut down

Monever requires none of this. It is a throwback to when software just ran on your machine, did its job, and minded its own business.

The Windows 95 aesthetic is not nostalgia for its own sake, it is a visual statement about what software should be: **direct, honest, and yours**.

---

## Roadmap

Features that may be added in future versions:

- [ ] MS-DOS Terminal Lab tool, type `BALANCE`, `SPENT`, `GOALS` to query your data in command-line style
- [ ] AI-powered Spending Roast :- Claude reads your expense data and writes a personalised one-paragraph roast
- [ ] Financial Autopsy :- post-mortem analysis of any past month styled as a coroner's report
- [ ] PWA support :- installable as a desktop app via Progressive Web App
- [ ] Multi-currency support :- track expenses in different currencies
- [ ] Dark mode :- a CRT green phosphor variant of the Win95 theme

---

## License

```
MIT License

Copyright (c) 2026 Hero Harshit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Built By

**Hero Harshit**
Student · Developer · Designer

Built as a personal project to explore what a fully-featured, zero-dependency, privacy-first personal finance application could look like, and to prove that vanilla JavaScript is still capable of building something genuinely complex and polished.

> *"The goal was not to build another expense tracker. The goal was to build something with personality."*

---

## Acknowledgements

- **Bootstrap 5** :- UI grid, modals, and tab components
- **Chart.js** :- Doughnut and bar charts on the Insights page
- **Bootstrap Icons** :- Icon set used throughout the application
- **Open-Meteo** :- Free weather API used by the Weather & Spend widget (no API key required)
- **Anthropic Claude** :- AI assistant used during development for architecture guidance, code review, and prompt-driven feature building

---

<div align="center">

**© 1995 Monever Corporation, Classic Edition**

*Built with vanilla JavaScript. No frameworks were harmed.*

</div>
