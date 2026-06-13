import { useState, useEffect }            from "react";
import { motion, AnimatePresence }        from "framer-motion";
import { Avatar, Rating }                 from "@mui/material";
import DeleteIcon                         from "@mui/icons-material/Delete";
import type { Review }                    from "../../../types/reviewTypes";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { deleteReview }                   from "../../../Redux Toolkit/Customer/ReviewSlice";

interface Props { item: Review; }

// ── helper - get user name from any shape ──
const getUserName = (user: any): string => {
  if (!user) return "Customer";
  if (user.fullName)  return user.fullName;
  if (user.firstName) return `${user.firstName} ${user.lastName ?? ""}`.trim();
  if (user.email)     return user.email.split("@")[0];
  return "Customer";
};

// ── media lightbox ──
const Lightbox = ({
  items, startIndex, onClose,
}: {
  items: string[]; startIndex: number; onClose: () => void;
}) => {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft")  setIdx((i) => (i - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [items.length, onClose]);

  const url = items[idx];
  const isVideo = url?.includes("/video/") || /\.(mp4|mov|webm)$/i.test(url);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.93)",
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:    "20px",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute", top: "20px", right: "24px",
          width:    "44px", height: "44px",
          borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.1)",
          color:      "#fff", fontSize: "22px",
          cursor:     "pointer", zIndex: 2,
        }}
      >×</button>

      {/* prev */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + items.length) % items.length); }}
          style={{
            position: "absolute", left: "20px",
            width: "48px", height: "48px",
            borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,0.12)",
            color: "#fff", fontSize: "22px",
            cursor: "pointer", zIndex: 2,
          }}
        >‹</button>
      )}

      {/* media */}
      <motion.div
        key={idx}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw", maxHeight: "85vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "12px",
        }}
      >
        {isVideo ? (
          <video
            src={url} controls autoPlay
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "12px" }}
          />
        ) : (
          <img
            src={url} alt=""
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "12px", objectFit: "contain" }}
          />
        )}
        <span style={{ color: "#94a3b8", fontSize: "12px" }}>
          {idx + 1} / {items.length}
        </span>
      </motion.div>

      {/* next */}
      {items.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % items.length); }}
          style={{
            position: "absolute", right: "20px",
            width: "48px", height: "48px",
            borderRadius: "50%", border: "none",
            background: "rgba(255,255,255,0.12)",
            color: "#fff", fontSize: "22px",
            cursor: "pointer", zIndex: 2,
          }}
        >›</button>
      )}
    </motion.div>
  );
};

const ProductReviewCard = ({ item }: Props) => {
  const dispatch = useAppDispatch();
  const user     = useAppSelector((s) => s.user.user);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  const userName = getUserName(item.user);

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    setDeleting(true);
    await dispatch(deleteReview({ reviewId: item._id, jwt: localStorage.getItem("jwt") || "" }));
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return d; }
  };

  const avatarColors = ["#6366f1","#a855f7","#ec4899","#06b6d4","#10b981","#f59e0b"];
  const avatarBg     = avatarColors[(userName.charCodeAt(0) ?? 0) % avatarColors.length];

  const ratingColor = item.rating >= 4 ? "#22c55e"
    : item.rating >= 3 ? "#fbbf24" : "#ef4444";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background:   "linear-gradient(135deg, #1e1e2e, #16213e)",
          borderRadius: "16px",
          padding:      "18px 20px",
          border:       "1px solid rgba(255,255,255,0.07)",
          position:     "relative",
          opacity:      deleting ? 0.5 : 1,
          transition:   "opacity 0.3s",
        }}
      >
        {/* ── Header row ── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: "12px", marginBottom: "12px",
        }}>
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 42, height: 42,
                background: avatarBg,
                fontWeight: 800, fontSize: "15px",
                flexShrink: 0,
              }}
            >
              {userName[0]?.toUpperCase() ?? "C"}
            </Avatar>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 700, color: "#f1f5f9",
                fontSize: "14px", margin: 0,
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {userName}
                {/* verified buyer badge */}
                <span style={{
                  fontSize: "10px", padding: "1px 6px",
                  borderRadius: "999px",
                  background: "#16a34a20",
                  color: "#22c55e", fontWeight: 700,
                }}>
                  ✓ Verified
                </span>
              </p>
              <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0" }}>
                {fmtDate(item.createdAt)}
              </p>
            </div>
          </div>

          {/* Rating chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "3px 10px", borderRadius: "999px",
            background: `${ratingColor}18`,
            border: `1px solid ${ratingColor}40`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "11px" }}>⭐</span>
            <span style={{ fontWeight: 800, fontSize: "13px", color: ratingColor }}>
              {item.rating}
            </span>
          </div>
        </div>

        {/* Stars */}
        <Rating
          readOnly
          value={item.rating}
          precision={0.5}
          sx={{
            fontSize: "14px",
            "& .MuiRating-iconFilled": { color: "#fbbf24" },
            "& .MuiRating-iconEmpty":  { color: "rgba(255,255,255,0.15)" },
          }}
        />

        {/* Review text */}
        <p style={{
          fontSize: "14px", color: "#cbd5e1",
          lineHeight: 1.65, margin: "10px 0 0",
        }}>
          {item.reviewText}
        </p>

        {/* ── Media collection (Flipkart style) ── */}
        {item.productImages?.length > 0 && (
          <div style={{
            display: "flex", gap: "8px",
            marginTop: "14px", flexWrap: "wrap",
          }}>
            {item.productImages.map((img, i) => {
              const isVideo = img.includes("/video/") || /\.(mp4|mov|webm)$/i.test(img);
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setLightbox({ open: true, index: i })}
                  style={{
                    width: "72px", height: "72px",
                    borderRadius: "10px", overflow: "hidden",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    flexShrink: 0, cursor: "pointer",
                    position: "relative",
                    background: "#1e1e2e",
                  }}
                >
                  {isVideo ? (
                    <>
                      <video
                        src={img} muted
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.35)",
                        fontSize: "20px", color: "#fff",
                      }}>▶</div>
                    </>
                  ) : (
                    <img
                      src={img} alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}

                  {/* type badge */}
                  <div style={{
                    position: "absolute", bottom: "3px", left: "3px",
                    background: "rgba(0,0,0,0.7)", color: "#fff",
                    fontSize: "8px", padding: "1px 5px",
                    borderRadius: "3px", fontWeight: 800,
                  }}>
                    {isVideo ? "🎬" : "📷"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Helpful row */}
        <div style={{
          display: "flex", gap: "16px",
          marginTop: "14px", paddingTop: "12px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <button style={{
            background: "transparent", border: "none",
            color: "#64748b", cursor: "pointer",
            fontSize: "12px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "4px",
            padding: 0,
          }}>
            👍 Helpful
          </button>
          {item.user?._id === user?._id && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "transparent", border: "none",
                color: "#ef4444", cursor: "pointer",
                fontSize: "12px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "4px",
                padding: 0, marginLeft: "auto",
              }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
              Delete
            </button>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && item.productImages?.length > 0 && (
          <Lightbox
            items={item.productImages}
            startIndex={lightbox.index}
            onClose={() => setLightbox({ open: false, index: 0 })}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductReviewCard;