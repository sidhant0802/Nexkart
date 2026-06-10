import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Button, CircularProgress, Alert, Snackbar, Divider, Chip,
} from "@mui/material";
import ArrowBackIcon    from "@mui/icons-material/ArrowBack";
import PaymentIcon      from "@mui/icons-material/Payment";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import LockIcon         from "@mui/icons-material/Lock";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useTheme }     from "../../../routes/CustomerRoutes";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import {
  buyNow, checkoutCart, verifyPayment,
  markPaymentFailed, fetchSellerPaymentOptions,
} from "../../../Redux Toolkit/Customer/CheckoutSlice";
import { fetchUserCart }    from "../../../Redux Toolkit/Customer/CartSlice";
import { openRazorpayCheckout } from "../../../util/razorpay";
import type { CheckoutData }    from "./Checkout";

interface Props {
  mode:         "buyNow" | "cart";
  checkoutData: CheckoutData | null;
  cart:         any;
  selectedAddr: any;
  user:         any;
  onBack:       () => void;
}

const Step3Payment = ({ mode, checkoutData, cart, selectedAddr, user, onBack }: Props) => {
  const { isDark } = useTheme();
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();

  // ── Responsive ──
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const c = {
    text:      isDark ? "#f1f5f9" : "#0f172a",
    textSec:   isDark ? "#cbd5e1" : "#475569",
    textMute:  isDark ? "#94a3b8" : "#64748b",
    bgCard:    isDark ? "#13131a" : "#ffffff",
    bgInner:   isDark ? "#1a1a24" : "#f9fafb",
    border:    isDark ? "#1f1f2e" : "#e5e7eb",
    accent:    "#6366f1",
    success:   "#10b981",
    warning:   "#f59e0b",
    danger:    "#ef4444",
    successBg: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
  };

  const [method,      setMethod]      = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [processing,  setProcessing]  = useState(false);
  const [codAvailable, setCodAvailable] = useState(true);
  const [codReason,   setCodReason]   = useState("");
  const [toast, setToast] = useState<{open:boolean; msg:string; type:"success"|"error"|"info"}>({
    open: false, msg: "", type: "info",
  });

  // ── Calc totals ──
  let totalMrp     = 0;
  let totalSelling = 0;
  let totalItems   = 0;
  let sellerIds: string[] = [];

  if (mode === "buyNow" && checkoutData) {
    totalMrp     = (checkoutData.mrpPrice     || 0) * (checkoutData.quantity || 1);
    totalSelling = (checkoutData.sellingPrice || 0) * (checkoutData.quantity || 1);
    totalItems   = checkoutData.quantity || 1;
    if (checkoutData.sellerId) sellerIds = [checkoutData.sellerId];
  } else if (cart?.cartItems) {
    totalMrp     = cart.cartItems.reduce((s: number, i: any) => s + (i.mrpPrice     || 0) * (i.quantity || 1), 0);
    totalSelling = cart.cartItems.reduce((s: number, i: any) => s + (i.sellingPrice || 0) * (i.quantity || 1), 0);
    totalItems   = cart.cartItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
    sellerIds = Array.from(new Set(
      cart.cartItems
        .map((i: any) => i.product?.seller?._id || i.product?.seller)
        .filter(Boolean)
    )) as string[];
  }

  const discount   = totalMrp - totalSelling;
  const shipping   = totalSelling >= 499 ? 0 : 49;
  const finalTotal = totalSelling + shipping;

  // ── Check COD availability ──
  useEffect(() => {
    if (sellerIds.length === 0) return;

    Promise.all(sellerIds.map((id) =>
      dispatch(fetchSellerPaymentOptions(id)).unwrap()
    ))
    .then((results) => {
      const allCodEnabled    = results.every((r: any) => r.options?.codEnabled);
      const allWithinLimit   = results.every((r: any) => totalSelling <= (r.options?.codMaxAmount || 0));

      if (!allCodEnabled) {
        setCodAvailable(false);
        setCodReason("COD not available for one or more sellers");
      } else if (!allWithinLimit) {
        setCodAvailable(false);
        const minLimit = Math.min(...results.map((r: any) => r.options?.codMaxAmount || 0));
        setCodReason(`COD limit: ₹${minLimit.toLocaleString()}`);
      } else {
        setCodAvailable(true);
        setCodReason("");
      }
    })
    .catch(() => {
      // If seller options fail — allow COD (don't block user)
      setCodAvailable(true);
    });
  }, [sellerIds.join(",")]);

  // ── Place Order ──
  const handlePlaceOrder = async () => {
    if (!selectedAddr) {
      setToast({ open: true, msg: "No address selected", type: "error" });
      return;
    }

    setProcessing(true);

    try {
      let result: any;

      if (mode === "buyNow" && checkoutData?.listingId) {
        const payload = {
          listingId:       checkoutData.listingId,
          quantity:        checkoutData.quantity || 1,
          shippingAddress: selectedAddr,
          paymentMethod:   method,
        };
        console.log("📦 buyNow payload:", payload);
        result = await dispatch(buyNow(payload)).unwrap();

      } else {
        const payload = {
          shippingAddress: selectedAddr,
          paymentMethod:   method,
        };
        console.log("🛒 checkoutCart payload:", payload);
        result = await dispatch(checkoutCart(payload)).unwrap();
      }

      console.log("✅ Checkout result:", result);

      // ── COD success ──
      if (result.paymentMethod === "COD") {
        const orderId =
          result.order?._id     ||
          result.orders?.[0]?._id ||
          "";

        // Refresh cart
        const jwt = localStorage.getItem("jwt");
        if (jwt) dispatch(fetchUserCart(jwt));

        navigate(`/checkout/success?orderId=${orderId}&method=COD`, { replace: true });
        return;
      }

      // ── Razorpay ──
      const rp = result.razorpay || result.razorpayOrders?.[0];

      if (!rp?.razorpayOrderId) {
        console.error("No Razorpay payload:", result);
        setToast({ open: true, msg: "Payment gateway error. Please try again.", type: "error" });
        setProcessing(false);
        return;
      }

      console.log("💳 Opening Razorpay:", rp);

      await openRazorpayCheckout({
        razorpayOrderId: rp.razorpayOrderId,
        amount:          rp.amount,
        currency:        rp.currency || "INR",
        key:             rp.key,
        nexkartOrderId:  rp.nexkartOrderId,
        userName:        user?.fullName  || "",
        userEmail:       user?.email     || "",
        userMobile:      user?.mobile    || "",

        onSuccess: async (data) => {
          try {
            console.log("✅ Razorpay success callback:", data);
            await dispatch(verifyPayment({
              razorpayOrderId:   data.razorpay_order_id,
              razorpayPaymentId: data.razorpay_payment_id,
              razorpaySignature: data.razorpay_signature,
              nexkartOrderId:    rp.nexkartOrderId,
            })).unwrap();

            // Refresh cart
            const jwt = localStorage.getItem("jwt");
            if (jwt) dispatch(fetchUserCart(jwt));

            navigate(
              `/checkout/success?orderId=${rp.nexkartOrderId}&method=RAZORPAY`,
              { replace: true }
            );
          } catch (e: any) {
            console.error("Verification failed:", e);
            setToast({
              open: true,
              msg: `Payment verification failed: ${e}`,
              type: "error",
            });
            setProcessing(false);
          }
        },

        onDismiss: async () => {
          console.log("❌ Razorpay dismissed");
          try {
            await dispatch(markPaymentFailed({
              nexkartOrderId: rp.nexkartOrderId,
            }));
          } catch (e) {
            console.error("Stock release failed:", e);
          }
          setToast({ open: true, msg: "Payment cancelled. Stock released.", type: "info" });
          setProcessing(false);
        },
      });

    } catch (err: any) {
      console.error("Place order error:", err);
      setToast({ open: true, msg: `Order failed: ${err}`, type: "error" });
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id:        "RAZORPAY",
      name:      "Pay Online",
      subtext:   "UPI · Cards · Net Banking · Wallets",
      icon:      "💳",
      available: true,
      badge:     "Recommended",
      badgeColor: c.accent,
    },
    {
      id:        "COD",
      name:      "Cash on Delivery",
      subtext:   codAvailable ? "Pay when your order arrives" : codReason,
      icon:      "💵",
      available: codAvailable,
      badge:     codAvailable ? "" : "Unavailable",
      badgeColor: c.danger,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
      gap: 20,
      alignItems: "start",
    }}>

      {/* ── LEFT: Payment methods ── */}
      <div style={{
        background: c.bgCard,
        borderRadius: 16,
        padding: isMobile ? 16 : 24,
        border: `1px solid ${c.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <PaymentIcon sx={{ color: c.accent, fontSize: 24 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: c.text, margin: 0 }}>
            Choose Payment Method
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paymentMethods.map((m) => {
            const isSelected = method === m.id;
            const disabled   = !m.available;

            return (
              <motion.div
                key={m.id}
                whileHover={!disabled ? { scale: 1.01 } : {}}
                whileTap={!disabled ? { scale: 0.99 } : {}}
                onClick={() => !disabled && setMethod(m.id as any)}
                style={{
                  padding: 18,
                  borderRadius: 14,
                  border: `2px solid ${
                    disabled   ? c.border :
                    isSelected ? c.accent : c.border
                  }`,
                  background: disabled
                    ? (isDark ? "#0d0d14" : "#f3f4f6")
                    : isSelected
                      ? (isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.07)")
                      : c.bgInner,
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.55 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 12,
                  background: isSelected
                    ? `linear-gradient(135deg, ${c.accent}, #8b5cf6)`
                    : c.bgCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  border: `1px solid ${c.border}`,
                  flexShrink: 0,
                  boxShadow: isSelected ? `0 4px 12px rgba(99,102,241,0.3)` : "none",
                }}>
                  {m.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700,
                      color: c.text, margin: 0,
                    }}>
                      {m.name}
                    </p>
                    {m.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        color: m.badgeColor,
                        background: `${m.badgeColor}20`,
                        padding: "2px 6px",
                        borderRadius: 4,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 12, color: disabled ? c.danger : c.textMute,
                    margin: "3px 0 0",
                  }}>
                    {m.subtext}
                  </p>
                </div>

                {/* Check */}
                {isSelected && !disabled && (
                  <CheckCircleIcon sx={{ color: c.accent, fontSize: 22, flexShrink: 0 }} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Test mode info */}
        {method === "RAZORPAY" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert
              severity="info"
              sx={{ mt: 3, borderRadius: 2, fontSize: 12 }}
            >
              <strong>🧪 Test Mode</strong> — Use card{" "}
              <code style={{ background: "#e0e7ff", padding: "1px 4px", borderRadius: 3 }}>
                4111 1111 1111 1111
              </code>{" "}
              · Expiry <code style={{ background: "#e0e7ff", padding: "1px 4px", borderRadius: 3 }}>
                12/26
              </code>{" "}
              · CVV <code style={{ background: "#e0e7ff", padding: "1px 4px", borderRadius: 3 }}>
                123
              </code>{" "}
              · OTP <code style={{ background: "#e0e7ff", padding: "1px 4px", borderRadius: 3 }}>
                1234
              </code>
            </Alert>
          </motion.div>
        )}

        {/* Security badges */}
        <div style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          flexWrap: "wrap",
        }}>
          {["🔒 256-bit SSL", "✅ PCI DSS Secure", "🛡️ 100% Safe"].map((badge) => (
            <span key={badge} style={{
              fontSize: 10, color: c.textMute,
              background: c.bgInner,
              border: `1px solid ${c.border}`,
              padding: "4px 8px",
              borderRadius: 6,
              fontWeight: 600,
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Price summary + Pay button ── */}
      <div style={{ position: isMobile ? "static" : "sticky", top: 20 }}>
        <div style={{
          background: c.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${c.border}`,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 16px" }}>
            Order Summary
          </h3>

          {/* Price rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: c.textSec }}>
                Items ({totalItems})
              </span>
              <span style={{ color: c.text, fontWeight: 600 }}>
                ₹{totalMrp.toLocaleString()}
              </span>
            </div>

            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: c.textSec }}>Discount</span>
                <span style={{ color: c.success, fontWeight: 700 }}>
                  − ₹{discount.toLocaleString()}
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: c.textSec, display: "flex", alignItems: "center", gap: 4 }}>
                <LocalShippingIcon sx={{ fontSize: 14 }} /> Delivery
              </span>
              <span style={{
                color: shipping === 0 ? c.success : c.text,
                fontWeight: 700,
              }}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>
          </div>

          <Divider sx={{ my: 1.5, borderColor: c.border }} />

          {/* Total */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>
              Total to Pay
            </span>
            <span style={{ fontSize: 26, fontWeight: 900, color: c.success }}>
              ₹{finalTotal.toLocaleString()}
            </span>
          </div>

          {discount > 0 && (
            <div style={{
              padding: "8px 12px",
              background: c.successBg,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 12,
              color: c.success,
              fontWeight: 700,
              textAlign: "center",
              border: `1px solid ${isDark ? "rgba(16,185,129,0.2)" : "#bbf7d0"}`,
            }}>
              🎉 You save ₹{discount.toLocaleString()} on this order!
            </div>
          )}

          {/* Delivery address mini preview */}
          {selectedAddr && (
            <div style={{
              padding: "10px 12px",
              background: c.bgInner,
              borderRadius: 8,
              marginBottom: 14,
              border: `1px solid ${c.border}`,
              fontSize: 11,
            }}>
              <p style={{ color: c.textMute, margin: "0 0 2px", fontWeight: 700, letterSpacing: 0.5 }}>
                DELIVERING TO
              </p>
              <p style={{ color: c.text, margin: "0 0 2px", fontWeight: 600 }}>
                {selectedAddr.name}
              </p>
              <p style={{ color: c.textSec, margin: 0, lineHeight: 1.5 }}>
                {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pinCode}
              </p>
            </div>
          )}

          {/* Place Order button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={processing}
            variant="contained"
            fullWidth
            startIcon={
              processing
                ? undefined
                : method === "COD"
                  ? <LocalShippingIcon />
                  : <LockIcon />
            }
            sx={{
              py: 1.6,
              fontSize: 14,
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 3,
              background: method === "COD"
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: method === "COD"
                ? "0 6px 20px rgba(245,158,11,0.4)"
                : "0 6px 20px rgba(16,185,129,0.4)",
              "&:hover": {
                background: method === "COD"
                  ? "linear-gradient(135deg, #d97706, #b45309)"
                  : "linear-gradient(135deg, #059669, #047857)",
              },
              "&.Mui-disabled": {
                background: isDark ? "#1f1f2e" : "#e5e7eb",
              },
            }}
          >
            {processing
              ? <><CircularProgress size={18} sx={{ color: "#fff", mr: 1 }} /> Processing...</>
              : method === "COD"
                ? "Place COD Order"
                : "Pay Securely Now"}
          </Button>

          <Button
            onClick={onBack}
            disabled={processing}
            fullWidth
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{
              mt: 1,
              py: 1,
              color: c.textMute,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Back to review
          </Button>

          <p style={{
            fontSize: 10,
            color: c.textMute,
            textAlign: "center",
            margin: "10px 0 0",
            lineHeight: 1.6,
          }}>
            <LockIcon sx={{ fontSize: 10, mr: 0.3 }} />
            Payments are 100% secure & encrypted
          </p>
        </div>
      </div>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.type} onClose={() => setToast({ ...toast, open: false })}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Step3Payment;