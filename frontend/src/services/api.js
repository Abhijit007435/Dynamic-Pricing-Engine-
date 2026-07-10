import axios from 'axios';

// Using a relative path here works together with the proxy in vite.config.js —
// requests to /api/... automatically get forwarded to localhost:8080 by Vite,
// which avoids CORS issues entirely during local development.
// For production (deployed) builds, set VITE_API_URL to the real backend URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Product APIs ----
export const getProducts = () => api.get('/products');
export const addProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ---- Inventory APIs (used by Dev 2) ----
export const getInventory = () => api.get('/inventory');
export const addInventory = (data) => api.post('/inventory', data);
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);

// ---- Competitor Price APIs (used by Dev 2) ----
export const getCompetitorPrices = () => api.get('/competitor-prices');
export const addCompetitorPrice = (data) => api.post('/competitor-prices', data);

// ---- Pricing Engine APIs (used by Dev 2) ----
export const calculatePrice = (productId) => api.post('/calculate-price', { productId });
export const getPricingHistory = () => api.get('/pricing-history');

// ---- Analytics APIs (for Dashboard) ----
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getDashboardRecommendations = () => api.get('/analytics/dashboard-recommendations');

export default api;
