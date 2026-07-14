import { requireAuth } from "../../utils/authGuard.js";
import { authService } from "../../api/services/authService.js";
import { showAlert } from "../../utils/ui.js";

const user = await requireAuth();
document.getElementById("name").value = user.name || "";
document.getElementById("email").value = user.email || "";

const form = document.getElementById("profileForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
  };
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";
  try {
    await authService.updateProfile(data);
    showAlert("alertContainer", "Profile updated successfully", "success");
  } catch (err) {
    showAlert("alertContainer", err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save changes";
  }
});
