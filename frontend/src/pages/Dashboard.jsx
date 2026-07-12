import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Stack, CircularProgress } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import StatCard from '../components/StatCard';
import PriceTag from '../components/PriceTag';
import FadeIn from '../components/FadeIn';
import TiltCard from '../components/TiltCard';
import { tokens } from '../theme';
import { getDashboardAnalytics, getDashboardRecommendations } from '../services/api';

// Fallback mock data — shown ONLY if the real backend call fails.
const MOCK_STATS = {
  totalProducts: 42,
  lowStockCount: 5,
  recommendationsToday: 12,
  averagePrice: 1249,
};

const MOCK_RECENT_CHANGES = [
  { product: 'Wireless Mouse', oldPrice: 799, newPrice: 879, direction: 'up', stockStatus: 'LOW' },
  { product: 'Mechanical Keyboard', oldPrice: 2499, newPrice: 2299, direction: 'down', stockStatus: 'HIGH' },
  { product: 'USB-C Hub', oldPrice: 1199, newPrice: 1250, direction: 'up', stockStatus: 'NORMAL' },
  { product: 'Webcam 1080p', oldPrice: 1899, newPrice: 1799, direction: 'down', stockStatus: 'NORMAL' },
];

const stockStatusStyle = (status) => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'LOW') return { bg: tokens.decreaseSoft, color: tokens.decrease };
  if (normalized === 'HIGH') return { bg: tokens.increaseSoft, color: tokens.increase };
  return { bg: tokens.structureSoft, color: tokens.structure };
};

export default function Dashboard() {
  const [stats, setStats] = useState(MOCK_STATS);
  const [recentChanges, setRecentChanges] = useState(MOCK_RECENT_CHANGES);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getDashboardAnalytics()
      .then((res) => {
        if (!isMounted) return;
        const data = res.data;
        setStats({
          totalProducts: data.totalProducts ?? data.total_products ?? 0,
          lowStockCount: data.lowInventoryProducts ?? data.lowStockCount ?? 0,
          recommendationsToday: data.totalRecommendations ?? data.recommendationsToday ?? 0,
          averagePrice: data.averageProductPrice ?? data.averagePrice ?? 0,
        });
      })
      .catch(() => {
        if (isMounted) {
          setUsingMockData(true);
          setStats(MOCK_STATS);
        }
      });

    getDashboardRecommendations()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped = list.slice(0, 5).map((item) => ({
          product: item.productName ?? 'Unknown',
          oldPrice: item.oldPrice ?? 0,
          newPrice: item.recommendedPrice ?? 0,
          direction: (item.recommendedPrice ?? 0) >= (item.oldPrice ?? 0) ? 'up' : 'down',
          stockStatus: item.stockStatus ?? 'NORMAL',
        }));
        if (mapped.length > 0) setRecentChanges(mapped);
      })
      .catch(() => {
        if (isMounted) setRecentChanges(MOCK_RECENT_CHANGES);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 3 }}>
        Overview of products, stock, and pricing activity
      </Typography>

      {usingMockData && (
        <Paper sx={{ p: 1.5, mb: 3, backgroundColor: tokens.decreaseSoft, borderColor: tokens.decrease }}>
          <Typography variant="caption" sx={{ color: tokens.decrease }}>
            Showing sample data — could not reach the backend server.
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: tokens.accent }} />
        </Box>
      ) : (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <FadeIn delay={0}>
              <TiltCard>
                <StatCard label="Total Products" value={stats.totalProducts} icon={<StorefrontOutlinedIcon />} />
              </TiltCard>
            </FadeIn>
            <FadeIn delay={100}>
              <TiltCard>
                <StatCard label="Low Stock Products" value={stats.lowStockCount} icon={<Inventory2OutlinedIcon />} />
              </TiltCard>
            </FadeIn>
            <FadeIn delay={200}>
              <TiltCard>
                <StatCard label="Recommendations" value={stats.recommendationsToday} icon={<TrendingUpOutlinedIcon />} accent />
              </TiltCard>
            </FadeIn>
          </Stack>

          <FadeIn delay={300}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <HistoryOutlinedIcon sx={{ color: tokens.structure }} fontSize="small" />
                <Typography variant="h6">Recent Price Recommendations</Typography>
              </Stack>

              <Stack spacing={0}>
                {recentChanges.map((change, idx) => {
                  const stockStyle = stockStatusStyle(change.stockStatus);
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1.5,
                        flexWrap: 'wrap',
                        gap: 1,
                        borderBottom: idx < recentChanges.length - 1 ? `1px solid ${tokens.structureSoft}` : 'none',
                        transition: 'background-color 150ms ease',
                        '&:hover': { backgroundColor: tokens.background },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{change.product}</Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.3 }}>
                          <Typography variant="caption" sx={{ color: tokens.inkSoft }}>Stock:</Typography>
                          <Chip
                            size="small"
                            label={change.stockStatus}
                            sx={{
                              backgroundColor: stockStyle.bg,
                              color: stockStyle.color,
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              height: 20,
                            }}
                          />
                        </Stack>
                      </Box>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: tokens.inkSoft, display: 'block' }}>Old Price</Typography>
                          <PriceTag value={change.oldPrice} size="small" />
                        </Box>
                        <Typography sx={{ color: tokens.inkSoft }}>→</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: tokens.inkSoft, display: 'block' }}>Recommended</Typography>
                          <PriceTag value={change.newPrice} size="small" variant={change.direction === 'up' ? 'increase' : 'decrease'} />
                        </Box>
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
                  );
                })}
              </Stack>
            </Paper>
          </FadeIn>
        </>
      )}
    </Box>
  );
}
