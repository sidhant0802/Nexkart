// frontend/src/admin/pages/HomePage/forms/BannerForm.tsx

import { useState, useEffect, useRef } from "react";
import {
  Box, Button, TextField, Typography, Switch,
  FormControlLabel, Divider, Alert, CircularProgress,
  IconButton, LinearProgress,
} from "@mui/material";
import AddIcon            from "@mui/icons-material/Add";
import DeleteIcon         from "@mui/icons-material/Delete";
import UploadIcon         from "@mui/icons-material/CloudUpload";
import PhoneAndroidIcon   from "@mui/icons-material/PhoneAndroid";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  createBanner, updateBanner, resetBannerFlags,
} from "../../../../Redux Toolkit/Admin/bannerSlice";
import { uploadToCloudinary } from "../../../../util/uploadToCloudnary";

interface Props {
  banner:  any | null;
  onClose: () => void;
}

const defaultForm = {
  title:       "",
  highlight:   "",
  subtitle:    "",
  badge:       "",
  cta:         "Shop Now",
  ctaLink:     "/",
  secondCta:   "View All",
  secondLink:  "/",
  image:       "",
  mobileImage: "",
  overlay:     "from-black/80 via-black/40 to-transparent",
  accent:      "#6366f1",
  isActive:    true,
  stats:       [{ val: "", label: "" }],
};

// ── Reusable Image Upload Box ─────────────────────────────
interface ImageUploadBoxProps {
  label:       string;
  subLabel:    string;
  icon:        React.ReactNode;
  color:       string;
  value:       string;
  onChange:    (url: string) => void;
  placeholder: string;
  previewH:    number;
  previewW?:   number;
}

const ImageUploadBox = ({
  label, subLabel, icon, color,
  value, onChange, placeholder, previewH, previewW,
}: ImageUploadBoxProps) => {
  const inputRef                    = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]   = useState(false);
  const [progress,  setProgress]    = useState(0);
  const [error,     setError]       = useState("");
  const [dragOver,  setDragOver]    = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large (max 10MB)");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(30);

    try {
      // Simulate progress
      const timer = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 85));
      }, 300);

      const url = await uploadToCloudinary(file);

      clearInterval(timer);
      setProgress(100);
      onChange(url);

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 600);

    } catch (err: any) {
      setError(err.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Label row */}
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Box sx={{ color }}>{icon}</Box>
        <Box>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          <Typography variant="caption" color="text.secondary">{subLabel}</Typography>
        </Box>
      </Box>

      {/* Drop Zone */}
      <Box
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          border:       `2px dashed ${dragOver ? color : "#e2e8f0"}`,
          borderRadius: "12px",
          padding:      "20px",
          textAlign:    "center",
          cursor:       uploading ? "not-allowed" : "pointer",
          background:   dragOver ? `${color}08` : "#fafafa",
          transition:   "all 0.2s ease",
          "&:hover":    { borderColor: color, background: `${color}05` },
        }}
      >
        {uploading ? (
          <Box>
            <CircularProgress size={32} sx={{ color, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Uploading to Cloudinary...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mt: 1, borderRadius: 99,
                "& .MuiLinearProgress-bar": { background: color },
              }}
            />
          </Box>
        ) : value ? (
          <Box>
            <CheckCircleIcon sx={{ color: "green", mb: 0.5 }} />
            <Typography variant="caption" color="success.main" display="block">
              Image uploaded ✓
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click to replace
            </Typography>
          </Box>
        ) : (
          <Box>
            <UploadIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Click or drag & drop image here
            </Typography>
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, WEBP — max 10MB
            </Typography>
          </Box>
        )}
      </Box>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />

      {/* Error */}
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          ❌ {error}
        </Typography>
      )}

      {/* Preview */}
      {value && !uploading && (
        <Box sx={{ mt: 1.5, position: "relative", display: "inline-block" }}>
          <Box
            component="img"
            src={value}
            alt="preview"
            onError={(e: any) => {
              e.target.src = `https://placehold.co/400x${previewH}/${color.replace("#","")}/white?text=Preview`;
            }}
            sx={{
              width:        previewW ? `${previewW}px` : "100%",
              height:       `${previewH}px`,
              objectFit:    "cover",
              borderRadius: "10px",
              border:       `2px solid ${color}`,
              display:      "block",
            }}
          />
          {/* Remove button */}
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            sx={{
              position:   "absolute",
              top:        -8, right: -8,
              background: "#ef4444",
              color:      "white",
              width:      24, height: 24,
              "&:hover":  { background: "#dc2626" },
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      {/* OR paste URL */}
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          — or paste image URL directly —
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{ mt: 0.5 }}
          InputProps={{ style: { fontSize: 12 } }}
        />
      </Box>
    </Box>
  );
};

// ── Main BannerForm ───────────────────────────────────────
const BannerForm = ({ banner, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { loading, bannerCreated, bannerUpdated, error } =
    useAppSelector((s) => s.banner);

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (banner) {
      setForm({
        title:       banner.title       || "",
        highlight:   banner.highlight   || "",
        subtitle:    banner.subtitle    || "",
        badge:       banner.badge       || "",
        cta:         banner.cta         || "Shop Now",
        ctaLink:     banner.ctaLink     || "/",
        secondCta:   banner.secondCta   || "View All",
        secondLink:  banner.secondLink  || "/",
        image:       banner.image       || "",
        mobileImage: banner.mobileImage || "",
        overlay:     banner.overlay     || "from-black/80 via-black/40 to-transparent",
        accent:      banner.accent      || "#6366f1",
        isActive:    banner.isActive    ?? true,
        stats:       banner.stats?.length > 0
          ? banner.stats
          : [{ val: "", label: "" }],
      });
    } else {
      setForm(defaultForm);
    }
  }, [banner]);

  useEffect(() => {
    if (bannerCreated || bannerUpdated) {
      dispatch(resetBannerFlags());
      onClose();
    }
  }, [bannerCreated, bannerUpdated]);

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setStatField = (i: number, key: "val" | "label", value: string) => {
    const updated = [...form.stats];
    updated[i]    = { ...updated[i], [key]: value };
    setForm((prev) => ({ ...prev, stats: updated }));
  };

  const addStat    = () => {
    if (form.stats.length >= 3) return;
    setForm((prev) => ({ ...prev, stats: [...prev.stats, { val: "", label: "" }] }));
  };

  const removeStat = (i: number) =>
    setForm((prev) => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }));

  const handleSubmit = () => {
    if (!form.title || !form.highlight || !form.subtitle || !form.image) {
      alert("Please fill: Title, Highlight, Subtitle and upload Desktop Image");
      return;
    }
    const payload = {
      ...form,
      stats: form.stats.filter((s) => s.val && s.label),
    };
    if (banner?._id) {
      dispatch(updateBanner({ id: banner._id, data: payload }));
    } else {
      dispatch(createBanner(payload));
    }
  };

  const field = (
    label: string, key: string,
    options?: { multiline?: boolean; rows?: number; placeholder?: string }
  ) => (
    <TextField
      fullWidth size="small" label={label}
      value={(form as any)[key]}
      onChange={(e) => set(key, e.target.value)}
      multiline={options?.multiline}
      rows={options?.rows}
      placeholder={options?.placeholder}
      sx={{ mb: 2 }}
    />
  );

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {banner ? "✏️ Edit Banner" : "➕ New Banner"}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Basic Info ── */}
      <Typography variant="overline" color="text.secondary">Basic Info</Typography>

      {field("Title (e.g. New Season)", "title")}
      {field("Highlight — colored text below title", "highlight")}
      {field("Subtitle", "subtitle", {
        multiline: true, rows: 2,
        placeholder: "Short description shown below heading",
      })}
      {field("Badge (e.g. 🔥 Trending Now)", "badge", {
        placeholder: "Optional — shown as pill badge on banner",
      })}

      <Divider sx={{ my: 2 }} />

      {/* ── Images ── */}
      <Typography variant="overline" color="text.secondary">Images</Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
        Upload from your device — images go directly to Cloudinary
      </Typography>

      {/* Desktop Image */}
      <ImageUploadBox
        label="Desktop Image"
        subLabel="Landscape · 1600×620 recommended"
        icon={<DesktopWindowsIcon fontSize="small" />}
        color="#6366f1"
        value={form.image}
        onChange={(url) => set("image", url)}
        placeholder="https://... or upload above"
        previewH={130}
      />

      {/* Mobile Image */}
      <ImageUploadBox
        label="Mobile Image (Optional)"
        subLabel="Portrait · 600×800 recommended · falls back to desktop"
        icon={<PhoneAndroidIcon fontSize="small" />}
        color="#ec4899"
        value={form.mobileImage}
        onChange={(url) => set("mobileImage", url)}
        placeholder="https://... or upload above"
        previewH={180}
        previewW={130}
      />

      <Divider sx={{ my: 2 }} />

      {/* ── CTA Buttons ── */}
      <Typography variant="overline" color="text.secondary">CTA Buttons</Typography>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} sx={{ mt: 1, mb: 2 }}>
        <TextField size="small" label="Primary Text"
          value={form.cta}
          onChange={(e) => set("cta", e.target.value)} />
        <TextField size="small" label="Primary Link"
          value={form.ctaLink}
          onChange={(e) => set("ctaLink", e.target.value)} />
        <TextField size="small" label="Secondary Text"
          value={form.secondCta}
          onChange={(e) => set("secondCta", e.target.value)} />
        <TextField size="small" label="Secondary Link"
          value={form.secondLink}
          onChange={(e) => set("secondLink", e.target.value)} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ── Style ── */}
      <Typography variant="overline" color="text.secondary">Style</Typography>

      <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1, mb: 2 }}>
        <TextField
          size="small" label="Accent Color (hex)"
          value={form.accent}
          onChange={(e) => set("accent", e.target.value)}
          sx={{ flex: 1 }}
        />
        {/* Color picker */}
        <input
          type="color"
          value={form.accent}
          onChange={(e) => set("accent", e.target.value)}
          style={{
            width: 48, height: 40,
            border: "none", borderRadius: 8,
            cursor: "pointer", padding: 2,
          }}
        />
        <Box sx={{
          width: 40, height: 40, borderRadius: 1,
          background: form.accent,
          border: "1px solid #e2e8f0",
        }} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ── Stats ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="overline" color="text.secondary">
          Stats (max 3)
        </Typography>
        {form.stats.length < 3 && (
          <Button size="small" startIcon={<AddIcon />} onClick={addStat}>
            Add
          </Button>
        )}
      </Box>

      {form.stats.map((stat, i) => (
        <Box key={i} display="flex" gap={1} alignItems="center" sx={{ mb: 1 }}>
          <TextField
            size="small" label="Value"
            placeholder="50K+"
            value={stat.val}
            onChange={(e) => setStatField(i, "val", e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small" label="Label"
            placeholder="Products"
            value={stat.label}
            onChange={(e) => setStatField(i, "label", e.target.value)}
            sx={{ flex: 1 }}
          />
          <IconButton onClick={() => removeStat(i)} size="small">
            <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
          </IconButton>
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* ── Active Toggle ── */}
      <FormControlLabel
        control={
          <Switch
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            color="success"
          />
        }
        label={
          <Typography variant="body2">
            {form.isActive
              ? "🟢 Active — visible on home page"
              : "⚪ Hidden — not shown on home page"}
          </Typography>
        }
        sx={{ mb: 2 }}
      />

      {/* ── Actions ── */}
      <Box display="flex" gap={2}>
        <Button
          fullWidth variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            background:  "linear-gradient(135deg, #6366f1, #a855f7)",
            fontWeight:  "bold",
            py:          1.5,
            borderRadius: 2,
          }}
        >
          {loading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
        </Button>
        <Button
          fullWidth variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default BannerForm;