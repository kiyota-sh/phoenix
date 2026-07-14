import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetTasks,
  mockCreateTask,
  mockToggleTask,
  mockRemoveTask,
} from "../../utils/mockData.js";

export const taskService = {
  getByProject: (projectId) =>
    USE_MOCK
      ? mockGetTasks(projectId)
      : fetchClient.get(ENDPOINTS.TASKS.BY_PROJECT(projectId)),
  create: (projectId, task) =>
    USE_MOCK
      ? mockCreateTask(projectId, task)
      : fetchClient.post(ENDPOINTS.TASKS.BY_PROJECT(projectId), task),
  toggle: (id) =>
    USE_MOCK
      ? mockToggleTask(id)
      : fetchClient.patch(ENDPOINTS.TASKS.TOGGLE(id)),
  remove: (id) =>
    USE_MOCK
      ? mockRemoveTask(id)
      : fetchClient.delete(ENDPOINTS.TASKS.DETAIL(id)),
};
