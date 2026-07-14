import { PATHS } from "../routes/paths.js";

const BASE_URL = "http://localhost:3000";

async function request(method, url, { body, params } = {}) {
  let fullUrl = `${BASE_URL}${url}`;

  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    const query = new URLSearchParams(cleanParams).toString();
    if (query) fullUrl += `?${query}`;
  }

  let response;
  try {
    response = await fetch(fullUrl, {
      method,
      credentials: "include", // sends/receives the session cookie
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw { status: 0, message: "Could not connect to the server" };
  }

  if (response.status === 401) {
    window.location.href = PATHS.LOGIN;
    throw { status: 401, message: "Session expired" };
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.message || "Something went wrong",
    };
  }

  return data;
}

export const fetchClient = {
  get: (url, options) => request("GET", url, options),
  post: (url, body) => request("POST", url, { body }),
  put: (url, body) => request("PUT", url, { body }),
  patch: (url, body) => request("PATCH", url, { body }),
  delete: (url) => request("DELETE", url),
};
