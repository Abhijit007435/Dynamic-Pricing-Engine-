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
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import StackedLineChartOutlinedIcon from '@mui/icons-material/StackedLineChartOutlined';
import { tokens } from '../theme';
import StatCard from '../components/StatCard';
import { getInventory, addInventory, updateInventory, deleteInventory, getProducts } from '../services/api';

const getStockStatus = (quantity) => {
  if (quantity <= 10) return 'low';
  if (quantity >= 100) return 'high';
  return 'normal';
};

const STATUS_STYLES = {
  low: { label: 'Low Stock', bg: tokens.decreaseSoft, color: tokens.decrease },
  normal: { label: 'Normal', bg: tokens.structureSoft, color: tokens.inkSoft },
  high: { label: 'High Stock', bg: tokens.increaseSoft, color: tokens.increase },
};

function MonoNumber({ children, sx = {} }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontVariantNumeric: 'tabular-nums',
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ productId: '', productName: '', availableQuantity: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, prodRes] = await Promise.all([getInventory(), getProducts()]);
      const productsById = {};
      prodRes.data.forEach((p) => {
        productsById[p.id || p._id] = p;
      });
      const merged = invRes.data.map((item) => ({
        ...item,
        productName: productsById[item.productId]?.productName || 'Unknown Product',
      }));
      setItems(merged);
    } catch (err) {
      setError('Could not load inventory. Check that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddDialog = () => {
    setEditingItem(null);
    setForm({ productId: '', productName: '', availableQuantity: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setForm({
      productId: item.productId,
      productName: item.productName,
      availableQuantity: item.availableQuantity,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await updateInventory(editingItem.id, {
          productId: editingItem.productId,
          availableQuantity: Number(form.availableQuantity),
        });
      } else {
        await addInventory({
          ...form,
          availableQuantity: Number(form.availableQuantity),
        });
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
    if (!window.confirm(`Delete inventory record for "${item.productName}"?`)) return;
    try {
      await deleteInventory(item.id);
      fetchItems();
    } catch (err) {
      setError('Delete failed. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Box>
          <Typography variant="h4">Inventory</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
            Track stock levels across all products
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openAddDialog}>
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loading && items.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <StatCard
            label="Total Products"
            value={items.length}
            icon={<Inventory2OutlinedIcon />}
          />
          <StatCard
            label="Low Stock Items"
            value={items.filter((i) => getStockStatus(i.availableQuantity) === 'low').length}
            icon={<WarningAmberOutlinedIcon />}
            accent
          />
          <StatCard
            label="Total Units in Stock"
            value={items.reduce((sum, i) => sum + Number(i.availableQuantity || 0), 0)}
            icon={<StackedLineChartOutlinedIcon />}
          />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Product ID</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Product Name</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Available Quantity</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Actions</TableCell>
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
                  No products yet. Click "Add Product" to create your first inventory entry.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              items.map((item) => {
                const status = getStockStatus(item.availableQuantity);
                const statusStyle = STATUS_STYLES[status];
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <MonoNumber sx={{ color: tokens.inkSoft }}>{item.productId}</MonoNumber>
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <MonoNumber sx={{ fontWeight: 600 }}>{item.availableQuantity}</MonoNumber>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusStyle.label}
                        size="small"
                        sx={{
                          bgcolor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 600,
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
          {editingItem ? 'Update Stock' : 'Add Product'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Product ID"
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            disabled={!!editingItem}
            fullWidth
          />
          <TextField
            label="Product Name"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            disabled={!!editingItem}
            fullWidth
          />
          <TextField
            label="Available Quantity"
            type="number"
            value={form.availableQuantity}
            onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })}
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