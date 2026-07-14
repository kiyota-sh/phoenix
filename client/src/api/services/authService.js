// src/api/authService.js
import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockLogin,
  mockRegister,
  mockLogout,
  mockGetProfile,
  mockUpdateProfile,
} from "../utils/mockData.js";

export const authService = {
  login: (credentials) =>
    USE_MOCK
      ? mockLogin(credentials)
      : fetchClient.post(ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) =>
    USE_MOCK
      ? mockRegister(userData)
      : fetchClient.post(ENDPOINTS.AUTH.REGISTER, userData),
  logout: () =>
    USE_MOCK ? mockLogout() : fetchClient.post(ENDPOINTS.AUTH.LOGOUT),
  forgotPassword: (email) =>
    USE_MOCK
      ? Promise.resolve({ success: true })
      : fetchClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  getProfile: () =>
    USE_MOCK ? mockGetProfile() : fetchClient.get(ENDPOINTS.USERS.PROFILE),
  updateProfile: (data) =>
    USE_MOCK
      ? mockUpdateProfile(data)
      : fetchClient.put(ENDPOINTS.USERS.PROFILE, data),
};
