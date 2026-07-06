import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import CompetitorPricing from './pages/CompetitorPricing';
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
          {/* Dev 2 will replace these two with real pages */}
          <Route path="/competitor-pricing" element={<CompetitorPricing />} />
          <Route path="/pricing-recommendation" element={<PlaceholderPage title="Pricing Recommendation" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}