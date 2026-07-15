import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { mockGetAbandonReasons } from "../../utils/mockData.js";
import { extractArray } from "../../utils/apiHelpers.js";

function fromBackendReason(raw = {}) {
  return { id: raw.id, name: raw.nombre };
}

export const catalogService = {
  getAbandonReasons: async () => {
    if (USE_MOCK) return mockGetAbandonReasons();
    const data = await fetchClient.get(ENDPOINTS.CATALOGS.ABANDON_REASONS);
    return extractArray(data).map(fromBackendReason);
  },
};
