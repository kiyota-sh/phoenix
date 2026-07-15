// src/api/projectService.js
import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetProjects,
  mockSearchProjects,
  mockGetProjectById,
  mockCreateProject,
  mockUpdateProject,
  mockChangeProjectStatus,
  mockReopenProject,
} from "../../utils/mockData.js";

export const projectService = {
  getAll: (filters = {}) =>
    USE_MOCK
      ? mockGetProjects(filters)
      : fetchClient.get(ENDPOINTS.PROJECTS.BASE, { params: filters }),
  getById: (id) =>
    USE_MOCK
      ? mockGetProjectById(id)
      : fetchClient.get(ENDPOINTS.PROJECTS.DETAIL(id)),
  create: (project) =>
    USE_MOCK
      ? mockCreateProject(project)
      : fetchClient.post(ENDPOINTS.PROJECTS.BASE, project),
  update: (id, project) =>
    USE_MOCK
      ? mockUpdateProject(id, project)
      : fetchClient.put(ENDPOINTS.PROJECTS.DETAIL(id), project),
  archive: (id) =>
    USE_MOCK
      ? Promise.resolve({ success: true })
      : fetchClient.patch(ENDPOINTS.PROJECTS.ARCHIVE(id)),
  changeStatus: (id, statusData) =>
    USE_MOCK
      ? mockChangeProjectStatus(id, statusData)
      : fetchClient.patch(ENDPOINTS.PROJECTS.STATUS(id), statusData),
  reopen: (id) =>
    USE_MOCK
      ? mockReopenProject(id)
      : fetchClient.patch(ENDPOINTS.PROJECTS.REOPEN(id)),
  search: (query, filters = {}) =>
    USE_MOCK
      ? mockSearchProjects(query, filters)
      : fetchClient.get(ENDPOINTS.PROJECTS.SEARCH, {
          params: { query, ...filters },
        }),
};
