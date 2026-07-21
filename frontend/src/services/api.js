import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://dynamic-pricing-engine-dqws.onrender.com";

const AUTH_USERNAME = import.meta.env.VITE_API_USERNAME || "";
const AUTH_PASSWORD = import.meta.env.VITE_API_PASSWORD || "";
const authConfig = AUTH_USERNAME || AUTH_PASSWORD
  ? { username: AUTH_USERNAME, password: AUTH_PASSWORD }
  : undefined;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
  ...(authConfig ? { auth: authConfig } : {}),
});

export const getProducts = () => api.get("/products");
export const addProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getInventory = () => api.get("/inventory");
export const addInventory = (data) => api.post("/inventory", data);
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

export const getCompetitorPrices = () => api.get("/competitor-prices");
export const addCompetitorPrice = (data) => api.post("/competitor-prices", data);
export const updateCompetitorPrice = (id, data) => api.put(`/competitor-prices/${id}`, data);
export const deleteCompetitorPrice = (id) => api.delete(`/competitor-prices/${id}`);
export const getPriceComparison = (productId) => api.get(`/competitor-prices/compare/${productId}`);

export const calculatePrice = (productId) => api.post(`/pricing-engine/calculate/${productId}`);

export const getPricingHistory = () => api.get("/pricing-history");
export const getPricingHistoryByProduct = (productId) => api.get(`/pricing-history/product/${productId}`);

export const getDashboardAnalytics = () => api.get("/analytics/dashboard");
export const getDashboardRecommendations = () => api.get("/analytics/dashboard-recommendations");

export default api;
