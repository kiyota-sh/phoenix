export const PATHS = {
  LOGIN: "/login.html",
  REGISTER: "/register.html",

  DASHBOARD: "/dashboard.html",

  PROJECTS: "/projects.html",
  PROJECT_DETAIL: "/project-detail.html", // uses ?id=123
  PROJECT_NEW: "/project-form.html", // no query = create mode
  PROJECT_EDIT: "/project-form.html", // with ?id=123 = edit mode

  CATEGORIES: "/categories.html",
  STATISTICS: "/statistics.html",
  SEARCH: "/search.html",
  PROFILE: "/profile.html",
};

// Navigates while attaching query params
// e.g. goTo(PATHS.PROJECT_DETAIL, { id: 5 }) -> /project-detail.html?id=5
export function goTo(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  window.location.href = query ? `${path}?${query}` : path;
}

// Reads a single query param from the current URL
export function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}
