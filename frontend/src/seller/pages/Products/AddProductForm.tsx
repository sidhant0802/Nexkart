import { useFormik } from "formik";
import {
  TextField, Button, MenuItem, Select, InputLabel, FormControl,
  FormHelperText, Grid, CircularProgress, IconButton, Snackbar, Alert,
  Autocomplete, Box, Avatar,
} from "@mui/material";
import "tailwindcss/tailwind.css";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon             from "@mui/icons-material/Close";
import { mainCategory }              from "../../../data/category/mainCategory";
import { menLevelTwo }               from "../../../data/category/level two/menLevelTwo";
import { womenLevelTwo }             from "../../../data/category/level two/womenLevelTwo";
import { menLevelThree }             from "../../../data/category/level three/menLevelThree";
import { womenLevelThree }           from "../../../data/category/level three/womenLevelThree";
import { electronicsLevelThree }     from "../../../data/category/level three/electronicsLevelThree";
import { electronicsLevelTwo }       from "../../../data/category/level two/electronicsLavelTwo";
import { furnitureLevelTwo }         from "../../../data/category/level two/furnitureLevleTwo";
import { furnitureLevelThree }       from "../../../data/category/level three/furnitureLevelThree";
import { colors } from "../../../data/Filter/color";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { createProduct } from "../../../Redux Toolkit/Seller/sellerProductSlice";
import { uploadToCloudinary } from "../../../util/uploadToCloudnary";
import React, { useState, useEffect } from "react";
import { api } from "../../../Config/Api";

const categoryTwo: { [k: string]: any[] } = {
  men: menLevelTwo, women: womenLevelTwo, kids: [],
  home_furniture: furnitureLevelTwo, beauty: [], electronics: electronicsLevelTwo,
};
const categoryThree: { [k: string]: any[] } = {
  men: menLevelThree, women: womenLevelThree, kids: [],
  home_furniture: furnitureLevelThree, beauty: [], electronics: electronicsLevelThree,
};

interface Brand {
  _id:  string;
  name: string;
  slug: string;
  logo?: string;
}

interface AddProductFormProps {
  initialValues?: any;
  mode?: "add" | "edit";
  onSubmit?: (values: any) => void;
  onClose?: () => void;
}

const defaultInitialValues = {
  title: "", description: "", mrpPrice: "", sellingPrice: "",
  quantity: "50", color: "", images: [], category: "",
  category2: "", category3: "", sizes: "", brand: "",
};

const AddProductForm: React.FC<AddProductFormProps> = ({
  initialValues = defaultInitialValues,
  mode = "add",
  onSubmit,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { sellerProduct } = useAppSelector((s) => s);
  const [uploadImage, setUploadingImage] = useState(false);
  const [snackbarOpen, setOpenSnackbar]   = useState(false);
  const [brands, setBrands]               = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  // ── Fetch brands ──
  useEffect(() => {
    setBrandsLoading(true);
    api.get<Brand[]>("/api/brands")
      .then(r => setBrands(r.data || []))
      .catch(e => console.error("brands fetch:", e))
      .finally(() => setBrandsLoading(false));
  }, []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (onSubmit) {
        onSubmit(values);
      } else {
        dispatch(createProduct({ request: values, jwt: localStorage.getItem("jwt") }));
      }
    },
  });

  const handleImageChange = async (event: any) => {
    const file = event.target.files[0];
    setUploadingImage(true);
    const image = await uploadToCloudinary(file);
    formik.setFieldValue("images", [...formik.values.images, image]);
    setUploadingImage(false);
  };

  const handleRemoveImage = (i: number) => {
    const arr = [...formik.values.images];
    arr.splice(i, 1);
    formik.setFieldValue("images", arr);
  };

  const childCategory = (cat: any, parentId: any) =>
    cat.filter((c: any) => c.parentCategoryId == parentId);

  useEffect(() => {
    if (sellerProduct.productCreated || sellerProduct.error) setOpenSnackbar(true);
  }, [sellerProduct.productCreated, sellerProduct.error]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-4">
        <Grid container spacing={2}>
          {/* ── Images ── */}
          <Grid className="flex flex-wrap gap-5" size={{ xs: 12 }}>
            <input type="file" accept="image/*" id="fileInput"
              style={{ display: "none" }} onChange={handleImageChange} />
            <label className="relative" htmlFor="fileInput">
              <span className="w-24 h-24 cursor-pointer flex items-center justify-center p-3 border-2 border-dashed border-green-300 rounded-md hover:bg-green-50 transition">
                <AddPhotoAlternateIcon className="text-green-600" />
              </span>
              {uploadImage && (
                <div className="absolute inset-0 w-24 h-24 flex justify-center items-center">
                  <CircularProgress sx={{ color: "#10b981" }} />
                </div>
              )}
            </label>

            <div className="flex flex-wrap gap-2">
              {formik.values.images.map((img: any, i: number) => (
                <div className="relative" key={i}>
                  <img loading="lazy" decoding="async" className="w-24 h-24 object-cover rounded" src={img} alt={`P${i}`} />
                  <IconButton size="small" color="error"
                    onClick={() => handleRemoveImage(i)}
                    sx={{ position: "absolute", top: 0, right: 0, background: "#fff" }}>
                    <CloseIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </div>
              ))}
            </div>
          </Grid>

          {/* ── Title ── */}
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth id="title" name="title" label="Product Title *"
              value={formik.values.title} onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)} required />
          </Grid>

          {/* ── Description ── */}
          <Grid size={{ xs: 12 }}>
            <TextField multiline rows={4} fullWidth id="description" name="description"
              label="Description *" value={formik.values.description}
              onChange={formik.handleChange} required
              error={formik.touched.description && Boolean(formik.errors.description)} />
          </Grid>

          {/* ── ✅ NEW: Brand ── */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={brands}
              loading={brandsLoading}
              getOptionLabel={(o) => o.name || ""}
              value={brands.find(b => b.slug === formik.values.brand) || null}
              onChange={(_, val) => formik.setFieldValue("brand", val?.slug || "")}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Avatar src={option.logo} variant="rounded" sx={{ width: 28, height: 28, bgcolor: "#f0fdf4" }}>
                    {option.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <span style={{ fontSize: 13 }}>{option.name}</span>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Brand *"
                  required
                  helperText="Select brand from catalog"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {brandsLoading ? <CircularProgress size={18} sx={{ color: "#10b981" }} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* ── Quantity ── */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth type="number" id="quantity" name="quantity"
              label="Stock Quantity *"
              value={formik.values.quantity}
              onChange={formik.handleChange}
              helperText="How many units do you have?"
              required
            />
          </Grid>

          {/* ── MRP & Selling Price ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <TextField fullWidth id="mrp_price" name="mrpPrice" label="MRP Price ₹ *"
              type="number" value={formik.values.mrpPrice}
              onChange={formik.handleChange}
              error={formik.touched.mrpPrice && Boolean(formik.errors.mrpPrice)} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <TextField fullWidth id="sellingPrice" name="sellingPrice" label="Selling Price ₹ *"
              type="number" value={formik.values.sellingPrice}
              onChange={formik.handleChange}
              error={formik.touched.sellingPrice && Boolean(formik.errors.sellingPrice)} required />
          </Grid>

          {/* ── Discount preview ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Box sx={{
              p: 2, borderRadius: 1, border: "1px solid #d1fae5",
              background: "#f0fdf4", height: "100%",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>
                Discount
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>
                {formik.values.mrpPrice && formik.values.sellingPrice && Number(formik.values.mrpPrice) > 0
                  ? `${Math.round(((Number(formik.values.mrpPrice) - Number(formik.values.sellingPrice)) / Number(formik.values.mrpPrice)) * 100)}% OFF`
                  : "—"}
              </span>
            </Box>
          </Grid>

          {/* ── Color ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <FormControl fullWidth required
              error={formik.touched.color && Boolean(formik.errors.color)}>
              <InputLabel id="color-label">Color</InputLabel>
              <Select labelId="color-label" id="color" name="color"
                value={formik.values.color} onChange={formik.handleChange} label="Color">
                <MenuItem value=""><em>None</em></MenuItem>
                {colors.map((c) => (
                  <MenuItem key={c.name} value={c.name}>
                    <div className="flex gap-3 items-center">
                      <span style={{ backgroundColor: c.hex }}
                        className={`h-5 w-5 rounded-full ${c.name === "White" ? "border" : ""}`} />
                      <p>{c.name}</p>
                    </div>
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.color && formik.errors.color && (
                <FormHelperText>
                  {typeof formik.errors.color === "string" ? formik.errors.color : undefined}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* ── Sizes ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <FormControl fullWidth required>
              <InputLabel id="sizes-label">Sizes</InputLabel>
              <Select labelId="sizes-label" id="sizes" name="sizes"
                value={formik.values.sizes} onChange={formik.handleChange} label="Sizes">
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="FREE">FREE</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="M">M</MenuItem>
                <MenuItem value="L">L</MenuItem>
                <MenuItem value="XL">XL</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* ── Delivery Days ── */}
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <TextField fullWidth type="number" name="deliveryDays"
              label="Delivery Days" defaultValue="5"
              onChange={formik.handleChange}
              helperText="Days to ship after order" />
          </Grid>

          {/* ── Categories ── */}
          {mode === "add" && (
            <>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select labelId="category-label" id="category" name="category"
                    value={formik.values.category} onChange={formik.handleChange} label="Category">
                    {mainCategory.map((c) => (
                      <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel id="category2-label">Sub Category</InputLabel>
                  <Select labelId="category2-label" id="category2" name="category2"
                    value={formik.values.category2} onChange={formik.handleChange} label="Sub Category">
                    {formik.values.category && categoryTwo[formik.values.category]?.map((c) => (
                      <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <FormControl fullWidth required>
                  <InputLabel id="category3-label">Type</InputLabel>
                  <Select labelId="category3-label" id="category3" name="category3"
                    value={formik.values.category3} onChange={formik.handleChange} label="Type">
                    <MenuItem value=""><em>None</em></MenuItem>
                    {formik.values.category2 &&
                      childCategory(categoryThree[formik.values.category], formik.values.category2)
                        ?.map((c: any) => (
                          <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
                        ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* ── Submit ── */}
          <Grid size={12}>
            <Button
              sx={{
                p: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                "&:hover": { background: "linear-gradient(135deg, #059669, #047857)" },
                fontWeight: 700, fontSize: 15,
              }}
              variant="contained" fullWidth type="submit"
              disabled={sellerProduct.loading}
            >
              {sellerProduct.loading
                ? <CircularProgress size={24} sx={{ color: "#fff" }} />
                : mode === "edit" ? "Update Product" : "Create Product"}
            </Button>
          </Grid>
          {onClose && (
            <Grid size={12}>
              <Button onClick={onClose} color="secondary" fullWidth>Cancel</Button>
            </Grid>
          )}
        </Grid>
      </form>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen} autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}>
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={sellerProduct.error ? "error" : "success"}
          variant="filled" sx={{ width: "100%" }}>
          {sellerProduct.error ? sellerProduct.error : "✅ Product created successfully!"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddProductForm;