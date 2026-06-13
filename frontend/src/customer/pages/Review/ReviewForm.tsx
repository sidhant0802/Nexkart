import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence }                   from "framer-motion";
import { useFormik }                                 from "formik";
import * as Yup                                      from "yup";
import { CircularProgress }                          from "@mui/material";
import { uploadFileToCloudinary, type UploadResult } from "../../../util/uploadToCloudnary";
import { useAppDispatch, useAppSelector }             from "../../../Redux Toolkit/Store";
import { createReview }                               from "../../../Redux Toolkit/Customer/ReviewSlice";
import { useNavigate, useParams }                     from "react-router-dom";

interface FormVals {
  reviewText:    string;
  rating:        number;
  productImages: string[];
}

interface MediaItem extends UploadResult {
  localId: string;
  uploading?: boolean;
  progress?: number;
  error?: string;
}

// ── Inject CSS ──
const injectCSS = () => {
  if (document.getElementById("review-form-css")) return;
  const s = document.createElement("style");
  s.id = "review-form-css";
  s.innerHTML = `
    @keyframes rf-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes rf-progress {
      from { width: 0%; }
    }
    .rf-star { transition: transform 0.15s, filter 0.15s; }
    .rf-star:hover { transform: scale(1.3); }
    .rf-upload-zone { transition: all 0.2s ease; }
    .rf-upload-zone:hover {
      border-color: #7c3aed !important;
      background: rgba(124,58,237,0.08) !important;
    }
    .rf-thumb { transition: transform 0.2s; }
    .rf-thumb:hover { transform: scale(1.04); }
    .rf-submit { transition: all 0.2s ease; }
    .rf-submit:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(107,70,193,0.55) !important;
    }
    .rf-textarea:focus {
      border-color: #7c3aed !important;
      box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important;
    }
  `;
  document.head.appendChild(s);
};

// ── Star rating ──
const StarInput = ({
  value, onChange,
}: {
  value: number; onChange: (v: number) => void;
}) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  const labels  = ["", "Poor", "Average", "Good", "Very Good", "Excellent"];

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="rf-star"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            style={{
              background: "none",
              border:     "none",
              cursor:     "pointer",
              fontSize:   "36px",
              padding:    "0 2px",
              lineHeight: 1,
              filter:     star <= display
                ? "drop-shadow(0 0 8px rgba(251,191,36,0.7))"
                : "grayscale(1) opacity(0.35)",
            }}
          >
            ⭐
          </button>
        ))}
        <AnimatePresence mode="wait">
          {display > 0 && (
            <motion.span
              key={display}
              initial={{ opacity: 0, x: -8, scale: 0.8 }}
              animate={{ opacity: 1, x: 0,  scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize:   "13px",
                fontWeight: 700,
                color:      display >= 4 ? "#22c55e"
                  : display === 3 ? "#fbbf24"
                  : "#ef4444",
                marginLeft: "6px",
              }}
            >
              {labels[display]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Upload progress ring ──
const ProgressRing = ({ pct }: { pct: number }) => {
  const r   = 18;
  const c   = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke="#a855f7"
        strokeWidth="3"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.3s" }}
      />
    </svg>
  );
};

// ── Media thumbnail ──
const MediaThumb = ({
  item, onRemove,
}: {
  item: MediaItem; onRemove: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.75, y: 10 }}
    animate={{ opacity: 1, scale: 1,    y: 0  }}
    exit={{ opacity: 0, scale: 0.7 }}
    transition={{ type: "spring", stiffness: 300, damping: 22 }}
    className="rf-thumb"
    style={{
      position:     "relative",
      width:        "88px",
      height:       "88px",
      borderRadius: "12px",
      overflow:     "hidden",
      border:       item.error
        ? "2px solid #ef4444"
        : item.uploading
        ? "2px solid #a855f7"
        : "2px solid rgba(255,255,255,0.12)",
      flexShrink:   0,
      background:   "#1e1e2e",
    }}
  >
    {/* uploading overlay */}
    {item.uploading && (
      <div style={{
        position:       "absolute",
        inset:          0,
        background:     "rgba(0,0,0,0.65)",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         3,
        gap:            "2px",
      }}>
        <ProgressRing pct={item.progress ?? 0} />
        <span style={{ fontSize: "9px", color: "#fff", fontWeight: 700 }}>
          {item.progress ?? 0}%
        </span>
      </div>
    )}

    {/* error overlay */}
    {item.error && (
      <div style={{
        position:       "absolute",
        inset:          0,
        background:     "rgba(239,68,68,0.2)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        zIndex:         3,
        fontSize:       "20px",
      }}>⚠️</div>
    )}

    {/* media */}
    {item.type === "video" ? (
      <video
        src={item.url}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
      />
    ) : (
      <img
        src={item.thumbnail || item.url}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    )}

    {/* type badge */}
    {!item.uploading && !item.error && (
      <div style={{
        position:     "absolute",
        bottom:       "4px",
        left:         "4px",
        background:   "rgba(0,0,0,0.65)",
        color:        "#fff",
        fontSize:     "8px",
        padding:      "2px 5px",
        borderRadius: "4px",
        fontWeight:   800,
        letterSpacing: "0.5px",
      }}>
        {item.type === "video" ? "🎬 VIDEO" : "🖼 IMG"}
      </div>
    )}

    {/* remove btn */}
    {!item.uploading && (
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.85 }}
        onClick={onRemove}
        type="button"
        style={{
          position:       "absolute",
          top:            "4px",
          right:          "4px",
          width:          "22px",
          height:         "22px",
          borderRadius:   "50%",
          border:         "none",
          background:     "#ef4444",
          color:          "#fff",
          fontSize:       "13px",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontWeight:     900,
          zIndex:         4,
          boxShadow:      "0 2px 6px rgba(0,0,0,0.4)",
        }}
      >
        ×
      </motion.button>
    )}
  </motion.div>
);

// ── Drop zone ──
const DropZone = ({
  onFiles, disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length) onFiles(files);
  };

  return (
    <div
      className="rf-upload-zone"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      style={{
        border:       `2px dashed ${dragging ? "#a855f7" : "rgba(255,255,255,0.12)"}`,
        borderRadius: "14px",
        padding:      "32px 20px",
        textAlign:    "center",
        cursor:       disabled ? "not-allowed" : "pointer",
        background:   dragging
          ? "rgba(168,85,247,0.1)"
          : "rgba(255,255,255,0.02)",
        transition:   "all 0.2s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) {
            onFiles(Array.from(e.target.files));
            e.target.value = "";
          }
        }}
      />

      <motion.div
        animate={{ y: dragging ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{ fontSize: "40px", marginBottom: "10px" }}
      >
        {dragging ? "📂" : "📁"}
      </motion.div>

      <p style={{
        color:      "#f1f5f9",
        fontWeight: 700,
        fontSize:   "14px",
        margin:     "0 0 4px",
      }}>
        {dragging ? "Drop files here!" : "Drag & Drop Images / Videos"}
      </p>
      <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 8px" }}>
        or{" "}
        <span style={{ color: "#a855f7", fontWeight: 700 }}>
          click to browse
        </span>
      </p>
      <div style={{
        display:      "inline-flex",
        gap:          "6px",
        flexWrap:     "wrap",
        justifyContent: "center",
      }}>
        {["JPG", "PNG", "WEBP", "MP4", "MOV"].map((ext) => (
          <span key={ext} style={{
            fontSize:     "10px",
            fontWeight:   700,
            padding:      "2px 8px",
            borderRadius: "999px",
            background:   "rgba(168,85,247,0.15)",
            color:        "#c084fc",
          }}>
            {ext}
          </span>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
// MAIN FORM
// ══════════════════════════════════════════════
const ReviewForm: React.FC = () => {
  const dispatch    = useAppDispatch();
  const navigate    = useNavigate();
  const { productId } = useParams();
  const review      = useAppSelector((s) => s.review);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => { injectCSS(); }, []);

  const anyUploading = mediaItems.some((m) => m.uploading);

  const formik = useFormik<FormVals>({
    initialValues: { reviewText: "", rating: 0, productImages: [] },
    validationSchema: Yup.object({
      reviewText: Yup.string()
        .required("Please write a review")
        .min(10, "Must be at least 10 characters"),
      rating: Yup.number()
        .required("Please select a rating")
        .min(1, "Please select a rating"),
    }),
    onSubmit: (values, { resetForm }) => {
      if (!productId) return;
      dispatch(createReview({
        productId,
        review:   {
          ...values,
          productImages: mediaItems
            .filter((m) => !m.uploading && !m.error)
            .map((m) => m.url),
        },
        jwt:      localStorage.getItem("jwt") || "",
        navigate,
      }));
      resetForm();
      setMediaItems([]);
    },
  });

  // upload handler with progress simulation
  const handleFiles = useCallback(async (files: File[]) => {
    const newItems: MediaItem[] = files.map((f) => ({
      localId:   `${Date.now()}-${Math.random()}`,
      url:       "",
      type:      f.type.startsWith("video/") ? "video" : "image",
      thumbnail: "",
      name:      f.name,
      size:      f.size,
      uploading: true,
      progress:  0,
    }));

    setMediaItems((prev) => [...prev, ...newItems]);

    // upload each file
    for (let i = 0; i < files.length; i++) {
      const file    = files[i];
      const localId = newItems[i].localId;

      // simulate progress 0→85 while uploading
      const progressInterval = setInterval(() => {
        setMediaItems((prev) =>
          prev.map((m) =>
            m.localId === localId && m.uploading
              ? { ...m, progress: Math.min((m.progress ?? 0) + 12, 85) }
              : m
          )
        );
      }, 300);

      try {
        const result = await uploadFileToCloudinary(file);
        clearInterval(progressInterval);
        setMediaItems((prev) =>
          prev.map((m) =>
            m.localId === localId
              ? {
                  ...m,
                  ...result,
                  localId,
                  uploading: false,
                  progress:  100,
                }
              : m
          )
        );
      } catch (err: any) {
        clearInterval(progressInterval);
        setMediaItems((prev) =>
          prev.map((m) =>
            m.localId === localId
              ? { ...m, uploading: false, error: err.message ?? "Upload failed" }
              : m
          )
        );
      }
    }
  }, []);

  const removeMedia = (localId: string) => {
    setMediaItems((prev) => prev.filter((m) => m.localId !== localId));
  };

  const isSubmitDisabled =
    review.loading || anyUploading || !formik.values.reviewText || formik.values.rating < 1;

  return (
    <form
      onSubmit={formik.handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >

      {/* ── Star rating ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{
          fontSize:      "12px",
          fontWeight:    700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color:         "#64748b",
        }}>
          Your Rating *
        </label>
        <StarInput
          value={formik.values.rating}
          onChange={(v) => formik.setFieldValue("rating", v)}
        />
        {formik.touched.rating && formik.errors.rating && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: "12px", color: "#ef4444" }}
          >
            ⚠️ {formik.errors.rating}
          </motion.span>
        )}
      </div>

      {/* ── Review text ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{
          fontSize:      "12px",
          fontWeight:    700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color:         "#64748b",
        }}>
          Your Review *
        </label>
        <textarea
          name="reviewText"
          className="rf-textarea"
          rows={5}
          placeholder="Describe your experience — quality, fit, delivery, etc."
          value={formik.values.reviewText}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          style={{
            width:        "100%",
            background:   "rgba(255,255,255,0.04)",
            border:       `1.5px solid ${
              formik.touched.reviewText && formik.errors.reviewText
                ? "#ef4444"
                : "rgba(255,255,255,0.1)"
            }`,
            borderRadius: "12px",
            color:        "#f1f5f9",
            fontSize:     "14px",
            lineHeight:   1.65,
            fontFamily:   "inherit",
            outline:      "none",
            padding:      "14px 16px",
            resize:       "vertical",
            minHeight:    "130px",
            boxSizing:    "border-box",
            transition:   "border-color 0.2s, box-shadow 0.2s",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {formik.touched.reviewText && formik.errors.reviewText ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontSize: "12px", color: "#ef4444" }}
            >
              ⚠️ {formik.errors.reviewText}
            </motion.span>
          ) : <span />}
          <span style={{ fontSize: "11px", color: "#475569" }}>
            {formik.values.reviewText.length} / 1000
          </span>
        </div>
      </div>

      {/* ── Upload zone ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={{
          fontSize:      "12px",
          fontWeight:    700,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color:         "#64748b",
        }}>
          Photos & Videos
          <span style={{ color: "#475569", fontWeight: 400, marginLeft: "6px" }}>
            (optional)
          </span>
        </label>

        <DropZone onFiles={handleFiles} disabled={anyUploading} />

        {/* Thumbnails */}
        <AnimatePresence>
          {mediaItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display:   "flex",
                gap:       "10px",
                flexWrap:  "wrap",
                paddingTop: "4px",
              }}
            >
              {mediaItems.map((item) => (
                <MediaThumb
                  key={item.localId}
                  item={item}
                  onRemove={() => removeMedia(item.localId)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload status */}
        {anyUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "8px",
              fontSize:     "12px",
              color:        "#a855f7",
              fontWeight:   600,
            }}
          >
            <div style={{
              width:        "14px",
              height:       "14px",
              border:       "2px solid #a855f7",
              borderTop:    "2px solid transparent",
              borderRadius: "50%",
              animation:    "rf-spin 0.7s linear infinite",
              flexShrink:   0,
            }} />
            Uploading media to Cloudinary...
          </motion.div>
        )}
      </div>

      {/* ── Submit ── */}
      <motion.button
        type="submit"
        className="rf-submit"
        disabled={isSubmitDisabled}
        whileTap={isSubmitDisabled ? {} : { scale: 0.97 }}
        style={{
          padding:        "14px 20px",
          borderRadius:   "14px",
          border:         "none",
          cursor:         isSubmitDisabled ? "not-allowed" : "pointer",
          fontSize:       "15px",
          fontWeight:     800,
          color:          "#fff",
          background:     isSubmitDisabled
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg, #6b46c1, #9333ea)",
          boxShadow:      isSubmitDisabled
            ? "none"
            : "0 4px 20px rgba(107,70,193,0.4)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "8px",
          letterSpacing:  "0.3px",
          opacity:        isSubmitDisabled ? 0.5 : 1,
        }}
      >
        {review.loading ? (
          <>
            <CircularProgress size={18} sx={{ color: "#fff" }} />
            Submitting your review...
          </>
        ) : anyUploading ? (
          <>⏳ Waiting for uploads...</>
        ) : (
          <>✍️ Submit Review</>
        )}
      </motion.button>
    </form>
  );
};

export default ReviewForm;