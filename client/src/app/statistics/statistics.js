import { requireAuth } from "../../utils/authGuard.js";
import { statisticsService } from "../../api/services/statisticsService.js";
import { showAlert, escapeHtml } from "../../utils/ui.js";

await requireAuth();

const VARIANTS = [
  "bg-primary",
  "bg-success",
  "bg-info",
  "bg-warning",
  "bg-danger",
  "bg-secondary",
];

function renderBarChart(containerId, data, variant = "bg-primary") {
  const max = Math.max(...data.map((d) => d.value), 1);
  document.getElementById(containerId).innerHTML = data
    .map(
      (d) => `
      <div class="mb-3">
        <div class="d-flex justify-content-between small mb-1">
          <span>${escapeHtml(String(d.label))}</span><span class="font-mono">${d.value}</span>
        </div>
        <div class="progress" style="height: 8px;"><div class="progress-bar ${variant}" style="width:${(d.value / max) * 100}%;"></div></div>
      </div>
    `,
    )
    .join("");
}

function renderStackedBar(containerId, data) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const bars = data
    .map(
      (d, i) =>
        `<div class="progress-bar ${VARIANTS[i % VARIANTS.length]}" style="width:${(d.value / total) * 100}%;" title="${escapeHtml(String(d.label))}: ${d.value}"></div>`,
    )
    .join("");
  const legend = data
    .map(
      (d, i) =>
        `<span class="badge ${VARIANTS[i % VARIANTS.length]} bg-opacity-50 me-2 mb-1">${escapeHtml(String(d.label))} (${d.value})</span>`,
    )
    .join("");
  document.getElementById(containerId).innerHTML =
    `<div class="progress mb-3" style="height: 22px;">${bars}</div><div>${legend}</div>`;
}

async function init() {
  try {
    const [byCategory, abandonReasons, completedByYear, avgTime] =
      await Promise.all([
        statisticsService.getByCategory(),
        statisticsService.getAbandonReasons(),
        statisticsService.getCompletedByYear(),
        statisticsService.getAvgTimeToAbandon(),
      ]);
    renderBarChart(
      "chartCategory",
      byCategory.map((i) => ({ label: i.category, value: i.total })),
      "bg-primary",
    );
    renderStackedBar(
      "chartReasons",
      abandonReasons.map((i) => ({ label: i.reason, value: i.total })),
    );
    renderBarChart(
      "chartCompleted",
      completedByYear.map((i) => ({ label: i.year, value: i.total })),
      "bg-success",
    );
    document.getElementById("avgTimeValue").textContent = avgTime.days
      ? `${avgTime.days} days`
      : "—";
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

init();
