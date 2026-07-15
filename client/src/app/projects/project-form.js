import { requireAuth } from "../../utils/authGuard.js";
import { projectService } from "../../api/services/projectService.js";
import { categoryService } from "../../api/services/categoryService.js";
import { PATHS, goTo, getQueryParam } from "../../routes/paths.js";
import { showAlert } from "../../utils/ui.js";

await requireAuth();

const form = document.getElementById("projectForm");
const submitBtn = document.getElementById("submitBtn");
const formTitle = document.getElementById("formTitle");
const categorySelect = document.getElementById("category");

const projectId = getQueryParam("id");
const isEditMode = Boolean(projectId);

async function loadCategories(selectedId = null) {
  const categories = await categoryService.getAll();
  categorySelect.innerHTML = '<option value="">Select a category</option>';
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    if (selectedId && String(cat.id) === String(selectedId))
      option.selected = true;
    categorySelect.appendChild(option);
  });
}

function fillForm(project) {
  document.getElementById("name").value = project.name || "";
  document.getElementById("description").value = project.description || "";
  document.getElementById("goal").value = project.goal || "";
  document.getElementById("priority").value = project.priority || "medium";
  document.getElementById("startDate").value =
    project.startDate?.slice(0, 10) || "";
  document.getElementById("targetDate").value =
    project.targetDate?.slice(0, 10) || "";
}

function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    goal: document.getElementById("goal").value.trim(),
    categoryId: categorySelect.value,
    priority: document.getElementById("priority").value,
    startDate: document.getElementById("startDate").value,
    targetDate: document.getElementById("targetDate").value || null,
  };
}

function validate(data) {
  if (!data.name) return "Project name is required";
  if (!data.categoryId) return "Please select a category";
  if (!data.startDate) return "Start date is required";
  if (data.targetDate && data.targetDate < data.startDate)
    return "Target date cannot be earlier than the start date";
  return null;
}

async function init() {
  if (isEditMode) {
    formTitle.textContent = "Edit project";
    submitBtn.textContent = "Save changes";
    try {
      const [project] = await Promise.all([
        projectService.getById(projectId),
        loadCategories(),
      ]);
      fillForm(project);
      categorySelect.value = project.categoryId;
    } catch (err) {
      showAlert("alertContainer", err.message);
    }
  } else {
    await loadCategories();
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = getFormData();
  const validationError = validate(data);
  if (validationError) {
    showAlert("alertContainer", validationError);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = isEditMode ? "Saving..." : "Creating...";

  try {
    const saved = isEditMode
      ? await projectService.update(projectId, data)
      : await projectService.create(data);
    goTo(PATHS.PROJECT_DETAIL, { id: saved.id || projectId });
  } catch (err) {
    showAlert("alertContainer", err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = isEditMode ? "Save changes" : "Create project";
  }
});

init();
