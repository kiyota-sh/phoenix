import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import { extractArray } from "../../utils/apiHelpers.js";
import {
  mockGetCategories,
  mockCreateCategory,
  mockUpdateCategory,
  mockRemoveCategory,
} from "../../utils/mockData.js";

function toBackendCategory({ name }) {
  return { nombre: name };
}
function fromBackendCategory(raw = {}) {
  return { id: raw.id, name: raw.nombre };
}

export const categoryService = {
  getAll: async () => {
    if (USE_MOCK) return mockGetCategories();
    const data = await fetchClient.get(ENDPOINTS.CATEGORIES.BASE);
    return extractArray(data).map(fromBackendCategory);
  },
  create: async (category) => {
    if (USE_MOCK) return mockCreateCategory(category);
    const data = await fetchClient.post(
      ENDPOINTS.CATEGORIES.BASE,
      toBackendCategory(category),
    );
    return fromBackendCategory(data);
  },
  update: async (id, category) => {
    if (USE_MOCK) return mockUpdateCategory(id, category);
    const data = await fetchClient.put(
      ENDPOINTS.CATEGORIES.DETAIL(id),
      toBackendCategory(category),
    );
    return fromBackendCategory(data);
  },
  remove: async (id) => {
    if (USE_MOCK) return mockRemoveCategory(id);
    return fetchClient.delete(ENDPOINTS.CATEGORIES.DETAIL(id));
  },
};
