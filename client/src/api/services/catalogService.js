import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { mockGetAbandonReasons } from "../../utils/mockData.js";

export const catalogService = {
  getAbandonReasons: () =>
    USE_MOCK
      ? mockGetAbandonReasons()
      : fetchClient.get(ENDPOINTS.CATALOGS.ABANDON_REASONS),
};
