// src/api/services/projectService.js
import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { extractArray } from "../../utils/apiHelpers.js";
import {
  mockGetProjects,
  mockGetProjectById,
  mockCreateProject,
  mockUpdateProject,
  mockChangeProjectStatus,
  mockReopenProject,
} from "../../utils/mockData.js";

function toBackendProject({
  name,
  description,
  goal,
  categoryId,
  priority,
  startDate,
  targetDate,
}) {
  return {
    nombre: name,
    descripcion: description,
    objetivo: goal,
    categoriaId: categoryId || null,
    prioridad: priority,
    fechaInicio: startDate,
    fechaObjetivo: targetDate,
  };
}

function fromBackendProject(raw = {}) {
  return {
    id: raw.id,
    name: raw.nombre,
    description: raw.descripcion,
    goal: raw.objetivo,
    categoryId: raw.categoriaId,
    // Only obtenerDetalle() includes the Categoria association — the
    // list endpoint doesn't join it, so this will be null there.
    // projects.js resolves the name client-side using the categories
    // it already loads for the filter dropdown.
    categoryName: raw.categoria?.nombre ?? null,
    priority: raw.prioridad,
    status: raw.estado,
    startDate: raw.fechaInicio,
    targetDate: raw.fechaObjetivo,
    // progreso is calculated server-side from weighted tasks and is
    // null when the project has no tasks yet — surfaced as null here
    // (not coerced to 0) so the UI can show "no tasks yet" instead of "0%".
    progress: raw.progreso,
    daysRemaining: raw.diasRestantesObjetivo,
    abandonReasonId: raw.motivoAbandonoId ?? null,
    abandonReasonDetail: raw.motivoAbandonoDetalle ?? null,
  };
}

// Confirmed from proyecto.service.listar(): the query key is "categoria",
// not "categoriaId" — and there is NO text-search parameter at all.
function toBackendFilters({ category, status, priority } = {}) {
  return {
    categoria: category || undefined,
    estado: status || undefined,
    prioridad: priority || undefined,
  };
}

export const projectService = {
  getAll: async (filters = {}) => {
    if (USE_MOCK) return mockGetProjects(filters);
    const data = await fetchClient.get(ENDPOINTS.PROJECTS.BASE, {
      params: { ...toBackendFilters(filters), limit: 100 },
    });
    return extractArray(data).map(fromBackendProject);
  },

  getById: async (id) => {
    if (USE_MOCK) return mockGetProjectById(id);
    const data = await fetchClient.get(ENDPOINTS.PROJECTS.DETAIL(id));
    return fromBackendProject(data);
  },

  create: async (project) => {
    if (USE_MOCK) return mockCreateProject(project);
    const data = await fetchClient.post(
      ENDPOINTS.PROJECTS.BASE,
      toBackendProject(project),
    );
    return fromBackendProject(data);
  },

  update: async (id, project) => {
    if (USE_MOCK) return mockUpdateProject(id, project);
    const data = await fetchClient.put(
      ENDPOINTS.PROJECTS.DETAIL(id),
      toBackendProject(project),
    );
    return fromBackendProject(data);
  },

  archive: async (id) => {
    if (USE_MOCK) return Promise.resolve({ success: true });
    return fetchClient.patch(ENDPOINTS.PROJECTS.ARCHIVE(id));
  },

  // reason is { id, detail } now — id is required (numeric, from the
  // catalog), detail is optional free text.
  changeStatus: async (id, { status, reasonId, reasonDetail }) => {
    if (USE_MOCK)
      return mockChangeProjectStatus(id, { status, reason: reasonDetail });
    const data = await fetchClient.patch(ENDPOINTS.PROJECTS.STATUS(id), {
      estado: status,
      motivoAbandonoId: reasonId,
      motivoAbandonoDetalle: reasonDetail || null,
    });
    return fromBackendProject(data);
  },

  reopen: async (id) => {
    if (USE_MOCK) return mockReopenProject(id);
    const data = await fetchClient.patch(ENDPOINTS.PROJECTS.REOPEN(id));
    return fromBackendProject(data);
  },

  // No text-search capability exists on the backend at all — filter
  // by name on the client after fetching everything that matches the
  // other filters.
  search: async (query, filters = {}) => {
    const all = await projectService.getAll(filters);
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((p) => p.name.toLowerCase().includes(q));
  },
};
