import { authService } from "../../api/services/authService.js";
import { PATHS, goTo } from "../../routes/paths.js";
import { showAlert } from "../../utils/ui.js";

const form = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password) {
    showAlert("alertContainer", "Please fill in all fields");
    return;
  }
  if (password.length < 8) {
    showAlert("alertContainer", "Password must be at least 8 characters long");
    return;
  }
  if (password !== confirmPassword) {
    showAlert("alertContainer", "Passwords do not match");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    await authService.register({ name, email, password });
    goTo(PATHS.LOGIN);
  } catch (err) {
    showAlert("alertContainer", err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Create account";
  }
});
