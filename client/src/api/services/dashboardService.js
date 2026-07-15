import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetDashboardSummary,
  mockGetRecentActivity,
  mockGetUpcomingGoals,
} from "../../utils/mockData.js";
import { extractArray } from "../../utils/apiHelpers.js";

export const dashboardService = {
  getSummary: async () => {
    if (USE_MOCK) return mockGetDashboardSummary();
    const raw = await fetchClient.get(ENDPOINTS.DASHBOARD.SUMMARY);
    return {
      active: raw.activos ?? raw.active ?? 0,
      abandoned: raw.abandonados ?? raw.abandoned ?? 0,
      completed: raw.finalizados ?? raw.completed ?? 0,
    };
  },
  getRecentActivity: async () => {
    if (USE_MOCK) return mockGetRecentActivity();
    const data = await fetchClient.get(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY);
    return extractArray(data).map((raw) => ({
      date: raw.fecha,
      description: raw.descripcion,
    }));
  },
  getUpcomingGoals: async () => {
    if (USE_MOCK) return mockGetUpcomingGoals();
    const data = await fetchClient.get(ENDPOINTS.DASHBOARD.UPCOMING_GOALS);
    return extractArray(data).map((raw) => ({
      name: raw.nombre,
      targetDate: raw.fechaObjetivo,
    }));
  },
};
