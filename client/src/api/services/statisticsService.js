import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetStatsByCategory,
  mockGetStatsAbandonReasons,
  mockGetStatsCompletedByYear,
  mockGetAvgTimeToAbandon,
} from "../../utils/mockData.js";

export const statisticsService = {
  getByCategory: () =>
    USE_MOCK
      ? mockGetStatsByCategory()
      : fetchClient.get(ENDPOINTS.STATISTICS.BY_CATEGORY),
  getAbandonReasons: () =>
    USE_MOCK
      ? mockGetStatsAbandonReasons()
      : fetchClient.get(ENDPOINTS.STATISTICS.ABANDON_REASONS),
  getAvgTimeToAbandon: () =>
    USE_MOCK
      ? mockGetAvgTimeToAbandon()
      : fetchClient.get(ENDPOINTS.STATISTICS.AVG_TIME_TO_ABANDON),
  getCompletedByYear: () =>
    USE_MOCK
      ? mockGetStatsCompletedByYear()
      : fetchClient.get(ENDPOINTS.STATISTICS.COMPLETED_BY_YEAR),
};
