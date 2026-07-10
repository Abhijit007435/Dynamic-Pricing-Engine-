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
  TextField,
  Chip,
  Alert,
  Skeleton,
  Typography,
  IconButton,
  InputAdornment,
  Autocomplete,
  Snackbar,
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

  // NEW: sort state
  const [orderBy, setOrderBy] = useState('productName');
  const [order, setOrder] = useState('asc');

  // NEW: pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ productId: '', competitorName: '', competitorPrice: '' });
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pendingDeletes, setPendingDeletes] = useState({});

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

  // NEW: sort handler
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

  // NEW: sorted list (applied after filtering)
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

  // NEW: paginated slice
  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // reset to page 0 whenever search/filter changes result size
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  // NEW: CSV export (uses filtered+sorted set, not just current page)
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
        <Box>
          <Typography variant="h4">Competitor Pricing</Typography>
          <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
            Track how our prices compare to competitors
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
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
                  No competitor records match your view.
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              paginatedItems.map((item) => {
                const comparison = getComparison(item.ourPrice, item.competitorPrice);
                const percentDiff = getPriceDiffPercentage(item.ourPrice, item.competitorPrice);
                return (
                  <TableRow key={item.id} hover>
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