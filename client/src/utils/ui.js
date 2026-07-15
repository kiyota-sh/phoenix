import { showSuccessToast, showErrorToast } from "./toast.js";

export function showAlert(containerId, message, type = "danger") {
  if (type === "success") showSuccessToast(message);
  else showErrorToast(message);
}

export function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }
}

export function clearContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = "";
}

export function escapeHtml(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
