import { requireAuth } from "../../utils/authGuard.js";
import { categoryService } from "../../api/services/categoryService.js";
import { showAlert, showLoading, escapeHtml } from "../../utils/ui.js";

await requireAuth();

const form = document.getElementById("categoryForm");
const nameInput = document.getElementById("categoryName");
const list = document.getElementById("categoryList");

async function loadCategories() {
  showLoading("categoryList");
  try {
    const categories = await categoryService.getAll();
    renderList(categories);
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

function renderList(categories) {
  if (!categories || categories.length === 0) {
    list.innerHTML =
      '<p class="text-secondary p-3 mb-0">You have no categories yet. Add the first one above.</p>';
    return;
  }
  list.innerHTML = `<ul class="list-group list-group-flush">${categories
    .map(
      (cat) => `
      <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center">
        <span>${escapeHtml(cat.name)}</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary edit-btn" data-id="${cat.id}" data-name="${escapeHtml(cat.name)}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${cat.id}"><i class="bi bi-trash"></i></button>
        </div>
      </li>
    `,
    )
    .join("")}</ul>`;

  list
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        handleEdit(btn.dataset.id, btn.dataset.name),
      ),
    );
  list
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => handleDelete(btn.dataset.id)),
    );
}

async function handleEdit(id, currentName) {
  const newName = prompt("New category name:", currentName);
  if (!newName || !newName.trim() || newName === currentName) return;
  try {
    await categoryService.update(id, { name: newName.trim() });
    loadCategories();
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

async function handleDelete(id) {
  if (
    !confirm("Delete this category? Associated projects will not be deleted.")
  )
    return;
  try {
    await categoryService.remove(id);
    loadCategories();
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  try {
    await categoryService.create({ name });
    nameInput.value = "";
    loadCategories();
  } catch (err) {
    showAlert("alertContainer", err.message);
  }
});

loadCategories();
