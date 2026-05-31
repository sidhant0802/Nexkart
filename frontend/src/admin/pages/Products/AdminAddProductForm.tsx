import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  TextField, Button, MenuItem, Select, InputLabel,
  FormControl, Grid, CircularProgress, IconButton,
  Tabs, Tab, Box
} from "@mui/material";
import { ImagePlus, X, Link as LinkIcon, Upload, Plus, Tag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  createAdminProduct, updateAdminProduct
} from "../../../Redux Toolkit/Admin/AdminProductSlice";
import { fetchBrands } from "../../../Redux Toolkit/Admin/BrandSlice";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";
import { mainCategory } from "../../../data/category/mainCategory";
import { electronicsLevelTwo } from "../../../data/category/level two/electronicsLavelTwo";
import { menLevelTwo } from "../../../data/category/level two/menLevelTwo";
import { womenLevelTwo } from "../../../data/category/level two/womenLevelTwo";
import { electronicsLevelThree } from "../../../data/category/level three/electronicsLevelThree";
import { menLevelThree } from "../../../data/category/level three/menLevelThree";
import { womenLevelThree } from "../../../data/category/level three/womenLevelThree";
import { colors } from "../../../data/Filter/color";

const catTwoMap: Record<string, any[]> = {
  electronics: electronicsLevelTwo,
  men:         menLevelTwo,
  women:       womenLevelTwo,
  home_furniture: [],
};
const catThreeMap: Record<string, any[]> = {
  electronics: electronicsLevelThree,
  men:         menLevelThree,
  women:       womenLevelThree,
  home_furniture: [],
};

interface Props {
  editProduct?: any;
  onClose: () => void;
}

const AdminAddProductForm: React.FC<Props> = ({ editProduct, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(s => s.adminProduct);
  const { brands }  = useAppSelector(s => s.brand);

  const [uploading, setUploading]   = useState(false);
  const [imageMode, setImageMode]   = useState<"upload" | "url">("url");
  const [imageUrl, setImageUrl]     = useState("");

  // Fetch brands on mount
  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: editProduct ? {
      title:        editProduct.title || "",
      description:  editProduct.description || "",
      mrpPrice:     editProduct.mrpPrice || "",
      sellingPrice: editProduct.sellingPrice || "",
      quantity:     editProduct.quantity || 10,
      color:        editProduct.color || "",
      brand:        editProduct.brand || "",
      sizes:        editProduct.sizes || "",
      images:       editProduct.images || [],
      category:     "",
      category2:    "",
      category3:    "",
    } : {
      title: "", description: "", mrpPrice: "", sellingPrice: "",
      quantity: 10, color: "", brand: "", sizes: "", images: [],
      category: "", category2: "", category3: "",
    },
    onSubmit: async (values) => {
      const cat1 = mainCategory.find(c => c.categoryId === values.category);
      const cat2 = catTwoMap[values.category]?.find(c => c.categoryId === values.category2);
      const cat3 = catThreeMap[values.category]?.find(
        (c: any) => c.categoryId === values.category3 && c.parentCategoryId === values.category2
      );

      const payload = {
        ...values,
        categoryName:  cat1?.name,
        category2Name: cat2?.name,
        category3Name: cat3?.name,
      };

      if (editProduct) {
        await dispatch(updateAdminProduct({ id: editProduct._id, data: payload }));
      } else {
        await dispatch(createAdminProduct(payload));
      }
      onClose();
    },
  });

  // ── Image Upload via File ──
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToCloudinary(file);
    formik.setFieldValue("images", [...formik.values.images, url]);
    setUploading(false);
  };

  // ── Image via URL ──
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    formik.setFieldValue("images", [...formik.values.images, imageUrl.trim()]);
    setImageUrl("");
  };

  const removeImage = (i: number) => {
    const updated = [...formik.values.images];
    updated.splice(i, 1);
    formik.setFieldValue("images", updated);
  };

  const childCats = (cats: any[], parentId: string) =>
    cats?.filter((c: any) => c.parentCategoryId === parentId) || [];

  // Filter brands by selected category
  const filteredBrands = brands.filter(b =>
    b.isActive !== false &&
    (!formik.values.category || !b.category || b.category === formik.values.category)
  );

  return (
    <form onSubmit={formik.handleSubmit} className="p-5">
      <Grid container spacing={2}>

        {/* ═══════════ IMAGE SECTION ═══════════ */}
        <Grid size={12}>
          <p className="text-sm font-semibold text-gray-700 mb-2">Product Images</p>

          {/* Toggle Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={imageMode}
              onChange={(_, v) => setImageMode(v)}
              sx={{ minHeight: 36 }}
            >
              <Tab
                icon={<LinkIcon size={14} />}
                iconPosition="start"
                label="Image URL"
                value="url"
                sx={{ minHeight: 36, textTransform: 'none', fontSize: 13 }}
              />
              <Tab
                icon={<Upload size={14} />}
                iconPosition="start"
                label="Upload File"
                value="upload"
                sx={{ minHeight: 36, textTransform: 'none', fontSize: 13 }}
              />
            </Tabs>
          </Box>

          {/* URL Mode */}
          {imageMode === "url" && (
            <div className="flex gap-2 mb-3">
              <TextField
                fullWidth size="small"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImageUrl();
                  }
                }}
                InputProps={{
                  sx: { borderRadius: '10px' },
                  startAdornment: <LinkIcon size={14} className="text-gray-400 mr-2" />
                }}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          )}

          {/* Upload Mode */}
          {imageMode === "upload" && (
            <div className="mb-3">
              <input
                type="file" accept="image/*" id="imgInput"
                style={{ display: "none" }} onChange={handleFileUpload}
              />
              <label htmlFor="imgInput"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                {uploading ? <CircularProgress size={16} /> : (
                  <>
                    <ImagePlus size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Image Preview Grid */}
          <div className="flex flex-wrap gap-2">
            {formik.values.images.map((img: string, i: number) => (
              <div key={i} className="relative w-20 h-20 group">
                <img loading="lazy" decoding="async"
                  src={img}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/80x80/eee/999?text=⚠";
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[9px] font-bold text-center py-0.5 rounded-b-lg">
                    MAIN
                  </span>
                )}
              </div>
            ))}
            {formik.values.images.length === 0 && (
              <p className="text-xs text-gray-400 italic">No images added yet</p>
            )}
          </div>
        </Grid>

        {/* ═══════════ TITLE ═══════════ */}
        <Grid size={12}>
          <TextField
            fullWidth required name="title" label="Product Title"
            value={formik.values.title} onChange={formik.handleChange}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>

        {/* ═══════════ DESCRIPTION ═══════════ */}
        <Grid size={12}>
          <TextField
            fullWidth multiline rows={3} required
            name="description" label="Description"
            value={formik.values.description} onChange={formik.handleChange}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>

        {/* ═══════════ PRICE ═══════════ */}
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth required type="number" name="mrpPrice" label="MRP (₹)"
            value={formik.values.mrpPrice} onChange={formik.handleChange}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth required type="number" name="sellingPrice" label="Selling Price (₹)"
            value={formik.values.sellingPrice} onChange={formik.handleChange}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            fullWidth type="number" name="quantity" label="Stock Quantity"
            value={formik.values.quantity} onChange={formik.handleChange}
            InputProps={{ sx: { borderRadius: '10px' } }}
          />
        </Grid>

        {/* ═══════════ COLOR ═══════════ */}
        <Grid size={{ xs: 6, md: 3 }}>
          <FormControl fullWidth required>
            <InputLabel>Color</InputLabel>
            <Select
              name="color" label="Color"
              value={formik.values.color} onChange={formik.handleChange}
              sx={{ borderRadius: '10px' }}
            >
              {colors.map((c: any) => (
                <MenuItem key={c.name} value={c.name}>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border" style={{ background: c.hex }} />
                    {c.name}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* ═══════════ BRAND (NEW!) ═══════════ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Brand</InputLabel>
            <Select
              name="brand" label="Brand"
              value={formik.values.brand} onChange={formik.handleChange}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="">
                <em>None / No Brand</em>
              </MenuItem>
              {filteredBrands.map((b: any) => (
                <MenuItem key={b._id} value={b.name}>
                  <div className="flex items-center gap-2">
                    {b.logo && (
                      <img loading="lazy" decoding="async" src={b.logo} alt={b.name}
                        className="w-5 h-5 object-cover rounded"
                        onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                      />
                    )}
                    <span className="font-medium">{b.name}</span>
                    {b.featured && (
                      <span className="ml-auto text-amber-500 text-xs">⭐</span>
                    )}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Tag size={11} />
            {filteredBrands.length} brands available
            {formik.values.category && ` in ${formik.values.category}`}
          </p>
        </Grid>

        {/* ═══════════ SIZES ═══════════ */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth required>
            <InputLabel>Size</InputLabel>
            <Select
              name="sizes" label="Size"
              value={formik.values.sizes} onChange={formik.handleChange}
              sx={{ borderRadius: '10px' }}
            >
              <MenuItem value="FREE">FREE / One Size</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="XL">XL</MenuItem>
              <MenuItem value="XXL">XXL</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* ═══════════ CATEGORY (Only on Add) ═══════════ */}
        {!editProduct && <>
          <Grid size={12}>
            <div className="border-t pt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={14} className="text-indigo-600" />
                Category Hierarchy
              </p>
            </div>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth required>
              <InputLabel>Main Category</InputLabel>
              <Select
                name="category" label="Main Category"
                value={formik.values.category} onChange={formik.handleChange}
                sx={{ borderRadius: '10px' }}
              >
                {mainCategory.map(c => (
                  <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth required>
              <InputLabel>Sub Category</InputLabel>
              <Select
                name="category2" label="Sub Category"
                value={formik.values.category2} onChange={formik.handleChange}
                sx={{ borderRadius: '10px' }}
                disabled={!formik.values.category}
              >
                {catTwoMap[formik.values.category]?.map((c: any) => (
                  <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth required>
              <InputLabel>Sub-Sub Category</InputLabel>
              <Select
                name="category3" label="Sub-Sub Category"
                value={formik.values.category3} onChange={formik.handleChange}
                sx={{ borderRadius: '10px' }}
                disabled={!formik.values.category2}
              >
                {childCats(catThreeMap[formik.values.category], formik.values.category2)
                  .map((c: any) => (
                    <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        </>}

        {/* ═══════════ SUBMIT ═══════════ */}
        <Grid size={12}>
          <Button
            type="submit" variant="contained" fullWidth
            disabled={loading || uploading || formik.values.images.length === 0}
            sx={{
              py: 1.5, borderRadius: "12px", fontWeight: 700, fontSize: 15,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
              '&:hover': { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
            }}
          >
            {loading
              ? <CircularProgress size={22} sx={{ color: "white" }} />
              : (editProduct ? "✓ Update Product" : "+ Create Product")}
          </Button>
          {formik.values.images.length === 0 && (
            <p className="text-xs text-red-500 mt-2 text-center">
              ⚠️ Please add at least one product image
            </p>
          )}
        </Grid>
      </Grid>
    </form>
  );
};

export default AdminAddProductForm;