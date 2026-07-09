import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import { tokens } from '../theme';
import PriceTag from '../components/PriceTag';
import { getProducts, calculatePrice } from '../services/api';

export default function PricingRecommendation() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null); // { productId, currentPrice, recommendedPrice, reason }
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (err) {
        setError('Could not load products. Check that the backend server is running.');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCalculate = async () => {
    if (!selectedProductId) return;
    setCalculating(true);
    setError(null);
    setResult(null);
    try {
      const response = await calculatePrice(selectedProductId);
      setResult(response.data);
    } catch (err) {
      setError('Could not calculate a recommendation. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const priceWentUp = result && result.recommendedPrice > result.currentPrice;
  const priceWentDown = result && result.recommendedPrice < result.currentPrice;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Pricing Recommendation</Typography>
        <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
          Select a product to see the recommended price and why it was chosen
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Product selector + trigger */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 260 }} disabled={loadingProducts}>
          <InputLabel id="product-select-label">Product</InputLabel>
          <Select
            labelId="product-select-label"
            label="Product"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.productName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCalculate}
          disabled={!selectedProductId || calculating}
        >
          {calculating ? 'Calculating...' : 'Get Recommendation'}
        </Button>
      </Paper>

      {calculating && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: tokens.accent }} />
        </Box>
      )}

      {/* Result card — the main demo moment */}
      {result && !calculating && (
        <Paper sx={{ p: 4 }}>
          {/* Current → Recommended, big and clear */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              py: 3,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 0.5 }}>
                Current Price
              </Typography>
              <PriceTag value={result.currentPrice} size="large" />
            </Box>

            <ArrowForwardIcon sx={{ color: tokens.inkSoft, fontSize: 32 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 0.5 }}>
                Recommended Price
              </Typography>
              <PriceTag
                value={result.recommendedPrice}
                size="large"
                variant={priceWentUp ? 'decrease' : priceWentDown ? 'increase' : 'accent'}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Backend returns a single "reason" string (not a factors array) —
              e.g. "High demand and low inventory + Competitor cheaper" */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Why This Price
          </Typography>
          <Box
            sx={{
              bgcolor: tokens.accentSoft,
              borderLeft: `4px solid ${tokens.accent}`,
              borderRadius: 1,
              p: 3,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <FormatQuoteOutlinedIcon sx={{ color: tokens.accent }} />
            <Typography sx={{ fontStyle: 'italic', color: tokens.ink }}>
              {result.reason || 'No change'}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Nothing selected yet */}
      {!result && !calculating && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography sx={{ color: tokens.inkSoft }}>
            Select a product above and click "Get Recommendation" to see the pricing engine in action.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}