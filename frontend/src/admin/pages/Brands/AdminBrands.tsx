import React, { useEffect, useState } from "react";
import {
  Plus, Search, Edit2, Trash2, Star, X,
  BadgeCheck, Image as ImageIcon, Tag, Filter
} from "lucide-react";
import {
  Dialog, IconButton, CircularProgress, Switch,
  TextField, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { useFormik } from "formik";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchBrands, createBrand, updateBrand,
  deleteBrand, toggleBrandFeatured, resetBrandFlags,
  type Brand
} from "../../../Redux Toolkit/Admin/BrandSlice";
import { mainCategory } from "../../../data/category/mainCategory";

const AdminBrands: React.FC = () => {
  const dispatch = useAppDispatch();
  const { brands, loading, created, updated, deleted } = useAppSelector(s => s.brand);

  const [filterCategory, setFilterCategory] = useState<string>("");
  const [search, setSearch]                 = useState("");
  const [openForm, setOpenForm]             = useState(false);
  const [editBrand, setEditBrand]           = useState<Brand | null>(null);
  const [snackbar, setSnackbar]             = useState({ open: false, msg: "", type: "success" as "success" | "error" });

  // Fetch brands
  useEffect(() => {
    dispatch(fetchBrands(filterCategory ? { category: filterCategory } : undefined));
  }, [filterCategory]);

  // Snackbar feedback
  useEffect(() => {
    if (created) setSnackbar({ open: true, msg: "✅ Brand created", type: "success" });
    if (updated) setSnackbar({ open: true, msg: "✅ Brand updated", type: "success" });
    if (deleted) setSnackbar({ open: true, msg: "🗑️ Brand deleted", type: "success" });
    if (created || updated || deleted) {
      setTimeout(() => dispatch(resetBrandFlags()), 100);
      setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3000);
    }
  }, [created, updated, deleted]);

  const handleEdit = (brand: Brand) => {
    setEditBrand(brand);
    setOpenForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this brand permanently?")) {
      dispatch(deleteBrand(id));
    }
  };

  const handleToggleFeatured = (id: string) => {
    dispatch(toggleBrandFeatured(id));
  };

  const handleClose = () => {
    setOpenForm(false);
    setEditBrand(null);
  };

  const filtered = brands.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* ═══════════ HEADER ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BadgeCheck className="text-indigo-600" size={22} />
              Brand Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage brands · {filtered.length} total
              {filterCategory && ` · ${mainCategory.find(c => c.categoryId === filterCategory)?.name}`}
            </p>
          </div>

          <button
            onClick={() => setOpenForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <Plus size={16} />
            Add Brand
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '12px', backgroundColor: '#f9fafb' }}
            >
              <MenuItem value="">
                <div className="flex items-center gap-2">
                  <Filter size={14} /> All Categories
                </div>
              </MenuItem>
              {mainCategory.map(c => (
                <MenuItem key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* ═══════════ BRAND GRID ═══════════ */}
      {loading ? (
        <div className="flex justify-center py-20">
          <CircularProgress />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <BadgeCheck size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No brands found</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Add Brand" to create your first brand
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(brand => (
            <div
              key={brand._id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Logo */}
              <div className="relative h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
                {brand.logo ? (
                  <img loading="lazy" decoding="async"
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/120x80/6366f1/white?text=${brand.name.charAt(0)}`;
                    }}
                  />
                ) : (
                  <div className="text-4xl font-black text-gray-300">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Featured Star */}
                {brand.featured && (
                  <div className="absolute top-2 right-2 bg-amber-400 text-white rounded-full p-1.5 shadow-md">
                    <Star size={12} fill="white" />
                  </div>
                )}

                {/* Category badge */}
                {brand.category && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur text-xs font-semibold text-gray-700 rounded-md">
                    {mainCategory.find(c => c.categoryId === brand.category)?.name || brand.category}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate mb-1">
                  {brand.name}
                </h3>
                {brand.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                    {brand.description}
                  </p>
                )}

                {/* Featured Toggle */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Star size={12} className={brand.featured ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
                    Featured
                  </span>
                  <Switch
                    size="small"
                    checked={!!brand.featured}
                    onChange={() => brand._id && handleToggleFeatured(brand._id)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => brand._id && handleDelete(brand._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ FORM DIALOG ═══════════ */}
      <Dialog
        open={openForm}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <BrandForm
          editBrand={editBrand}
          onClose={handleClose}
        />
      </Dialog>

      {/* ═══════════ SNACKBAR ═══════════ */}
      {snackbar.open && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl z-50 ${
          snackbar.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white font-medium text-sm`}>
          {snackbar.msg}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════
// BRAND FORM COMPONENT (inline)
// ════════════════════════════════════════════════════════

interface FormProps {
  editBrand: Brand | null;
  onClose: () => void;
}

const BrandForm: React.FC<FormProps> = ({ editBrand, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(s => s.brand);

  const formik = useFormik({
    initialValues: editBrand ? {
      name:        editBrand.name || "",
      logo:        editBrand.logo || "",
      description: editBrand.description || "",
      category:    editBrand.category || "",
      featured:    editBrand.featured || false,
    } : {
      name: "", logo: "", description: "", category: "", featured: false,
    },
    onSubmit: async (values) => {
      if (editBrand && editBrand._id) {
        await dispatch(updateBrand({ id: editBrand._id, data: values }));
      } else {
        await dispatch(createBrand(values as Brand));
      }
      onClose();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <BadgeCheck className="text-indigo-600" size={20} />
          {editBrand ? "Edit Brand" : "Add New Brand"}
        </h2>
        <IconButton onClick={onClose} size="small">
          <X size={18} />
        </IconButton>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">

        {/* Logo Preview */}
        {formik.values.logo && (
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-gray-50 rounded-xl border-2 border-gray-100 flex items-center justify-center p-3 overflow-hidden">
              <img loading="lazy" decoding="async"
                src={formik.values.logo}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Name */}
        <TextField
          fullWidth required
          name="name"
          label="Brand Name"
          placeholder="e.g. Apple, Nike, Samsung"
          value={formik.values.name}
          onChange={formik.handleChange}
          InputProps={{ sx: { borderRadius: '10px' } }}
        />

        {/* Logo URL */}
        <TextField
          fullWidth
          name="logo"
          label="Logo URL"
          placeholder="https://logo.clearbit.com/apple.com"
          value={formik.values.logo}
          onChange={formik.handleChange}
          InputProps={{
            sx: { borderRadius: '10px' },
            startAdornment: <ImageIcon size={16} className="text-gray-400 mr-2" />
          }}
          helperText={
            <span className="text-xs">
              💡 Tip: Use <span className="text-indigo-600 font-mono">https://logo.clearbit.com/[domain]</span>
            </span>
          }
        />

        {/* Category */}
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            label="Category"
            value={formik.values.category}
            onChange={formik.handleChange}
            sx={{ borderRadius: '10px' }}
          >
            <MenuItem value=""><em>None (All Categories)</em></MenuItem>
            {mainCategory.map(c => (
              <MenuItem key={c.categoryId} value={c.categoryId}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Description */}
        <TextField
          fullWidth multiline rows={2}
          name="description"
          label="Description (optional)"
          placeholder="Premium electronics brand..."
          value={formik.values.description}
          onChange={formik.handleChange}
          InputProps={{ sx: { borderRadius: '10px' } }}
        />

        {/* Featured Toggle */}
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Featured Brand</p>
              <p className="text-xs text-gray-500">Show in homepage Top Brands section</p>
            </div>
          </div>
          <Switch
            checked={formik.values.featured}
            onChange={(e) => formik.setFieldValue("featured", e.target.checked)}
          />
        </div>

      </div>

      {/* Footer */}
      <div className="flex gap-3 p-5 border-t bg-gray-50">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: 'white' }} />
          ) : editBrand ? "Update Brand" : "Create Brand"}
        </button>
      </div>
    </form>
  );
};

export default AdminBrands;