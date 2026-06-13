import { useEffect }                      from "react";
import { motion }                         from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useParams, useNavigate }         from "react-router-dom";
import { fetchProductById }               from "../../../Redux Toolkit/Customer/ProductSlice";
import ReviewForm                         from "./ReviewForm";

const WriteReviews = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { products } = useAppSelector((s) => s);
  const { productId } = useParams();

  useEffect(() => {
    if (productId) dispatch(fetchProductById(productId));
  }, [productId]);

  const product = products.product;

  return (
    <div style={{
      minHeight:  "100vh",
      background: "linear-gradient(160deg, #0f0f1a 0%, #0a0a14 60%, #0d0814 100%)",
    }}>
      {/* Header bar */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding:      "16px 24px",
        display:      "flex",
        alignItems:   "center",
        gap:          "12px",
        background:   "rgba(255,255,255,0.02)",
        backdropFilter: "blur(8px)",
        position:     "sticky",
        top:          0,
        zIndex:       10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background:   "rgba(255,255,255,0.06)",
            border:       "none",
            borderRadius: "10px",
            color:        "#94a3b8",
            cursor:       "pointer",
            padding:      "8px 14px",
            fontSize:     "13px",
            fontWeight:   600,
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
          }}
        >
          ← Back
        </button>
        <span style={{ color: "#64748b", fontSize: "13px" }}>
          Write a Review
        </span>
      </div>

      <div style={{
        maxWidth: "860px",
        margin:   "0 auto",
        padding:  "40px 20px",
        display:  "flex",
        gap:      "40px",
        flexWrap: "wrap",
      }}>

        {/* ── Product sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "220px", flexShrink: 0 }}
        >
          {/* Image */}
          <div style={{
            borderRadius: "16px",
            overflow:     "hidden",
            border:       "1px solid rgba(255,255,255,0.07)",
            background:   "#1e1e2e",
            aspectRatio:  "1/1",
          }}>
            {product?.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                style={{
                  width:      "100%",
                  height:     "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{
                width:          "100%",
                height:         "100%",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "48px",
              }}>
                📦
              </div>
            )}
          </div>

          {/* Product info */}
          <div style={{ marginTop: "16px" }}>
            {product?.brand && (
              <p style={{
                fontSize:      "10px",
                fontWeight:    700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color:         "#6366f1",
                margin:        "0 0 6px",
              }}>
                {product.brand}
              </p>
            )}
            <p style={{
              fontWeight: 700,
              color:      "#f1f5f9",
              fontSize:   "14px",
              margin:     "0 0 4px",
              lineHeight: 1.4,
            }}>
              {product?.title ?? "Loading..."}
            </p>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 12px" }}>
              {product?.seller?.businessDetails?.businessName}
            </p>

            <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
              <span style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "18px" }}>
                ₹{product?.sellingPrice?.toLocaleString("en-IN") ?? "—"}
              </span>
              {(product?.mrpPrice ?? 0) > (product?.sellingPrice ?? 0) && (
                <span style={{
                  color:          "#64748b",
                  textDecoration: "line-through",
                  fontSize:       "13px",
                }}>
                  ₹{product?.mrpPrice?.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            marginTop:    "24px",
            padding:      "14px",
            borderRadius: "12px",
            background:   "rgba(99,102,241,0.08)",
            border:       "1px solid rgba(99,102,241,0.15)",
          }}>
            <p style={{
              fontSize:   "11px",
              fontWeight: 700,
              color:      "#818cf8",
              margin:     "0 0 8px",
            }}>
              💡 Review Tips
            </p>
            {[
              "Be honest and specific",
              "Mention quality & fit",
              "Add photos for credibility",
              "Describe delivery experience",
            ].map((tip) => (
              <p key={tip} style={{
                fontSize: "11px",
                color:    "#64748b",
                margin:   "0 0 4px",
                display:  "flex",
                gap:      "5px",
              }}>
                <span style={{ color: "#6366f1" }}>›</span> {tip}
              </p>
            ))}
          </div>
        </motion.div>

        {/* ── Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ flex: 1, minWidth: "280px" }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{
              fontSize:   "24px",
              fontWeight: 900,
              color:      "#f1f5f9",
              margin:     "0 0 6px",
              letterSpacing: "-0.5px",
            }}>
              ✍️ Write a Review
            </h1>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              Your honest review helps millions of shoppers make better decisions
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background:   "rgba(255,255,255,0.03)",
            border:       "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding:      "28px",
          }}>
            <ReviewForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WriteReviews;