
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

export async function getOverviewStats() {
  return request("/statistics/overview");
}

export async function getRevenueByPeriod(days = 7) {
  return request(`/statistics/revenue?days=${days}`);
}

export async function getBestSellers(limit = 10, days = 7) {
  return request(`/statistics/bestsellers?limit=${limit}&days=${days}`);
}

export async function getLowStockProducts(threshold = 10) {
  return request(`/statistics/lowstock?threshold=${threshold}`);
}

export async function getOrderStats(days = 7) {
  return request(`/statistics/orders?days=${days}`);
}
