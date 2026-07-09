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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { tokens } from '../theme';
import PriceTag from '../components/PriceTag';
import { getCompetitorPrices, addCompetitorPrice, updateCompetitorPrice, deleteCompetitorPrice, getProducts } from '../services/api';

export default function CompetitorPricing() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ productId: '', competitorName: '', competitorPrice: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, prodRes] = await Promise.all([getCompetitorPrices(), getProducts()]);
      setProducts(prodRes.data);

      const productsById = {};
      prodRes.data.forEach((p) => {
        productsById[p.id || p._id] = p;
      });

      const merged = compRes.data.map((item) => ({
        ...item,
        // ✅ BUG FIX: Changed .name to .productName
        productName: productsById[item.productId]?.productName || 'Unknown Product',
        ourPrice: productsById[item.productId]?.currentPrice ?? null,
      }));
      setItems(merged);
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
    setEditingItem(null);
    setForm({ productId: '', competitorName: '', competitorPrice: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setForm({
      productId: item.productId,
      competitorName: item.competitorName,
      competitorPrice: item.competitorPrice,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.productId || !form.competitorName || !form.competitorPrice) {
      setError('Please fill in all details.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        productId: form.productId,
        competitorName: form.competitorName.trim(),
        competitorPrice: Number(form.competitorPrice),
      };

      if (editingItem) {
        // Direct update if opened via Edit button (uses the new updateCompetitorPrice from api.js)
        await updateCompetitorPrice(editingItem.id, payload);
      } else {
        // ✅ BUG FIX: Added .toLowerCase() to handle case-sensitivity (Zenith vs zenith)
        const duplicate = items.find(
          (item) =>
            item.productId === form.productId &&
            item.competitorName.toLowerCase() === form.competitorName.trim().toLowerCase()
        );

        if (duplicate) {
          // Instead of duplicating, trigger an automatic background update!
          await updateCompetitorPrice(duplicate.id, payload);
        } else {
          // Fresh insert
          await addCompetitorPrice(payload);
        }
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err) {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete competitor price entry from "${item.competitorName}"?`)) return;
    try {
      await deleteCompetitorPrice(item.id);
      fetchItems();
    } catch (err) {
      setError('Delete failed. Please try again.');
    }
  };

  const getComparison = (ourPrice, competitorPrice) => {
    if (ourPrice == null) {
      return { label: 'No product price', color: tokens.inkSoft, bg: tokens.structureSoft, icon: null };
    }
    if (ourPrice < competitorPrice) {
      return { label: 'We are cheaper', color: tokens.increase, bg: tokens.increaseSoft, icon: <ArrowDownwardIcon fontSize="small" /> };
    }
    if (ourPrice > competitorPrice) {
      return { label: 'We are costlier', color: tokens.decrease, bg: tokens.decreaseSoft, icon: <ArrowUpwardIcon fontSize="small" /> };
    }
    return { label: 'Same price', color: tokens.inkSoft, bg: tokens.structureSoft, icon: null };
  };

  // Live client-side filtering logic based on user input
  const filteredItems = items.filter(
    (item) =>
      item.competitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Live Table Search bar */}
      <Box sx={{ mb: 3, maxWidth: '400px' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search competitor or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: tokens.inkSoft }} />
              </InputAdornment>
            ),
          }}
        />
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
              <TableCell align="right" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: tokens.inkSoft }}>
                  No competitor records match your view.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredItems.map((item) => {
                const comparison = getComparison(item.ourPrice, item.competitorPrice);
                return (
                  <TableRow key={item.id} hover>
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
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditDialog(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item)}>
                        <DeleteOutlineIcon fontSize="small" sx={{ color: tokens.decrease }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          {editingItem ? 'Edit Competitor Data' : 'Add Competitor Pricing'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          
          <FormControl fullWidth disabled={!!editingItem} sx={{ mt: 1 }}>
            <InputLabel id="comp-product-select-label">Select Product</InputLabel>
            <Select
              labelId="comp-product-select-label"
              label="Select Product"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              {products.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {/* ✅ BUG FIX: Changed prod.name to prod.productName */}
                  {prod.productName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Competitor Name"
            value={form.competitorName}
            onChange={(e) => setForm({ ...form, competitorName: e.target.value })}
            disabled={!!editingItem}
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