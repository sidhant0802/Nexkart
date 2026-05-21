import { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Button, Slider, Select,
  MenuItem, FormControl, InputLabel, Switch,
  Alert, Chip, CircularProgress, Snackbar,
  Divider, FormControlLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  fetchHomeSettings,
  updateHomeSettings,
  resetSaved,
} from "../../../../Redux Toolkit/Admin/homeSettingsSlice";
import { fetchBrands, toggleBrandFeatured } from "../../../../Redux Toolkit/Admin/BrandSlice";
import { fetchHomePageData } from "../../../../Redux Toolkit/Customer/Customer/AsyncThunk";

const SORT_OPTIONS = [
  { value: "featured_first", label: "⭐ Featured First — starred brands on top"  },
  { value: "alphabetical",   label: "🔤 Alphabetical — A to Z"                  },
  { value: "random",         label: "🎲 Random — different every time"           },
  { value: "newest",         label: "🆕 Newest — recently added first"           },
];

const AdminBrandSettings = () => {
  const dispatch = useAppDispatch();
  const { settings, loading, saved } = useAppSelector((s) => s.homeSettings);
  const { brands, loading: brandsLoading } = useAppSelector((s) => s.brand);

  const [brandCount, setBrandCount] = useState<number | null>(null);
  const [brandSort,  setBrandSort]  = useState<string | null>(null);
  const [showBrands, setShowBrands] = useState(true);
  const [snackOpen,  setSnackOpen]  = useState(false);
  const [snackMsg,   setSnackMsg]   = useState("");

  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = false;
    dispatch(fetchHomeSettings());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (settings && !loadedRef.current) {
      setBrandCount(settings.brandDisplayCount ?? 18);
      setBrandSort(settings.brandSortMode ?? "featured_first");
      setShowBrands(settings.showBrandsOnHome ?? true);
      loadedRef.current = true;
    }
  }, [settings]);

  useEffect(() => {
    if (saved) {
      setSnackMsg("✅ Brand settings saved!");
      setSnackOpen(true);
      dispatch(resetSaved());
    }
  }, [saved]);

  const displayCount = brandCount ?? 18;
  const displaySort  = brandSort  ?? "featured_first";

  const hasUnsavedChanges =
    displayCount !== (settings?.brandDisplayCount ?? 18) ||
    displaySort  !== (settings?.brandSortMode ?? "featured_first") ||
    showBrands   !== (settings?.showBrandsOnHome ?? true);

  const handleSave = async () => {
    const result = await dispatch(updateHomeSettings({
      brandDisplayCount: displayCount,
      brandSortMode:     displaySort as any,
      showBrandsOnHome:  showBrands,
    }));

    if (updateHomeSettings.fulfilled.match(result)) {
      const s = result.payload;
      setBrandCount(s.brandDisplayCount);
      setBrandSort(s.brandSortMode);
      setShowBrands(s.showBrandsOnHome);
      dispatch(fetchHomePageData());
    }
  };

  const handleToggleFeatured = async (id: string) => {
    await dispatch(toggleBrandFeatured(id));
    dispatch(fetchBrands());
  };

  const featuredCount = brands.filter(b => b.featured).length;
  const activeCount   = brands.filter(b => b.isActive !== false).length;

  if (brandCount === null || !loadedRef.current) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold">
          🏆 Top Brands Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Control the Top Brands section on the home page
        </Typography>
      </Box>

      {/* SECTION 1 — Display Settings */}
      <Box sx={{
        p: 3, mb: 3, borderRadius: 2,
        border: hasUnsavedChanges ? "2px solid #f59e0b" : "1px solid #e0e7ff",
        background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            ⚙️ Brand Display Settings
          </Typography>
          {hasUnsavedChanges && (
            <Chip label="⚠️ Unsaved changes" color="warning" size="small" sx={{ fontWeight: "bold" }} />
          )}
        </Box>

        {/* Show/Hide */}
        <Box sx={{
          mb: 3, p: 2, borderRadius: 2,
          background: showBrands ? "#ecfdf5" : "#fef2f2",
          border: showBrands ? "1px solid #a7f3d0" : "1px solid #fecaca",
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={showBrands}
                onChange={(e) => setShowBrands(e.target.checked)}
                color="success"
                size="medium"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {showBrands ? "🟢 Top Brands section is VISIBLE" : "🔴 Top Brands section is HIDDEN"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {showBrands
                    ? "Customers can see the Top Brands grid on home page"
                    : "The entire Top Brands section is hidden from home page"}
                </Typography>
              </Box>
            }
          />
        </Box>

        {showBrands && (
          <>
            {/* Count Slider */}
            <Box mb={4}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Number of Brands to Show
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    How many brand logos appear on the home page
                  </Typography>
                </Box>
                <Chip
                  label={`${displayCount} brands`}
                  sx={{ fontWeight: "bold", fontSize: 14, px: 1, background: "#f59e0b", color: "white" }}
                />
              </Box>

              <Slider
                value={displayCount}
                onChange={(_, v) => setBrandCount(v as number)}
                min={5}
                max={100}
                step={1}
                marks={[
                  { value: 5,   label: "5"   },
                  { value: 10,  label: "10"  },
                  { value: 18,  label: "18"  },
                  { value: 30,  label: "30"  },
                  { value: 50,  label: "50"  },
                  { value: 75,  label: "75"  },
                  { value: 100, label: "100" },
                ]}
                valueLabelDisplay="on"
                sx={{
                  color: "#f59e0b", mb: 1,
                  "& .MuiSlider-markLabel": { fontSize: 10 },
                  "& .MuiSlider-valueLabel": {
                    background: "#f59e0b", fontSize: 13, fontWeight: "bold",
                  },
                }}
              />

              <Alert severity="info" icon={false} sx={{ mt: 1 }}>
                <Typography variant="body2">
                  You have <strong>{activeCount} active brands</strong> total,
                  <strong> {featuredCount} featured</strong>.
                  Showing <strong>{Math.min(displayCount, activeCount)}</strong> on home page.
                </Typography>
              </Alert>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Sort */}
            <Box mb={3}>
              <Typography variant="body2" fontWeight="bold" mb={0.5}>
                Display Order
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                How brands are ordered on the home page
              </Typography>

              <FormControl fullWidth>
                <InputLabel>Brand Sort Mode</InputLabel>
                <Select
                  value={displaySort}
                  onChange={(e) => setBrandSort(e.target.value)}
                  label="Brand Sort Mode"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, background: "#fffbeb", border: "1px solid #fde68a" }}>
                <Typography variant="body2" color="text.secondary">
                  {displaySort === "featured_first" && "⭐ Featured (starred) brands appear first, then alphabetically."}
                  {displaySort === "alphabetical"   && "🔤 Brands sorted A to Z by name."}
                  {displaySort === "random"         && "🎲 Different brands shown every page load."}
                  {displaySort === "newest"         && "🆕 Most recently added brands shown first."}
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {/* Save */}
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={loading || !hasUnsavedChanges}
          sx={{
            background: hasUnsavedChanges
              ? "linear-gradient(135deg, #f59e0b, #ef4444)"
              : "linear-gradient(135deg, #f59e0b, #d97706)",
            fontWeight: "bold", px: 4, py: 1.5, borderRadius: 2,
            "&.Mui-disabled": { background: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {loading ? "Saving..." : hasUnsavedChanges ? "⚠️ Save Changes" : "✅ All Saved"}
        </Button>
      </Box>

      {/* SECTION 2 — Quick Featured Toggle */}
      <Box sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            ⭐ Quick Feature Toggle
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Toggle which brands are "featured" (appear first when sort = Featured First).
            Go to <strong>/admin/brands</strong> for full brand management.
          </Typography>
        </Box>

        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Chip label={`${activeCount} total brands`} size="small" variant="outlined" />
          <Chip label={`⭐ ${featuredCount} featured`} size="small" variant="outlined" color="warning" />
          <Chip label={`Showing ${Math.min(displayCount, activeCount)} on home`} size="small" variant="outlined" color="success" />
        </Box>

        {brandsLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : brands.length === 0 ? (
          <Alert severity="warning">
            No brands found. Go to <strong>/admin/brands</strong> to add brands.
          </Alert>
        ) : (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 1.5,
            maxHeight: 400,
            overflowY: "auto",
            pr: 1,
          }}>
            {brands
              .slice()
              .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
              .map((brand) => (
                <Box
                  key={brand._id}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5, p: 1.5,
                    borderRadius: 2, border: "1px solid",
                    borderColor: brand.featured ? "#fde68a" : "#f3f4f6",
                    background:  brand.featured ? "#fffbeb" : "#fafafa",
                    transition: "all 0.2s",
                    "&:hover": { borderColor: "#f59e0b" },
                  }}
                >
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    overflow: "hidden", flexShrink: 0,
                    background: "white", border: "1px solid #e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {brand.logo ? (
                      <img loading="lazy" decoding="async"
                        src={brand.logo}
                        alt={brand.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 14, fontWeight: "bold", color: "#9ca3af" }}>
                        {brand.name.charAt(0)}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ fontSize: 12, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {brand.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {(brand as any).categories?.[0] || (brand as any).category || "All"}
                    </Typography>
                  </Box>

                  <Switch
                    size="small"
                    checked={!!brand.featured}
                    onChange={() => brand._id && handleToggleFeatured(brand._id)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#f59e0b" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#f59e0b" },
                    }}
                  />
                </Box>
              ))}
          </Box>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ fontWeight: "bold" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBrandSettings;