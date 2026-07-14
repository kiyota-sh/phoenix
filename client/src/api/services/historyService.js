import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { mockGetHistory } from "../utils/mockData.js";

export const historyService = {
  getByProject: (projectId) =>
    USE_MOCK
      ? mockGetHistory(projectId)
      : fetchClient.get(ENDPOINTS.HISTORY.BY_PROJECT(projectId)),
};
