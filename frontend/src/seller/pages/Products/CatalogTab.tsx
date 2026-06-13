import { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, TextField, InputAdornment,
  Card, CardContent, CardMedia, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, Snackbar, Grid,
} from "@mui/material";
import SearchIcon       from "@mui/icons-material/Search";
import StorefrontIcon   from "@mui/icons-material/Storefront";
import LocalOfferIcon   from "@mui/icons-material/LocalOffer";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchAvailableCatalog, claimProduct, clearClaimSuccess,
} from "../../../Redux Toolkit/Seller/sellerProductSlice";
import { type Product } from "../../../types/productTypes";

const CatalogTab = () => {
  const dispatch = useAppDispatch();
  const { catalog, catalogLoading, claimSuccess, error } = useAppSelector((s) => s.sellerProduct);
  const jwt = localStorage.getItem("jwt") || "";

  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<Product | null>(null);
  const [sellingPrice, setSellingPrice] = useState("");
  const [mrpPrice, setMrpPrice]       = useState("");
  const [quantity, setQuantity]       = useState("50");
  const [deliveryDays, setDeliveryDays] = useState("5");
  const [snack, setSnack]             = useState(false);

  useEffect(() => { dispatch(fetchAvailableCatalog(jwt)); }, []);

  useEffect(() => {
    if (claimSuccess) {
      setSnack(true);
      setSelected(null);
      dispatch(clearClaimSuccess());
    }
  }, [claimSuccess]);

  const openClaim = (p: Product) => {
    setSelected(p);
    setMrpPrice(String(p.minMrpPrice || p.minPrice || ""));
    setSellingPrice(String(p.minPrice || ""));
    setQuantity("50");
    setDeliveryDays("5");
  };

  const submitClaim = () => {
    if (!selected) return;
    dispatch(claimProduct({
      productId:    selected._id,
      sellingPrice: Number(sellingPrice),
      mrpPrice:     Number(mrpPrice),
      quantity:     Number(quantity),
      deliveryDays: Number(deliveryDays),
    }));
  };

  const filtered = catalog.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  if (catalogLoading && catalog.length === 0) {
    return (
      <Box display="flex" justifyContent="center" minHeight={300} alignItems="center">
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search products by name or brand..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#9ca3af" }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Alert severity="info" sx={{ mb: 3, background: "#eff6ff" }}>
        <strong>{filtered.length}</strong> products available to sell.
        Click "Sell This" to add to your store.
      </Alert>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <StorefrontIcon sx={{ fontSize: 64, color: "#e5e7eb", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No products available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? "Try a different search" : "You're already selling all catalog products!"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p._id}>
              <Card sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
              }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={p.images?.[0] || "/placeholder.png"}
                  alt={p.title}
                  sx={{ objectFit: "contain", background: "#f9fafb", p: 1 }}
                />
                <CardContent sx={{ flex: 1, p: 1.5 }}>
                  <Typography fontSize={13} fontWeight={700} noWrap title={p.title}>
                    {p.title}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary" gutterBottom>
                    {p.brand || "No brand"}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Typography fontSize={14} fontWeight={700} color="#059669">
                      ₹{p.minPrice || 0}
                    </Typography>
                    {p.minMrpPrice > p.minPrice && (
                      <Typography fontSize={11} sx={{ textDecoration: "line-through", color: "#9ca3af" }}>
                        ₹{p.minMrpPrice}
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                    <Chip
                      label={`${p.totalSellers || 0} sellers`}
                      size="small"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                    {p.color && (
                      <Chip
                        label={p.color}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 20 }}
                      />
                    )}
                  </Box>
                </CardContent>

                <Box sx={{ p: 1.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<LocalOfferIcon fontSize="small" />}
                    onClick={() => openClaim(p)}
                    sx={{
                      background: "linear-gradient(135deg,#10b981,#059669)",
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": { background: "linear-gradient(135deg,#059669,#047857)" },
                    }}
                  >
                    Sell This
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Claim Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "linear-gradient(135deg,#f0fdf4,#fff)" }}>
          <Box display="flex" gap={2} alignItems="center">
            <img loading="lazy" decoding="async"
              src={selected?.images?.[0]}
              alt=""
              style={{ width: 60, height: 60, objectFit: "contain", background: "#f9fafb", borderRadius: 8 }}
            />
            <Box>
              <Typography fontWeight={800} fontSize={16}>{selected?.title}</Typography>
              <Typography fontSize={12} color="text.secondary">{selected?.brand}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          <Typography fontSize={13} color="text.secondary" mb={2}>
            Set your selling price and stock. You'll be listed alongside {selected?.totalSellers || 0} other sellers.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                fullWidth
                label="MRP Price"
                type="number"
                value={mrpPrice}
                onChange={(e) => setMrpPrice(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Your Selling Price"
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                size="small"
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label="Delivery Days"
                type="number"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
          {Number(mrpPrice) > 0 && Number(sellingPrice) > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Discount: <strong>
                {Math.round(((Number(mrpPrice) - Number(sellingPrice)) / Number(mrpPrice)) * 100)}% OFF
              </strong>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitClaim}
            disabled={!sellingPrice || !mrpPrice}
            sx={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
          >
            Start Selling
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack}
        autoHideDuration={3000}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          🎉 Product added to your store!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar open autoHideDuration={4000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="error" variant="filled">{error}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default CatalogTab;