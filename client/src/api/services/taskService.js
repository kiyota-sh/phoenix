import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { extractArray } from "../../utils/apiHelpers.js";
import {
  mockGetTasks,
  mockCreateTask,
  mockToggleTask,
  mockRemoveTask,
} from "../../utils/mockData.js";

function toBackendTask({ title, weight }) {
  return { nombre: title, peso: weight };
}
function fromBackendTask(raw = {}) {
  return {
    id: raw.id,
    title: raw.nombre,
    weight: raw.peso,
    completed: raw.completado,
    order: raw.orden,
  };
}

export const taskService = {
  getByProject: async (projectId) => {
    if (USE_MOCK) return mockGetTasks(projectId);
    const data = await fetchClient.get(ENDPOINTS.TASKS.BY_PROJECT(projectId));
    return extractArray(data).map(fromBackendTask);
  },
  create: async (projectId, task) => {
    if (USE_MOCK) return mockCreateTask(projectId, task);
    const data = await fetchClient.post(
      ENDPOINTS.TASKS.BY_PROJECT(projectId),
      toBackendTask(task),
    );
    return fromBackendTask(data);
  },
  toggle: async (id, completed) => {
    if (USE_MOCK) return mockToggleTask(id);
    const data = await fetchClient.patch(ENDPOINTS.TASKS.COMPLETE(id), {
      completado: completed,
    });
    return fromBackendTask(data);
  },
  remove: async (id) => {
    if (USE_MOCK) return mockRemoveTask(id);
    return fetchClient.delete(ENDPOINTS.TASKS.DETAIL(id));
  },
};
