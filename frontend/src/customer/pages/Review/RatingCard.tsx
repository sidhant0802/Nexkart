import { useRef }        from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect }     from "react";
import { Rating }        from "@mui/material";
import type { Review }   from "../../../types/reviewTypes";

interface Props {
  totalReview: number;
  reviews?:    Review[];
}

// ── bar config ──
const BARS = [
  { label: "Excellent", min: 5,   max: 5,   color: "#22c55e" },
  { label: "Very Good", min: 4,   max: 4.9, color: "#84cc16" },
  { label: "Good",      min: 3,   max: 3.9, color: "#eab308" },
  { label: "Average",   min: 2,   max: 2.9, color: "#f97316" },
  { label: "Poor",      min: 0,   max: 1.9, color: "#ef4444" },
];

// ── animated bar ──
const AnimatedBar = ({
  pct, color, count,
}: {
  pct: number; color: string; count: number;
}) => {
  const ref      = useRef(null);
  const inView   = useInView(ref, { once: true, margin: "-40px" });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({
        width:      `${pct}%`,
        transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.1 },
      });
    }
  }, [inView, pct, controls]);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
      {/* track */}
      <div style={{
        flex: 1, height: "8px", borderRadius: "99px",
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden", position: "relative",
      }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={controls}
          style={{
            height: "100%", borderRadius: "99px",
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
      {/* count */}
      <span style={{ fontSize: "11px", color: "#94a3b8", minWidth: "28px", textAlign: "right" }}>
        {count}
      </span>
    </div>
  );
};

const RatingCard = ({ totalReview, reviews = [] }: Props) => {
  // compute real counts
  const counts = BARS.map((b) =>
    reviews.filter((r) => r.rating >= b.min && r.rating <= b.max).length
  );

  const avgRating = totalReview > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalReview
    : 0;

  return (
    <div style={{
      background:   "linear-gradient(135deg, #1e1e2e, #16213e)",
      borderRadius: "20px",
      padding:      "24px",
      border:       "1px solid rgba(255,255,255,0.07)",
      boxShadow:    "0 8px 32px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>

        {/* ── Left: avg score ── */}
        <div style={{
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            "6px",
          minWidth:       "100px",
        }}>
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            style={{
              fontSize:      "48px",
              fontWeight:    900,
              color:         "#f1f5f9",
              lineHeight:    1,
              letterSpacing: "-2px",
            }}
          >
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </motion.span>

          <Rating
            readOnly
            value={avgRating}
            precision={0.5}
            sx={{ fontSize: "18px", "& .MuiRating-iconFilled": { color: "#fbbf24" } }}
          />

          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {totalReview} {totalReview === 1 ? "rating" : "ratings"}
          </span>
        </div>

        {/* ── Right: bars ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: "200px" }}>
          {BARS.map((bar, i) => (
            <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                fontSize: "12px", fontWeight: 600,
                color: "#94a3b8", minWidth: "68px",
              }}>
                {bar.label}
              </span>
              <AnimatedBar
                pct={totalReview > 0 ? (counts[i] / totalReview) * 100 : 0}
                color={bar.color}
                count={counts[i]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingCard;