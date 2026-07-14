import { authService } from "../api/services/authService.js";
import { PATHS, goTo } from "../routes/paths.js";

export async function requireAuth() {
  try {
    return await authService.getProfile();
  } catch (err) {
    goTo(PATHS.LOGIN);
    throw err;
  }
}
