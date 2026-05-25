import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box, Button, TextField, Typography,
  Switch, FormControlLabel, Divider,
} from "@mui/material";
import { useAppDispatch } from "../../../../Redux Toolkit/Store";
import { createBanner, updateBanner } from "../../../../Redux Toolkit/Admin/bannerSlice";
import type { Banner } from "../../../../types/homeDataTypes";
import ImageUpload from "../../../../admin/components/ImageUpload";  // ✅ NEW

interface Props {
  banner:  Banner | null;
  onClose: () => void;
}

const schema = Yup.object({
  title:      Yup.string().required("Required"),
  highlight:  Yup.string().required("Required"),
  subtitle:   Yup.string().required("Required"),
  image:      Yup.string().required("Required"),   // ✅ no .url()
  cta:        Yup.string().required("Required"),
  ctaLink:    Yup.string().required("Required"),
  secondCta:  Yup.string().required("Required"),
  secondLink: Yup.string().required("Required"),
  badge:      Yup.string(),
  accent:     Yup.string(),
});

const BannerForm = ({ banner, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const isEdit   = !!banner;

  const formik = useFormik({
    initialValues: {
      title:      banner?.title      || "",
      highlight:  banner?.highlight  || "",
      subtitle:   banner?.subtitle   || "",
      badge:      banner?.badge      || "",
      image:      banner?.image      || "",
      accent:     banner?.accent     || "#6366f1",
      cta:        banner?.cta        || "Shop Now",
      ctaLink:    banner?.ctaLink    || "/",
      secondCta:  banner?.secondCta  || "View All",
      secondLink: banner?.secondLink || "/",
      isActive:   banner?.isActive   ?? true,
      stats: banner?.stats
        ? banner.stats.map((s) => `${s.val}:${s.label}`).join(",")
        : "50K+:Products,2K+:Vendors,70%:Max Off",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const stats = values.stats
        .split(",")
        .filter(Boolean)
        .map((s) => {
          const [val, label] = s.split(":");
          return { val: val?.trim() || "", label: label?.trim() || "" };
        });

      const payload = { ...values, stats };

      if (isEdit && banner?._id) {
        dispatch(updateBanner({ id: banner._id, data: payload }));
      } else {
        dispatch(createBanner(payload));
      }
      onClose();
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        {isEdit ? "✏️ Edit Banner" : "➕ Add Banner"}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        {/* ✅ NEW — Image Upload (URL + Device) */}
        <ImageUpload
          value={formik.values.image}
          onChange={(val) => formik.setFieldValue("image", val)}
          label="Banner Image *"
          height={160}
        />
        {/* Show validation error for image */}
        {formik.touched.image && formik.errors.image && (
          <Typography variant="caption" color="error" sx={{ mt: -1 }}>
            {formik.errors.image}
          </Typography>
        )}

        {/* Title + Highlight */}
        <Box display="flex" gap={2}>
          <TextField
            fullWidth label="Title *"
            name="title" value={formik.values.title}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.title && !!formik.errors.title}
            helperText={formik.touched.title && formik.errors.title}
          />
          <TextField
            fullWidth label="Highlight (colored text) *"
            name="highlight" value={formik.values.highlight}
            onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.highlight && !!formik.errors.highlight}
            helperText={formik.touched.highlight && formik.errors.highlight}
          />
        </Box>

        {/* Subtitle */}
        <TextField
          fullWidth label="Subtitle *"
          name="subtitle" value={formik.values.subtitle}
          onChange={formik.handleChange} onBlur={formik.handleBlur}
          error={formik.touched.subtitle && !!formik.errors.subtitle}
          helperText={formik.touched.subtitle && formik.errors.subtitle}
        />

        {/* Badge + Accent Color */}
        <Box display="flex" gap={2}>
          <TextField
            fullWidth label="Badge (e.g. 🔥 Trending Now)"
            name="badge" value={formik.values.badge}
            onChange={formik.handleChange}
          />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
              Accent Color
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <input
                type="color"
                value={formik.values.accent}
                onChange={(e) => formik.setFieldValue("accent", e.target.value)}
                style={{
                  width: 48, height: 48,
                  border: "none", borderRadius: 8,
                  cursor: "pointer", padding: 2,
                }}
              />
              <TextField
                size="small"
                value={formik.values.accent}
                onChange={(e) => formik.setFieldValue("accent", e.target.value)}
                sx={{ width: 120 }}
                placeholder="#6366f1"
              />
            </Box>
          </Box>
        </Box>

        {/* CTA Buttons */}
        <Divider>CTA Buttons</Divider>

        <Box display="flex" gap={2}>
          <TextField
            fullWidth label="Primary Button Text *"
            name="cta" value={formik.values.cta}
            onChange={formik.handleChange}
            error={formik.touched.cta && !!formik.errors.cta}
            helperText={formik.touched.cta && formik.errors.cta}
          />
          <TextField
            fullWidth label="Primary Button Link *"
            name="ctaLink" value={formik.values.ctaLink}
            onChange={formik.handleChange}
            error={formik.touched.ctaLink && !!formik.errors.ctaLink}
            helperText={formik.touched.ctaLink && formik.errors.ctaLink}
            placeholder="/products/women_western_wear"
          />
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            fullWidth label="Secondary Button Text *"
            name="secondCta" value={formik.values.secondCta}
            onChange={formik.handleChange}
            error={formik.touched.secondCta && !!formik.errors.secondCta}
            helperText={formik.touched.secondCta && formik.errors.secondCta}
          />
          <TextField
            fullWidth label="Secondary Button Link *"
            name="secondLink" value={formik.values.secondLink}
            onChange={formik.handleChange}
            error={formik.touched.secondLink && !!formik.errors.secondLink}
            helperText={formik.touched.secondLink && formik.errors.secondLink}
            placeholder="/products/men_t_shirts"
          />
        </Box>

        {/* Stats */}
        <Divider>Stats</Divider>
        <TextField
          fullWidth
          label='Stats (e.g. "50K+:Products,2K+:Vendors,70%:Max Off")'
          name="stats"
          value={formik.values.stats}
          onChange={formik.handleChange}
          helperText="Format: value:label — separate with comma. e.g. 50K+:Products,2K+:Vendors"
        />

        {/* Active toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={formik.values.isActive}
              onChange={(e) => formik.setFieldValue("isActive", e.target.checked)}
              color="success"
            />
          }
          label={
            <Typography variant="body2">
              {formik.values.isActive
                ? "🟢 Active — visible on home page"
                : "⚪ Hidden — not shown to customers"
              }
            </Typography>
          }
        />

        {/* Buttons */}
        <Box display="flex" gap={2} mt={1}>
          <Button
            fullWidth variant="contained" type="submit"
            sx={{ py: 1.5, background: "linear-gradient(135deg, #6366f1, #a855f7)", fontWeight: "bold" }}
          >
            {isEdit ? "💾 Update Banner" : "➕ Create Banner"}
          </Button>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BannerForm;