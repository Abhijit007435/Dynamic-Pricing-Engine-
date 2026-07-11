import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Chip, CircularProgress, InputAdornment, MenuItem, Snackbar, Alert, Skeleton, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PriceTag from '../components/PriceTag';
import FadeIn from '../components/FadeIn';
import { tokens } from '../theme';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';

// Fallback mock data — shown ONLY if the real backend call fails.
const MOCK_PRODUCTS = [
  { id: 'mock-1', productName: 'Wireless Mouse', category: 'Electronics', currentPrice: 799 },
  { id: 'mock-2', productName: 'Mechanical Keyboard', category: 'Electronics', currentPrice: 2499 },
  { id: 'mock-3', productName: 'USB-C Hub', category: 'Accessories', currentPrice: 1199 },
];

const emptyForm = { productName: '', category: '', currentPrice: '' };

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => {
        setProducts(res.data);
        setUsingMockData(false);
      })
      .catch(() => {
        setProducts(MOCK_PRODUCTS);
        setUsingMockData(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return unique;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.productName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingId(product.id);
    setForm({ productName: product.productName, category: product.category, currentPrice: product.currentPrice });
    setFormError('');
    setOpen(true);
  };

  const validateForm = () => {
    if (!form.productName.trim()) return 'Product name is required';
    if (!form.category.trim()) return 'Category is required';
    if (!form.currentPrice || Number(form.currentPrice) <= 0) return 'Enter a valid price';
    return '';
  };

  const handleSave = () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = { ...form, currentPrice: Number(form.currentPrice) };

    if (usingMockData) {
      if (editingId) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p)));
        showToast('Product updated (sample data only)', 'success');
      } else {
        setProducts((prev) => [...prev, { id: `mock-${Date.now()}`, ...payload }]);
        showToast('Product added (sample data only)', 'success');
      }
      setOpen(false);
      return;
    }

    if (editingId) {
      updateProduct(editingId, payload)
        .then(() => {
          loadProducts();
          showToast('Product updated successfully');
        })
        .catch(() => showToast('Failed to update product', 'error'));
    } else {
      addProduct(payload)
        .then(() => {
          loadProducts();
          showToast('Product added successfully');
        })
        .catch(() => showToast('Failed to add product', 'error'));
    }
    setOpen(false);
  };

  const confirmDelete = (product) => {
    setDeleteTarget(product);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    if (usingMockData) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product deleted (sample data only)', 'success');
      setDeleteTarget(null);
      return;
    }

    deleteProduct(id)
      .then(() => {
        loadProducts();
        showToast('Product deleted successfully');
      })
      .catch(() => showToast('Failed to delete product', 'error'))
      .finally(() => setDeleteTarget(null));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>Products</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
            Manage your product catalog and base prices
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}
          sx={{ backgroundColor: tokens.structure, '&:hover': { backgroundColor: '#1f2a3f' } }}>
          Add Product
        </Button>
      </Box>

      {usingMockData && (
        <Paper sx={{ p: 1.5, mb: 3, backgroundColor: tokens.decreaseSoft, borderColor: tokens.decrease }}>
          <Typography variant="caption" sx={{ color: tokens.decrease }}>
            Showing sample data — could not reach the backend server. Changes here won't be saved.
          </Typography>
        </Paper>
      )}

      {/* Search + Filter bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 240, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: tokens.inkSoft }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Paper sx={{ p: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
          ))}
        </Paper>
      ) : filteredProducts.length === 0 ? (
        <FadeIn>
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Inventory2OutlinedIcon sx={{ fontSize: 48, color: tokens.structureSoft, mb: 1 }} />
            <Typography variant="h6" sx={{ color: tokens.inkSoft, mb: 0.5 }}>
              {products.length === 0 ? 'No products yet' : 'No products match your search'}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
              {products.length === 0
                ? 'Click "Add Product" to create your first product.'
                : 'Try adjusting your search or filter.'}
            </Typography>
          </Paper>
        </FadeIn>
      ) : (
        <FadeIn>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: tokens.inkSoft }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: tokens.inkSoft }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: tokens.inkSoft }}>Current Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: tokens.inkSoft }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{product.productName}</TableCell>
                    <TableCell>
                      <Chip size="small" label={product.category} sx={{ backgroundColor: tokens.structureSoft, color: tokens.structure, fontWeight: 500 }} />
                    </TableCell>
                    <TableCell><PriceTag value={product.currentPrice} /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditDialog(product)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => confirmDelete(product)}>
                        <DeleteOutlineIcon fontSize="small" sx={{ color: tokens.decrease }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </FadeIn>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          {editingId ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label="Product Name"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            fullWidth
            autoFocus
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            fullWidth
          />
          <TextField
            label="Current Price (₹)"
            type="number"
            value={form.currentPrice}
            onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ backgroundColor: tokens.structure, '&:hover': { backgroundColor: '#1f2a3f' } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 40, color: tokens.decrease, mb: 1 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>Delete this product?</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
            "{deleteTarget?.productName}" will be permanently removed. This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete}
            sx={{ backgroundColor: tokens.decrease, '&:hover': { backgroundColor: '#8f402c' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
