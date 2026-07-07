import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import PlaceholderPage from './pages/PlaceholderPage';

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
                <Layout><PlaceholderPage title="Inventory Management" /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/competitor-pricing"
            element={
              <ProtectedRoute>
                <Layout><PlaceholderPage title="Competitor Pricing" /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing-recommendation"
            element={
              <ProtectedRoute>
                <Layout><PlaceholderPage title="Pricing Recommendation" /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
