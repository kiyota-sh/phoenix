import { requireAuth } from "../../utils/authGuard.js";
import { projectService } from "../../api/projectService.js";
import { progressService } from "../../api/progressService.js";
import { historyService } from "../../api/historyService.js";
import { catalogService } from "../../api/catalogService.js";
import { taskService } from "../../api/taskService.js";
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
    const [project, entries, history, tasks] = await Promise.all([
      projectService.getById(projectId),
      progressService.getByProject(projectId),
      historyService.getByProject(projectId),
      taskService.getByProject(projectId),
    ]);
    render(project, entries.items || entries, history.items || history, tasks);
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

function render(project, entries, history, tasks) {
  const badgeClass = STATUS_BADGE_CLASS[project.status] || "text-bg-success";
  const statusLabel = STATUS_LABELS[project.status] || project.status;
  const priorityLabel = PRIORITY_LABELS[project.priority] || project.priority;

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
        <div class="progress-bar" style="width:${project.progress ?? 0}%;"></div>
      </div>
      <p class="text-secondary small mt-1">${project.progress ?? 0}% complete — based on ${tasks.filter((t) => t.completed).length} of ${tasks.length} tasks</p>

      <div class="row row-cols-2 row-cols-md-4 g-3 mt-2">
        <div class="col"><div class="text-secondary text-uppercase small">Start date</div><div class="font-mono">${formatDate(project.startDate)}</div></div>
        <div class="col"><div class="text-secondary text-uppercase small">Target date</div><div class="font-mono">${formatDate(project.targetDate)}</div></div>
        <div class="col"><div class="text-secondary text-uppercase small">Last progress</div><div class="font-mono">${formatDate(project.lastProgressDate)}</div></div>
        ${project.abandonReason ? `<div class="col"><div class="text-secondary text-uppercase small">Abandon reason</div><div class="font-mono">${escapeHtml(project.abandonReason)}</div></div>` : ""}
      </div>
    </div>

    <div id="statusPanel" class="mt-3"></div>

    <h2 class="h5 fst-italic mt-4">Tasks</h2>
    <p class="text-secondary small mt-n2 mb-3">Break the project into steps. The progress bar above updates automatically as you check them off.</p>
    <div class="card p-4">
      <form id="taskForm" class="input-group mb-3">
        <input type="text" id="taskTitle" class="form-control" placeholder="Add a task..." required maxlength="140" />
        <button type="submit" class="btn btn-primary">Add</button>
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
    `;
  }
  if (project.status === PROJECT_STATUS.ABANDONED) {
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
    const title = titleInput.value.trim();
    if (!title) return;
    try {
      await taskService.create(projectId, { title });
      loadAll();
    } catch (err) {
      showAlert("alertContainer", err.message);
    }
  });

  document.querySelectorAll(".task-toggle").forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      try {
        await taskService.toggle(checkbox.dataset.id);
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
  let reasons = [];
  try {
    reasons = await catalogService.getAbandonReasons();
  } catch {
    reasons = [];
  }

  const options = reasons
    .map(
      (r) =>
        `<option value="${escapeHtml(r.name)}">${escapeHtml(r.name)}</option>`,
    )
    .join("");

  panel.innerHTML = `
    <div class="card p-3">
      <div class="mb-3">
        <label for="reasonSelect" class="form-label">Why is this project being abandoned?</label>
        <select id="reasonSelect" class="form-select">${options}<option value="other">Other</option></select>
      </div>
      <div id="otherReasonWrap" class="mb-3" style="display:none;">
        <label for="otherReason" class="form-label">Specify the reason</label>
        <input type="text" id="otherReason" class="form-control" />
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-primary" id="confirmAbandonBtn" type="button">Confirm</button>
        <button class="btn btn-outline-secondary" id="cancelAbandonBtn" type="button">Cancel</button>
      </div>
    </div>
  `;

  const select = document.getElementById("reasonSelect");
  const otherWrap = document.getElementById("otherReasonWrap");
  select.addEventListener("change", () => {
    otherWrap.style.display = select.value === "other" ? "block" : "none";
  });

  document.getElementById("cancelAbandonBtn").addEventListener("click", () => {
    panel.innerHTML = "";
  });

  document
    .getElementById("confirmAbandonBtn")
    .addEventListener("click", async () => {
      const reason =
        select.value === "other"
          ? document.getElementById("otherReason").value.trim()
          : select.value;
      if (!reason) {
        showAlert("alertContainer", "Please provide a reason for abandonment");
        return;
      }
      try {
        await projectService.changeStatus(project.id, {
          status: PROJECT_STATUS.ABANDONED,
          reason,
        });
        loadAll();
      } catch (err) {
        showAlert("alertContainer", err.message);
      }
    });
}

loadAll();
