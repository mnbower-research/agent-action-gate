export const dashboardHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AAG Distribution Copilot</title>
    <link rel="stylesheet" href="/dashboard.css" />
  </head>
  <body>
    <div id="app"></div>
    <script src="/dashboard.js"></script>
  </body>
</html>`;

export const dashboardCss = `
:root {
  color-scheme: dark;
  --bg: #06111f;
  --bg-2: #081827;
  --panel: rgba(15, 31, 48, 0.84);
  --panel-strong: rgba(18, 39, 59, 0.94);
  --panel-soft: rgba(12, 27, 43, 0.74);
  --line: rgba(130, 165, 200, 0.18);
  --line-bright: rgba(75, 221, 219, 0.38);
  --text: #eef7ff;
  --muted: #9fb0c3;
  --faint: #677b90;
  --teal: #24d6d2;
  --blue: #5ea7ff;
  --green: #48df8b;
  --amber: #f7aa3c;
  --red: #ff5c65;
  --purple: #9a79ff;
  --shadow: 0 20px 70px rgba(0, 0, 0, 0.34);
  --radius: 8px;
}

html,
body {
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at 30% -10%, rgba(36, 214, 210, 0.12), transparent 34%),
    radial-gradient(circle at 88% 8%, rgba(94, 167, 255, 0.11), transparent 30%),
    linear-gradient(135deg, #030910 0%, var(--bg) 48%, #081421 100%);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.shell {
  display: grid;
  grid-template-columns: 272px minmax(0, 1fr);
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 26px 18px;
  border-right: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(4, 12, 24, 0.96), rgba(6, 18, 31, 0.94));
}

.brand-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
  padding: 0 10px;
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(36, 214, 210, 0.9), rgba(72, 223, 139, 0.7));
  box-shadow: 0 0 30px rgba(36, 214, 210, 0.22);
}

.nav {
  display: grid;
  gap: 8px;
}

.nav-item {
  width: 100%;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 0 14px;
  color: #d7e3f0;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  text-align: left;
}

.nav-item:hover,
.nav-item.active {
  background: linear-gradient(90deg, rgba(36, 214, 210, 0.16), rgba(94, 167, 255, 0.06));
  border-color: rgba(36, 214, 210, 0.18);
  color: var(--teal);
}

.nav-icon,
.source-icon,
.card-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: currentColor;
  font-size: 13px;
  font-weight: 800;
}

.count {
  min-width: 28px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  color: #021116;
  background: linear-gradient(135deg, var(--teal), rgba(72, 223, 139, 0.8));
  font-size: 12px;
  font-weight: 800;
}

.governance-card {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 24px;
  padding: 18px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(8, 24, 39, 0.72);
  box-shadow: var(--shadow);
}

.governance-card strong {
  display: block;
  color: var(--green);
  margin-bottom: 10px;
}

.governance-card p {
  margin: 0 0 16px;
  color: var(--muted);
  line-height: 1.45;
}

.main {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 86px;
  padding: 0 32px;
  border-bottom: 1px solid var(--line);
  background: rgba(5, 14, 25, 0.78);
  backdrop-filter: blur(18px);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: 0;
}

h2 {
  margin-bottom: 6px;
  font-size: 26px;
}

h3 {
  margin-bottom: 12px;
  font-size: 17px;
}

.status-pill,
.chip,
.decision-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1px solid rgba(36, 214, 210, 0.28);
  background: rgba(36, 214, 210, 0.11);
  color: var(--teal);
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
}

.user {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--muted);
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #06111f;
  font-weight: 900;
  background: linear-gradient(135deg, #8de8ff, #f4b971);
}

.content {
  padding: 28px 32px 38px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.muted {
  color: var(--muted);
}

.grid {
  display: grid;
  gap: 18px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

.grid > *,
.card,
.mini-card,
.detail-stack {
  min-width: 0;
  max-width: 100%;
}

.kpi-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.two-col {
  grid-template-columns: minmax(0, 1.7fr) minmax(340px, 0.75fr);
}

.three-col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent),
    var(--panel);
  box-shadow: var(--shadow);
  min-width: 0;
  max-width: 100%;
}

.card.pad {
  padding: 18px;
}

.kpi {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  min-height: 116px;
  padding: 18px;
}

.card-icon {
  width: 58px;
  height: 58px;
  font-size: 24px;
}

.teal { color: var(--teal); }
.blue { color: var(--blue); }
.green { color: var(--green); }
.amber { color: var(--amber); }
.red { color: var(--red); }
.purple { color: var(--purple); }

.bg-teal { background: linear-gradient(135deg, rgba(36, 214, 210, 0.22), rgba(36, 214, 210, 0.08)); }
.bg-blue { background: linear-gradient(135deg, rgba(94, 167, 255, 0.25), rgba(94, 167, 255, 0.08)); }
.bg-green { background: linear-gradient(135deg, rgba(72, 223, 139, 0.25), rgba(72, 223, 139, 0.08)); }
.bg-amber { background: linear-gradient(135deg, rgba(247, 170, 60, 0.25), rgba(247, 170, 60, 0.08)); }
.bg-red { background: linear-gradient(135deg, rgba(255, 92, 101, 0.24), rgba(255, 92, 101, 0.08)); }
.bg-purple { background: linear-gradient(135deg, rgba(154, 121, 255, 0.25), rgba(154, 121, 255, 0.08)); }

.kpi-label {
  color: var(--muted);
  font-size: 13px;
}

.kpi-value {
  margin-top: 4px;
  font-size: 30px;
  font-weight: 850;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 13px 14px;
  border-bottom: 1px solid rgba(130, 165, 200, 0.12);
  text-align: left;
  vertical-align: middle;
  font-size: 13px;
}

.table th {
  color: var(--muted);
  font-weight: 650;
  background: rgba(255, 255, 255, 0.02);
}

.table tr:hover td {
  background: rgba(36, 214, 210, 0.035);
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 7px;
  border: 1px solid rgba(130, 165, 200, 0.23);
  color: var(--text);
  background: rgba(255, 255, 255, 0.035);
}

.btn:hover {
  border-color: var(--line-bright);
}

.btn.primary {
  color: #03161b;
  border-color: rgba(36, 214, 210, 0.8);
  background: linear-gradient(135deg, var(--teal), #6ee7b7);
  font-weight: 800;
}

.btn.green { border-color: rgba(72, 223, 139, 0.5); color: var(--green); }
.btn.red { border-color: rgba(255, 92, 101, 0.5); color: var(--red); }
.btn.blue { border-color: rgba(94, 167, 255, 0.5); color: var(--blue); }
.btn.purple { border-color: rgba(154, 121, 255, 0.5); color: var(--purple); }

.chip {
  min-height: 24px;
  border-radius: 6px;
  padding: 3px 8px;
}

.chip.low,
.decision-allow,
.chip.in_scope {
  color: var(--green);
  border-color: rgba(72, 223, 139, 0.22);
  background: rgba(72, 223, 139, 0.1);
}

.chip.medium,
.chip.scope_warning,
.decision-require_approval,
.decision-revise_action {
  color: var(--amber);
  border-color: rgba(247, 170, 60, 0.28);
  background: rgba(247, 170, 60, 0.12);
}

.chip.high,
.chip.scope_violation,
.decision-block {
  color: var(--red);
  border-color: rgba(255, 92, 101, 0.28);
  background: rgba(255, 92, 101, 0.12);
}

.opportunity-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.75fr);
  gap: 20px;
  align-items: start;
}

.opportunity-list-panel {
  overflow: hidden;
}

.opportunity-list {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.opportunity-detail-panel {
  position: sticky;
  top: 106px;
  align-self: start;
  overflow: hidden;
}

.opportunity-card {
  width: 100%;
  display: grid;
  grid-template-columns: 44px minmax(220px, 1.2fr) minmax(220px, 0.9fr) 150px;
  gap: 16px;
  align-items: center;
  min-height: 118px;
  padding: 16px;
  border: 1px solid rgba(130, 165, 200, 0.14);
  border-radius: var(--radius);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent),
    rgba(13, 29, 45, 0.78);
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.opportunity-card.selected {
  border-color: rgba(36, 214, 210, 0.92);
  background:
    linear-gradient(180deg, rgba(36, 214, 210, 0.08), rgba(94, 167, 255, 0.03)),
    rgba(13, 35, 50, 0.9);
  box-shadow: 0 0 0 1px rgba(36, 214, 210, 0.14), 0 16px 42px rgba(0, 0, 0, 0.24);
}

.opportunity-main,
.opportunity-why,
.opportunity-meta {
  min-width: 0;
}

.opportunity-title {
  display: block;
  margin-bottom: 4px;
  color: var(--text);
  font-weight: 800;
  line-height: 1.25;
}

.opportunity-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 9px;
  justify-items: start;
  align-content: center;
}

.opportunity-score-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.opportunity-action {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.detail-title {
  overflow-wrap: normal;
  word-break: normal;
  line-height: 1.25;
}

.detail-actions {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr) minmax(0, 0.8fr);
  gap: 10px;
}

.source-icon {
  width: 42px;
  height: 42px;
  font-size: 16px;
  color: var(--teal);
}

.preview {
  color: var(--muted);
  line-height: 1.45;
  font-size: 13px;
  overflow-wrap: normal;
}

.approval-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
  gap: 20px;
  align-items: start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.approval-left,
.approval-right {
  min-width: 0;
  max-width: 100%;
}

.approval-right {
  display: grid;
  gap: 14px;
}

.approval-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;
}

.wrap-anywhere,
.setting-row span:last-child,
.mini-card p,
.raw-json {
  overflow-wrap: anywhere;
  word-break: normal;
}

.line-clamp-2,
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  -webkit-line-clamp: 3;
}

.detail-stack {
  display: grid;
  gap: 12px;
}

.mini-card {
  padding: 14px;
  border: 1px solid rgba(130, 165, 200, 0.14);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.025);
}

.timeline {
  position: relative;
  display: grid;
  gap: 18px;
}

.timeline:before {
  content: "";
  position: absolute;
  left: 18px;
  top: 16px;
  bottom: 16px;
  width: 2px;
  background: rgba(130, 165, 200, 0.2);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 14px;
}

.dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid currentColor;
  background: rgba(8, 24, 39, 0.94);
  z-index: 1;
}

.workflow-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}

.workflow-step {
  position: relative;
  display: grid;
  gap: 9px;
  justify-items: center;
  text-align: center;
  color: var(--muted);
}

.step-ring {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid currentColor;
  background: rgba(255, 255, 255, 0.04);
  font-weight: 900;
}

.bars {
  display: grid;
  gap: 12px;
}

.bar {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 40px;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.bar-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--teal), var(--blue));
}

.chart {
  height: 190px;
  width: 100%;
}

.raw-json {
  max-height: 480px;
  overflow: auto;
  max-width: 100%;
  padding: 14px;
  border-radius: 7px;
  background: rgba(2, 7, 13, 0.72);
  color: #d5e7f7;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.settings-list {
  display: grid;
  gap: 10px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 13px 0;
  border-bottom: 1px solid rgba(130, 165, 200, 0.12);
}

.empty {
  padding: 28px;
  text-align: center;
  color: var(--muted);
}

.safety-note {
  margin: 0 0 18px;
  padding: 12px 14px;
  border: 1px solid rgba(36, 214, 210, 0.22);
  border-radius: var(--radius);
  background: rgba(36, 214, 210, 0.07);
  color: #bfeef0;
}

.toast-stack {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 100;
  display: grid;
  gap: 10px;
  max-width: min(420px, calc(100vw - 44px));
}

.toast {
  padding: 13px 15px;
  border: 1px solid rgba(36, 214, 210, 0.28);
  border-radius: var(--radius);
  background: rgba(8, 24, 39, 0.96);
  color: var(--text);
  box-shadow: var(--shadow);
}

.toast.error {
  border-color: rgba(255, 92, 101, 0.5);
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin: 20px 0;
}

.select {
  min-width: 132px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 7px;
  color: var(--text);
  background: rgba(255, 255, 255, 0.035);
}

@media (max-width: 1180px) {
  .shell {
    grid-template-columns: 86px minmax(0, 1fr);
  }
  .sidebar {
    padding: 20px 10px;
  }
  .brand-mini span,
  .nav-item span.label,
  .governance-card {
    display: none;
  }
  .nav-item {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .kpi-grid,
  .three-col,
  .two-col,
  .opportunity-layout {
    grid-template-columns: 1fr;
  }
  .approval-layout {
    grid-template-columns: 1fr;
  }
  .opportunity-detail-panel {
    position: static;
  }
}

@media (max-width: 760px) {
  .shell {
    display: block;
  }
  .sidebar {
    position: static;
    height: auto;
  }
  .nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .topbar {
    height: auto;
    padding: 18px;
    align-items: flex-start;
    gap: 14px;
    flex-direction: column;
  }
  .content {
    padding: 20px 14px 32px;
  }
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .opportunity-card {
    grid-template-columns: 42px minmax(0, 1fr);
    min-height: auto;
  }
  .opportunity-card > *:nth-child(n+3) {
    grid-column: 2;
  }
  .opportunity-meta,
  .detail-actions,
  .approval-meta-grid {
    grid-template-columns: 1fr;
  }
}
`;

export const dashboardJs = `
const state = {
  data: null,
  route: location.hash.replace("#/", "") || "overview",
  selectedOpportunityId: null,
  selectedReceiptId: null,
};

const navItems = [
  ["overview", "O", "Overview"],
  ["inbox", "I", "Inbox"],
  ["approvals", "Q", "Approval Queue"],
  ["activity", "A", "Activity"],
  ["workflows", "W", "Workflows"],
  ["receipts", "R", "Receipts"],
  ["analytics", "N", "Analytics"],
  ["settings", "S", "Settings"],
];

window.addEventListener("hashchange", () => {
  state.route = location.hash.replace("#/", "") || "overview";
  render();
});

load();

async function load() {
  const response = await fetch("/api/snapshot");
  state.data = await response.json();
  if (!state.selectedOpportunityId || !state.data.opportunities.some(item => item.id === state.selectedOpportunityId)) {
    state.selectedOpportunityId = state.data.opportunities[0]?.id || null;
  }
  state.selectedReceiptId = state.data.receipts[0]?.id || null;
  render();
}

function render() {
  const app = document.getElementById("app");
  if (!state.data) {
    app.innerHTML = '<div class="empty">Loading local dashboard...</div>';
    return;
  }

  app.innerHTML = '<div class="shell">' + sidebar() + '<main class="main">' + topbar() + '<section class="content">' + routeContent() + '</section></main></div>';
  wireActions();
}

function sidebar() {
  const counts = {
    inbox: state.data.opportunities.length,
    approvals: state.data.approvals.length,
  };
  return '<aside class="sidebar"><div class="brand-mini"><div class="brand-mark"></div><span>Control Plane</span></div><nav class="nav">' +
    navItems.map(([route, icon, label]) => '<button class="nav-item ' + (state.route === route ? "active" : "") + '" data-route="' + route + '"><span class="nav-icon">' + icon + '</span><span class="label">' + label + '</span>' + (counts[route] ? '<span class="count">' + counts[route] + '</span>' : '') + '</button>').join("") +
    '</nav><div class="governance-card"><strong>Governance Active</strong><p>All agent actions are gated and logged.</p><button class="btn" data-route="settings">View Governance</button></div></aside>';
}

function topbar() {
  return '<header class="topbar"><div class="title-row"><h1>AAG Distribution Copilot</h1><span class="status-pill">Governed by AAG</span></div><div class="user"><span>Local Demo</span><div class="avatar">AAG</div></div></header>';
}

function routeContent() {
  switch (state.route) {
    case "inbox": return inbox();
    case "approvals": return approvals();
    case "activity": return activityPage();
    case "workflows": return workflows();
    case "receipts": return receipts();
    case "analytics": return analytics();
    case "settings": return settings();
    default: return overview();
  }
}

function overview() {
  const k = state.data.kpis;
  return pageHeader("Overview", state.data.isDemoData ? "Demo fallback data is shown because no local records were found." : "Local control center for governed distribution work.") +
    '<div class="grid kpi-grid">' +
    kpi("teal", "O", "Opportunities Found", k.opportunitiesFound) +
    kpi("purple", "A", "Awaiting Approval", k.awaitingApproval) +
    kpi("green", "P", "Approved Today", k.approvedToday) +
    kpi("red", "B", "Blocked", k.blocked) +
    kpi("blue", "R", "Receipts Written", k.receiptsWritten) +
    '</div><div class="grid two-col" style="margin-top:18px">' +
    '<div class="card pad"><h3>Approval Queue <span class="count">' + state.data.approvals.length + '</span></h3>' + safetyNote() + approvalTable(state.data.approvals.slice(0, 8)) + '</div>' +
    '<div class="card pad"><h3>Recent Activity</h3>' + activityList(state.data.activity.slice(0, 5)) + '</div>' +
    '</div><div class="grid three-col" style="margin-top:18px">' +
    workflowScopeCard() + weeklyProgressCard() + governanceSummaryCard() +
    '</div>';
}

function inbox() {
  const selected = selectedOpportunity();
  return pageHeader("Opportunity Inbox", "Stay ahead of relevant conversations and content opportunities.") +
    '<div class="filters"><select class="select"><option>All Sources</option></select><select class="select"><option>All Relevance</option></select><select class="select"><option>All Risk</option></select><select class="select"><option>All Status</option></select><select class="select"><option>Newest first</option></select></div>' +
    '<div class="opportunity-layout"><div class="card opportunity-list-panel"><div class="opportunity-list">' +
    state.data.opportunities.map(opportunityCard).join("") +
    '</div></div><aside class="card pad opportunity-detail-panel">' + opportunityDetail(selected) + '</aside></div>';
}

function approvals() {
  const selected = selectedOpportunity() || state.data.approvals[0] || state.data.opportunities[0];
  if (!selected) {
    return pageHeader("Approval Review", "Human approval surface for public actions.") + '<div class="card empty">No approval items found.</div>';
  }
  const comment = selected.safeComment || "";
  return pageHeader("Approval Review", '<button class="btn blue" data-route="overview">Back to Approval Queue</button>') +
    safetyNote() +
    '<div class="approval-layout"><section class="card pad approval-left"><div class="title-row"><span class="source-icon">' + sourceInitial(selected.platform) + '</span><h2 class="wrap-anywhere">' + escapeHtml(selected.suggestedAction) + ' on ' + escapeHtml(formatPlatform(selected.platform)) + ' post</h2><span class="decision-pill decision-' + selected.decision + '">' + formatDecision(selected.decision) + '</span>' + statusBadge(selected) + '</div>' +
    '<div class="approval-meta-grid"><div class="mini-card"><div class="muted">Source</div><strong>' + escapeHtml(selected.sourceType) + '</strong><p class="muted">' + escapeHtml(selected.platform) + '</p></div><div class="mini-card"><div class="muted">Target Topic</div><strong class="wrap-anywhere">' + escapeHtml(selected.title) + '</strong><p class="muted">Category: Governance</p></div></div>' +
    '<h3 style="margin-top:18px">Original Post Preview</h3><div class="mini-card"><p>' + escapeHtml(selected.sourceText) + '</p></div>' +
    '<div class="mini-card" style="margin-top:18px"><h3>Drafted Comment</h3><p>' + escapeHtml(comment) + '</p><div class="muted">' + comment.length + ' characters</div><button class="btn" style="margin-top:10px">Preview as it will appear</button></div></section>' +
    '<aside class="approval-right">' + reviewPacket(selected) + decisionCard(selected) + riskFlagsCard(selected) + notRevealCard(selected) + receiptPreview(selected) + '</aside></div>' +
    '<div class="card pad actions" style="margin-top:18px">' + approvalButtons(selected, true) + '</div>';
}

function workflows() {
  return pageHeader("Workflow Ledger and Analytics", "End-to-end visibility across workflow scope, decisions, and outcomes.") +
    '<div class="grid kpi-grid">' +
    kpi("teal", "W", "Total Workflows", state.data.workflows.length) +
    kpi("green", "I", "In Scope", state.data.workflows.filter(w => w.scopeStatus === "in_scope").length) +
    kpi("amber", "S", "Scope Warnings", state.data.workflows.filter(w => w.scopeStatus === "scope_warning").length) +
    kpi("red", "V", "Violations Blocked", state.data.workflows.filter(w => w.scopeStatus === "scope_violation").length) +
    kpi("blue", "R", "Receipts Written", state.data.receipts.length) +
    '</div><div class="grid two-col" style="margin-top:18px"><div class="card pad"><h3>Workflow Scope Ledger</h3>' + workflowTable() + '</div>' +
    '<div class="card pad"><h3>Workflow Timeline</h3>' + workflowTimeline() + '<div class="mini-card" style="margin-top:18px">Public posting always requires human approval.</div></div></div>' +
    '<div class="grid two-col" style="margin-top:18px"><div class="card pad"><h3>Recent Receipts</h3>' + receiptTable(state.data.receipts.slice(0, 5)) + '</div><div class="card pad"><h3>Governance Note</h3><p class="muted">Workflow ledgers record action chains locally. They do not post, DM, schedule, or call external APIs.</p></div></div>';
}

function receipts() {
  const selected = selectedReceipt();
  return pageHeader("Receipts", "Local JSON and JSONL receipts from AAG and the Distribution Copilot.") +
    '<div class="grid two-col"><div class="card pad">' + receiptTable(state.data.receipts) + '</div><aside class="card pad"><h3>Raw Receipt</h3><pre class="raw-json">' + escapeHtml(JSON.stringify(selected?.raw || {}, null, 2)) + '</pre></aside></div>';
}

function activityPage() {
  return pageHeader("Activity", "Timeline of copilot evaluations, receipts, approvals, workflow changes, and policy events.") +
    '<div class="card pad">' + activityList(state.data.activity) + '</div>';
}

function analytics() {
  return pageHeader("Analytics", "Local trend views for governed distribution activity.") +
    '<div class="grid three-col">' + weeklyProgressCard() + sourceBars() + '<div class="card pad"><h3>Approval Mix</h3><div class="kpi-value">' + state.data.kpis.awaitingApproval + '</div><p class="muted">Items currently awaiting human action.</p></div></div>';
}

function settings() {
  const rows = [
    ["Auto-post", "Off", "red"],
    ["Public posting", "Requires approval", "amber"],
    ["Repo links", "Require approval", "amber"],
    ["Mentioning companies", "Requires approval", "amber"],
    ["MetaGate internals", "Do not reveal", "red"],
    ["Exact roadmap details", "Do not reveal", "red"],
    ["Private deployment details", "Do not reveal", "red"],
    ["Em dash policy", "Zero em dashes in marketing copy", "green"],
  ];
  return pageHeader("Settings", "Read-only local governance settings for this dashboard version.") +
    '<div class="card pad"><div class="settings-list">' + rows.map(([label, value, tone]) => '<div class="setting-row"><span>' + label + '</span><span class="' + tone + '">' + value + '</span></div>').join("") + '</div></div>';
}

function kpi(tone, icon, label, value) {
  return '<div class="card kpi"><div class="card-icon bg-' + tone + ' ' + tone + '">' + icon + '</div><div><div class="kpi-label">' + label + '</div><div class="kpi-value">' + value + '</div><div class="muted">local records</div></div></div>';
}

function approvalTable(items) {
  if (!items.length) return '<div class="empty">No public actions awaiting review.</div>';
  return '<table class="table"><thead><tr><th>Proposed Action</th><th>Source</th><th>Relevance</th><th>Risk Level</th><th>AAG Decision</th><th>Age</th><th>Actions</th></tr></thead><tbody>' +
    items.map(item => '<tr><td><strong>' + escapeHtml(item.suggestedAction) + '</strong><div class="muted">' + escapeHtml(item.title) + '</div>' + statusBadge(item) + '</td><td>' + escapeHtml(item.sourceType) + '</td><td>' + chip(scoreLabel(item.relevanceScore), relevanceTone(item.relevanceScore)) + ' ' + (item.relevanceScore / 10).toFixed(2) + '</td><td>' + chip(item.riskLevel, item.riskLevel) + '</td><td>' + chip(formatDecision(item.decision), decisionTone(item.decision)) + '</td><td>' + item.age + '</td><td><div class="actions">' + approvalButtons(item, false) + '</div></td></tr>').join("") +
    '</tbody></table>';
}

function opportunityCard(item) {
  return '<div class="opportunity-card ' + (state.selectedOpportunityId === item.id ? "selected" : "") + '" data-select-opportunity="' + item.id + '" role="button" tabindex="0"><span class="source-icon">' + sourceInitial(item.platform) + '</span><div class="opportunity-main"><strong class="opportunity-title line-clamp-2">' + escapeHtml(item.title) + '</strong><div class="muted">' + escapeHtml(item.sourceType) + ' · ' + item.age + '</div>' + statusBadge(item) + '<p class="preview line-clamp-3">' + escapeHtml(item.sourceText.slice(0, 190)) + '</p></div><div class="opportunity-why"><strong>Why it matters to AAG</strong><p class="preview line-clamp-2">' + escapeHtml(item.whyItMatters[0] || "Relevant to governed workflows.") + '</p></div><div class="opportunity-meta"><div><div class="muted">Relevance</div><div class="opportunity-score-row">' + chip(String(item.relevanceScore), relevanceTone(item.relevanceScore)) + chip(item.riskLevel, item.riskLevel) + '</div></div><button class="btn blue opportunity-action" type="button" data-endpoint="/api/opportunities/' + encodeURIComponent(item.id) + '/queue">' + escapeHtml(item.suggestedAction) + '</button></div></div>';
}

function opportunityDetail(item) {
  if (!item) return '<div class="empty">Select an opportunity.</div>';
  return '<div class="detail-stack"><div><div class="muted">Selected Opportunity</div><h3 class="detail-title">' + escapeHtml(item.title) + '</h3><div class="muted">' + escapeHtml(item.sourceType) + ' · ' + item.age + '</div></div>' +
    mini("Why it matters", list(item.whyItMatters)) +
    mini("Suggested Comment", escapeHtml(item.safeComment || "No safe comment generated.")) +
    mini("Suggested Repost", escapeHtml(item.safeRepost || "No safe repost generated.")) +
    mini("Suggested CTA", escapeHtml(item.suggestedCTA || "No CTA generated.")) +
    mini("What Not To Reveal", list(item.whatNotToReveal)) +
    '<div class="mini-card"><h3>AAG Decision</h3>' + chip(formatDecision(item.decision), decisionTone(item.decision)) + ' ' + chip(item.riskLevel, item.riskLevel) + '</div>' +
    '<div class="detail-actions"><button class="btn primary" data-endpoint="/api/opportunities/' + encodeURIComponent(item.id) + '/queue">Queue for Approval</button><button class="btn" data-endpoint="/api/approvals/' + encodeURIComponent(item.id) + '/ignore">Ignore</button><button class="btn blue" data-endpoint="/api/approvals/' + encodeURIComponent(item.id) + '/save-draft">Save Draft</button></div>' +
    '<p class="muted">All generated copy contains no em dashes.</p></div>';
}

function approvalButtons(item, large) {
  const id = encodeURIComponent(item.id);
  const postedButton = large && item.localStatus === "approved_for_manual_posting"
    ? '<button class="btn green" data-endpoint="/api/approvals/' + id + '/mark-posted">Mark Manually Posted</button>'
    : '';
  return '<button class="btn green" data-endpoint="/api/approvals/' + id + '/approve">Approve</button><button class="btn red" data-endpoint="/api/approvals/' + id + '/reject">Reject</button><button class="btn blue" data-endpoint="/api/approvals/' + id + '/revise">Revise</button>' + (large ? '<button class="btn purple" data-endpoint="/api/approvals/' + id + '/escalate">Escalate</button>' + postedButton : '');
}

function reviewPacket(item) {
  return '<div class="card pad"><h3>Review Packet</h3><div class="settings-list">' +
    setting("Risk Level", chip(item.riskLevel, item.riskLevel)) +
    setting("Relevance", chip(scoreLabel(item.relevanceScore), relevanceTone(item.relevanceScore))) +
    setting("Platform Risk", chip(item.riskFlags.includes("platform_risk") ? "Medium" : "Low", item.riskFlags.includes("platform_risk") ? "medium" : "low")) +
    setting("Company Claim Risk", chip(item.riskFlags.includes("specific_company_claim_risk") ? "High" : "Low", item.riskFlags.includes("specific_company_claim_risk") ? "high" : "low")) +
    setting("Human Review Required", chip("Yes", "medium")) +
    setting("Workflow ID", escapeHtml(item.workflowId || "not attached")) +
    '</div></div>';
}

function decisionCard(item) {
  return '<div class="card pad"><h3>AAG Decision</h3><div class="decision-pill decision-' + item.decision + '" style="width:100%;justify-content:center;min-height:58px;font-size:18px">' + formatDecision(item.decision) + '</div></div>';
}

function riskFlagsCard(item) {
  return '<div class="card pad"><h3>Risk Flags</h3>' + list(item.riskFlags.length ? item.riskFlags : ["none"]) + '</div>';
}

function notRevealCard(item) {
  return '<div class="card pad"><h3>What Not To Reveal</h3>' + list(item.whatNotToReveal) + '</div>';
}

function receiptPreview(item) {
  return '<div class="card pad"><h3>Receipt Preview</h3><div class="settings-list">' + setting("Receipt ID", escapeHtml(item.receiptId || item.id)) + setting("Time", escapeHtml(item.age)) + setting("Log Path", escapeHtml(item.logPath || ".aag/distribution/receipts.jsonl")) + '</div></div>';
}

function workflowTable() {
  if (!state.data.workflows.length) return '<div class="empty">No workflow ledgers found yet.</div>';
  return '<table class="table"><thead><tr><th>Workflow ID</th><th>Workflow Name</th><th>Current Stage</th><th>In-Scope Status</th><th>Cumulative Risk</th><th>Actions</th><th>Last Updated</th></tr></thead><tbody>' +
    state.data.workflows.map(w => '<tr><td>' + escapeHtml(w.workflowId) + '</td><td>' + escapeHtml(w.workflowName) + '</td><td>' + chip(w.currentStage, "blue") + '</td><td>' + chip(formatScope(w.scopeStatus), w.scopeStatus) + '</td><td>' + chip(w.cumulativeRisk, w.cumulativeRisk) + '</td><td>' + w.actions + '</td><td>' + formatDate(w.lastUpdated) + '</td></tr>').join("") + '</tbody></table>';
}

function receiptTable(items) {
  if (!items.length) return '<div class="empty">No receipts found.</div>';
  return '<table class="table"><thead><tr><th>Receipt ID</th><th>Timestamp</th><th>Decision</th><th>Risk</th><th>Action Type</th><th>Source</th><th>Workflow</th><th>Local Status</th></tr></thead><tbody>' +
    items.map(r => '<tr data-select-receipt="' + r.id + '"><td>' + escapeHtml(shortId(r.id)) + '</td><td>' + formatDate(r.timestamp) + '</td><td>' + chip(formatDecision(r.decision), decisionTone(r.decision)) + '</td><td>' + chip(r.riskLevel, riskTone(r.riskLevel)) + '</td><td>' + escapeHtml(r.actionType) + '</td><td>' + escapeHtml(r.source) + '</td><td>' + escapeHtml(r.workflowId || "none") + '</td><td>' + (r.localStatus ? chip(formatStatus(r.localStatus), statusTone(r.localStatus)) : '<span class="muted">none</span>') + '</td></tr>').join("") + '</tbody></table>';
}

function activityList(items) {
  if (!items.length) return '<div class="empty">No activity yet.</div>';
  return '<div class="timeline">' + items.map(item => '<div class="timeline-item"><div class="dot ' + item.tone + '">' + item.title[0] + '</div><div><strong>' + escapeHtml(item.title) + '</strong><p class="muted">' + escapeHtml(item.detail) + '</p><div class="muted">' + formatDate(item.createdAt) + '</div></div></div>').join("") + '</div>';
}

function workflowScopeCard() {
  return '<div class="card pad"><h3>Workflow Scope</h3><div class="workflow-steps">' + ["Discover", "Draft", "Evaluate", "Awaiting Approval", "Posted"].map((label, index) => '<div class="workflow-step ' + ["teal","blue","purple","amber","green"][index] + '"><div class="step-ring">' + (index + 1) + '</div><strong>' + label + '</strong><span>' + workflowMetric(label) + '</span></div>').join("") + '</div></div>';
}

function workflowTimeline() {
  return '<div class="workflow-steps">' + ["Discover", "Draft", "Evaluate", "Approve", "Posted", "Reply"].map((label, index) => '<div class="workflow-step ' + ["teal","blue","purple","amber","green","purple"][index] + '"><div class="step-ring">' + label[0] + '</div><strong>' + label + '</strong><span class="muted">' + workflowMetric(label) + '</span></div>').join("") + '</div>';
}

function weeklyProgressCard() {
  return '<div class="card pad"><h3>Weekly Progress</h3><svg class="chart" viewBox="0 0 420 190" role="img" aria-label="Weekly progress chart"><defs><linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#24d6d2" stop-opacity="0.28"/><stop offset="1" stop-color="#24d6d2" stop-opacity="0"/></linearGradient></defs><path d="M20 160 L80 136 L140 116 L200 96 L260 64 L320 82 L400 48 L400 170 L20 170 Z" fill="url(#lineFill)"/><path d="M20 160 L80 136 L140 116 L200 96 L260 64 L320 82 L400 48" fill="none" stroke="#24d6d2" stroke-width="3"/><g fill="#24d6d2"><circle cx="20" cy="160" r="4"/><circle cx="80" cy="136" r="4"/><circle cx="140" cy="116" r="4"/><circle cx="200" cy="96" r="4"/><circle cx="260" cy="64" r="4"/><circle cx="320" cy="82" r="4"/><circle cx="400" cy="48" r="4"/></g></svg><div class="muted">Approved and blocked local decisions over the last seven days.</div></div>';
}

function governanceSummaryCard() {
  return '<div class="card pad"><h3>Governance Summary</h3><div class="settings-list">' + setting("Policy", '<span class="green">Strict</span>') + setting("Auto-post", '<span class="red">Off</span>') + setting("Public posting", '<span class="amber">Human approval required</span>') + '</div></div>';
}

function sourceBars() {
  const sources = [["LinkedIn", state.data.opportunities.filter(o => o.platform === "linkedin").length], ["Manual", state.data.opportunities.length], ["Receipts", state.data.receipts.length], ["Workflows", state.data.workflows.length]];
  const max = Math.max(...sources.map(s => s[1]), 1);
  return '<div class="card pad"><h3>Top Opportunity Sources</h3><div class="bars">' + sources.map(([label, value]) => '<div class="bar"><span>' + label + '</span><div class="bar-track"><div class="bar-fill" style="width:' + Math.max(8, Math.round((value / max) * 100)) + '%"></div></div><strong>' + value + '</strong></div>').join("") + '</div></div>';
}

function pageHeader(title, subtitle) {
  return '<div style="margin-bottom:22px"><h2>' + title + '</h2><div class="muted">' + subtitle + '</div>' + warningBanner() + '</div>';
}

function warningBanner() {
  const warnings = state.data.parseWarnings;
  if (!warnings.ignoredMalformedJsonl && !warnings.missingFiles.length) return "";
  return '<div class="mini-card" style="margin-top:12px"><span class="amber">Local data note:</span> ignored malformed JSONL lines: ' + warnings.ignoredMalformedJsonl + '. Missing optional files: ' + warnings.missingFiles.length + '.</div>';
}

function wireActions() {
  document.querySelectorAll("[data-route]").forEach(el => el.addEventListener("click", () => {
    location.hash = "#/" + el.dataset.route;
  }));
  document.querySelectorAll("[data-select-opportunity]").forEach(el => el.addEventListener("click", () => {
    state.selectedOpportunityId = el.dataset.selectOpportunity;
    render();
  }));
  document.querySelectorAll("[data-select-receipt]").forEach(el => el.addEventListener("click", () => {
    state.selectedReceiptId = el.dataset.selectReceipt;
    render();
  }));
  document.querySelectorAll("[data-endpoint]").forEach(el => el.addEventListener("click", async (event) => {
    event.stopPropagation();
    await performLocalAction(el.dataset.endpoint);
  }));
  document.querySelectorAll("[data-status]").forEach(el => el.addEventListener("click", async (event) => {
    event.stopPropagation();
    const [itemId, status] = el.dataset.status.split(":");
    const response = await fetch("/api/approval-state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, status })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      showToast(result.error || "Local action failed.", true);
      return;
    }
    state.data = result.snapshot || state.data;
    showToast(result.message || "Local state updated. No public action was taken.");
    render();
  }));
}

async function performLocalAction(endpoint) {
  try {
    const response = await fetch(endpoint, { method: "POST" });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      showToast(result.error || "Local action failed.", true);
      return;
    }
    if (result.snapshot) {
      state.data = result.snapshot;
    } else {
      await load();
    }
    showToast(result.message || "Local state updated. No public action was taken.");
    render();
  } catch (error) {
    showToast("Local action failed. No public action was taken.", true);
  }
}

function showToast(message, isError) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = "toast" + (isError ? " error" : "");
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function selectedOpportunity() {
  return state.data.opportunities.find(item => item.id === state.selectedOpportunityId) || state.data.opportunities[0];
}

function selectedReceipt() {
  return state.data.receipts.find(item => item.id === state.selectedReceiptId) || state.data.receipts[0];
}

function mini(title, body) {
  return '<div class="mini-card"><h3>' + title + '</h3><div class="preview">' + body + '</div></div>';
}

function setting(label, value) {
  return '<div class="setting-row"><span class="muted">' + label + '</span><span>' + value + '</span></div>';
}

function list(items) {
  return '<ul>' + items.map(item => '<li>' + escapeHtml(item) + '</li>').join("") + '</ul>';
}

function chip(label, tone) {
  return '<span class="chip ' + tone + '">' + escapeHtml(label) + '</span>';
}

function statusBadge(item) {
  return item.localStatus ? '<div style="margin-top:8px">' + chip(formatStatus(item.localStatus), statusTone(item.localStatus)) + '</div>' : '';
}

function safetyNote() {
  return '<div class="safety-note">Local approval only. This dashboard does not post, DM, scrape, schedule, call social APIs, or use an LLM.</div>';
}

function sourceInitial(platform) {
  return platform && platform.toLowerCase() === "linkedin" ? "in" : (platform || "S").slice(0, 1).toUpperCase();
}

function formatPlatform(platform) {
  return platform && platform.toLowerCase() === "linkedin" ? "LinkedIn" : String(platform || "Source");
}

function scoreLabel(score) {
  if (score >= 8) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

function relevanceTone(score) {
  if (score >= 8) return "low";
  if (score >= 5) return "medium";
  return "high";
}

function decisionTone(decision) {
  if (decision === "allow") return "low";
  if (decision === "block") return "high";
  return "medium";
}

function riskTone(risk) {
  const value = String(risk || "").toLowerCase();
  if (value === "low") return "low";
  if (value === "high" || value === "critical") return "high";
  return "medium";
}

function statusTone(status) {
  if (status === "approved_for_manual_posting" || status === "manually_posted") return "low";
  if (status === "rejected") return "high";
  return "medium";
}

function formatDecision(decision) {
  return String(decision || "unknown").replace(/_/g, " ").replace(/\\b\\w/g, char => char.toUpperCase());
}

function formatScope(scope) {
  return String(scope || "in_scope").replace(/_/g, " ").replace(/\\b\\w/g, char => char.toUpperCase());
}

function formatStatus(status) {
  if (status === "approved_for_manual_posting") return "Approved For Manual Posting";
  if (status === "queued_for_approval" || status === "awaiting_approval") return "Queued For Approval";
  if (status === "needs_revision") return "Needs Revision";
  if (status === "saved_draft") return "Saved Draft";
  if (status === "manually_posted") return "Manually Posted";
  return formatDecision(status);
}

function workflowMetric(label) {
  if (label === "Discover") return state.data.opportunities.length;
  if (label === "Draft") return state.data.opportunities.filter(o => o.safeComment || o.safeRepost).length;
  if (label === "Evaluate") return state.data.receipts.length;
  if (label === "Awaiting Approval" || label === "Approve") return state.data.approvals.length;
  if (label === "Posted") return 0;
  return 0;
}

function shortId(id) {
  const value = String(id || "receipt");
  return value.length > 18 ? value.slice(0, 18) + "..." : value;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.valueOf())) return "local";
  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
`;
