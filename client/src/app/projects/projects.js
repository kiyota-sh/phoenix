// src/app/projects/projects.js
import { requireAuth } from "../../utils/authGuard.js";
import { projectService } from "../../api/services/projectService.js";
import { categoryService } from "../../api/services/categoryService.js";
import { PATHS, goTo } from "../../routes/paths.js";
import { showAlert, showLoading, escapeHtml } from "../../utils/ui.js";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
} from "../../utils/constants.js";

await requireAuth();

const resultsContainer = document.getElementById("resultsContainer");
const filtersForm = document.getElementById("filtersForm");
const filterQuery = document.getElementById("filterQuery");
const filterCategory = document.getElementById("filterCategory");
const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");

// Note: there's no logout wiring here anymore — <nav-sidebar> owns it now.

function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function loadCategories() {
  try {
    const categories = await categoryService.getAll();
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      filterCategory.appendChild(option);
    });
  } catch (err) {
    console.error(err);
  }
}

function getCurrentFilters() {
  return {
    query: filterQuery.value.trim(),
    category: filterCategory.value,
    status: filterStatus.value,
    priority: filterPriority.value,
  };
}

function calculateDaysAgo(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function renderProjects(projects) {
  if (!projects || projects.length === 0) {
    resultsContainer.innerHTML = `
      <div class="text-center text-secondary py-5">
        <h3 class="h5">No projects here yet</h3>
        <p class="mb-0">Create one or adjust the search filters.</p>
      </div>
    `;
    return;
  }

  const cards = projects
    .map((project) => {
      const daysAgo = calculateDaysAgo(project.lastProgressDate);
      const badgeClass =
        STATUS_BADGE_CLASS[project.status] || "text-bg-success";
      const statusLabel = STATUS_LABELS[project.status] || project.status;
      const priorityLabel =
        PRIORITY_LABELS[project.priority] || project.priority;
      const progress = project.progress ?? 0;

      return `
        <div class="col">
          <div class="card h-100 project-card" data-id="${project.id}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h3 class="h6 card-title mb-1">${escapeHtml(project.name)}</h3>
                  <p class="card-subtitle small text-secondary text-uppercase mb-0">${escapeHtml(project.categoryName || "No category")}</p>
                </div>
                <span class="badge ${badgeClass} rounded-pill">
                  <i class="bi bi-circle-fill me-1" style="font-size:.5rem;"></i>${statusLabel}
                </span>
              </div>
              <div class="progress mb-2" style="height: 6px;">
                <div class="progress-bar" style="width: ${progress}%;"></div>
              </div>
              <div class="d-flex justify-content-between small font-mono text-secondary">
                <span>${priorityLabel} priority</span>
                <span>${daysAgo !== null ? `${daysAgo}d ago` : "no progress yet"}</span>
              </div>
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

async function loadProjects() {
  showLoading("resultsContainer");
  try {
    const filters = getCurrentFilters();
    const data = filters.query
      ? await projectService.search(filters.query, filters)
      : await projectService.getAll(filters);
    renderProjects(data.items || data);
  } catch (err) {
    showAlert("alertContainer", err.message);
    resultsContainer.innerHTML = "";
  }
}

filterCategory.addEventListener("change", loadProjects);
filterStatus.addEventListener("change", loadProjects);
filterPriority.addEventListener("change", loadProjects);
filterQuery.addEventListener("input", debounce(loadProjects));
filtersForm.addEventListener("submit", (e) => e.preventDefault());

loadCategories();
loadProjects();
