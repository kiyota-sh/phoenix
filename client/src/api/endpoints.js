const API_PREFIX = "/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
  },
  USERS: {
    PROFILE: `${API_PREFIX}/users/profile`,
  },
  PROJECTS: {
    BASE: `${API_PREFIX}/projects`,
    DETAIL: (id) => `${API_PREFIX}/projects/${id}`,
    ARCHIVE: (id) => `${API_PREFIX}/projects/${id}/archive`,
    STATUS: (id) => `${API_PREFIX}/projects/${id}/status`,
    REOPEN: (id) => `${API_PREFIX}/projects/${id}/reopen`,
    SEARCH: `${API_PREFIX}/projects/search`,
  },
  PROGRESS: {
    BY_PROJECT: (projectId) => `${API_PREFIX}/projects/${projectId}/progress`,
    DETAIL: (id) => `${API_PREFIX}/progress/${id}`,
  },
  TASKS: {
    BY_PROJECT: (projectId) => `${API_PREFIX}/projects/${projectId}/tasks`,
    DETAIL: (id) => `${API_PREFIX}/tasks/${id}`,
    TOGGLE: (id) => `${API_PREFIX}/tasks/${id}/toggle`,
  },
  CATEGORIES: {
    BASE: `${API_PREFIX}/categories`,
    DETAIL: (id) => `${API_PREFIX}/categories/${id}`,
  },
  CATALOGS: {
    ABANDON_REASONS: `${API_PREFIX}/catalogs/abandon-reasons`,
  },
  DASHBOARD: {
    SUMMARY: `${API_PREFIX}/dashboard/summary`,
    RECENT_ACTIVITY: `${API_PREFIX}/dashboard/recent-activity`,
    UPCOMING_GOALS: `${API_PREFIX}/dashboard/upcoming-goals`,
  },
  STATISTICS: {
    BY_CATEGORY: `${API_PREFIX}/statistics/by-category`,
    ABANDON_REASONS: `${API_PREFIX}/statistics/abandon-reasons`,
    AVG_TIME_TO_ABANDON: `${API_PREFIX}/statistics/average-time-to-abandon`,
    COMPLETED_BY_YEAR: `${API_PREFIX}/statistics/completed-by-year`,
  },
  HISTORY: {
    BY_PROJECT: (projectId) => `${API_PREFIX}/projects/${projectId}/history`,
  },
};
