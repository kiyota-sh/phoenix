import { requireAuth } from "../../utils/authGuard.js";
import { projectService } from "../../api/services/projectService.js";
import { PATHS, goTo } from "../../routes/paths.js";
import { showAlert, showLoading, escapeHtml } from "../../utils/ui.js";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
} from "../../utils/constants.js";

await requireAuth();

const form = document.getElementById("searchForm");
const resultsContainer = document.getElementById("resultsContainer");

function renderResults(projects) {
  if (!projects || projects.length === 0) {
    resultsContainer.innerHTML = `<div class="text-center text-secondary py-5"><h3 class="h5">No results</h3><p class="mb-0">Try a different name or remove the filters.</p></div>`;
    return;
  }
  const cards = projects
    .map((project) => {
      const badgeClass =
        STATUS_BADGE_CLASS[project.status] || "text-bg-success";
      const statusLabel = STATUS_LABELS[project.status] || project.status;
      const priorityLabel =
        PRIORITY_LABELS[project.priority] || project.priority;
      return `
      <div class="col">
        <div class="card h-100 project-card" data-id="${project.id}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h3 class="h6 card-title mb-1">${escapeHtml(project.name)}</h3>
                <p class="card-subtitle small text-secondary text-uppercase mb-0">${escapeHtml(project.categoryName || "No category")}</p>
              </div>
              <span class="badge ${badgeClass} rounded-pill"><i class="bi bi-circle-fill me-1" style="font-size:.5rem;"></i>${statusLabel}</span>
            </div>
            <span class="small font-mono text-secondary">${priorityLabel} priority</span>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  resultsContainer.innerHTML = `<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">${cards}</div>`;
  resultsContainer.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () =>
      goTo(PATHS.PROJECT_DETAIL, { id: card.dataset.id }),
    );
  });
}

async function performSearch() {
  const query = document.getElementById("searchQuery").value.trim();
  const status = document.getElementById("searchStatus").value;

  showLoading("resultsContainer");
  try {
    const data = await projectService.search(query, { status });
    renderResults(data);
  } catch (err) {
    showAlert("alertContainer", err.message);
    resultsContainer.innerHTML = "";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  performSearch();
});

performSearch();
