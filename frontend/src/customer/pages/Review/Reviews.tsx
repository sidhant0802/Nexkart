import { useEffect }                      from "react";
import { motion }                         from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useParams }                      from "react-router-dom";
import { fetchProductById }               from "../../../Redux Toolkit/Customer/ProductSlice";
import { fetchReviewsByProductId }        from "../../../Redux Toolkit/Customer/ReviewSlice";
import { AnimatePresence }                from "framer-motion";
import ProductReviewCard                  from "./ProductReviewCard";
import RatingCard                         from "./RatingCard";

const Reviews = () => {
  const dispatch      = useAppDispatch();
  const { products, review } = useAppSelector((s) => s);
  const { productId } = useParams();

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
      dispatch(fetchReviewsByProductId({ productId }));
    }
  }, [productId]);

  const product = products.product;

  return (
    <div style={{
      minHeight:  "100vh",
      background: "linear-gradient(135deg, #0f0f1a, #0a0a12)",
      padding:    "40px 16px",
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ maxWidth: "1000px", margin: "0 auto" }}
      >
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>

          {/* ── Product card ── */}
          <div style={{ width: "220px", flexShrink: 0 }}>
            <div style={{
              borderRadius: "16px",
              overflow:     "hidden",
              border:       "1px solid rgba(255,255,255,0.07)",
            }}>
              <img
                src={product?.images?.[0] ?? ""}
                alt={product?.title}
                style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }}
              />
            </div>
            <div style={{ marginTop: "12px" }}>
              <p style={{ fontWeight: 800, color: "#f1f5f9", fontSize: "14px", margin: "0 0 3px" }}>
                {product?.seller?.businessDetails?.businessName}
              </p>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 8px" }}>
                {product?.title}
              </p>
              <span style={{ fontWeight: 700, color: "#f1f5f9" }}>
                ₹{product?.sellingPrice?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* ── Reviews list ── */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 900, color: "#f1f5f9", margin: "0 0 4px" }}>
                Reviews & Ratings
              </h1>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                {review.reviews.length} verified review{review.reviews.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Rating card */}
            <RatingCard
              totalReview={review.reviews.length}
              reviews={review.reviews}
            />

            {/* Reviews */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {review.reviews.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign:    "center",
                    padding:      "48px 20px",
                    borderRadius: "16px",
                    background:   "rgba(255,255,255,0.03)",
                    border:       "1px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  <p style={{ fontSize: "40px", margin: "0 0 12px" }}>💬</p>
                  <p style={{ color: "#64748b", fontWeight: 600, margin: 0 }}>
                    No reviews yet
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {review.reviews.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <ProductReviewCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reviews;