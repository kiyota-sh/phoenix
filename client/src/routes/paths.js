const BASE_PATH = "/client/src"

export const PATHS = {
  LOGIN: `${BASE_PATH}/app/auth/login.html`,
  REGISTER: `${BASE_PATH}/app/auth/register.html`,

  DASHBOARD: `${BASE_PATH}/app/dashboard/dashboard.html`,

  PROJECTS: `${BASE_PATH}/app/projects/projects.html`,
  PROJECT_DETAIL: `${BASE_PATH}/app/projects/project-detail.html`, // uses ?id=123
  PROJECT_NEW: `${BASE_PATH}/app/projects/project-form.html`, // no query = create mode
  PROJECT_EDIT: `${BASE_PATH}/app/projects/project-form.html`, // with ?id=123 = edit mode

  CATEGORIES: `${BASE_PATH}/app/categories/categories.html`,
  STATISTICS: `${BASE_PATH}/app/statistics/statistics.html`,
  SEARCH: `${BASE_PATH}/app/search/search.html`,
  PROFILE: `${BASE_PATH}/app/profile/profile.html`,
};

export function goTo(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.href = query ? `${path}?${query}` : path;
}

export function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}
