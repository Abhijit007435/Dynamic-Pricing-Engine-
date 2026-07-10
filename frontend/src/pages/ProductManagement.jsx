import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Chip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PriceTag from '../components/PriceTag';
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
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => {
        // Backend field is "id" per the sample response we saw earlier
        // (id, productName, category, currentPrice, demandLevel, createdAt)
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

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingId(product.id);
    setForm({ productName: product.productName, category: product.category, currentPrice: product.currentPrice });
    setOpen(true);
  };

  const handleSave = () => {
    const payload = { ...form, currentPrice: Number(form.currentPrice) };

    if (usingMockData) {
      // No real backend reachable — just update local state so the UI still works
      if (editingId) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p)));
      } else {
        setProducts((prev) => [...prev, { id: `mock-${Date.now()}`, ...payload }]);
      }
      setOpen(false);
      return;
    }

    if (editingId) {
      updateProduct(editingId, payload)
        .then(() => loadProducts())
        .catch((err) => console.error('Failed to update product:', err));
    } else {
      addProduct(payload)
        .then(() => loadProducts())
        .catch((err) => console.error('Failed to add product:', err));
    }
    setOpen(false);
  };

  const handleDelete = (id) => {
    if (usingMockData) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return;
    }
    deleteProduct(id)
      .then(() => loadProducts())
      .catch((err) => console.error('Failed to delete product:', err));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: tokens.accent }} />
        </Box>
      ) : (
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
              {products.map((product) => (
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
                    <IconButton size="small" onClick={() => handleDelete(product.id)}>
                      <DeleteOutlineIcon fontSize="small" sx={{ color: tokens.decrease }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          {editingId ? 'Edit Product' : 'Add Product'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Product Name"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            fullWidth
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
    </Box>
  );
}
