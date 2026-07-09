import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import InventoryManagement from './pages/InventoryManagement';
import CompetitorPricing from './pages/CompetitorPricing';
import PricingRecommendation from './pages/PricingRecommendation';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login page — no sidebar/layout, no auth required */}
          <Route path="/login" element={<Login />} />

          {/* Everything below requires login first */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout><ProductManagement /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Layout><InventoryManagement /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/competitor-pricing"
            element={
              <ProtectedRoute>
                <Layout><CompetitorPricing /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing-recommendation"
            element={
              <ProtectedRoute>
                <Layout><PricingRecommendation /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}