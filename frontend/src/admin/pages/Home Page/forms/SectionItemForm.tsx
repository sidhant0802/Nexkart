import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box, Button, TextField, Typography,
  Switch, FormControlLabel, Alert,
} from "@mui/material";
import { useAppDispatch } from "../../../../Redux Toolkit/Store";
import {
  createSectionItem,
  updateSectionItem,
} from "../../../../Redux Toolkit/Admin/sectionItemSlice";
import type { SectionItem } from "../../../../types/homeDataTypes";

const SECTION_LABELS: Record<string, string> = {
  men:         "👔 Men's Fashion",
  women:       "👗 Women's Fashion",
  electronics: "💻 Electronics",
  fashion:     "✨ Fashion & Lifestyle",
  lightning:   "⚡ Lightning Deals",
};

interface Props {
  item:    SectionItem | null;
  section: "men" | "women" | "electronics" | "fashion" | "lightning";
  onClose: () => void;
  existingSubcategories?: string[];  // passed from parent for autocomplete
}

const schema = Yup.object({
  name:       Yup.string().required("Required"),
  categoryId: Yup.string().required("Required"),
image: Yup.string().required("Required"),
});

const SectionItemForm = ({ item, section, onClose, existingSubcategories = [] }: Props) => {
  const dispatch = useAppDispatch();
  const isEdit   = !!item;

  const formik = useFormik({
    initialValues: {
      name:        item?.name        || "",
      categoryId:  item?.categoryId  || "",
      image:       item?.image       || "",
      discount:    item?.discount    || "",
      subcategory: item?.subcategory || "",
      isActive:    item?.isActive    ?? true,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const payload = { ...values, section };

      if (isEdit && item?._id) {
        dispatch(updateSectionItem({ id: item._id, data: payload }));
      } else {
        dispatch(createSectionItem(payload));
      }
      onClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" fontWeight="bold" mb={0.5}>
        {isEdit ? "✏️ Edit Item" : "➕ Add New Item"}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Section: <strong>{SECTION_LABELS[section]}</strong>
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        {isEdit
          ? "Update this item. Changes reflect on home page instantly."
          : "Add a new item. You can toggle visibility later."
        }
      </Alert>

      {formik.values.image && (
        <Box mb={2} display="flex" gap={2} alignItems="center">
          <img loading="lazy" decoding="async"
            src={formik.values.image}
            alt="preview"
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: "2px solid #e5e7eb" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/80x80/ef4444/white?text=Invalid";
            }}
          />
          <Typography variant="caption" color="text.secondary">Preview</Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth label="Image URL *"
          name="image" value={formik.values.image}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.image && !!formik.errors.image}
          helperText={(formik.touched.image && formik.errors.image) || "Paste an image URL"}
          placeholder="https://images.unsplash.com/photo-..."
        />
        <TextField
          fullWidth label="Display Name *"
          name="name" value={formik.values.name}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.name && !!formik.errors.name}
          helperText={(formik.touched.name && formik.errors.name) || "Name shown below the image"}
          placeholder="e.g. Laptops, T-Shirts"
        />
        <TextField
          fullWidth label="Category ID *"
          name="categoryId" value={formik.values.categoryId}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.categoryId && !!formik.errors.categoryId}
          helperText={(formik.touched.categoryId && formik.errors.categoryId) || "Links to /products/{categoryId}"}
          placeholder="e.g. laptops, men_t_shirts"
        />

        {/* ── Subcategory (grouping) ── */}
        <TextField
          fullWidth label="Subcategory Group"
          name="subcategory" value={formik.values.subcategory}
          onChange={formik.handleChange}
          helperText={
            existingSubcategories.length > 0
              ? `Existing: ${existingSubcategories.join(", ")}`
              : "Group name, e.g. Computing, Topwear, Audio"
          }
          placeholder="e.g. Computing, Audio, Topwear"
        />

        {section === "lightning" && (
          <TextField
            fullWidth label="Discount Badge Text"
            name="discount" value={formik.values.discount}
            onChange={formik.handleChange}
            helperText='e.g. "Up to 40%", "Flat 50% Off"'
            placeholder="Up to 40%"
          />
        )}

        <FormControlLabel
          control={
            <Switch
              checked={formik.values.isActive}
              onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
              color="success"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {formik.values.isActive ? "🟢 Visible on home page" : "⚪ Hidden from home page"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formik.values.isActive ? "Customers can see this" : "Saved but hidden"}
              </Typography>
            </Box>
          }
        />

        <Box display="flex" gap={2} mt={1}>
          <Button fullWidth variant="contained" type="submit"
            sx={{ py: 1.5, background: "linear-gradient(135deg, #6366f1, #a855f7)", fontWeight: "bold" }}>
            {isEdit ? "💾 Update" : "➕ Create"}
          </Button>
          <Button fullWidth variant="outlined" onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SectionItemForm;