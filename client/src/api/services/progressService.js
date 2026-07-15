import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetProgressEntries,
  mockCreateProgressEntry,
  mockRemoveProgressEntry,
} from "../../utils/mockData.js";

export const progressService = {
  getByProject: (projectId, filters = {}) =>
    USE_MOCK
      ? mockGetProgressEntries(projectId)
      : fetchClient.get(ENDPOINTS.PROGRESS.BY_PROJECT(projectId), {
          params: filters,
        }),
  create: (projectId, entry) =>
    USE_MOCK
      ? mockCreateProgressEntry(projectId, entry)
      : fetchClient.post(ENDPOINTS.PROGRESS.BY_PROJECT(projectId), entry),
  remove: (id) =>
    USE_MOCK
      ? mockRemoveProgressEntry(id)
      : fetchClient.delete(ENDPOINTS.PROGRESS.DETAIL(id)),
};
