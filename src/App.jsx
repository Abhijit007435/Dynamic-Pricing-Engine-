import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import CompetitorPricing from './pages/CompetitorPricing';
import PricingRecommendation from './pages/PricingRecommendation';
import ProductManagement from './pages/ProductManagement';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/inventory" element={<InventoryManagement />} />
          <Route path="/competitor-pricing" element={<CompetitorPricing />} />
          <Route path="/pricing-recommendation" element={<PricingRecommendation />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}