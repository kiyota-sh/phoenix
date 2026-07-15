import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { setToken, clearToken } from "../../utils/tokenStorage.js";
import {
  mockLogin,
  mockRegister,
  mockLogout,
  mockGetProfile,
  mockUpdateProfile,
} from "../../utils/mockData.js";

function toBackendRegister({ name, email, password }) {
  return { nombre: name, email, password };
}
function toBackendProfileUpdate({ name, email }) {
  return { nombre: name, email };
}
function fromBackendUser(raw = {}) {
  return { id: raw.id, name: raw.nombre, email: raw.email };
}
function fromAuthResponse(raw = {}) {
  return {
    token: raw.token,
    user: raw.usuario ? fromBackendUser(raw.usuario) : null,
  };
}

export const authService = {
  register: async (userData) => {
    if (USE_MOCK) return mockRegister(userData);
    const data = await fetchClient.post(
      ENDPOINTS.AUTH.REGISTER,
      toBackendRegister(userData),
    );
    return fromAuthResponse(data);
  },

  login: async (credentials) => {
    if (USE_MOCK) return mockLogin(credentials);
    const data = await fetchClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
    const result = fromAuthResponse(data);
    if (result.token) setToken(result.token);
    return result;
  },

  logout: async () => {
    try {
      if (USE_MOCK) await mockLogout();
      else await fetchClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      clearToken();
    }
  },

  getProfile: async () => {
    if (USE_MOCK) return mockGetProfile();
    const data = await fetchClient.get(ENDPOINTS.USERS.PROFILE);
    return fromBackendUser(data);
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK) return mockUpdateProfile(profileData);
    const data = await fetchClient.put(
      ENDPOINTS.USERS.PROFILE,
      toBackendProfileUpdate(profileData),
    );
    return fromBackendUser(data);
  },
};
