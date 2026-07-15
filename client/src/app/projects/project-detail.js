import { requireAuth } from "../../utils/authGuard.js";
import { projectService } from "../../api/services/projectService.js";
import { progressService } from "../../api/services/progressService.js";
import { historyService } from "../../api/services/historyService.js";
import { catalogService } from "../../api/services/catalogService.js";
import { taskService } from "../../api/services/taskService.js";
import { PATHS, goTo, getQueryParam } from "../../routes/paths.js";
import { showAlert, escapeHtml } from "../../utils/ui.js";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
  PROJECT_STATUS,
} from "../../utils/constants.js";

await requireAuth();

const projectId = getQueryParam("id");
if (!projectId) goTo(PATHS.PROJECTS);

const detailContainer = document.getElementById("detailContainer");
let cachedAbandonReasons = []; // loaded once, reused to show the reason's name

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function loadAll() {
  try {
    const [project, entries, history, tasks, reasons] = await Promise.all([
      projectService.getById(projectId),
      progressService.getByProject(projectId),
      historyService.getByProject(projectId),
      taskService.getByProject(projectId),
      catalogService.getAbandonReasons(),
    ]);
    cachedAbandonReasons = reasons;
    render(project, entries.items || entries, history.items || history, tasks);
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

function render(project, entries, history, tasks) {
  const badgeClass = STATUS_BADGE_CLASS[project.status] || "text-bg-success";
  const statusLabel = STATUS_LABELS[project.status] || project.status;
  const priorityLabel = PRIORITY_LABELS[project.priority] || project.priority;

  // progress is null when there are no tasks yet — show an honest
  // "no tasks" state instead of a misleading 0%.
  const hasTasks = tasks.length > 0;
  const progressValue = project.progress ?? 0;

  const reasonName = project.abandonReasonId
    ? cachedAbandonReasons.find(
        (r) => String(r.id) === String(project.abandonReasonId),
      )?.name
    : null;

  detailContainer.innerHTML = `
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div>
        <span class="badge ${badgeClass} rounded-pill"><i class="bi bi-circle-fill me-1" style="font-size:.5rem;"></i>${statusLabel}</span>
        <h1 class="h3 mt-2 mb-1">${escapeHtml(project.name)}</h1>
        <p class="text-secondary mb-0">${escapeHtml(project.categoryName || "No category")} · ${priorityLabel} priority</p>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <a href="project-form.html?id=${project.id}" class="btn btn-outline-secondary"><i class="bi bi-pencil me-1"></i>Edit</a>
        ${renderStatusActions(project)}
      </div>
    </div>

    <div class="card p-4">
      <p>${escapeHtml(project.description || "No description.")}</p>
      ${project.goal ? `<p class="text-secondary"><strong>Goal:</strong> ${escapeHtml(project.goal)}</p>` : ""}

      <div class="progress mt-3" style="height: 6px;">
        <div class="progress-bar" style="width:${progressValue}%;"></div>
      </div>
      <p class="text-secondary small mt-1">
        ${hasTasks ? `${progressValue}% complete — weighted across ${tasks.length} task(s)` : "No tasks yet — add some below to start tracking progress"}
      </p>

      <div class="row row-cols-2 row-cols-md-4 g-3 mt-2">
        <div class="col"><div class="text-secondary text-uppercase small">Start date</div><div class="font-mono">${formatDate(project.startDate)}</div></div>
        <div class="col"><div class="text-secondary text-uppercase small">Target date</div><div class="font-mono">${formatDate(project.targetDate)}</div></div>
        ${
          project.daysRemaining !== null && project.daysRemaining !== undefined
            ? `<div class="col"><div class="text-secondary text-uppercase small">Days remaining</div><div class="font-mono">${project.daysRemaining}</div></div>`
            : ""
        }
        ${reasonName ? `<div class="col"><div class="text-secondary text-uppercase small">Abandon reason</div><div class="font-mono">${escapeHtml(reasonName)}</div></div>` : ""}
      </div>
      ${project.abandonReasonDetail ? `<p class="text-secondary small mt-2 mb-0"><strong>Details:</strong> ${escapeHtml(project.abandonReasonDetail)}</p>` : ""}
    </div>

    <div id="statusPanel" class="mt-3"></div>

    <h2 class="h5 fst-italic mt-4">Tasks</h2>
    <p class="text-secondary small mt-n2 mb-3">Break the project into steps and give each one a weight (1-5). The progress bar above is calculated automatically from these.</p>
    <div class="card p-4">
      <form id="taskForm" class="row g-2 mb-3">
        <div class="col-8 col-md-9">
          <input type="text" id="taskTitle" class="form-control" placeholder="Add a task..." required maxlength="140" />
        </div>
        <div class="col-4 col-md-2">
          <select id="taskWeight" class="form-select" title="Weight (impact on progress)">
            <option value="1">Weight: 1</option>
            <option value="2">Weight: 2</option>
            <option value="3" selected>Weight: 3</option>
            <option value="4">Weight: 4</option>
            <option value="5">Weight: 5</option>
          </select>
        </div>
        <div class="col-12 col-md-1 d-grid">
          <button type="submit" class="btn btn-primary">Add</button>
        </div>
      </form>
      <div id="taskList">${renderTasks(tasks)}</div>
    </div>

    <h2 class="h5 fst-italic mt-4">Progress log</h2>
    <div class="card p-4">
      <form id="progressForm">
        <div class="mb-3">
          <label for="progressDescription" class="form-label">Log new progress</label>
          <textarea id="progressDescription" class="form-control" rows="2" placeholder="What did you accomplish today?" required></textarea>
        </div>
        <div class="mb-3">
          <label for="progressNotes" class="form-label">Notes / difficulties</label>
          <textarea id="progressNotes" class="form-control" rows="2" placeholder="Optional"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Save progress</button>
      </form>
      <div id="progressList" class="mt-4">${renderProgressEntries(entries)}</div>
    </div>

    <h2 class="h5 fst-italic mt-4">Change history</h2>
    <div class="card"><div class="card-body p-0">${renderHistory(history)}</div></div>
  `;

  attachTaskHandlers();
  attachProgressForm();
  attachStatusActions(project);
}

function renderStatusActions(project) {
  if (project.status === PROJECT_STATUS.ACTIVE) {
    return `
      <button class="btn btn-outline-secondary" id="markCompletedBtn"><i class="bi bi-check-circle me-1"></i>Mark completed</button>
      <button class="btn btn-outline-secondary" id="markAbandonedBtn"><i class="bi bi-moon me-1"></i>Mark abandoned</button>
      <button class="btn btn-outline-secondary" id="archiveBtn"><i class="bi bi-archive me-1"></i>Archive</button>
    `;
  }
  if (
    project.status === PROJECT_STATUS.ABANDONED ||
    project.status === PROJECT_STATUS.ARCHIVED
  ) {
    return `<button class="btn btn-primary" id="reopenBtn"><i class="bi bi-arrow-repeat me-1"></i>Reopen project</button>`;
  }
  return "";
}

function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    return `<p class="text-secondary mb-0">No tasks yet. Add the first step above.</p>`;
  }
  return `<ul class="list-group list-group-flush">${tasks
    .map(
      (task) => `
      <li class="list-group-item bg-transparent d-flex align-items-center gap-2">
        <input type="checkbox" class="form-check-input task-toggle" data-id="${task.id}" ${task.completed ? "checked" : ""} />
        <span class="flex-grow-1 ${task.completed ? "text-decoration-line-through text-secondary" : ""}">${escapeHtml(task.title)}</span>
        <span class="badge text-bg-secondary font-mono">w${task.weight}</span>
        <button class="btn btn-sm btn-outline-danger task-delete" data-id="${task.id}"><i class="bi bi-trash"></i></button>
      </li>
    `,
    )
    .join("")}</ul>`;
}

function renderProgressEntries(entries) {
  if (!entries || entries.length === 0) {
    return `<p class="text-secondary mb-0">No progress logged yet.</p>`;
  }
  return `<ul class="list-group list-group-flush">${entries
    .map(
      (entry) => `
      <li class="list-group-item bg-transparent">
        <div class="small font-mono text-secondary">${formatDate(entry.date)}</div>
        <div>${escapeHtml(entry.description)}</div>
        ${entry.notes ? `<div class="small text-secondary mt-1">${escapeHtml(entry.notes)}</div>` : ""}
      </li>
    `,
    )
    .join("")}</ul>`;
}

function renderHistory(history) {
  if (!history || history.length === 0) {
    return `<p class="text-secondary mb-0 p-3">No changes recorded yet.</p>`;
  }
  return `<ul class="list-group list-group-flush">${history
    .map(
      (h) => `
      <li class="list-group-item bg-transparent">
        <div class="small font-mono text-secondary">${formatDate(h.date)}</div>
        <div>${escapeHtml(h.field)}: <span class="text-secondary">${escapeHtml(h.oldValue ?? "—")}</span> → ${escapeHtml(h.newValue ?? "—")}</div>
      </li>
    `,
    )
    .join("")}</ul>`;
}

function attachTaskHandlers() {
  document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const titleInput = document.getElementById("taskTitle");
    const weightSelect = document.getElementById("taskWeight");
    const title = titleInput.value.trim();
    if (!title) return;
    try {
      await taskService.create(projectId, {
        title,
        weight: Number(weightSelect.value),
      });
      loadAll();
    } catch (err) {
      showAlert("alertContainer", err.message);
    }
  });

  document.querySelectorAll(".task-toggle").forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      try {
        await taskService.toggle(checkbox.dataset.id, checkbox.checked);
        loadAll();
      } catch (err) {
        showAlert("alertContainer", err.message);
      }
    });
  });

  document.querySelectorAll(".task-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await taskService.remove(btn.dataset.id);
        loadAll();
      } catch (err) {
        showAlert("alertContainer", err.message);
      }
    });
  });
}

function attachProgressForm() {
  document
    .getElementById("progressForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = document
        .getElementById("progressDescription")
        .value.trim();
      const notes = document.getElementById("progressNotes").value.trim();

      if (!description) {
        showAlert("alertContainer", "Briefly describe the progress made");
        return;
      }
      try {
        await progressService.create(projectId, { description, notes });
        loadAll();
      } catch (err) {
        showAlert("alertContainer", err.message);
      }
    });
}

function attachStatusActions(project) {
  const markCompletedBtn = document.getElementById("markCompletedBtn");
  const markAbandonedBtn = document.getElementById("markAbandonedBtn");
  const archiveBtn = document.getElementById("archiveBtn");
  const reopenBtn = document.getElementById("reopenBtn");

  markCompletedBtn?.addEventListener("click", async () => {
    if (!confirm("Mark this project as completed?")) return;
    try {
      await projectService.changeStatus(project.id, {
        status: PROJECT_STATUS.COMPLETED,
      });
      loadAll();
    } catch (err) {
      showAlert("alertContainer", err.message);
    }
  });

  markAbandonedBtn?.addEventListener("click", () => showAbandonPanel(project));

  archiveBtn?.addEventListener("click", async () => {
    if (!confirm("Archive this project? You can still reopen it later."))
      return;
    try {
      await projectService.archive(project.id);
      loadAll();
    } catch (err) {
      showAlert("alertContainer", err.message);
    }
  });

  reopenBtn?.addEventListener("click", async () => {
    try {
      await projectService.reopen(project.id);
      loadAll();
    } catch (err) {
      showAlert("alertContainer", err.message);
    }
  });
}

async function showAbandonPanel(project) {
  const panel = document.getElementById("statusPanel");
  const options = cachedAbandonReasons
    .map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`)
    .join("");

  panel.innerHTML = `
    <div class="card p-3">
      <div class="mb-3">
        <label for="reasonSelect" class="form-label">Why is this project being abandoned?</label>
        <select id="reasonSelect" class="form-select">${options}</select>
      </div>
      <div class="mb-3">
        <label for="reasonDetail" class="form-label">Additional details (optional)</label>
        <input type="text" id="reasonDetail" class="form-control" placeholder="Anything specific you'd like to remember" />
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" id="confirmAbandonBtn" type="button">Confirm</button>
        <button class="btn btn-outline-secondary" id="cancelAbandonBtn" type="button">Cancel</button>
      </div>
    </div>
  `;

  document.getElementById("cancelAbandonBtn").addEventListener("click", () => {
    panel.innerHTML = "";
  });

  document
    .getElementById("confirmAbandonBtn")
    .addEventListener("click", async () => {
      const reasonId = document.getElementById("reasonSelect").value;
      const reasonDetail = document.getElementById("reasonDetail").value.trim();
      if (!reasonId) {
        showAlert("alertContainer", "Please choose a reason for abandonment");
        return;
      }
      try {
        await projectService.changeStatus(project.id, {
          status: PROJECT_STATUS.ABANDONED,
          reasonId,
          reasonDetail,
        });
        loadAll();
      } catch (err) {
        showAlert("alertContainer", err.message);
      }
    });
}

loadAll();
