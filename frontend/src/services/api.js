import axios from 'axios';

// TODO: replace with your deployed backend URL once Backend team gives it to you.
// Keep this as the ONLY place base URL is defined — never hardcode URLs in pages.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Spring Security Basic Auth Credentials
  auth: {
    username: 'user', // Default username
    password: '4724092a-1b2f-4cc1-ac22-1e500f07c04b' // Replace with the password from your Spring Boot console
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

// ---- Competitor Price APIs (used by Dev 2) ----
export const getCompetitorPrices = () => api.get('/competitor-prices');
export const addCompetitorPrice = (data) => api.post('/competitor-prices', data);

// ---- Pricing Engine APIs (used by Dev 2) ----
export const calculatePrice = (productId) => api.post('/calculate-price', { productId });
export const getPricingHistory = () => api.get('/pricing-history');

export default api;