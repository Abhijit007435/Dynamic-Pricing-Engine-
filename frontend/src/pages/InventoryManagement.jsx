import { useEffect, useState, useMemo, useRef } from 'react';
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
  Checkbox,
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

// Aligned with backend's InventoryService.getInventoryStatus() thresholds
// exactly: <=0 OUT_OF_STOCK, <20 LOW, <=100 MEDIUM (shown as "Normal"), >100 HIGH.
// Previously this used different local numbers (<=10 / >=100) which didn't
// match the backend's business logic — now synced.
const LOW_STOCK_THRESHOLD = 20;
const HIGH_STOCK_THRESHOLD = 100;

const getStockStatus = (quantity) => {
  if (quantity <= 0) return 'out';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low';
  if (quantity <= HIGH_STOCK_THRESHOLD) return 'normal';
  return 'high';
};

const STATUS_STYLES = {
  out: { label: 'Out of Stock', bg: tokens.decreaseSoft, color: tokens.decrease },
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

  // NEW: bulk-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const tableRef = useRef(null);

  // NEW: clicking anywhere outside the table clears the current selection,
  // instead of having to uncheck each row one by one.
  useEffect(() => {
    if (selectedIds.length === 0) return;
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedIds([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedIds.length]);

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
      // Backend's PUT /inventory/{id} is ADDITIVE (existing + incoming), not a
      // set-exact-value endpoint. Since this dialog shows the current quantity
      // and lets the admin type the new desired total, we must send only the
      // delta so the backend's addition lands on the intended final value.
      const delta = qty - editingItem.availableQuantity;
      persistInventory(
        {
          id: editingItem.id,
          productId: editingItem.productId,
          availableQuantity: delta,
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
    // Backend's PUT /inventory/{id} already does existing + incoming itself.
    // Sending a pre-summed value here would double-count, so we send the
    // raw entered quantity only and let the backend do the addition.
    persistInventory(
      {
        id: existing.id,
        productId: existing.productId,
        availableQuantity: enteredQuantity,
      },
      `Added ${enteredQuantity} units. New total: ${existing.availableQuantity + enteredQuantity}.`
    );
  };

  const handleOverwrite = () => {
    if (!duplicateDialog) return;
    setResolving(true);
    const { existing, enteredQuantity } = duplicateDialog;
    // Backend is additive, so to "overwrite" to an exact value we must send
    // the delta between the desired final value and the current value.
    const delta = enteredQuantity - existing.availableQuantity;
    persistInventory(
      {
        id: existing.id,
        productId: existing.productId,
        availableQuantity: delta,
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

  // NEW: bulk-delete handler (no per-item undo — confirmation dialog protects against mistakes instead)
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await deleteInventory(id);
        successCount += 1;
      } catch (err) {
        failCount += 1;
      }
    }

    setBulkDeleting(false);
    setBulkDeleteConfirmOpen(false);
    setSelectedIds([]);

    if (failCount === 0) {
      showSnackbar(`Deleted ${successCount} inventory record(s).`, 'success');
    } else {
      showSnackbar(`Deleted ${successCount} record(s), ${failCount} failed. Please retry those.`, 'error');
    }

    fetchItems();
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

  // NEW: bulk-select helpers
  const allOnPageSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.includes(item.id));
  const someOnPageSelected = paginatedItems.some((item) => selectedIds.includes(item.id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedItems.some((item) => item.id === id)));
    } else {
      const newIds = paginatedItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <Box>
      <Box ref={tableRef}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4">Inventory</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
            Track stock levels across all products
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {selectedIds.length > 0 && (
            <Button
              variant="contained"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setBulkDeleteConfirmOpen(true)}
              sx={{ bgcolor: tokens.decrease, '&:hover': { bgcolor: tokens.decrease, opacity: 0.9 } }}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
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
            label="Low / Out of Stock Items"
            value={items.filter((i) => ['low', 'out'].includes(getStockStatus(i.availableQuantity))).length}
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
            value="out"
            sx={{ textTransform: 'none', px: 2, '&.Mui-selected': { bgcolor: tokens.decreaseSoft, color: tokens.decrease } }}
          >
            Out of Stock
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
              <TableCell
                padding="checkbox"
                sx={{ '&:hover .row-checkbox': { opacity: 1 } }}
              >
                <Checkbox
                  className="row-checkbox"
                  checked={allOnPageSelected}
                  indeterminate={!allOnPageSelected && someOnPageSelected}
                  onChange={toggleSelectAllOnPage}
                  disabled={paginatedItems.length === 0}
                  sx={{
                    opacity: selectedIds.length > 0 || allOnPageSelected ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }}
                />
              </TableCell>
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
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: tokens.inkSoft }}>
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
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TableRow
                    key={item.id}
                    hover
                    selected={isSelected}
                    sx={{ '&:hover .row-checkbox': { opacity: 1 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        className="row-checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(item.id)}
                        sx={{
                          opacity: isSelected ? 1 : 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      />
                    </TableCell>
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
      </Box>

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

      {/* NEW: bulk-delete confirmation dialog */}
      <Dialog open={bulkDeleteConfirmOpen} onClose={() => !bulkDeleting && setBulkDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to permanently delete <strong>{selectedIds.length}</strong> inventory record(s).
            This action cannot be undone (unlike single-row delete, there is no undo window for bulk delete).
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkDeleteConfirmOpen(false)} disabled={bulkDeleting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            sx={{ bgcolor: tokens.decrease, '&:hover': { bgcolor: tokens.decrease, opacity: 0.9 } }}
          >
            {bulkDeleting ? 'Deleting...' : 'Delete Permanently'}
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