import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableSortLabel,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Chip,
  Alert,
  Skeleton,
  IconButton,
  Typography,
  Autocomplete,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import StackedLineChartOutlinedIcon from '@mui/icons-material/StackedLineChartOutlined';
import { tokens } from '../theme';
import StatCard from '../components/StatCard';
import { getInventory, addInventory, updateInventory, deleteInventory, getProducts } from '../services/api';

const LOW_STOCK_THRESHOLD = 10;
const HIGH_STOCK_THRESHOLD = 100;

const getStockStatus = (quantity) => {
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low';
  if (quantity >= HIGH_STOCK_THRESHOLD) return 'high';
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

function exportToCsv(rows) {
  const header = ['Product ID', 'Product Name', 'Available Quantity', 'Status', 'Added By'];
  const lines = rows.map((r) => [
    r.productId,
    r.productName,
    r.availableQuantity,
    STATUS_STYLES[getStockStatus(r.availableQuantity)].label,
    r.addedBy || '—',
  ]);

  const csvContent = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search / status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sorting
  const [orderBy, setOrderBy] = useState('productName');
  const [order, setOrder] = useState('asc');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ productId: '', availableQuantity: '' });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Duplicate-stock resolution dialog
  const [duplicateDialog, setDuplicateDialog] = useState(null);
  const [resolving, setResolving] = useState(false);

  // Snackbar feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Undo-delete state
  const [pendingDeletes, setPendingDeletes] = useState({});

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, prodRes] = await Promise.all([getInventory(), getProducts()]);

      setProducts(prodRes.data);

      const productsById = {};
      prodRes.data.forEach((p) => {
        productsById[p.id || p._id] = p;
      });

      const merged = invRes.data.map((item) => ({
        ...item,
        productName: productsById[item.productId]?.productName || 'Unknown Product',
        addedBy: item.addedBy || item.createdBy || null,
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
    return () => {
      Object.values(pendingDeletes).forEach(({ timeoutId }) => clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  const openAddDialog = () => {
    setEditingItem(null);
    setForm({ productId: '', availableQuantity: '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setForm({
      productId: item.productId,
      availableQuantity: item.availableQuantity,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const persistInventory = async ({ id, productId, availableQuantity }, successMessage) => {
    setSaving(true);
    try {
      if (id) {
        await updateInventory(id, { productId, availableQuantity });
      } else {
        await addInventory({ productId, availableQuantity });
      }
      setDialogOpen(false);
      setDuplicateDialog(null);
      showSnackbar(successMessage, 'success');
      fetchItems();
    } catch (err) {
      showSnackbar('Save failed. Please try again.', 'error');
    } finally {
      setSaving(false);
      setResolving(false);
    }
  };

  const handleSave = async () => {
    setFormError(null);

    if (!form.productId) {
      setFormError('Please select a product.');
      return;
    }

    const qty = Number(form.availableQuantity);
    if (form.availableQuantity === '' || Number.isNaN(qty)) {
      setFormError('Please enter a quantity.');
      return;
    }
    if (qty < 0) {
      setFormError('Quantity cannot be negative.');
      return;
    }
    if (!Number.isInteger(qty)) {
      setFormError('Quantity must be a whole number.');
      return;
    }

    if (editingItem) {
      persistInventory(
        {
          id: editingItem.id,
          productId: editingItem.productId,
          availableQuantity: qty,
        },
        'Stock updated successfully.'
      );
      return;
    }

    const existing = items.find((item) => item.productId === form.productId);

    if (existing) {
      setDuplicateDialog({ existing, enteredQuantity: qty });
    } else {
      persistInventory(
        { id: null, productId: form.productId, availableQuantity: qty },
        'Inventory record added successfully.'
      );
    }
  };

  const handleAddToExisting = () => {
    if (!duplicateDialog) return;
    setResolving(true);
    const { existing, enteredQuantity } = duplicateDialog;
    persistInventory(
      {
        id: existing.id,
        productId: existing.productId,
        availableQuantity: existing.availableQuantity + enteredQuantity,
      },
      `Added ${enteredQuantity} units. New total: ${existing.availableQuantity + enteredQuantity}.`
    );
  };

  const handleOverwrite = () => {
    if (!duplicateDialog) return;
    setResolving(true);
    const { existing, enteredQuantity } = duplicateDialog;
    persistInventory(
      {
        id: existing.id,
        productId: existing.productId,
        availableQuantity: enteredQuantity,
      },
      `Stock overwritten to ${enteredQuantity} units.`
    );
  };

  const handleDelete = (item) => {
    setPendingDeletes((prev) => {
      const timeoutId = setTimeout(() => {
        deleteInventory(item.id)
          .then(() => fetchItems())
          .catch(() => showSnackbar(`Failed to delete "${item.productName}".`, 'error'));
        setPendingDeletes((p) => {
          const next = { ...p };
          delete next[item.id];
          return next;
        });
      }, 5000);

      return { ...prev, [item.id]: { item, timeoutId } };
    });

    setSnackbar({
      open: true,
      message: `Deleting "${item.productName}"...`,
      severity: 'info',
      undoId: item.id,
    });
  };

  const handleUndoDelete = (id) => {
    setPendingDeletes((prev) => {
      const entry = prev[id];
      if (entry) clearTimeout(entry.timeoutId);
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSnackbar({ open: true, message: 'Delete undone.', severity: 'success' });
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (pendingDeletes[item.id]) return false;
      const matchesSearch =
        item.productName.toLowerCase().includes(q) ||
        String(item.productId).toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || getStockStatus(item.availableQuantity) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter, pendingDeletes]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let cmp;
      if (orderBy === 'availableQuantity') {
        cmp = a.availableQuantity - b.availableQuantity;
      } else {
        cmp = a.productName.localeCompare(b.productName);
      }
      return order === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredItems, orderBy, order]);

  const paginatedItems = sortedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const selectedProduct = products.find((p) => p.id === form.productId) || null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4">Inventory</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
            Track stock levels across all products
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlinedIcon />}
            onClick={() => exportToCsv(sortedItems)}
            disabled={sortedItems.length === 0}
          >
            Export CSV
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Stock
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loading && items.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <StatCard label="Total Products" value={items.length} icon={<Inventory2OutlinedIcon />} />
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

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search by product name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 360, flex: 1, minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: tokens.inkSoft, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(event, newValue) => {
            if (newValue !== null) setStatusFilter(newValue);
          }}
          size="small"
        >
          <ToggleButton value="all" sx={{ textTransform: 'none', px: 2 }}>
            All
          </ToggleButton>
          <ToggleButton
            value="low"
            sx={{ textTransform: 'none', px: 2, '&.Mui-selected': { bgcolor: tokens.decreaseSoft, color: tokens.decrease } }}
          >
            Low Stock
          </ToggleButton>
          <ToggleButton
            value="normal"
            sx={{ textTransform: 'none', px: 2, '&.Mui-selected': { bgcolor: tokens.structureSoft, color: tokens.inkSoft } }}
          >
            Normal
          </ToggleButton>
          <ToggleButton
            value="high"
            sx={{ textTransform: 'none', px: 2, '&.Mui-selected': { bgcolor: tokens.increaseSoft, color: tokens.increase } }}
          >
            High Stock
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Product ID</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'productName'}
                  direction={orderBy === 'productName' ? order : 'asc'}
                  onClick={() => handleSort('productName')}
                >
                  Product Name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'availableQuantity'}
                  direction={orderBy === 'availableQuantity' ? order : 'asc'}
                  onClick={() => handleSort('availableQuantity')}
                >
                  Available Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Added By</TableCell>
              <TableCell align="right" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: tokens.inkSoft }}>
                  {items.length === 0
                    ? 'No inventory data available. Click "Add Stock" to create an entry.'
                    : 'No results match your search/filter.'}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              paginatedItems.map((item) => {
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
                        sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {item.addedBy ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonOutlineIcon sx={{ fontSize: 16, color: tokens.inkSoft }} />
                          <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
                            {item.addedBy}
                          </Typography>
                        </Box>
                      ) : (
                        <Tooltip title="Backend doesn't provide this field yet">
                          <Typography variant="body2" sx={{ color: tokens.inkSoft, opacity: 0.5 }}>
                            —
                          </Typography>
                        </Tooltip>
                      )}
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

        {!loading && sortedItems.length > 0 && (
          <TablePagination
            component="div"
            count={sortedItems.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </TableContainer>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          {editingItem ? 'Update Stock Level' : 'Add New Inventory'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Autocomplete
            disabled={!!editingItem}
            options={products}
            getOptionLabel={(option) => option.productName || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedProduct}
            onChange={(event, newValue) => {
              setForm({ ...form, productId: newValue ? newValue.id : '' });
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Product" placeholder="Type to search..." />
            )}
            noOptionsText="No matching products"
          />

          <TextField
            label="Available Quantity"
            type="number"
            value={form.availableQuantity}
            onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })}
            fullWidth
            inputProps={{ min: 0, step: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate-stock resolution dialog */}
      <Dialog open={!!duplicateDialog} onClose={() => !resolving && setDuplicateDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          Product Already in Stock
        </DialogTitle>
        <DialogContent>
          {duplicateDialog && (
            <DialogContentText sx={{ color: tokens.ink }}>
              <strong>{duplicateDialog.existing.productName}</strong> already has{' '}
              <MonoNumber sx={{ fontWeight: 600 }}>{duplicateDialog.existing.availableQuantity}</MonoNumber>{' '}
              units in stock.
              <br />
              <br />
              You entered <MonoNumber sx={{ fontWeight: 600 }}>{duplicateDialog.enteredQuantity}</MonoNumber> units.
              How should this be applied?
              <br />
              <br />
              <strong>Add to Existing</strong> → new total will be{' '}
              <MonoNumber sx={{ fontWeight: 600, color: tokens.increase }}>
                {duplicateDialog.existing.availableQuantity + duplicateDialog.enteredQuantity}
              </MonoNumber>
              <br />
              <strong>Overwrite</strong> → stock will be set to exactly{' '}
              <MonoNumber sx={{ fontWeight: 600, color: tokens.decrease }}>
                {duplicateDialog.enteredQuantity}
              </MonoNumber>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDuplicateDialog(null)} disabled={resolving}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleOverwrite}
            disabled={resolving}
            sx={{ borderColor: tokens.decrease, color: tokens.decrease }}
          >
            Overwrite
          </Button>
          <Button variant="contained" color="secondary" onClick={handleAddToExisting} disabled={resolving}>
            {resolving ? 'Saving...' : 'Add to Existing'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/error/info toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.undoId ? 5000 : 3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            snackbar.undoId ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  handleUndoDelete(snackbar.undoId);
                  setSnackbar((prev) => ({ ...prev, open: false }));
                }}
              >
                UNDO
              </Button>
            ) : undefined
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}