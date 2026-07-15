import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { extractArray } from "../../utils/apiHelpers.js";
import {
  mockGetStatsByCategory,
  mockGetStatsAbandonReasons,
  mockGetStatsCompletedByYear,
  mockGetAvgTimeToAbandon,
} from "../../utils/mockData.js";

export const statisticsService = {
  getByCategory: async () => {
    if (USE_MOCK) return mockGetStatsByCategory();
    const data = await fetchClient.get(ENDPOINTS.STATISTICS.BY_CATEGORY);
    return extractArray(data).map((raw) => ({
      category: raw.categoria,
      total: raw.cantidad,
    }));
  },
  getAbandonReasons: async () => {
    if (USE_MOCK) return mockGetStatsAbandonReasons();
    const data = await fetchClient.get(ENDPOINTS.STATISTICS.ABANDON_REASONS);
    return extractArray(data).map((raw) => ({
      reason: raw.motivo,
      total: raw.cantidad,
    }));
  },
  getAvgTimeToAbandon: async () => {
    if (USE_MOCK) return mockGetAvgTimeToAbandon();
    // NOT a list — tiempoPromedioAbandono returns a single { diasPromedio } object.
    const raw = await fetchClient.get(ENDPOINTS.STATISTICS.AVG_TIME_TO_ABANDON);
    return { days: raw.diasPromedio };
  },
  getCompletedByYear: async () => {
    if (USE_MOCK) return mockGetStatsCompletedByYear();
    const data = await fetchClient.get(ENDPOINTS.STATISTICS.COMPLETED_BY_YEAR);
    return extractArray(data).map((raw) => ({
      year: raw.anio,
      total: raw.cantidad,
    }));
  },
};
