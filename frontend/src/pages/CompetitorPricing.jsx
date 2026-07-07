import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Skeleton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { tokens } from '../theme';
import PriceTag from '../components/PriceTag';
import { getCompetitorPrices, addCompetitorPrice } from '../services/api';

export default function CompetitorPricing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ productId: '', competitorName: '', competitorPrice: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompetitorPrices();
      setItems(response.data);
    } catch (err) {
      setError('Could not load competitor prices. Check that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddDialog = () => {
    setForm({ productId: '', competitorName: '', competitorPrice: '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await addCompetitorPrice({
        ...form,
        competitorPrice: Number(form.competitorPrice),
      });
      setDialogOpen(false);
      fetchItems();
    } catch (err) {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Compares our price vs competitor price and returns a label + color
  // using the same increase/decrease tokens used everywhere else in the app.
  const getComparison = (ourPrice, competitorPrice) => {
    if (ourPrice < competitorPrice) {
      return { label: 'We are cheaper', color: tokens.increase, bg: tokens.increaseSoft, icon: <ArrowDownwardIcon fontSize="small" /> };
    }
    if (ourPrice > competitorPrice) {
      return { label: 'We are costlier', color: tokens.decrease, bg: tokens.decreaseSoft, icon: <ArrowUpwardIcon fontSize="small" /> };
    }
    return { label: 'Same price', color: tokens.inkSoft, bg: tokens.structureSoft, icon: null };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Box>
          <Typography variant="h4">Competitor Pricing</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
            Track how our prices compare to competitors
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openAddDialog}>
          Add Competitor Price
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Product</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Competitor</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Our Price</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Competitor Price</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Comparison</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: tokens.inkSoft }}>
                  No competitor prices yet. Click "Add Competitor Price" to add your first entry.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              items.map((item) => {
                const comparison = getComparison(item.ourPrice, item.competitorPrice);
                return (
                  <TableRow key={item._id || item.productId} hover>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell sx={{ color: tokens.inkSoft }}>{item.competitorName}</TableCell>
                    <TableCell>
                      <PriceTag value={item.ourPrice} />
                    </TableCell>
                    <TableCell>
                      <PriceTag value={item.competitorPrice} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={comparison.icon || undefined}
                        label={comparison.label}
                        size="small"
                        sx={{
                          bgcolor: comparison.bg,
                          color: comparison.color,
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: comparison.color },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          Add Competitor Price
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Product ID"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            fullWidth
            helperText="Must match an existing product's ID"
          />
          <TextField
            label="Competitor Name"
            value={form.competitorName}
            onChange={(e) => setForm({ ...form, competitorName: e.target.value })}
            fullWidth
          />
          <TextField
            label="Competitor Price (₹)"
            type="number"
            value={form.competitorPrice}
            onChange={(e) => setForm({ ...form, competitorPrice: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}