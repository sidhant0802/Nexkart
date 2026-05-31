import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  Button, TextField, CircularProgress, Chip, MenuItem,
  Select, FormControl, InputLabel, Tooltip,
} from "@mui/material";
import {
  X, Plus, Trash2, Edit2, Store, TrendingDown,
  Package, Star, Clock,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchProductListingsAdmin,
  fetchAllSellers,
  addSellerToProduct,
  updateListing,
  deleteListing,
} from "../../../Redux Toolkit/Admin/AdminProductSlice";

interface Props {
  product: any;
  open: boolean;
  onClose: () => void;
}

const AdminSellerManager: React.FC<Props> = ({ product, open, onClose }) => {
  const dispatch = useAppDispatch();
  const { listings, listingsLoading, sellers } = useAppSelector(s => s.adminProduct);

  const [showAddForm, setShowAddForm]   = useState(false);
  const [editListing, setEditListing]   = useState<any>(null);
  const [submitting, setSubmitting]     = useState(false);

  // Add seller form state
  const [form, setForm] = useState({
    sellerId: "",
    mrpPrice: "",
    sellingPrice: "",
    quantity: "50",
    deliveryDays: "5",
  });

  useEffect(() => {
    if (open && product?._id) {
      dispatch(fetchProductListingsAdmin(product._id));
      dispatch(fetchAllSellers());
    }
  }, [open, product?._id]);

  const resetForm = () => {
    setForm({ sellerId: "", mrpPrice: "", sellingPrice: "", quantity: "50", deliveryDays: "5" });
    setShowAddForm(false);
    setEditListing(null);
  };

  const handleAddSeller = async () => {
    if (!form.sellerId || !form.mrpPrice || !form.sellingPrice) return;
    setSubmitting(true);
    await dispatch(addSellerToProduct({
      productId: product._id,
      data: {
        sellerId:     form.sellerId,
        mrpPrice:     Number(form.mrpPrice),
        sellingPrice: Number(form.sellingPrice),
        quantity:     Number(form.quantity),
        deliveryDays: Number(form.deliveryDays),
      },
    }));
    resetForm();
    setSubmitting(false);
  };

  const handleUpdateListing = async () => {
    if (!editListing) return;
    setSubmitting(true);
    await dispatch(updateListing({
      listingId: editListing._id,
      data: {
        mrpPrice:     Number(form.mrpPrice),
        sellingPrice: Number(form.sellingPrice),
        quantity:     Number(form.quantity),
        deliveryDays: Number(form.deliveryDays),
        isActive:     editListing.isActive,
      },
    }));
    resetForm();
    setSubmitting(false);
  };

  const handleEditClick = (listing: any) => {
    setEditListing(listing);
    setShowAddForm(true);
    setForm({
      sellerId:     listing.seller?._id || "",
      mrpPrice:     String(listing.mrpPrice),
      sellingPrice: String(listing.sellingPrice),
      quantity:     String(listing.quantity),
      deliveryDays: String(listing.deliveryDays),
    });
  };

  const handleDelete = async (listingId: string) => {
    if (!window.confirm("Remove this seller from this product?")) return;
    await dispatch(deleteListing(listingId));
  };

  const handleToggleActive = async (listing: any) => {
    await dispatch(updateListing({
      listingId: listing._id,
      data: { isActive: !listing.isActive },
    }));
  };

  const discount = (mrp: number, sell: number) =>
    mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;

  // Already-listed seller IDs (to exclude from dropdown)
  const listedSellerIds = listings.map((l: any) => l.seller?._id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Seller Management</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-sm">
              {product?.title}
            </p>
          </div>
          <IconButton onClick={onClose} size="small">
            <X size={18} />
          </IconButton>
        </div>

        {/* Price summary bar */}
        <div className="flex items-center gap-6 px-5 py-3 bg-white border-b text-sm">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-green-600" />
            <span className="text-gray-500">Lowest:</span>
            <span className="font-bold text-green-600">
              ₹{product?.minPrice?.toLocaleString("en-IN") ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={14} className="text-indigo-600" />
            <span className="text-gray-500">Sellers:</span>
            <span className="font-bold text-indigo-600">
              {product?.totalSellers ?? 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Store size={14} className="text-gray-500" />
            <span className="text-gray-500">Total Stock:</span>
            <span className="font-bold">{product?.totalStock ?? 0}</span>
          </div>
        </div>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <div className="p-5 space-y-4">

          {/* ── ADD / EDIT FORM ── */}
          {showAddForm ? (
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
              <h3 className="font-semibold text-indigo-800 text-sm">
                {editListing ? "Edit Seller Listing" : "Add New Seller"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Seller dropdown (only on add) */}
                {!editListing && (
                  <div className="col-span-2">
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Seller</InputLabel>
                      <Select
                        value={form.sellerId}
                        label="Select Seller"
                        onChange={(e) => setForm(f => ({ ...f, sellerId: e.target.value }))}
                        sx={{ borderRadius: "10px", background: "white" }}
                      >
                        {sellers
                          .filter((s: any) => !listedSellerIds.includes(s._id))
                          .map((s: any) => (
                            <MenuItem key={s._id} value={s._id}>
                              <div className="flex items-center gap-2">
                                <Store size={14} className="text-gray-400" />
                                <span>{s.businessDetails?.businessName || s.sellerName}</span>
                              </div>
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </div>
                )}

                {editListing && (
                  <div className="col-span-2 p-2 bg-white rounded-lg text-sm">
                    <span className="text-gray-500">Seller: </span>
                    <span className="font-semibold">
                      {editListing.seller?.businessDetails?.businessName ||
                       editListing.seller?.sellerName}
                    </span>
                  </div>
                )}

                <TextField
                  size="small" label="MRP Price (₹)" type="number"
                  value={form.mrpPrice}
                  onChange={(e) => setForm(f => ({ ...f, mrpPrice: e.target.value }))}
                  InputProps={{ sx: { borderRadius: "10px", background: "white" } }}
                />
                <TextField
                  size="small" label="Selling Price (₹)" type="number"
                  value={form.sellingPrice}
                  onChange={(e) => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
                  InputProps={{ sx: { borderRadius: "10px", background: "white" } }}
                />
                <TextField
                  size="small" label="Stock Quantity" type="number"
                  value={form.quantity}
                  onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                  InputProps={{ sx: { borderRadius: "10px", background: "white" } }}
                />
                <TextField
                  size="small" label="Delivery Days" type="number"
                  value={form.deliveryDays}
                  onChange={(e) => setForm(f => ({ ...f, deliveryDays: e.target.value }))}
                  InputProps={{ sx: { borderRadius: "10px", background: "white" } }}
                />
              </div>

              {/* Discount preview */}
              {form.mrpPrice && form.sellingPrice && (
                <p className="text-xs text-green-700 font-semibold">
                  Discount: {discount(Number(form.mrpPrice), Number(form.sellingPrice))}% off
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="contained"
                  size="small"
                  disabled={submitting}
                  onClick={editListing ? handleUpdateListing : handleAddSeller}
                  sx={{
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {submitting
                    ? <CircularProgress size={14} sx={{ color: "white" }} />
                    : editListing ? "Update Listing" : "Add Seller"}
                </Button>
                <Button
                  variant="outlined" size="small"
                  onClick={resetForm}
                  sx={{ borderRadius: "8px", textTransform: "none" }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
            >
              <Plus size={16} />
              Add Seller to This Product
            </button>
          )}

          {/* ── LISTINGS TABLE ── */}
          {listingsLoading ? (
            <div className="flex justify-center py-8">
              <CircularProgress />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Store size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No sellers yet for this product</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                {listings.length} Seller{listings.length !== 1 ? "s" : ""} · Sorted by price
              </p>

              {listings.map((listing: any, idx: number) => {
                const sName =
                  listing.seller?.businessDetails?.businessName ||
                  listing.seller?.sellerName ||
                  "Unknown Seller";
                const disc = discount(listing.mrpPrice, listing.sellingPrice);

                return (
                  <div
                    key={listing._id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      !listing.isActive
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : idx === 0
                        ? "border-green-200 bg-green-50"
                        : "border-gray-100 bg-white hover:border-indigo-100"
                    }`}
                  >
                    {/* Rank badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      idx === 0
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Seller info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-gray-800 truncate">
                          {sName}
                        </p>
                        {idx === 0 && (
                          <Chip
                            label="Lowest Price"
                            size="small"
                            sx={{
                              fontSize: 9, height: 16,
                              background: "#dcfce7", color: "#16a34a", fontWeight: 700,
                            }}
                          />
                        )}
                        {!listing.isActive && (
                          <Chip label="Inactive" size="small" color="default" sx={{ fontSize: 9, height: 16 }} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-amber-400" />
                          {listing.sellerRating > 0 ? listing.sellerRating.toFixed(1) : "New"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {listing.deliveryDays}d delivery
                        </span>
                        <span>
                          Stock: <b className="text-gray-700">{listing.quantity}</b>
                        </span>
                        <span>
                          Sold: <b className="text-gray-700">{listing.totalSold}</b>
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-base">
                        ₹{listing.sellingPrice.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        ₹{listing.mrpPrice.toLocaleString("en-IN")}
                      </p>
                      {disc > 0 && (
                        <p className="text-xs text-green-600 font-semibold">
                          {disc}% off
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Tooltip title="Edit listing">
                        <button
                          onClick={() => handleEditClick(listing)}
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                      </Tooltip>
                      <Tooltip title={listing.isActive ? "Deactivate" : "Activate"}>
                        <button
                          onClick={() => handleToggleActive(listing)}
                          className={`p-1.5 rounded-lg transition-colors text-xs font-bold ${
                            listing.isActive
                              ? "bg-orange-50 text-orange-500 hover:bg-orange-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {listing.isActive ? "OFF" : "ON"}
                        </button>
                      </Tooltip>
                      <Tooltip title="Remove seller">
                        <button
                          onClick={() => handleDelete(listing._id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSellerManager;