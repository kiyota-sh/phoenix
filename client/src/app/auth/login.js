import { authService } from "../../api/services/authService.js";
import { PATHS, goTo } from "../../routes/paths.js";
import { showAlert } from "../../utils/ui.js";

const form = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("alertContainer", "Please fill in all fields");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  try {
    await authService.login({ email, password });
    goTo(PATHS.DASHBOARD);
  } catch (err) {
    showAlert("alertContainer", err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign in";
  }
});
