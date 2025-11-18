// src/api/apiClient.js
import { trackRequestStart, trackRequestEnd } from "../utils/requestTracker";

const BASE_URL = "http://localhost:5099/api";
const USER_ID_STORAGE_KEY = "currentUserId";
let cachedUserId = null;

function getCurrentUserId() {
  if (cachedUserId) return cachedUserId;

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(USER_ID_STORAGE_KEY);
    if (stored) {
      cachedUserId = stored;
      return cachedUserId;
    }

    // Default to user #1 for local development if nothing stored yet
    cachedUserId = "1";
    window.localStorage.setItem(USER_ID_STORAGE_KEY, cachedUserId);
    return cachedUserId;
  }

  return null;
}

export function setCurrentUserId(id) {
  cachedUserId = String(id);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_ID_STORAGE_KEY, cachedUserId);
  }
}

export async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
    // Authorization: `Bearer ${token}` // add auth when ready
  };

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const currentUserId = getCurrentUserId();
  if (currentUserId) {
    headers["X-User-Id"] = currentUserId;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData)
  ) {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  trackRequestStart();
  try {
    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      const errText = await res.text();
      let displayMessage = errText;
      try {
        const parsed = errText ? JSON.parse(errText) : null;
        if (parsed) {
          if (typeof parsed === "string") {
            displayMessage = parsed;
          } else if (parsed.message) {
            displayMessage = parsed.message;
          } else if (parsed.errors && typeof parsed.errors === "object") {
            const firstKey = Object.keys(parsed.errors)[0];
            if (firstKey && Array.isArray(parsed.errors[firstKey])) {
              displayMessage = parsed.errors[firstKey][0];
            }
          }
        }
      } catch (_) {
        // ignore JSON parse errors, fall back to raw text
      }
      throw new Error(displayMessage || `${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } finally {
    trackRequestEnd();
  }
}

// Products -------------------------------------------------------------

// export async function getProductsAll() {
//   return request("/products");
// }

export async function getProductsPaginated(
  page = 1,
  pageSize = 10,
  search = "",
  categoryId = null,
  supplierId = null,
  minPrice = null,
  maxPrice = null,
  sortBy = "",
  status = null
) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(search && { search }),
    ...(categoryId && { categoryId: categoryId.toString() }),
    ...(supplierId && { supplierId: supplierId.toString() }),
    ...(minPrice && { minPrice: minPrice.toString() }),
    ...(maxPrice && { maxPrice: maxPrice.toString() }),
    ...(sortBy && { sortBy }),
    ...(status && { status: status.toString() }),
  });
  return request(`/products/paginated?${params}`);
}

// Users -------------------------------------------------------------

export async function getUsersPaginated(page = 1, pageSize = 10) {
  const q = `?page=${page}&pageSize=${pageSize}`;
  return request(`/users/paginated${q}`);
}

export async function getUserById(id) {
  return request(`/users/${id}`);
}

export async function createUser(payload) {
  return request("/users", {
    method: "POST",
    body: payload,
  });
}

export async function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function updateUserStatus(id, isActive) {
  return request(`/users/${id}/status?isActive=${isActive}`, {
    method: "PATCH",
  });
}

// Profile -------------------------------------------------------------

export async function getMyProfile() {
  return request("/me");
}

export async function updateMyProfile(payload) {
  return request("/me", {
    method: "PUT",
    body: payload,
  });
}

export async function changeMyPassword(payload) {
  return request("/me/change-password", {
    method: "PUT",
    body: payload,
  });
}

// export { BASE_URL, request, getCurrentUserId };
export { BASE_URL, getCurrentUserId };
