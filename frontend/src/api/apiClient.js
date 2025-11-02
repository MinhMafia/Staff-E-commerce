// src/api/apiClient.js
const BASE_URL = "http://localhost:5099/api";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}` // nếu cần
    },
    ...options,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${res.status} ${res.statusText} - ${errText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export async function getProductsAll() {
  // GET /api/products (non-paginated)
  return request("/products");
}

export async function getProductsPaginated(
  page = 1,
  pageSize = 12,
  search = ""
) {
  // If your backend supports /products/paginated
  const q = `?page=${page}&pageSize=${pageSize}${
    search ? `&search=${encodeURIComponent(search)}` : ""
  }`;
  return request(`/products/paginated${q}`);
}
