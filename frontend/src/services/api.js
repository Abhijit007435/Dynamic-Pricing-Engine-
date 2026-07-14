import axios from "axios";

// Backend base URL — can be overridden via .env for deployed environments.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// SECURITY: credentials come from environment variables (.env file, which
// is gitignored), never hardcoded here. If backend team has removed Basic
// Auth requirement, these are simply unused/harmless. If auth is still
// required, create a .env file in frontend/ with:
//   VITE_API_USERNAME=user
//   VITE_API_PASSWORD=<current password from backend team>
const AUTH_USERNAME = import.meta.env.VITE_API_USERNAME || "";
const AUTH_PASSWORD = import.meta.env.VITE_API_PASSWORD || "";
const authConfig = AUTH_USERNAME || AUTH_PASSWORD
  ? { username: AUTH_USERNAME, password: AUTH_PASSWORD }
  : undefined;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  ...(authConfig ? { auth: authConfig } : {}),
});

// ==================== Products ====================
export const getProducts = () => api.get("/products");
export const addProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ==================== Inventory ====================
export const getInventory = () => api.get("/inventory");
export const addInventory = (data) => api.post("/inventory", data);
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

// ==================== Competitor Prices ====================
export const getCompetitorPrices = () => api.get("/competitor-prices");
export const addCompetitorPrice = (data) =>
  api.post("/competitor-prices", data);
export const updateCompetitorPrice = (id, data) =>
  api.put(`/competitor-prices/${id}`, data);
export const deleteCompetitorPrice = (id) =>
  api.delete(`/competitor-prices/${id}`);
export const getPriceComparison = (productId) =>
  api.get(`/competitor-prices/compare/${productId}`);

// ==================== Pricing Engine ====================
export const calculatePrice = (productId) =>
  api.post(`/pricing-engine/calculate/${productId}`);

// ==================== Pricing History ====================
export const getPricingHistory = () => api.get("/pricing-history");
export const getPricingHistoryByProduct = (productId) =>
  api.get(`/pricing-history/product/${productId}`);

// ==================== Dashboard Analytics ====================
export const getDashboardAnalytics = () => api.get("/analytics/dashboard");
export const getDashboardRecommendations = () =>
  api.get("/analytics/dashboard-recommendations");

export default api;
