import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableSortLabel,
  TablePagination,
  Chip,
  Snackbar,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import { tokens } from '../theme';
import PriceTag from '../components/PriceTag';
import {
  getProducts,
  calculatePrice,
  getPricingHistoryByProduct,
  updateProduct,
} from '../services/api';

// Freshness helper — since backend calculates recommendations in real-time
// and doesn't return a timestamp, we track "when did the frontend fetch this"
// client-side, so admins can tell if a displayed number might be stale.
const getFreshnessLabel = (calculatedAt) => {
  if (!calculatedAt) return null;
  const seconds = Math.floor((new Date() - new Date(calculatedAt)) / 1000);
  if (seconds < 10) return { text: 'Just now', stale: false };
  if (seconds < 60) return { text: `${seconds}s ago`, stale: false };
  const minutes = Math.floor(seconds / 60);
  if (minutes < 5) return { text: `${minutes}m ago`, stale: false };
  if (minutes < 60) return { text: `${minutes}m ago`, stale: true };
  const hours = Math.floor(minutes / 60);
  return { text: `${hours}h ago`, stale: true };
};

export default function PricingRecommendation() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [tab, setTab] = useState(0); // 0 = Single Product, 1 = All Products

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // ---- All Products tab state ----
  const [allResults, setAllResults] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [allSearch, setAllSearch] = useState('');
  const [orderBy, setOrderBy] = useState('productName');
  const [order, setOrder] = useState('asc');
  const [applyingId, setApplyingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all'); // all | up | down | same

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkApplying, setBulkApplying] = useState(false);
  const allProductsRef = useRef(null);

  // NEW: clicking anywhere outside the All Products table (and its action bar)
  // clears the current selection, instead of unchecking each row one by one.
  useEffect(() => {
    if (selectedIds.length === 0) return;
    const handleClickOutside = (event) => {
      if (allProductsRef.current && !allProductsRef.current.contains(event.target)) {
        setSelectedIds([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedIds.length]);

  // NEW: per-row "view history" modal state (All Products tab)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyDialogProductName, setHistoryDialogProductName] = useState('');
  const [historyDialogData, setHistoryDialogData] = useState([]);
  const [historyDialogLoading, setHistoryDialogLoading] = useState(false);

  // NEW: force a re-render every 30s so "X ago" labels stay live without extra API calls
  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      setError('Could not load products. Check that the backend server is running.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchHistory = async (productId) => {
    setLoadingHistory(true);
    try {
      const response = await getPricingHistoryByProduct(productId);
      setHistory(response.data);
    } catch (err) {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedProduct) return;
    setCalculating(true);
    setError(null);
    setResult(null);
    try {
      const response = await calculatePrice(selectedProduct.id);
      setResult({ ...response.data, calculatedAt: new Date() });
      fetchHistory(selectedProduct.id);
    } catch (err) {
      setError('Could not calculate a recommendation. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleApply = async () => {
    if (!selectedProduct || !result) return;
    setApplying(true);
    try {
      const payload = { ...selectedProduct, currentPrice: result.recommendedPrice };
      await updateProduct(selectedProduct.id, payload);
      showSnackbar(`Price updated to ₹${result.recommendedPrice} for ${selectedProduct.productName}.`, 'success');
      await fetchProducts();
      const response = await calculatePrice(selectedProduct.id);
      setResult({ ...response.data, calculatedAt: new Date() });
      fetchHistory(selectedProduct.id);
    } catch (err) {
      showSnackbar('Failed to apply the new price. Please try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  const priceWentUp = result && result.recommendedPrice > result.currentPrice;
  const priceWentDown = result && result.recommendedPrice < result.currentPrice;
  const priceUnchanged = result && result.recommendedPrice === result.currentPrice;
  const resultFreshness = result ? getFreshnessLabel(result.calculatedAt) : null;

  // ---- All Products tab logic ----
  const loadAllRecommendations = async () => {
    setLoadingAll(true);
    setAllResults([]);
    setSelectedIds([]);
    try {
      const settled = await Promise.allSettled(
        products.map((p) => calculatePrice(p.id))
      );
      const now = new Date();
      const combined = products.map((p, i) => {
        const outcome = settled[i];
        if (outcome.status === 'fulfilled') {
          return { ...outcome.value.data, productName: p.productName, product: p, failed: false, calculatedAt: now };
        }
        return {
          productId: p.id,
          productName: p.productName,
          currentPrice: p.currentPrice,
          recommendedPrice: p.currentPrice,
          reason: 'Could not calculate (missing inventory data?)',
          product: p,
          failed: true,
          calculatedAt: now,
        };
      });
      setAllResults(combined);
    } catch (err) {
      showSnackbar('Failed to load recommendations for all products.', 'error');
    } finally {
      setLoadingAll(false);
    }
  };

  useEffect(() => {
    if (tab === 1 && allResults.length === 0 && products.length > 0) {
      loadAllRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, products]);

  const handleApplyRow = async (row) => {
    setApplyingId(row.productId);
    try {
      const payload = { ...row.product, currentPrice: row.recommendedPrice };
      await updateProduct(row.productId, payload);
      showSnackbar(`Price updated for ${row.productName}.`, 'success');
      await fetchProducts();
      loadAllRecommendations();
    } catch (err) {
      showSnackbar(`Failed to apply price for ${row.productName}.`, 'error');
    } finally {
      setApplyingId(null);
    }
  };

  // NEW: open history modal for a specific row (All Products tab)
  const handleOpenHistoryDialog = async (row) => {
    setHistoryDialogProductName(row.productName);
    setHistoryDialogOpen(true);
    setHistoryDialogLoading(true);
    setHistoryDialogData([]);
    try {
      const response = await getPricingHistoryByProduct(row.productId);
      setHistoryDialogData(response.data);
    } catch (err) {
      setHistoryDialogData([]);
    } finally {
      setHistoryDialogLoading(false);
    }
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setHistoryDialogProductName('');
    setHistoryDialogData([]);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getRowStatus = (row) => {
    if (row.recommendedPrice > row.currentPrice) return 'up';
    if (row.recommendedPrice < row.currentPrice) return 'down';
    return 'same';
  };

  const filteredAllResults = useMemo(() => {
    const q = allSearch.toLowerCase();
    return allResults.filter((r) => {
      const matchesSearch = r.productName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || getRowStatus(r) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allResults, allSearch, statusFilter]);

  const sortedAllResults = useMemo(() => {
    const list = [...filteredAllResults];
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
  }, [filteredAllResults, orderBy, order]);

  const paginatedResults = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedAllResults.slice(start, start + rowsPerPage);
  }, [sortedAllResults, page, rowsPerPage]);

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setPage(0);
  }, [allSearch, statusFilter]);

  const selectableOnPage = paginatedResults.filter((r) => getRowStatus(r) !== 'same' && !r.failed);
  const allOnPageSelected =
    selectableOnPage.length > 0 && selectableOnPage.every((r) => selectedIds.includes(r.productId));

  const toggleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableOnPage.some((r) => r.productId === id)));
    } else {
      const newIds = selectableOnPage.map((r) => r.productId);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  const toggleSelectRow = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleBulkApply = async () => {
    setBulkApplying(true);
    const rowsToApply = allResults.filter((r) => selectedIds.includes(r.productId));
    let successCount = 0;
    let failCount = 0;

    for (const row of rowsToApply) {
      try {
        const payload = { ...row.product, currentPrice: row.recommendedPrice };
        await updateProduct(row.productId, payload);
        successCount += 1;
      } catch (err) {
        failCount += 1;
      }
    }

    setBulkApplying(false);
    setBulkConfirmOpen(false);
    setSelectedIds([]);

    if (failCount === 0) {
      showSnackbar(`Applied new prices to ${successCount} product(s).`, 'success');
    } else {
      showSnackbar(`Applied ${successCount} price(s), ${failCount} failed. Please retry those.`, 'error');
    }

    await fetchProducts();
    loadAllRecommendations();
  };

  const batchFreshness = allResults.length > 0 ? getFreshnessLabel(allResults[0].calculatedAt) : null;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Pricing Recommendation</Typography>
        <Typography variant="body2" sx={{ color: tokens.inkSoft, mt: 0.5 }}>
          Select a product to see the recommended price and why it was chosen
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Single Product" />
        <Tab label="All Products" />
      </Tabs>

      {tab === 0 && (
        <>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Autocomplete
              sx={{ minWidth: 280 }}
              options={products}
              getOptionLabel={(option) => option.productName || ''}
              value={selectedProduct}
              onChange={(e, newValue) => {
                setSelectedProduct(newValue);
                setResult(null);
                setHistory([]);
              }}
              loading={loadingProducts}
              autoHighlight
              filterOptions={(options, state) => {
                const search = state.inputValue.toLowerCase();
                return options.filter((o) => (o.productName || '').toLowerCase().includes(search));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search & select product" placeholder="Type product name..." />
              )}
              noOptionsText="No matching products found"
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCalculate}
              disabled={!selectedProduct || calculating}
            >
              {calculating ? 'Calculating...' : 'Get Recommendation'}
            </Button>
          </Paper>

          {calculating && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: tokens.accent }} />
            </Box>
          )}

          {result && !calculating && (
            <Paper sx={{ p: 4, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                {resultFreshness && (
                  <Typography
                    variant="caption"
                    sx={{ color: resultFreshness.stale ? tokens.decrease : tokens.inkSoft }}
                  >
                    {resultFreshness.stale ? '⚠ ' : ''}Calculated {resultFreshness.text}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  py: 3,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 0.5 }}>
                    Current Price
                  </Typography>
                  <PriceTag value={result.currentPrice} size="large" />
                </Box>

                <ArrowForwardIcon sx={{ color: tokens.inkSoft, fontSize: 32 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: tokens.inkSoft, mb: 0.5 }}>
                    Recommended Price
                  </Typography>
                  <PriceTag
                    value={result.recommendedPrice}
                    size="large"
                    variant={priceWentUp ? 'decrease' : priceWentDown ? 'increase' : 'accent'}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Why This Price
              </Typography>
              <Box
                sx={{
                  bgcolor: tokens.accentSoft,
                  borderLeft: `4px solid ${tokens.accent}`,
                  borderRadius: 1,
                  p: 3,
                  display: 'flex',
                  gap: 1.5,
                  mb: 3,
                }}
              >
                <FormatQuoteOutlinedIcon sx={{ color: tokens.accent }} />
                <Typography sx={{ fontStyle: 'italic', color: tokens.ink }}>
  {result.aiExplanation || result.reason || 'No change'}
</Typography>
              </Box>

              {!priceUnchanged && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? 'Applying...' : `Apply ₹${result.recommendedPrice} as New Price`}
                </Button>
              )}
              {priceUnchanged && (
                <Chip label="Product is already at the recommended price" sx={{ bgcolor: tokens.structureSoft }} />
              )}
            </Paper>
          )}

          {!result && !calculating && (
            <Paper sx={{ p: 6, textAlign: 'center', mb: 3 }}>
              <Typography sx={{ color: tokens.inkSoft }}>
                Select a product above and click "Get Recommendation" to see the pricing engine in action.
              </Typography>
            </Paper>
          )}

          {selectedProduct && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HistoryIcon sx={{ color: tokens.inkSoft }} />
                <Typography variant="h6">Recommendation History</Typography>
              </Box>

              {loadingHistory && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} sx={{ color: tokens.accent }} />
                </Box>
              )}

              {!loadingHistory && history.length === 0 && (
                <Typography variant="body2" sx={{ color: tokens.inkSoft }}>
                  No past recommendations recorded for this product yet.
                </Typography>
              )}

              {!loadingHistory && history.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Old Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Recommended Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history
                        .slice()
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((h) => (
                          <TableRow key={h.id}>
                            <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>
                              {new Date(h.createdAt).toLocaleString('en-IN')}
                            </TableCell>
                            <TableCell><PriceTag value={h.oldPrice} size="small" /></TableCell>
                            <TableCell><PriceTag value={h.recommendedPrice} size="small" variant="accent" /></TableCell>
                            <TableCell sx={{ color: tokens.inkSoft }}>
  {h.aiExplanation || h.reason}
</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}
        </>
      )}

      {tab === 1 && (
        <Box ref={allProductsRef}>
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search product..."
                value={allSearch}
                onChange={(e) => setAllSearch(e.target.value)}
                sx={{ minWidth: 260 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: tokens.inkSoft, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <ToggleButtonGroup
                size="small"
                value={statusFilter}
                exclusive
                onChange={(e, val) => val && setStatusFilter(val)}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="up">Price Up</ToggleButton>
                <ToggleButton value="down">Price Down</ToggleButton>
                <ToggleButton value="same">No Change</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {selectedIds.length > 0 && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setBulkConfirmOpen(true)}
                >
                  Apply Selected ({selectedIds.length})
                </Button>
              )}
              <Button variant="outlined" onClick={loadAllRecommendations} disabled={loadingAll}>
                {loadingAll ? 'Loading...' : 'Refresh All'}
              </Button>
            </Box>
          </Box>

          {batchFreshness && !loadingAll && (
            <Typography
              variant="caption"
              sx={{ display: 'block', mb: 2, color: batchFreshness.stale ? tokens.decrease : tokens.inkSoft }}
            >
              {batchFreshness.stale ? '⚠ ' : ''}Last refreshed {batchFreshness.text}
            </Typography>
          )}

          {loadingAll && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: tokens.accent }} />
            </Box>
          )}

          {!loadingAll && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        '&:hover .row-checkbox': { opacity: 1 },
                      }}
                    >
                      <Checkbox
                        className="row-checkbox"
                        checked={allOnPageSelected}
                        indeterminate={
                          !allOnPageSelected &&
                          selectableOnPage.some((r) => selectedIds.includes(r.productId))
                        }
                        onChange={toggleSelectAllOnPage}
                        disabled={selectableOnPage.length === 0}
                        sx={{
                          opacity: selectedIds.length > 0 || allOnPageSelected ? 1 : 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === 'productName'}
                        direction={orderBy === 'productName' ? order : 'asc'}
                        onClick={() => handleSortRequest('productName')}
                      >
                        Product
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === 'currentPrice'}
                        direction={orderBy === 'currentPrice' ? order : 'asc'}
                        onClick={() => handleSortRequest('currentPrice')}
                      >
                        Current Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={orderBy === 'recommendedPrice'}
                        direction={orderBy === 'recommendedPrice' ? order : 'asc'}
                        onClick={() => handleSortRequest('recommendedPrice')}
                      >
                        Recommended
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedResults.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: tokens.inkSoft }}>
                        No products match your view.
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedResults.map((row) => {
                    const unchanged = row.recommendedPrice === row.currentPrice;
                    const isSelected = selectedIds.includes(row.productId);
                    const rowFreshness = getFreshnessLabel(row.calculatedAt);
                    return (
                      <TableRow
                        key={row.productId}
                        hover
                        selected={isSelected}
                        sx={{ '&:hover .row-checkbox': { opacity: 1 } }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            className="row-checkbox"
                            checked={isSelected}
                            disabled={unchanged || row.failed}
                            onChange={() => toggleSelectRow(row.productId)}
                            sx={{
                              opacity: isSelected ? 1 : 0,
                              transition: 'opacity 0.15s ease',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {row.productName}
                          {rowFreshness && (
                            <Typography
                              variant="caption"
                              component="div"
                              sx={{ color: rowFreshness.stale ? tokens.decrease : tokens.inkSoft, fontSize: '11px', mt: 0.2 }}
                            >
                              {rowFreshness.stale ? '⚠ ' : ''}{rowFreshness.text}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell><PriceTag value={row.currentPrice} /></TableCell>
                        <TableCell>
                          <PriceTag
                            value={row.recommendedPrice}
                            variant={row.recommendedPrice > row.currentPrice ? 'decrease' : row.recommendedPrice < row.currentPrice ? 'increase' : 'accent'}
                          />
                        </TableCell>
                        <TableCell
  sx={{
    color: row.failed ? tokens.decrease : tokens.inkSoft,
    fontSize: '13px'
  }}
>
  {row.aiExplanation || row.reason}
</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                            {!row.failed && (
                              <Tooltip title="View pricing history">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenHistoryDialog(row)}
                                  sx={{ color: tokens.inkSoft }}
                                >
                                  <HistoryIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {!unchanged && !row.failed && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleApplyRow(row)}
                                disabled={applyingId === row.productId}
                              >
                                {applyingId === row.productId ? 'Applying...' : 'Apply'}
                              </Button>
                            )}
                            {unchanged && !row.failed && (
                              <Chip label="Up to date" size="small" sx={{ bgcolor: tokens.structureSoft }} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={sortedAllResults.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}
        </>
        </Box>
      )}

      {/* NEW: per-row pricing history modal (All Products tab) */}
      <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: tokens.inkSoft }} />
          Pricing History — {historyDialogProductName}
        </DialogTitle>
        <DialogContent>
          {historyDialogLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ color: tokens.accent }} />
            </Box>
          )}

          {!historyDialogLoading && historyDialogData.length === 0 && (
            <Typography variant="body2" sx={{ color: tokens.inkSoft, py: 2 }}>
              No past recommendations recorded for this product yet.
            </Typography>
          )}

          {!historyDialogLoading && historyDialogData.length > 0 && (
            <TableContainer sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Old Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Recommended</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyDialogData
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((h) => (
                      <TableRow key={h.id}>
                        <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>
                          {new Date(h.createdAt).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell><PriceTag value={h.oldPrice} size="small" /></TableCell>
                        <TableCell><PriceTag value={h.recommendedPrice} size="small" variant="accent" /></TableCell>
                       <TableCell
  sx={{
    color: tokens.inkSoft,
    fontSize: '13px'
  }}
>
  {h.aiExplanation || h.reason}
</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseHistoryDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkConfirmOpen} onClose={() => !bulkApplying && setBulkConfirmOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Sora", sans-serif', fontWeight: 600 }}>
          Confirm Bulk Price Update
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to apply the recommended price to <strong>{selectedIds.length}</strong> product(s).
            This will overwrite their current price. You can always recalculate or edit a price again afterward.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkConfirmOpen(false)} disabled={bulkApplying}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleBulkApply} disabled={bulkApplying}>
            {bulkApplying ? 'Applying...' : 'Confirm & Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}