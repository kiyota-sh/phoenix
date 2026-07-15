import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetDashboardSummary,
  mockGetRecentActivity,
  mockGetUpcomingGoals,
} from "../../utils/mockData.js";

export const dashboardService = {
  getSummary: () =>
    USE_MOCK
      ? mockGetDashboardSummary()
      : fetchClient.get(ENDPOINTS.DASHBOARD.SUMMARY),
  getRecentActivity: () =>
    USE_MOCK
      ? mockGetRecentActivity()
      : fetchClient.get(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY),
  getUpcomingGoals: () =>
    USE_MOCK
      ? mockGetUpcomingGoals()
      : fetchClient.get(ENDPOINTS.DASHBOARD.UPCOMING_GOALS),
};
