import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Switch, Tooltip, CircularProgress,
  Box, Typography, Avatar, Button, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Snackbar, Tabs, Tab,
} from "@mui/material";
import DeleteIcon         from "@mui/icons-material/Delete";
import EditIcon           from "@mui/icons-material/Edit";
import StorefrontIcon     from "@mui/icons-material/Storefront";
import SaveIcon           from "@mui/icons-material/Save";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon          from "@mui/icons-material/Close";
import StarIcon           from "@mui/icons-material/Star";
import ArrowUpwardIcon    from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon  from "@mui/icons-material/ArrowDownward";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchSellerProducts, deleteListing, updateListing,
  type SellerListing,
} from "../../../Redux Toolkit/Seller/sellerProductSlice";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";

const MyListingsTab = () => {
  const dispatch = useAppDispatch();
  const { listings, loading, error } = useAppSelector((s) => s.sellerProduct);
  const jwt = localStorage.getItem("jwt") || "";

  const [editing, setEditing]   = useState<SellerListing | null>(null);
  const [editTab, setEditTab]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    sellingPrice: "", mrpPrice: "", quantity: "", deliveryDays: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [snack, setSnack] = useState<{open: boolean, msg: string, sev: "success" | "error"}>({
    open: false, msg: "", sev: "success"
  });

  useEffect(() => {
    dispatch(fetchSellerProducts(jwt));
  }, [dispatch]);

  const openEdit = (l: SellerListing) => {
    setEditing(l);
    setEditTab(0);
    setForm({
      sellingPrice: String(l.sellingPrice),
      mrpPrice:     String(l.mrpPrice),
      quantity:     String(l.quantity),
      deliveryDays: String(l.deliveryDays || 5),
    });
    setImages(l.product?.images || []);
  };

  const handleSave = async () => {
    if (!editing) return;
    const result: any = await dispatch(updateListing({
      listingId: editing._id,
      data: {
        sellingPrice: Number(form.sellingPrice),
        mrpPrice:     Number(form.mrpPrice),
        quantity:     Number(form.quantity),
        deliveryDays: Number(form.deliveryDays),
        images:       images,
      } as any,
    }));
    if (result.meta.requestStatus === "fulfilled") {
      setSnack({ open: true, msg: "✅ Listing updated successfully!", sev: "success" });
      setEditing(null);
      dispatch(fetchSellerProducts(jwt));
    } else {
      setSnack({ open: true, msg: "❌ Failed to update listing", sev: "error" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImages([...images, url]);
      setSnack({ open: true, msg: "📸 Image uploaded!", sev: "success" });
    } catch (err) {
      setSnack({ open: true, msg: "❌ Upload failed", sev: "error" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    if (images.length === 1) {
      setSnack({ open: true, msg: "⚠️ At least 1 image required", sev: "error" });
      return;
    }
    setImages(images.filter((_, i) => i !== idx));
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const newImages = [...images];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    [newImages[idx], newImages[newIdx]] = [newImages[newIdx], newImages[idx]];
    setImages(newImages);
  };

  const setAsPrimary = (idx: number) => {
    if (idx === 0) return;
    const newImages = [...images];
    const [primary] = newImages.splice(idx, 1);
    newImages.unshift(primary);
    setImages(newImages);
  };

  const handleStopSelling = (listing: SellerListing) => {
    if (window.confirm(`Stop selling "${listing.product?.title}"?`)) {
      dispatch(deleteListing(listing._id)).then(() => {
        setSnack({ open: true, msg: "🗑️ Listing removed", sev: "success" });
      });
    }
  };

  const handleToggle = (listing: SellerListing) => {
    dispatch(updateListing({
      listingId: listing._id,
      data: { isActive: !listing.isActive },
    }));
  };

  if (loading && listings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress sx={{ color: "#10b981" }} />
      </Box>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  if (listings.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <StorefrontIcon sx={{ fontSize: 64, color: "#d1fae5", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          You're not selling any products yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Browse the Marketplace to start selling from our verified catalog
        </Typography>
        <Button
          variant="contained"
          href="/seller/marketplace"
          sx={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
        >
          Go to Marketplace
        </Button>
      </Box>
    );
  }

  const discountPreview = form.mrpPrice && form.sellingPrice && Number(form.mrpPrice) > 0
    ? Math.round(((Number(form.mrpPrice) - Number(form.sellingPrice)) / Number(form.mrpPrice)) * 100)
    : 0;

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f0fdf4" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f0fdf4" }}>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>MRP</strong></TableCell>
              <TableCell><strong>Your Price</strong></TableCell>
              <TableCell><strong>Discount</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Sold</strong></TableCell>
              <TableCell><strong>Active</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listings.map((l) => {
              const p = l.product;
              if (!p) return null;
              return (
                <TableRow key={l._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar src={p.images?.[0]} variant="rounded" sx={{ width: 48, height: 48 }}>
                        {p.title?.[0]}
                      </Avatar>
                      <Box>
                        <Typography fontSize={13} fontWeight={600} noWrap maxWidth={200}>
                          {p.title}
                        </Typography>
                        <Typography fontSize={11} color="text.secondary">
                          {p.brand || "—"} • {p.color}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={11} color="text.secondary">
                      {(p.category as any)?.name || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={13} sx={{ textDecoration: "line-through", color: "#9ca3af" }}>
                      ₹{l.mrpPrice}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={14} fontWeight={700} color="#059669">
                      ₹{l.sellingPrice}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${l.discountPercent}% OFF`}
                      size="small"
                      sx={{ background: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: 11 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={l.quantity === 0 ? "Out" : l.quantity}
                      size="small"
                      color={l.quantity === 0 ? "error" : l.quantity < 10 ? "warning" : "success"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontSize={12} fontWeight={600}>
                      {l.totalSold || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={l.isActive}
                      onChange={() => handleToggle(l)}
                      size="small"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#10b981" },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="Edit price, stock & images">
                        <IconButton
                          size="small"
                          onClick={() => openEdit(l)}
                          sx={{
                            color: "#fff",
                            background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                            "&:hover": { background: "linear-gradient(135deg,#2563eb,#1e40af)" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Stop selling">
                        <IconButton
                          size="small"
                          onClick={() => handleStopSelling(l)}
                          sx={{
                            color: "#fff",
                            background: "linear-gradient(135deg,#ef4444,#dc2626)",
                            "&:hover": { background: "linear-gradient(135deg,#dc2626,#b91c1c)" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─────────────────────── EDIT DIALOG ─────────────────────── */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          background: "linear-gradient(135deg,#f0fdf4,#fff)",
          borderBottom: "1px solid #d1fae5",
        }}>
          <Box display="flex" gap={2} alignItems="center">
            <Avatar
              src={editing?.product?.images?.[0]}
              variant="rounded"
              sx={{ width: 56, height: 56 }}
            >
              {editing?.product?.title?.[0]}
            </Avatar>
            <Box flex={1}>
              <Typography fontWeight={800} fontSize={16}>
                {editing?.product?.title}
              </Typography>
              <Typography fontSize={12} color="text.secondary">
                {editing?.product?.brand || "—"} • {editing?.product?.color}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Tabs
          value={editTab}
          onChange={(_, v) => setEditTab(v)}
          sx={{
            borderBottom: "1px solid #e5e7eb",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13 },
            "& .Mui-selected": { color: "#059669 !important" },
            "& .MuiTabs-indicator": { background: "#10b981" },
          }}
        >
          <Tab label="💰 Pricing & Stock" />
          <Tab label={`🖼️  Images (${images.length})`} />
        </Tabs>

        <DialogContent sx={{ pt: "20px !important", minHeight: 400 }}>

          {/* ── Tab 1: Pricing ── */}
          {editTab === 0 && (
            <Box>
              <Typography fontSize={13} color="text.secondary" mb={2}>
                Update your selling price, MRP, stock quantity, and delivery time.
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="MRP Price (₹)"
                    type="number"
                    value={form.mrpPrice}
                    onChange={(e) => setForm({ ...form, mrpPrice: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Your Selling Price (₹)"
                    type="number"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    size="small"
                    required
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Delivery Days"
                    type="number"
                    value={form.deliveryDays}
                    onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
                    size="small"
                  />
                </Grid>
              </Grid>

              {discountPreview > 0 && (
                <Alert severity={discountPreview >= 20 ? "success" : "info"} sx={{ mt: 2 }} icon={false}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>Discount applied:</span>
                    <strong style={{ fontSize: 18 }}>{discountPreview}% OFF</strong>
                  </Box>
                </Alert>
              )}

              {Number(form.sellingPrice) > Number(form.mrpPrice) && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ⚠️ Selling price is higher than MRP — discount will be 0%
                </Alert>
              )}

              {Number(form.quantity) === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  ⚠️ Setting stock to 0 — product will show as "Out of Stock"
                </Alert>
              )}
            </Box>
          )}

          {/* ── Tab 2: Images ── */}
          {editTab === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                🌟 <strong>First image is the primary display.</strong> Customers see this first.
                Changes apply to all sellers of this product.
              </Alert>

              {/* Upload button */}
              <Box mb={3}>
                <input
                  type="file"
                  accept="image/*"
                  id="img-upload"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <label htmlFor="img-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={uploading ? <CircularProgress size={16} /> : <AddPhotoAlternateIcon />}
                    disabled={uploading}
                    sx={{
                      borderColor: "#10b981",
                      color: "#10b981",
                      "&:hover": { borderColor: "#059669", background: "#f0fdf4" },
                    }}
                  >
                    {uploading ? "Uploading..." : "Add Image"}
                  </Button>
                </label>
              </Box>

              {/* Image grid */}
              {images.length === 0 ? (
                <Box textAlign="center" py={6} sx={{ background: "#f9fafb", borderRadius: 2 }}>
                  <AddPhotoAlternateIcon sx={{ fontSize: 64, color: "#d1d5db" }} />
                  <Typography color="text.secondary" mt={1}>No images yet</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {images.map((img, idx) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={idx}>
                      <Box sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: idx === 0 ? "3px solid #10b981" : "2px solid #e5e7eb",
                        background: "#f9fafb",
                        transition: "all 0.2s",
                        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                      }}>
                        {/* Primary badge */}
                        {idx === 0 && (
                          <Box sx={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            background: "linear-gradient(135deg,#10b981,#059669)",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 800,
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.3,
                            zIndex: 2,
                            boxShadow: "0 2px 6px rgba(16,185,129,0.4)",
                          }}>
                            <StarIcon sx={{ fontSize: 12 }} />
                            PRIMARY
                          </Box>
                        )}

                        <img loading="lazy" decoding="async"
                          src={img}
                          alt={`P${idx}`}
                          style={{
                            width: "100%",
                            height: 140,
                            objectFit: "contain",
                            display: "block",
                            background: "#fff",
                          }}
                        />

                        {/* Action buttons */}
                        <Box sx={{
                          display: "flex",
                          gap: 0.5,
                          p: 0.5,
                          background: "#fff",
                          borderTop: "1px solid #f0fdf4",
                        }}>
                          {idx !== 0 && (
                            <Tooltip title="Set as primary">
                              <IconButton size="small" onClick={() => setAsPrimary(idx)} sx={{ color: "#f59e0b" }}>
                                <StarIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {idx > 0 && (
                            <Tooltip title="Move up">
                              <IconButton size="small" onClick={() => moveImage(idx, -1)}>
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {idx < images.length - 1 && (
                            <Tooltip title="Move down">
                              <IconButton size="small" onClick={() => moveImage(idx, 1)}>
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Box flex={1} />
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => removeImage(idx)} sx={{ color: "#ef4444" }}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: "1px solid #f0fdf4" }}>
          <Button onClick={() => setEditing(null)} sx={{ color: "#6b7280" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!form.sellingPrice || !form.mrpPrice || images.length === 0}
            sx={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              "&:hover": { background: "linear-gradient(135deg,#059669,#047857)" },
              fontWeight: 700,
            }}
          >
            Save All Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyListingsTab;