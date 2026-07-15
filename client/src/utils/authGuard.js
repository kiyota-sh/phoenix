import { authService } from "../api/services/authService.js";
import { getToken } from "./tokenStorage.js";
import { PATHS, goTo } from "../routes/paths.js";

export async function requireAuth() {
  if (!getToken()) {
    goTo(PATHS.LOGIN);
    throw { status: 401, message: "Not signed in" };
  }
  try {
    return await authService.getProfile();
  } catch (err) {
    goTo(PATHS.LOGIN);
    throw err;
  }
}
