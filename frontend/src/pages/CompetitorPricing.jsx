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
  Typography,
  IconButton,
  InputAdornment,
  Autocomplete,
  Snackbar,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { tokens } from '../theme';
import PriceTag from '../components/PriceTag';
import { getCompetitorPrices, addCompetitorPrice, updateCompetitorPrice, deleteCompetitorPrice, getProducts } from '../services/api';

export default function CompetitorPricing() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [orderBy, setOrderBy] = useState('productName');
  const [order, setOrder] = useState('asc');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ productId: '', competitorName: '', competitorPrice: '' });
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pendingDeletes, setPendingDeletes] = useState({});

  // NEW: bulk-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const tableRef = useRef(null);

  // NEW: clicking anywhere outside the table (and its action bar) clears the
  // current selection, instead of having to uncheck each row one by one.
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

  const showSnackbar = (message, severity = 'success', undoId = null) => {
    setSnackbar({ open: true, message, severity, undoId });
  };

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, prodRes] = await Promise.all([getCompetitorPrices(), getProducts()]);

      const sanitizedProducts = prodRes.data.map(p => ({
        ...p,
        id: p.id || p._id
      }));
      setProducts(sanitizedProducts);

      const productsById = {};
      sanitizedProducts.forEach((p) => {
        productsById[p.id] = p;
      });

      const merged = compRes.data.map((item) => ({
        ...item,
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
    return () => {
      Object.values(pendingDeletes).forEach(({ timeoutId }) => clearTimeout(timeoutId));
    };
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

  const selectedProduct = products.find((p) => p.id === form.productId) || null;

  const duplicateRecord = useMemo(() => {
    if (editingItem || !selectedProduct || !form.competitorName.trim()) return null;
    return items.find(
      (item) =>
        item.productName.toLowerCase() === selectedProduct.productName.toLowerCase() &&
        item.competitorName.toLowerCase() === form.competitorName.trim().toLowerCase()
    );
  }, [selectedProduct, form.competitorName, items, editingItem]);

  const handleSave = async (forceAddNew = false) => {
    if (!form.productId || !form.competitorName || !form.competitorPrice) {
      showSnackbar('Please fill in all details.', 'error');
      return;
    }

    const price = Number(form.competitorPrice);
    if (form.competitorPrice === '' || Number.isNaN(price) || price < 0) {
      showSnackbar('Please enter a valid price.', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      productId: form.productId,
      competitorName: form.competitorName.trim(),
      competitorPrice: price,
    };

    try {
      if (editingItem) {
        await updateCompetitorPrice(editingItem.id, payload);
        showSnackbar('Competitor price updated successfully.', 'success');
      } else if (duplicateRecord && !forceAddNew) {
        await updateCompetitorPrice(duplicateRecord.id, payload);
        showSnackbar(`Overwritten tracking data for ${payload.competitorName}.`, 'success');
      } else {
        await addCompetitorPrice(payload);
        showSnackbar('Competitor pricing record added successfully.', 'success');
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err) {
      showSnackbar('Save failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    setPendingDeletes((prev) => {
      const timeoutId = setTimeout(() => {
        deleteCompetitorPrice(item.id)
          .then(() => fetchItems())
          .catch(() => showSnackbar(`Failed to remove entry from "${item.competitorName}".`, 'error'));
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
      message: `Deleting entry from "${item.competitorName}"...`,
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
    showSnackbar('Delete undone.', 'success');
  };

  // NEW: bulk-delete handler — no per-item undo, confirmation dialog guards against mistakes instead
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await deleteCompetitorPrice(id);
        successCount += 1;
      } catch (err) {
        failCount += 1;
      }
    }

    setBulkDeleting(false);
    setBulkDeleteConfirmOpen(false);
    setSelectedIds([]);

    if (failCount === 0) {
      showSnackbar(`Deleted ${successCount} competitor pricing record(s).`, 'success');
    } else {
      showSnackbar(`Deleted ${successCount} record(s), ${failCount} failed. Please retry those.`, 'error');
    }

    fetchItems();
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

  const getPriceDiffPercentage = (ourPrice, competitorPrice) => {
    if (!ourPrice || !competitorPrice) return null;
    const diff = competitorPrice - ourPrice;
    const percent = (diff / ourPrice) * 100;
    const formatted = percent.toFixed(1);

    if (percent < 0) {
      return { text: `${Math.abs(percent).toFixed(1)}% Lower`, color: tokens.decrease };
    } else if (percent > 0) {
      return { text: `+${formatted}% Higher`, color: tokens.increase };
    }
    return { text: 'Equal', color: tokens.inkSoft };
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (pendingDeletes[item.id]) return false;
      return (
        item.competitorName.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery, pendingDeletes]);

  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    list.sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredItems, orderBy, order]);

  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const handleExportCsv = () => {
    const headers = ['Product Name', 'Product ID', 'Competitor', 'Our Price', 'Competitor Price', 'Comparison'];
    const rows = sortedItems.map((item) => {
      const comparison = getComparison(item.ourPrice, item.competitorPrice);
      return [
        item.productName,
        item.productId,
        item.competitorName,
        item.ourPrice ?? '',
        item.competitorPrice,
        comparison.label,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `competitor-pricing-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          <Typography variant="h4">Competitor Pricing</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
            Track how our prices compare to competitors
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
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Competitor Price
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, maxWidth: '360px' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search competitor or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: tokens.inkSoft, fontSize: 20 }} />
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
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'productName'}
                  direction={orderBy === 'productName' ? order : 'asc'}
                  onClick={() => handleSortRequest('productName')}
                >
                  Product
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'competitorName'}
                  direction={orderBy === 'competitorName' ? order : 'asc'}
                  onClick={() => handleSortRequest('competitorName')}
                >
                  Competitor
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'ourPrice'}
                  direction={orderBy === 'ourPrice' ? order : 'asc'}
                  onClick={() => handleSortRequest('ourPrice')}
                >
                  Our Price
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'competitorPrice'}
                  direction={orderBy === 'competitorPrice' ? order : 'asc'}
                  onClick={() => handleSortRequest('competitorPrice')}
                >
                  Competitor Price
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Comparison</TableCell>
              <TableCell align="right" sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
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
                  No competitor records match your view.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              paginatedItems.map((item) => {
                const comparison = getComparison(item.ourPrice, item.competitorPrice);
                const percentDiff = getPriceDiffPercentage(item.ourPrice, item.competitorPrice);
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
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.productName}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: tokens.inkSoft, opacity: 0.7, fontSize: '11px' }}>
                        ID: {item.productId}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: tokens.inkSoft, fontWeight: 500 }}>{item.competitorName}</TableCell>
                    <TableCell>
                      <PriceTag value={item.ourPrice} />
                    </TableCell>
                    <TableCell>
                      <PriceTag value={item.competitorPrice} />
                      {percentDiff && (
                        <Box sx={{ fontSize: '11px', fontWeight: 500, color: percentDiff.color, mt: 0.2 }}>
                          ({percentDiff.text})
                        </Box>
                      )}
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          {editingItem ? 'Edit Competitor Data' : 'Add Competitor Pricing'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>

          <Autocomplete
            disabled={!!editingItem}
            options={products}
            getOptionLabel={(option) => option.productName || ''}
            value={selectedProduct}
            onChange={(event, newValue) => {
              setForm({ ...form, productId: newValue ? newValue.id : '' });
            }}
            autoHighlight
            filterOptions={(options, state) => {
              const search = state.inputValue.toLowerCase();
              return options.filter(option =>
                (option.productName || '').toLowerCase().includes(search)
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Product" placeholder="Type to search product name..." sx={{ mt: 1 }} />
            )}
            noOptionsText="No matching products found"
          />

          <TextField
            label="Competitor Name"
            placeholder="e.g. Amazon, Flipkart"
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

          {duplicateRecord && (
            <Alert severity="warning" sx={{ mt: 1, '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Price Tracking Conflict</Typography>
              <Typography variant="caption" component="p" sx={{ mt: 0.5, lineHeight: 1.4 }}>
                A record for <strong>{duplicateRecord.competitorName}</strong> under product name "{duplicateRecord.productName}" already exists (Price: <strong>₹{duplicateRecord.competitorPrice}</strong>).
                <br />Choose whether to overwrite it or log it as a separate model.
              </Typography>
            </Alert>
          )}

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {duplicateRecord && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                Add as New
              </Button>
            )}
            <Button
              variant="contained"
              color={duplicateRecord ? "error" : "secondary"}
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : duplicateRecord ? 'Overwrite' : 'Save'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* NEW: bulk-delete confirmation dialog */}
      <Dialog open={bulkDeleteConfirmOpen} onClose={() => !bulkDeleting && setBulkDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          Confirm Bulk Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to permanently delete <strong>{selectedIds.length}</strong> competitor pricing record(s).
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