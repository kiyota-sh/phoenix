import { requireAuth } from "../../utils/authGuard.js";
import { dashboardService } from "../../api/services/dashboardService.js";
import { showAlert, escapeHtml } from "../../utils/ui.js";

const user = await requireAuth();
document.getElementById("greeting").textContent = user?.name
  ? `Hello, ${user.name}`
  : "Hello";

function renderSummary(summary) {
  document.getElementById("summaryContainer").innerHTML = `
    <div class="col"><div class="card text-bg-success h-100"><div class="card-body">
      <p class="card-subtitle mb-1">Active</p><p class="card-text display-6 font-mono mb-0">${summary.active ?? 0}</p>
    </div></div></div>
    <div class="col"><div class="card text-bg-warning h-100"><div class="card-body">
      <p class="card-subtitle mb-1">Abandoned</p><p class="card-text display-6 font-mono mb-0">${summary.abandoned ?? 0}</p>
    </div></div></div>
    <div class="col"><div class="card text-bg-info h-100"><div class="card-body">
      <p class="card-subtitle mb-1">Completed</p><p class="card-text display-6 font-mono mb-0">${summary.completed ?? 0}</p>
    </div></div></div>
  `;
}

function renderActivity(activity) {
  const container = document.getElementById("activityContainer");
  if (!activity || activity.length === 0) {
    container.innerHTML =
      '<p class="text-secondary mb-0 p-3">No recent activity.</p>';
    return;
  }
  container.innerHTML = `<ul class="list-group list-group-flush">${activity
    .map(
      (item) => `
      <li class="list-group-item bg-transparent">
        <div class="small font-mono text-secondary">${new Date(item.date).toLocaleDateString("en-US")}</div>
        <div>${escapeHtml(item.description)}</div>
      </li>
    `,
    )
    .join("")}</ul>`;
}

function renderGoals(goals) {
  const container = document.getElementById("goalsContainer");
  if (!goals || goals.length === 0) {
    container.innerHTML =
      '<p class="text-secondary mb-0 p-3">You have no upcoming goals.</p>';
    return;
  }
  container.innerHTML = `<ul class="list-group list-group-flush">${goals
    .map(
      (g) => `
      <li class="list-group-item bg-transparent">
        <div class="small font-mono text-secondary">${new Date(g.targetDate).toLocaleDateString("en-US")}</div>
        <div>${escapeHtml(g.name)}</div>
      </li>
    `,
    )
    .join("")}</ul>`;
}

async function init() {
  try {
    const [summary, activity, goals] = await Promise.all([
      dashboardService.getSummary(),
      dashboardService.getRecentActivity(),
      dashboardService.getUpcomingGoals(),
    ]);
    renderSummary(summary);
    renderActivity(activity.items || activity);
    renderGoals(goals.items || goals);
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

init();
