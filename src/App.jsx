import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          {/* Dev 2 will replace these three with real pages */}
          <Route path="/inventory" element={<PlaceholderPage title="Inventory Management" />} />
          <Route path="/competitor-pricing" element={<PlaceholderPage title="Competitor Pricing" />} />
          <Route path="/pricing-recommendation" element={<PlaceholderPage title="Pricing Recommendation" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
