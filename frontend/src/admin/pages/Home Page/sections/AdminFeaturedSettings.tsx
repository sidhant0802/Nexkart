import { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Button, Slider, Select,
  MenuItem, FormControl, InputLabel, Switch,
  Alert, Chip, IconButton, TextField, Divider,
  CircularProgress, Snackbar,
} from "@mui/material";
import AddIcon    from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon   from "@mui/icons-material/Save";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  fetchHomeSettings,
  updateHomeSettings,
  updateFeaturedTabs,
  resetSaved,
  type FeaturedTab,
} from "../../../../Redux Toolkit/Admin/homeSettingsSlice";
import { fetchHomePageData } from "../../../../Redux Toolkit/Customer/Customer/AsyncThunk";

const SORT_OPTIONS = [
  { value: "random",       label: "🎲 Random — different every time"      },
  { value: "latest",       label: "🆕 Latest Added — newest products"      },
  { value: "price_low",    label: "💰 Price: Low → High"                  },
  { value: "price_high",   label: "💎 Price: High → Low"                  },
  { value: "best_selling", label: "🔥 Best Selling — most ordered"         },
];

const AdminFeaturedSettings = () => {
  const dispatch = useAppDispatch();
  const { settings, loading, saved, error } = useAppSelector((s) => s.homeSettings);

  // ── Local state (only set from DB on first load) ──────
  const [count,       setCount]       = useState<number | null>(null);
  const [sortMode,    setSortMode]    = useState<string | null>(null);
  const [tabs,        setTabs]        = useState<FeaturedTab[] | null>(null);
  const [newTab,      setNewTab]      = useState({ label: "", category: "" });
  const [showAdd,     setShowAdd]     = useState(false);
  const [snackMsg,    setSnackMsg]    = useState("");
  const [snackOpen,   setSnackOpen]   = useState(false);
  const [savingTabs,  setSavingTabs]  = useState(false);

  // Track if we already loaded from DB
  const loadedRef = useRef(false);

  // ── Fetch on mount ────────────────────────────────────
  useEffect(() => {
    loadedRef.current = false;  // reset on mount
    dispatch(fetchHomeSettings());
  }, [dispatch]);

  // ── Sync from DB ONLY on first load ──────────────────
  useEffect(() => {
    if (settings && !loadedRef.current) {
      setCount(settings.featuredProductCount);
      setSortMode(settings.featuredSortMode);
      setTabs(
        [...(settings.featuredTabs || [])].sort((a, b) => a.order - b.order)
      );
      loadedRef.current = true;
    }
  }, [settings]);

  // ── Show success snackbar ─────────────────────────────
  useEffect(() => {
    if (saved) {
      setSnackMsg("✅ Settings saved! Home page updated.");
      setSnackOpen(true);
      dispatch(resetSaved());
    }
  }, [saved]);

  // ── Computed values (use local state or defaults) ─────
  const displayCount    = count    ?? 20;
  const displaySortMode = sortMode ?? "random";
  const displayTabs     = tabs     ?? [];
  const activeCount     = displayTabs.filter((t) => t.isActive).length;
  const hiddenCount     = displayTabs.filter((t) => !t.isActive).length;

  // ── Save general settings ─────────────────────────────
  const handleSaveGeneral = async () => {
    const result = await dispatch(updateHomeSettings({
      featuredProductCount: displayCount,
      featuredSortMode:     displaySortMode as any,
    }));

    // After save, update local state from response
    if (updateHomeSettings.fulfilled.match(result)) {
      const saved = result.payload;
      setCount(saved.featuredProductCount);
      setSortMode(saved.featuredSortMode);
      // Refresh home page data
      dispatch(fetchHomePageData());
    }
  };

  // ── Tab helpers ───────────────────────────────────────
  const saveTabs = async (updatedTabs: FeaturedTab[]) => {
    setSavingTabs(true);
    const result = await dispatch(updateFeaturedTabs(updatedTabs));
    if (updateFeaturedTabs.fulfilled.match(result)) {
      setTabs(
        [...(result.payload.featuredTabs || [])].sort((a, b) => a.order - b.order)
      );
      dispatch(fetchHomePageData());
    }
    setSavingTabs(false);
  };

  const handleToggleTab = (index: number) => {
    const updated = displayTabs.map((t, i) =>
      i === index ? { ...t, isActive: !t.isActive } : t
    );
    setTabs(updated);
    saveTabs(updated);
  };

  const handleDeleteTab = (index: number) => {
    const updated = displayTabs
      .filter((_, i) => i !== index)
      .map((t, i) => ({ ...t, order: i }));
    setTabs(updated);
    saveTabs(updated);
  };

  const handleAddTab = () => {
    if (!newTab.label.trim()) return;
    const updated = [
      ...displayTabs,
      {
        label:    newTab.label.trim(),
        category: newTab.category.trim(),
        isActive: true,
        order:    displayTabs.length,
      },
    ];
    setTabs(updated);
    saveTabs(updated);
    setNewTab({ label: "", category: "" });
    setShowAdd(false);
  };

  const handleMoveTab = (index: number, dir: "up" | "down") => {
    const updated = [...displayTabs];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= updated.length) return;
    [updated[index], updated[swap]] = [updated[swap], updated[index]];
    const reordered = updated.map((t, i) => ({ ...t, order: i }));
    setTabs(reordered);
    saveTabs(reordered);
  };

  // ── Loading state ─────────────────────────────────────
  if (count === null || !loadedRef.current) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  // ── Check if local differs from saved ─────────────────
  const hasUnsavedChanges =
    displayCount !== settings?.featuredProductCount ||
    displaySortMode !== settings?.featuredSortMode;

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight="bold">
          📦 Featured Products Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Control how products appear in the Featured section on home page
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ══════════════════════════════════════════════════
          SECTION 1 — Count & Sort
      ══════════════════════════════════════════════════ */}
      <Box sx={{
        p: 3, mb: 3, borderRadius: 2,
        border: hasUnsavedChanges ? "2px solid #f59e0b" : "1px solid #e0e7ff",
        background: "linear-gradient(135deg, #f0f4ff, #faf5ff)",
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            ⚙️ Display Settings
          </Typography>
          {hasUnsavedChanges && (
            <Chip
              label="⚠️ Unsaved changes"
              color="warning"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          )}
        </Box>

        {/* ── Product Count ── */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Number of Products to Show
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Drag the slider to set how many products appear
              </Typography>
            </Box>
            <Chip
              label={`${displayCount} products`}
              color="primary"
              sx={{ fontWeight: "bold", fontSize: 14, px: 1 }}
            />
          </Box>

          <Slider
            value={displayCount}
            onChange={(_, v) => setCount(v as number)}
            min={5}
            max={100}
            step={5}
            marks={[
              { value: 5,   label: "5"   },
              { value: 10,  label: "10"  },
              { value: 20,  label: "20"  },
              { value: 30,  label: "30"  },
              { value: 40,  label: "40"  },
              { value: 50,  label: "50"  },
              { value: 60,  label: "60"  },
              { value: 80,  label: "80"  },
              { value: 100, label: "100" },
            ]}
            valueLabelDisplay="on"
            sx={{
              color: "#6366f1",
              mb: 1,
              "& .MuiSlider-markLabel": { fontSize: 10 },
              "& .MuiSlider-valueLabel": {
                background: "#6366f1",
                fontSize: 13,
                fontWeight: "bold",
              },
            }}
          />

          {/* Saved vs Current comparison */}
          {settings && displayCount !== settings.featuredProductCount && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Changed from <strong>{settings.featuredProductCount}</strong> to{" "}
              <strong>{displayCount}</strong>.
              Click "Save" to apply.
            </Alert>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* ── Sort Mode ── */}
        <Box mb={3}>
          <Typography variant="body2" fontWeight="bold" mb={0.5}>
            How to Select Products
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            Choose how products are picked and ordered
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Sort / Selection Mode</InputLabel>
            <Select
              value={displaySortMode}
              onChange={(e) => setSortMode(e.target.value)}
              label="Sort / Selection Mode"
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{
            mt: 1.5, p: 1.5, borderRadius: 1,
            background: "#f9fafb", border: "1px solid #e5e7eb",
          }}>
            <Typography variant="body2" color="text.secondary">
              {displaySortMode === "random"       && "🎲 Every time a customer visits, they see a different set of products."}
              {displaySortMode === "latest"       && "🆕 Shows the most recently added products first."}
              {displaySortMode === "price_low"    && "💰 Shows cheapest products first."}
              {displaySortMode === "price_high"   && "💎 Shows most expensive products first."}
              {displaySortMode === "best_selling" && "🔥 Shows products with the most orders."}
            </Typography>
          </Box>
        </Box>

        {/* ── Save Button ── */}
        <Button
          variant="contained"
          size="large"
          startIcon={
            loading
              ? <CircularProgress size={18} sx={{ color: "white" }} />
              : <SaveIcon />
          }
          onClick={handleSaveGeneral}
          disabled={loading || !hasUnsavedChanges}
          sx={{
            background: hasUnsavedChanges
              ? "linear-gradient(135deg, #f59e0b, #ef4444)"
              : "linear-gradient(135deg, #6366f1, #a855f7)",
            fontWeight: "bold",
            px: 4, py: 1.5,
            borderRadius: 2,
            "&:hover": {
              background: hasUnsavedChanges
                ? "linear-gradient(135deg, #d97706, #dc2626)"
                : "linear-gradient(135deg, #4f46e5, #9333ea)",
            },
            "&.Mui-disabled": {
              background: "#e5e7eb",
              color: "#9ca3af",
            },
          }}
        >
          {loading
            ? "Saving..."
            : hasUnsavedChanges
            ? "⚠️ Save Changes"
            : "✅ All Saved"
          }
        </Button>

        {/* Current DB state */}
        {settings && !hasUnsavedChanges && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              label={`✅ Showing: ${settings.featuredProductCount} products`}
              size="small"
              variant="outlined"
              color="success"
            />
            <Chip
              label={`✅ Sort: ${SORT_OPTIONS.find(o => o.value === settings.featuredSortMode)?.label?.split("—")[0] || settings.featuredSortMode}`}
              size="small"
              variant="outlined"
              color="success"
            />
          </Box>
        )}
      </Box>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Category Tabs
      ══════════════════════════════════════════════════ */}
      <Box sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              🗂️ Category Filter Tabs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filter buttons above the Featured Products grid
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setShowAdd(!showAdd)}
            sx={{ borderRadius: 2 }}
          >
            Add Tab
          </Button>
        </Box>

        {/* Stats */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Chip label={`${activeCount} visible`} color="success" size="small" variant="outlined" />
          {hiddenCount > 0 && (
            <Chip label={`${hiddenCount} hidden`} color="default" size="small" variant="outlined" />
          )}
          {savingTabs && (
            <Chip label="Saving..." color="info" size="small" icon={<CircularProgress size={12} />} />
          )}
        </Box>

        {/* Live Preview */}
        <Box sx={{ mb: 2, p: 2, background: "#f9fafb", borderRadius: 2, border: "1px dashed #d1d5db" }}>
          <Typography variant="caption" color="text.secondary" display="block" mb={1} fontWeight="bold">
            👁️ Live Preview:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {displayTabs.filter(t => t.isActive).length === 0 ? (
              <Typography variant="caption" color="error">No active tabs!</Typography>
            ) : (
              displayTabs.filter(t => t.isActive).map((t, i) => (
                <Box key={i} sx={{
                  px: 2, py: 0.8, borderRadius: 2, fontSize: 12, fontWeight: "bold",
                  background: i === 0 ? "#4f46e5" : "white",
                  color: i === 0 ? "white" : "#6b7280",
                  border: i === 0 ? "none" : "1px solid #e5e7eb",
                }}>
                  {t.label}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Tabs List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {displayTabs.map((tab, i) => (
            <Box key={i} sx={{
              display: "flex", alignItems: "center", gap: 1, p: 1.5,
              borderRadius: 1.5, border: "1px solid",
              borderColor: tab.isActive ? "#c7d2fe" : "#f3f4f6",
              background: tab.isActive ? "#f0f4ff" : "#fafafa",
              opacity: tab.isActive ? 1 : 0.65, transition: "all 0.2s",
            }}>
              <DragIndicatorIcon sx={{ color: "#d1d5db", fontSize: 18 }} />

              <Box display="flex" flexDirection="column" sx={{ gap: 0 }}>
                <IconButton size="small" disabled={i === 0 || savingTabs}
                  onClick={() => handleMoveTab(i, "up")} sx={{ p: 0.2, fontSize: 10 }}>▲</IconButton>
                <IconButton size="small" disabled={i === displayTabs.length - 1 || savingTabs}
                  onClick={() => handleMoveTab(i, "down")} sx={{ p: 0.2, fontSize: 10 }}>▼</IconButton>
              </Box>

              <Typography fontWeight="bold" fontSize={14} sx={{ minWidth: 90 }}>{tab.label}</Typography>

              <Typography variant="caption" sx={{
                fontFamily: "monospace", background: "#f3f4f6",
                px: 1, py: 0.3, borderRadius: 1, flex: 1, color: "#6b7280", fontSize: 11,
              }}>
                {tab.category || "— all products —"}
              </Typography>

              <Box display="flex" alignItems="center" gap={0.5}>
                <Switch size="small" checked={tab.isActive}
                  onChange={() => handleToggleTab(i)} disabled={savingTabs} color="primary" />
                <Typography variant="caption" fontWeight="bold"
                  sx={{ color: tab.isActive ? "#6366f1" : "#9ca3af", minWidth: 30, fontSize: 11 }}>
                  {tab.isActive ? "ON" : "OFF"}
                </Typography>
              </Box>

              <IconButton size="small" onClick={() => handleDeleteTab(i)}
                disabled={savingTabs} sx={{ color: "#ef4444" }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}

          {displayTabs.length === 0 && (
            <Alert severity="warning">No tabs configured.</Alert>
          )}
        </Box>

        {/* Add Tab Form */}
        {showAdd && (
          <Box sx={{ mt: 2, p: 2, border: "2px dashed #6366f1", borderRadius: 2, background: "#f0f4ff" }}>
            <Typography variant="body2" fontWeight="bold" mb={1.5} color="#6366f1">
              ➕ Add New Category Tab
            </Typography>
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="flex-start">
              <TextField size="small" label="Tab Label *" value={newTab.label}
                onChange={(e) => setNewTab({ ...newTab, label: e.target.value })}
                placeholder="e.g. Electronics" helperText="Text on the tab button"
                sx={{ flex: 1, minWidth: 140 }} />
              <TextField size="small" label="Category ID" value={newTab.category}
                onChange={(e) => setNewTab({ ...newTab, category: e.target.value })}
                placeholder="e.g. mobiles" helperText="Empty = All Products"
                sx={{ flex: 2, minWidth: 200 }} />
              <Box display="flex" gap={1} mt={0.5}>
                <Button variant="contained" onClick={handleAddTab}
                  disabled={!newTab.label.trim() || savingTabs}
                  sx={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}>Add</Button>
                <Button variant="outlined"
                  onClick={() => { setShowAdd(false); setNewTab({ label: "", category: "" }); }}>Cancel</Button>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2, p: 1.5, background: "#fafafa", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Tab label = customer-facing text. Category ID = filter key.
            Empty category = shows all products. Changes save automatically.
          </Typography>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ fontWeight: "bold" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminFeaturedSettings;