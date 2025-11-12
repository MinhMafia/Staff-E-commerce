
const BASE_URL = "http://localhost:5099/api";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
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

export async function getAllPromotions() {
  return request("/promotions");
}

export async function getPromotionsPaginated(page = 1, pageSize = 12) {
  return request(`/promotions/paginated?page=${page}&pageSize=${pageSize}`);
}

export async function getPromotionById(id) {
  return request(`/promotions/${id}`);
}

export async function getPromotionByCode(code) {
  return request(`/promotions/code/${encodeURIComponent(code)}`);
}

export async function createPromotion(data) {
  return request("/promotions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePromotion(id, data) {
  return request(`/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePromotion(id) {
  return request(`/promotions/${id}`, {
    method: "DELETE",
  });
}

export async function togglePromotionActive(id) {
  return request(`/promotions/${id}/toggle`, {
    method: "PATCH",
  });
}

export async function validatePromotion(code, orderAmount) {
  return request("/promotions/validate", {
    method: "POST",
    body: JSON.stringify({ code, orderAmount }),
  });
}

export async function getActivePromotions() {
  return request("/promotions/active");
}

export async function getPromotionOverviewStats() {
  return request("/promotions/overview-stats");
}

export async function getPromotionRedemptions(id) {
  return request(`/promotions/${id}/redemptions`);
}

export async function getPromotionStats(id) {
  return request(`/promotions/${id}/stats`);
}
