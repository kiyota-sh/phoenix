const API_PREFIX = "/api/v1";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/registro`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
  },
  USERS: {
    PROFILE: `${API_PREFIX}/usuarios/perfil`,
    PASSWORD: `${API_PREFIX}/usuarios/password`,
  },
  PROJECTS: {
    BASE: `${API_PREFIX}/proyectos`,
    DETAIL: (id) => `${API_PREFIX}/proyectos/${id}`,
    ARCHIVE: (id) => `${API_PREFIX}/proyectos/${id}/archivar`,
    STATUS: (id) => `${API_PREFIX}/proyectos/${id}/estado`,
    REOPEN: (id) => `${API_PREFIX}/proyectos/${id}/reabrir`,
  },
  PROGRESS: {
    BY_PROJECT: (projectId) => `${API_PREFIX}/proyectos/${projectId}/avances`,
    DETAIL: (id) => `${API_PREFIX}/avances/${id}`, // PUT/DELETE live at top level, not nested
  },
  TASKS: {
    BY_PROJECT: (projectId) => `${API_PREFIX}/proyectos/${projectId}/tareas`,
    DETAIL: (id) => `${API_PREFIX}/tareas/${id}`,
    COMPLETE: (id) => `${API_PREFIX}/tareas/${id}/completar`,
  },
  CATEGORIES: {
    BASE: `${API_PREFIX}/categorias`,
    DETAIL: (id) => `${API_PREFIX}/categorias/${id}`,
  },
  CATALOGS: {
    ABANDON_REASONS: `${API_PREFIX}/catalogos/motivos-abandono`,
  },
  DASHBOARD: {
    SUMMARY: `${API_PREFIX}/dashboard/resumen`,
    RECENT_ACTIVITY: `${API_PREFIX}/dashboard/actividad-reciente`,
    UPCOMING_GOALS: `${API_PREFIX}/dashboard/proximos-objetivos`,
  },
  STATISTICS: {
    BY_CATEGORY: `${API_PREFIX}/estadisticas/por-categoria`,
    ABANDON_REASONS: `${API_PREFIX}/estadisticas/motivos-abandono`,
    AVG_TIME_TO_ABANDON: `${API_PREFIX}/estadisticas/tiempo-promedio-abandono`,
    COMPLETED_BY_YEAR: `${API_PREFIX}/estadisticas/completados-por-anio`,
  },
  HISTORY: {
    BY_PROJECT: (projectId) => `${API_PREFIX}/proyectos/${projectId}/historial`,
  },
};
