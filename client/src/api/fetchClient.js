import { PATHS, goTo } from "../routes/paths.js";
import { getToken, clearToken } from "../utils/tokenStorage.js";
import { showSuccessToast } from "../utils/toast.js";
import { API_BASE_URL } from "../utils/config.js";

async function request(method, url, { body, params } = {}) {
  let fullUrl = `${API_BASE_URL}${url}`;
  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    const query = new URLSearchParams(cleanParams).toString();
    if (query) fullUrl += `?${query}`;
  }

  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(fullUrl, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw { status: 0, message: "Could not connect to the server" };
  }

  const contentType = response.headers.get("content-type") || "";
  const envelope = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (response.status === 401) {
    clearToken();
    goTo(PATHS.LOGIN);
    throw { status: 401, message: envelope?.message || "Session expired" };
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: envelope?.message || "Something went wrong",
      errors: envelope?.errors,
    };
  }

  if (method !== "GET" && envelope?.message) {
    showSuccessToast(envelope.message);
  }

  return envelope?.data ?? null;
}

export const fetchClient = {
  get: (url, options) => request("GET", url, options),
  post: (url, body) => request("POST", url, { body }),
  put: (url, body) => request("PUT", url, { body }),
  patch: (url, body) => request("PATCH", url, { body }),
  delete: (url) => request("DELETE", url),
};
