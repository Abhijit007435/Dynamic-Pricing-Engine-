import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import StatCard from '../components/StatCard';
import PriceTag from '../components/PriceTag';
import { tokens } from '../theme';
// import { getProducts, getInventory, getPricingHistory } from '../services/api';

// MOCK DATA — remove once backend endpoints are live.
// Keep the shape identical so swapping to real API calls later is a one-line change.
const MOCK_STATS = {
  totalProducts: 42,
  lowStockCount: 5,
  recommendationsToday: 12,
};

const MOCK_RECENT_CHANGES = [
  { product: 'Wireless Mouse', oldPrice: 799, newPrice: 879, direction: 'up' },
  { product: 'Mechanical Keyboard', oldPrice: 2499, newPrice: 2299, direction: 'down' },
  { product: 'USB-C Hub', oldPrice: 1199, newPrice: 1250, direction: 'up' },
  { product: 'Webcam 1080p', oldPrice: 1899, newPrice: 1799, direction: 'down' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentChanges, setRecentChanges] = useState(MOCK_RECENT_CHANGES);

  useEffect(() => {
    // Once backend is ready, replace mock state above with something like:
    // getProducts().then(res => setStats(prev => ({ ...prev, totalProducts: res.data.length })));
    // getPricingHistory().then(res => setRecentChanges(res.data.slice(0, 5)));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 3 }}>
        Overview of products, stock, and pricing activity
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <StatCard label="Total Products" value={stats.totalProducts} icon={<StorefrontOutlinedIcon />} />
        <StatCard label="Low Stock Products" value={stats.lowStockCount} icon={<Inventory2OutlinedIcon />} />
        <StatCard label="Recommendations Today" value={stats.recommendationsToday} icon={<TrendingUpOutlinedIcon />} accent />
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <HistoryOutlinedIcon sx={{ color: tokens.structure }} fontSize="small" />
          <Typography variant="h6">Recent Price Changes</Typography>
        </Stack>

        <Stack spacing={0}>
          {recentChanges.map((change, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: idx < recentChanges.length - 1 ? `1px solid ${tokens.structureSoft}` : 'none',
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{change.product}</Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <PriceTag value={change.oldPrice} size="small" />
                <Typography sx={{ color: tokens.inkSoft }}>→</Typography>
                <PriceTag value={change.newPrice} size="small" variant={change.direction === 'up' ? 'increase' : 'decrease'} />
                <Chip
                  size="small"
                  label={change.direction === 'up' ? 'Increased' : 'Decreased'}
                  sx={{
                    backgroundColor: change.direction === 'up' ? tokens.increaseSoft : tokens.decreaseSoft,
                    color: change.direction === 'up' ? tokens.increase : tokens.decrease,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
