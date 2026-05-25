import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box, Button, TextField, Typography,
  FormControl, InputLabel, Select, MenuItem,
} from "@mui/material";
import { api } from "../../../../Config/Api";
import { mainCategory } from "../../../../data/category/mainCategory";
import { menLevelTwo }         from "../../../../data/category/level two/menLevelTwo";
import { womenLevelTwo }       from "../../../../data/category/level two/womenLevelTwo";
import { electronicsLevelTwo } from "../../../../data/category/level two/electronicsLavelTwo";
import { furnitureLevelTwo }   from "../../../../data/category/level two/furnitureLevleTwo";
import { menLevelThree }         from "../../../../data/category/level three/menLevelThree";
import { womenLevelThree }       from "../../../../data/category/level three/womenLevelThree";
import { electronicsLevelThree } from "../../../../data/category/level three/electronicsLevelThree";
import { furnitureLevelThree }   from "../../../../data/category/level three/furnitureLevelThree";

const catTwo: Record<string, any[]> = {
  men:            menLevelTwo,
  women:          womenLevelTwo,
  electronics:    electronicsLevelTwo,
  home_furniture: furnitureLevelTwo,
  beauty:         [],
};

const catThree: Record<string, any[]> = {
  men:            menLevelThree,
  women:          womenLevelThree,
  electronics:    electronicsLevelThree,
  home_furniture: furnitureLevelThree,
  beauty:         [],
};

// ── These are the actual DB values ──
const SECTION_OPTIONS = [
  { value: "GRID",                label: "🔥 Trending Now (Grid)"   },
  { value: "SHOP_BY_CATEGORIES",  label: "🛍️ Shop By Category"     },
  { value: "ELECTRIC_CATEGORIES", label: "💡 Electronics Box"       },
  { value: "DEALS",               label: "🏷️ Deal Categories"      },
];

// ── Section label for display ──
const getSectionLabel = (val: string) => {
  const found = SECTION_OPTIONS.find((o) => o.value === val);
  return found?.label || val;
};

interface Props {
  section: string;  // DB section value e.g. "GRID", "DEALS"
  onClose: () => void;
}

const AddHomeCategoryForm = ({ section, onClose }: Props) => {
  const formik = useFormik({
    initialValues: {
      name:      "",
      image:     "",
      category1: "",
      category2: "",
      category3: "",
      section:   section, // ← pre-filled from parent
    },
    validationSchema: Yup.object({
      name:  Yup.string().required("Required"),
image: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      const categoryId = values.category3 || values.category2 || values.category1;

      if (!categoryId) {
        alert("Please select at least one category level");
        return;
      }

      try {
        await api.post("/home/home-category", {
          name:       values.name,
          image:      values.image,
          categoryId: categoryId,
          section:    values.section,  // ← sends "GRID", "DEALS", etc
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
        onClose();
      } catch (err: any) {
        console.error("Failed to add category", err);
        alert(err.response?.data?.message || "Failed to add. Check console.");
      }
    },
  });

  const childCat = (all: any[], parentId: string) =>
    all.filter((c) => c.parentCategoryId === parentId);

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        ➕ Add Category
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Adding to: <strong>{getSectionLabel(section)}</strong>
      </Typography>

      {/* Image preview */}
      {formik.values.image && (
        <Box mb={2}>
          <img loading="lazy" decoding="async"
            src={formik.values.image}
            alt="preview"
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          fullWidth label="Display Name *"
          name="name" value={formik.values.name}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.name && !!formik.errors.name}
          helperText={formik.touched.name && formik.errors.name}
        />

        <TextField
          fullWidth label="Image URL *"
          name="image" value={formik.values.image}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.image && !!formik.errors.image}
          helperText={formik.touched.image && formik.errors.image}
        />

        {/* Section (pre-selected, can change) */}
        <FormControl fullWidth>
          <InputLabel>Section *</InputLabel>
          <Select
            name="section" value={formik.values.section}
            onChange={formik.handleChange} label="Section *"
          >
            {SECTION_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Level 1 */}
        <FormControl fullWidth>
          <InputLabel>Main Category</InputLabel>
          <Select
            name="category1" value={formik.values.category1}
            onChange={(e) => {
              formik.setFieldValue("category1", e.target.value);
              formik.setFieldValue("category2", "");
              formik.setFieldValue("category3", "");
            }}
            label="Main Category"
          >
            {mainCategory.map((c) => (
              <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Level 2 */}
        {formik.values.category1 && catTwo[formik.values.category1]?.length > 0 && (
          <FormControl fullWidth>
            <InputLabel>Sub Category</InputLabel>
            <Select
              name="category2" value={formik.values.category2}
              onChange={(e) => {
                formik.setFieldValue("category2", e.target.value);
                formik.setFieldValue("category3", "");
              }}
              label="Sub Category"
            >
              {catTwo[formik.values.category1].map((c) => (
                <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Category Level 3 */}
        {formik.values.category2 && (
          <FormControl fullWidth>
            <InputLabel>Deep Category</InputLabel>
            <Select
              name="category3" value={formik.values.category3}
              onChange={formik.handleChange}
              label="Deep Category"
            >
              <MenuItem value=""><em>None (use level 2)</em></MenuItem>
              {childCat(
                catThree[formik.values.category1] || [],
                formik.values.category2
              ).map((c) => (
                <MenuItem key={c.categoryId} value={c.categoryId}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Box display="flex" gap={2} mt={1}>
          <Button
            fullWidth variant="contained" type="submit"
            sx={{ py: 1.5, background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
          >
            Add Category
          </Button>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddHomeCategoryForm;