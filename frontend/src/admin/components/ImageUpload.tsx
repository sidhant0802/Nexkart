import { useRef, useState } from "react";
import {
  Box, Button, Typography, TextField,
  LinearProgress, Tabs, Tab,
} from "@mui/material";
import UploadIcon      from "@mui/icons-material/Upload";
import LinkIcon        from "@mui/icons-material/Link";
import DeleteIcon      from "@mui/icons-material/Delete";
import ImageIcon       from "@mui/icons-material/Image";

interface Props {
  value:    string;
  onChange: (val: string) => void;
  label?:   string;
  height?:  number;
}

const ImageUpload = ({ value, onChange, label = "Image", height = 140 }: Props) => {
  const fileRef              = useRef<HTMLInputElement>(null);
  const [tab,      setTab]   = useState(0);
  const [loading,  setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState(value?.startsWith("data:") ? "" : value || "");
  const [error,    setError]  = useState("");
  const [dragOver, setDragOver] = useState(false);

  // ── Handle file (upload or drag) ──────────────────────
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      setLoading(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Drag & Drop ───────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── URL input ─────────────────────────────────────────
  const handleUrlApply = () => {
    if (!urlInput.trim()) {
      setError("Please enter a URL");
      return;
    }
    setError("");
    onChange(urlInput.trim());
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const hasImage = !!value;

  return (
    <Box>
      <Typography variant="body2" fontWeight="bold" mb={1}>
        {label}
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => { setTab(v); setError(""); }}
        sx={{ mb: 2, minHeight: 36 }}
        TabIndicatorProps={{ style: { height: 2 } }}
      >
        <Tab
          icon={<LinkIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="URL"
          sx={{ minHeight: 36, fontSize: 12, py: 0 }}
        />
        <Tab
          icon={<UploadIcon sx={{ fontSize: 16 }} />}
          iconPosition="start"
          label="Upload from Device"
          sx={{ minHeight: 36, fontSize: 12, py: 0 }}
        />
      </Tabs>

      {/* ── TAB 0: URL ── */}
      {tab === 0 && (
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            size="small"
            label="Paste image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
            placeholder="https://images.unsplash.com/photo-..."
            error={!!error}
            helperText={error || "Press Enter or click Apply"}
          />
          <Button
            variant="contained"
            onClick={handleUrlApply}
            sx={{
              whiteSpace: "nowrap",
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              minWidth: 80,
            }}
          >
            Apply
          </Button>
        </Box>
      )}

      {/* ── TAB 1: Upload ── */}
      {tab === 1 && (
        <Box>
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />

          {/* Drop Zone */}
          <Box
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            sx={{
              border: dragOver
                ? "2px solid #6366f1"
                : "2px dashed #d1d5db",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "#f0f4ff" : "#fafafa",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "#6366f1",
                background: "#f0f4ff",
              },
            }}
          >
            <ImageIcon sx={{ fontSize: 40, color: "#9ca3af", mb: 1 }} />
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Click to upload or drag & drop
            </Typography>
            <Typography variant="caption" color="text.disabled">
              PNG, JPG, JPEG, WEBP up to 5MB
            </Typography>
          </Box>

          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
              ❌ {error}
            </Typography>
          )}

          {loading && (
            <Box mt={1}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary">
                Processing image...
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ── Image Preview ── */}
      {hasImage && !loading && (
        <Box mt={2} position="relative">
          {/* Clear button */}
          <Button
            size="small"
            color="error"
            variant="contained"
            startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
            onClick={handleClear}
            sx={{
              position:  "absolute",
              top:       8,
              right:     8,
              zIndex:    1,
              py:        0.5,
              px:        1,
              fontSize:  11,
              minWidth:  "auto",
            }}
          >
            Remove
          </Button>

          <Box
            sx={{
              width:        "100%",
              height:       height,
              borderRadius: 2,
              overflow:     "hidden",
              border:       "1px solid #e5e7eb",
              position:     "relative",
            }}
          >
            <img loading="lazy" decoding="async"
              src={value}
              alt="preview"
              style={{
                width:      "100%",
                height:     "100%",
                objectFit:  "cover",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                setError("Invalid image URL — image failed to load");
              }}
              onLoad={() => setError("")}
            />
          </Box>

          <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: "block" }}>
            ✅ {value.startsWith("data:") ? "Image uploaded from device" : "Image from URL"}
            {" "}• {value.startsWith("data:")
              ? `${Math.round(value.length * 0.75 / 1024)}KB`
              : value.slice(0, 40) + "..."
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;