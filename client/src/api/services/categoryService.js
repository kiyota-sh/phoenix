import { fetchClient } from "../fetchClient.js";
import { ENDPOINTS } from "../endpoints.js";
import { USE_MOCK } from "../../utils/config.js";
import {
  mockGetCategories,
  mockCreateCategory,
  mockUpdateCategory,
  mockRemoveCategory,
} from "../../utils/mockData.js";

export const categoryService = {
  getAll: () =>
    USE_MOCK ? mockGetCategories() : fetchClient.get(ENDPOINTS.CATEGORIES.BASE),
  create: (category) =>
    USE_MOCK
      ? mockCreateCategory(category)
      : fetchClient.post(ENDPOINTS.CATEGORIES.BASE, category),
  update: (id, category) =>
    USE_MOCK
      ? mockUpdateCategory(id, category)
      : fetchClient.put(ENDPOINTS.CATEGORIES.DETAIL(id), category),
  remove: (id) =>
    USE_MOCK
      ? mockRemoveCategory(id)
      : fetchClient.delete(ENDPOINTS.CATEGORIES.DETAIL(id)),
};
