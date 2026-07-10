import axios from 'axios';

// Backend now has CORS configured properly (CorsConfig.java) and uses Spring
// Security Basic Auth, so we call it directly instead of relying on a proxy.
// TODO: set VITE_API_URL to the real deployed backend URL once it's live.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// A couple of backend controllers (PricingEngineController, PricingHistoryController)
// are NOT mapped under /api — they're at root level (/pricing-engine, /pricing-history).
// So we derive a second client that strips the trailing /api for those two.
const ROOT_URL = BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Spring Security Basic Auth Credentials
  auth: {
    username: 'user', // Default username
    password: '4724092a-1b2f-4cc1-ac22-1e500f07c04b' // Replace with the password from your Spring Boot console
  }
});

const rootApi = axios.create({
  baseURL: ROOT_URL,
  headers: { 'Content-Type': 'application/json' },
  auth: {
    username: 'user',
    password: '4724092a-1b2f-4cc1-ac22-1e500f07c04b'
  }
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
// Real endpoint: POST /pricing-engine/calculate/{productId} — no /api prefix, no body.
export const calculatePrice = (productId) => rootApi.post(`/pricing-engine/calculate/${productId}`);
// Real endpoint: GET /pricing-history — no /api prefix.
export const getPricingHistory = () => rootApi.get('/pricing-history');

// ---- Price comparison (single product vs its competitors, backend-computed) ----
export const getPriceComparison = (productId) => api.get(`/competitor-prices/compare/${productId}`);

// ---- Analytics APIs (for Dashboard) ----
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getDashboardRecommendations = () => api.get('/analytics/dashboard-recommendations');

export default api;
