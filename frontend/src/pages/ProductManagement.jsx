import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  TableSortLabel, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, TextField, IconButton, Chip, CircularProgress, InputAdornment, MenuItem,
  Snackbar, Alert, Skeleton, Stack, Checkbox
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PriceTag from '../components/PriceTag';
import FadeIn from '../components/FadeIn';
import { tokens } from '../theme';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';

const emptyForm = { productName: '', category: '', currentPrice: '' };

function exportToCsv(rows) {
  const header = ['Product ID', 'Product Name', 'Category', 'Current Price'];
  const lines = rows.map((r) => [r.id, r.productName, r.category, r.currentPrice]);
  const csvContent = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [orderBy, setOrderBy] = useState('productName');
  const [order, setOrder] = useState('asc');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pendingDeletes, setPendingDeletes] = useState({});

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const tableRef = useRef(null);

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

  const loadProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => {
        setProducts(res.data);
        setLoadError(false);
      })
      .catch(() => {
        setProducts([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    return () => {
      Object.values(pendingDeletes).forEach(({ timeoutId }) => clearTimeout(timeoutId));
    };
  }, []);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return products.filter((p) => {
      if (pendingDeletes[p.id]) return false;
      const matchesSearch = p.productName?.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter, pendingDeletes]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredProducts, orderBy, order]);

  const paginatedProducts = sortedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, categoryFilter]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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

  const handleDelete = (product) => {
    setDeleteTarget(null);

    setPendingDeletes((prev) => {
      const timeoutId = setTimeout(() => {
        deleteProduct(product.id)
          .then(() => loadProducts())
          .catch(() => showToast(`Failed to delete "${product.productName}".`, 'error'));
        setPendingDeletes((p) => {
          const next = { ...p };
          delete next[product.id];
          return next;
        });
      }, 5000);
      return { ...prev, [product.id]: { product, timeoutId } };
    });

    setToast({ open: true, message: `Deleting "${product.productName}"...`, severity: 'info', undoId: product.id });
  };

  const handleUndoDelete = (id) => {
    setPendingDeletes((prev) => {
      const entry = prev[id];
      if (entry) clearTimeout(entry.timeoutId);
      const next = { ...prev };
      delete next[id];
      return next;
    });
    showToast('Delete undone.', 'success');
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await deleteProduct(id);
        successCount += 1;
      } catch (err) {
        failCount += 1;
      }
    }

    setBulkDeleting(false);
    setBulkDeleteConfirmOpen(false);
    setSelectedIds([]);

    if (failCount === 0) {
      showToast(`Deleted ${successCount} product(s).`, 'success');
    } else {
      showToast(`Deleted ${successCount} product(s), ${failCount} failed.`, 'error');
    }
    loadProducts();
  };

  const allOnPageSelected =
    paginatedProducts.length > 0 && paginatedProducts.every((p) => selectedIds.includes(p.id));
  const someOnPageSelected = paginatedProducts.some((p) => selectedIds.includes(p.id));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedProducts.some((p) => p.id === id)));
    } else {
      const newIds = paginatedProducts.map((p) => p.id);
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
            <Typography variant="h4" sx={{ mb: 0.5 }}>Products</Typography>
            <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
              Manage your product catalog and base prices
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
              startIcon={<FileDownloadIcon />}
              onClick={() => exportToCsv(sortedProducts)}
              disabled={sortedProducts.length === 0}
            >
              Export CSV
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}
              sx={{ backgroundColor: tokens.structure, '&:hover': { backgroundColor: '#1f2a3f' } }}>
              Add Product
            </Button>
          </Box>
        </Box>

        {loadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Could not reach the backend server. Product data could not be loaded.
          </Alert>
        )}

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
        ) : paginatedProducts.length === 0 ? (
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ '&:hover .row-checkbox': { opacity: 1 } }}>
                      <Checkbox
                        className="row-checkbox"
                        checked={allOnPageSelected}
                        indeterminate={!allOnPageSelected && someOnPageSelected}
                        onChange={toggleSelectAllOnPage}
                        disabled={paginatedProducts.length === 0}
                        sx={{ opacity: selectedIds.length > 0 || allOnPageSelected ? 1 : 0, transition: 'opacity 0.15s ease' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.inkSoft }}>
                      <TableSortLabel
                        active={orderBy === 'productName'}
                        direction={orderBy === 'productName' ? order : 'asc'}
                        onClick={() => handleSort('productName')}
                      >
                        Product Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.inkSoft }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: tokens.inkSoft }}>
                      <TableSortLabel
                        active={orderBy === 'currentPrice'}
                        direction={orderBy === 'currentPrice' ? order : 'asc'}
                        onClick={() => handleSort('currentPrice')}
                      >
                        Current Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: tokens.inkSoft }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                      <TableRow key={product.id} hover selected={isSelected} sx={{ '&:hover .row-checkbox': { opacity: 1 } }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            className="row-checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(product.id)}
                            sx={{ opacity: isSelected ? 1 : 0, transition: 'opacity 0.15s ease' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{product.productName}</TableCell>
                        <TableCell>
                          <Chip size="small" label={product.category} sx={{ backgroundColor: tokens.structureSoft, color: tokens.structure, fontWeight: 500 }} />
                        </TableCell>
                        <TableCell><PriceTag value={product.currentPrice} /></TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => openEditDialog(product)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setDeleteTarget(product)}>
                            <DeleteOutlineIcon fontSize="small" sx={{ color: tokens.decrease }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={sortedProducts.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </TableContainer>
          </FadeIn>
        )}
      </Box>

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

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Delete this product?</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
            "{deleteTarget?.productName}" will be removed. You'll have 5 seconds to undo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleDelete(deleteTarget)}
            sx={{ backgroundColor: tokens.decrease, '&:hover': { backgroundColor: '#8f402c' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkDeleteConfirmOpen} onClose={() => !bulkDeleting && setBulkDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to permanently delete <strong>{selectedIds.length}</strong> product(s).
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

      <Snackbar
        open={toast.open}
        autoHideDuration={toast.undoId ? 5000 : 3500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast({ ...toast, open: false })}
          action={
            toast.undoId ? (
              <Button color="inherit" size="small" onClick={() => {
                handleUndoDelete(toast.undoId);
                setToast({ ...toast, open: false });
              }}>
                UNDO
              </Button>
            ) : undefined
          }
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
