import axios from 'axios';

// Backend now has CORS configured properly (CorsConfig.java) and uses Spring
// Security Basic Auth, so we call it directly instead of relying on a proxy.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// A couple of backend controllers (PricingEngineController, PricingHistoryController)
// are NOT mapped under /api — they're at root level (/pricing-engine, /pricing-history).
// So we derive a second client that strips the trailing /api for those two.
const ROOT_URL = BASE_URL.replace(/\/api\/?$/, '');

// SECURITY: credentials now come from environment variables (.env file),
// never hardcoded here. Create a .env file in the frontend/ folder (it's
// already gitignored) with:
//   VITE_API_USERNAME=user
//   VITE_API_PASSWORD=<current password from backend team>
// This must be updated whenever backend team changes/fixes the password —
// but at least it won't be committed to GitHub anymore.
const AUTH_USERNAME = import.meta.env.VITE_API_USERNAME || 'user';
const AUTH_PASSWORD = import.meta.env.VITE_API_PASSWORD || '';

const authConfig = {
  username: AUTH_USERNAME,
  password: AUTH_PASSWORD,
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  auth: authConfig,
});

const rootApi = axios.create({
  baseURL: ROOT_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  auth: authConfig,
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
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);

// ---- Competitor Price APIs (used by Dev 2) ----
export const getCompetitorPrices = () => api.get('/competitor-prices');
export const addCompetitorPrice = (data) => api.post('/competitor-prices', data);
export const updateCompetitorPrice = (id, data) => api.put(`/competitor-prices/${id}`, data);
export const deleteCompetitorPrice = (id) => api.delete(`/competitor-prices/${id}`);

// ---- Pricing Engine APIs (used by Dev 2) ----
export const calculatePrice = (productId) => rootApi.post(`/pricing-engine/calculate/${productId}`);
export const getPricingHistory = () => rootApi.get('/pricing-history');
export const getPricingHistoryByProduct = (productId) => rootApi.get(`/pricing-history/product/${productId}`);

// ---- Price comparison (single product vs its competitors, backend-computed) ----
export const getPriceComparison = (productId) => api.get(`/competitor-prices/compare/${productId}`);

// ---- Analytics APIs (for Dashboard) ----
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getDashboardRecommendations = () => api.get('/analytics/dashboard-recommendations');

export default api;
