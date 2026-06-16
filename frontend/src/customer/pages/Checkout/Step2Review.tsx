// frontend/src/customer/pages/Checkout/Step2Review.tsx

import { useState, useEffect } from "react";
import { Button, Divider, CircularProgress } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "../../../routes/CustomerRoutes";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { applyCoupon } from "../../../Redux Toolkit/Customer/CouponSlice";
import type { CheckoutData } from "./Checkout";

interface Props {
  mode:         "buyNow" | "cart";
  checkoutData: CheckoutData | null;
  cart:         any;
  selectedAddr: any;
  onBack:       () => void;
  onNext:       () => void;
}

const Step2Review = ({ mode, checkoutData, cart, selectedAddr, onBack, onNext }: Props) => {
  const { isDark } = useTheme();
  const dispatch   = useAppDispatch();
const couponState = useAppSelector((s) => s.coupone);

  // ── Coupon state ──
  const [couponCode,   setCouponCode]   = useState("");
  const [couponMsg,    setCouponMsg]    = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  const c = {
    text:    isDark ? "#f1f5f9" : "#0f172a",
    textSec: isDark ? "#cbd5e1" : "#475569",
    textMute:isDark ? "#94a3b8" : "#64748b",
    bgCard:  isDark ? "#13131a" : "#ffffff",
    bgInner: isDark ? "#1a1a24" : "#f9fafb",
    border:  isDark ? "#1f1f2e" : "#e5e7eb",
    accent:  "#6366f1",
    success: "#10b981",
    warning: "#f59e0b",
    danger:  "#ef4444",
    successBg: isDark ? "rgba(16,185,129,0.08)" : "#f0fdf4",
  };

  // ── Build items list ──
  let items: any[] = [];
  let totalMrp = 0;
  let totalSelling = 0;
  let totalItems = 0;

  if (mode === "buyNow" && checkoutData) {
    items.push({
      title:        checkoutData.productTitle,
      image:        checkoutData.productImage,
      sellingPrice: checkoutData.sellingPrice || 0,
      mrpPrice:     checkoutData.mrpPrice || 0,
      quantity:     checkoutData.quantity || 1,
    });
    totalMrp     = (checkoutData.mrpPrice || 0) * (checkoutData.quantity || 1);
    totalSelling = (checkoutData.sellingPrice || 0) * (checkoutData.quantity || 1);
    totalItems   = checkoutData.quantity || 1;
  } else if (cart?.cartItems) {
    items = cart.cartItems.map((ci: any) => ({
      title:        ci.product?.title,
      image:        ci.product?.images?.[0],
      sellingPrice: ci.sellingPrice || 0,
      mrpPrice:     ci.mrpPrice || 0,
      quantity:     ci.quantity || 1,
    }));
    totalMrp     = cart.cartItems.reduce((s: number, i: any) => s + (i.mrpPrice || 0) * (i.quantity || 1), 0);
    totalSelling = cart.cartItems.reduce((s: number, i: any) => s + (i.sellingPrice || 0) * (i.quantity || 1), 0);
    totalItems   = cart.cartItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
  }

  const discount   = totalMrp - totalSelling;
  const couponOff  = appliedCoupon?.discount || 0;
  const shipping   = (totalSelling - couponOff) >= 499 ? 0 : 49;
  const finalTotal = totalSelling - couponOff + shipping;

  // ── Apply Coupon ──
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMsg({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    const jwt = localStorage.getItem("jwt") || "";

    try {
      const result = await dispatch(
        applyCoupon({
          apply:      "true",
          code:       couponCode.trim().toUpperCase(),
          orderValue: totalSelling,
          jwt,
        })
      ).unwrap();

      // Backend returns updated cart with couponPrice
      const discountAmt = result?.couponPrice || 0;

      if (discountAmt > 0) {
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: discountAmt });
        setCouponMsg({
          type: "success",
          text: `🎉 ₹${discountAmt} discount applied!`,
        });
      } else {
        setCouponMsg({
          type: "error",
          text: "Coupon applied but no discount available",
        });
      }
    } catch (err: any) {
      setCouponMsg({
        type: "error",
        text: err || "Invalid or expired coupon",
      });
    }
  };

  // ── Remove Coupon ──
  const handleRemoveCoupon = async () => {
    if (!appliedCoupon) return;

    const jwt = localStorage.getItem("jwt") || "";

    try {
      await dispatch(
        applyCoupon({
          apply:      "false",
          code:       appliedCoupon.code,
          orderValue: totalSelling,
          jwt,
        })
      ).unwrap();
    } catch (err) {
      // ignore — clear anyway
    }

    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMsg(null);
  };

  // Auto-hide message after 4 seconds
  useEffect(() => {
    if (couponMsg) {
      const t = setTimeout(() => setCouponMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [couponMsg]);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: window.innerWidth < 900 ? "1fr" : "1fr 360px",
      gap: 20,
    }}>

      {/* ── LEFT: Items + Address ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Address summary */}
        <div style={{
          background: c.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${c.border}`,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: c.textMute,
                      textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 10px" }}>
            Delivering to
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>
            {selectedAddr?.name}
          </p>
          <p style={{ fontSize: 13, color: c.textSec, margin: "4px 0", lineHeight: 1.5 }}>
            {selectedAddr?.address}, {selectedAddr?.city}, {selectedAddr?.state} - {selectedAddr?.pinCode}
          </p>
          <p style={{ fontSize: 12, color: c.textMute, margin: 0 }}>
            📞 {selectedAddr?.mobile}
          </p>
          <button
            onClick={onBack}
            style={{
              marginTop: 10,
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${c.accent}`,
              background: "transparent",
              color: c.accent,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            CHANGE
          </button>
        </div>

        {/* Items */}
        <div style={{
          background: c.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${c.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <ReceiptIcon sx={{ color: c.accent, fontSize: 22 }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: c.text, margin: 0 }}>
              Order Summary ({totalItems} items)
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: 12,
                  background: c.bgInner,
                  borderRadius: 10,
                  border: `1px solid ${c.border}`,
                }}
              >
                <img loading="lazy" decoding="async"
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: 60, height: 60,
                    borderRadius: 8,
                    objectFit: "contain",
                    background: "#fff",
                    padding: 4,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/60x60/6366f1/ffffff?text=?";
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: c.text,
                    margin: 0, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 11, color: c.textMute, margin: "4px 0" }}>
                    Quantity: {item.quantity}
                  </p>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>
                      ₹{(item.sellingPrice * item.quantity).toLocaleString()}
                    </span>
                    {item.mrpPrice > item.sellingPrice && (
                      <span style={{ fontSize: 11, color: c.textMute, textDecoration: "line-through" }}>
                        ₹{(item.mrpPrice * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Price breakdown + Coupon ── */}
      <div>
        <div style={{
          background: c.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${c.border}`,
          position: "sticky",
          top: 20,
        }}>

          {/* ════════════════════════════════════════ */}
          {/* ✅ NEW — COUPON SECTION                 */}
          {/* ════════════════════════════════════════ */}
          <div style={{
            background: c.bgInner,
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            border: `1.5px dashed ${appliedCoupon ? c.success : c.accent}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <LocalOfferIcon sx={{ color: appliedCoupon ? c.success : c.accent, fontSize: 18 }} />
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: c.text,
              }}>
                {appliedCoupon ? "Coupon Applied" : "Have a coupon?"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {appliedCoupon ? (
                // Applied Coupon Display
                <motion.div
                  key="applied"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    background: c.successBg,
                    borderRadius: 8,
                    border: `1px solid ${c.success}40`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircleIcon sx={{ color: c.success, fontSize: 18 }} />
                    <div>
                      <p style={{
                        fontSize: 13, fontWeight: 800,
                        color: c.success,
                        fontFamily: "monospace",
                        letterSpacing: 1,
                        margin: 0,
                      }}>
                        {appliedCoupon.code}
                      </p>
                      <p style={{ fontSize: 11, color: c.textSec, margin: 0 }}>
                        Saved ₹{appliedCoupon.discount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: c.danger,
                      display: "flex",
                      alignItems: "center",
                      padding: 4,
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </button>
                </motion.div>
              ) : (
                // Coupon Input
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: `1.5px solid ${c.border}`,
                      background: c.bgCard,
                      color: c.text,
                      fontSize: 13,
                      fontFamily: "monospace",
                      letterSpacing: 1,
                      fontWeight: 600,
                      outline: "none",
                      textTransform: "uppercase",
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponState.loading}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: couponState.loading
                        ? c.textMute
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: couponState.loading ? "not-allowed" : "pointer",
                      minWidth: 70,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {couponState.loading ? (
                      <CircularProgress size={14} sx={{ color: "#fff" }} />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Coupon Message */}
            <AnimatePresence>
              {couponMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: couponMsg.type === "success" ? c.success : c.danger,
                    margin: "8px 0 0",
                  }}
                >
                  {couponMsg.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ════════════════════════════════════════ */}
          {/* Price Details                            */}
          {/* ════════════════════════════════════════ */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 14px" }}>
            Price Details
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: c.textSec }}>Price ({totalItems} items)</span>
              <span style={{ color: c.text, fontWeight: 600 }}>₹{totalMrp.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: c.textSec }}>Product Discount</span>
                <span style={{ color: c.success, fontWeight: 700 }}>− ₹{discount.toLocaleString()}</span>
              </div>
            )}
            {couponOff > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: c.textSec }}>
                  🎟️ Coupon ({appliedCoupon?.code})
                </span>
                <span style={{ color: c.success, fontWeight: 700 }}>− ₹{couponOff.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: c.textSec }}>Delivery</span>
              <span style={{ color: shipping === 0 ? c.success : c.text, fontWeight: 700 }}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
          </div>

          <Divider sx={{ my: 1.5, borderColor: c.border }} />

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: c.success }}>
              ₹{finalTotal.toLocaleString()}
            </span>
          </div>

          {(discount + couponOff) > 0 && (
            <div style={{
              padding: 10,
              background: c.successBg,
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 12,
              color: c.success,
              fontWeight: 700,
              textAlign: "center",
            }}>
              🎉 You'll save ₹{(discount + couponOff).toLocaleString()} on this order!
            </div>
          )}

          <Button
            onClick={onNext}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              fontSize: 14,
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 6px 18px rgba(99,102,241,0.4)",
              "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
            }}
          >
            Proceed to Payment →
          </Button>

          <Button
            onClick={onBack}
            fullWidth
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{
              mt: 1,
              color: c.textMute,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Back to address
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step2Review;