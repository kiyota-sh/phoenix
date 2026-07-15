import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetProgressEntries,
  mockCreateProgressEntry,
  mockRemoveProgressEntry,
} from "../../utils/mockData.js";
import { extractArray } from "../../utils/apiHelpers.js";

function toBackendEntry({ description, notes }) {
  return { descripcion: description, notas: notes };
}
function fromBackendEntry(raw = {}) {
  return {
    id: raw.id,
    date: raw.fecha,
    description: raw.descripcion,
    notes: raw.notas,
  };
}

export const progressService = {
  getByProject: async (projectId, filters = {}) => {
    if (USE_MOCK) return mockGetProgressEntries(projectId);
    const data = await fetchClient.get(
      ENDPOINTS.PROGRESS.BY_PROJECT(projectId),
      { params: filters },
    );
    return extractArray(data).map(fromBackendEntry);
  },
  create: async (projectId, entry) => {
    if (USE_MOCK) return mockCreateProgressEntry(projectId, entry);
    const data = await fetchClient.post(
      ENDPOINTS.PROGRESS.BY_PROJECT(projectId),
      toBackendEntry(entry),
    );
    return fromBackendEntry(data);
  },
  update: async (id, entry) => {
    if (USE_MOCK) return Promise.resolve(entry);
    const data = await fetchClient.put(
      ENDPOINTS.PROGRESS.DETAIL(id),
      toBackendEntry(entry),
    );
    return fromBackendEntry(data);
  },
  remove: async (id) => {
    if (USE_MOCK) return mockRemoveProgressEntry(id);
    return fetchClient.delete(ENDPOINTS.PROGRESS.DETAIL(id));
  },
};
