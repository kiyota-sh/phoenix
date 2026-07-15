import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { mockGetHistory } from "../../utils/mockData.js";
import { extractArray } from "../../utils/apiHelpers.js";

function fromBackendHistoryEntry(raw = {}) {
  return {
    id: raw.id,
    date: raw.fecha,
    field: raw.campoModificado ?? raw.campo,
    oldValue: raw.valorAnterior,
    newValue: raw.valorNuevo,
  };
}

export const historyService = {
  getByProject: async (projectId) => {
    if (USE_MOCK) return mockGetHistory(projectId);
    const data = await fetchClient.get(ENDPOINTS.HISTORY.BY_PROJECT(projectId));
    return extractArray(data).map(fromBackendHistoryEntry);
  },
};
