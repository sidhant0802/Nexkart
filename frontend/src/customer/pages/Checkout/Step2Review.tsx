import { Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useTheme } from "../../../routes/CustomerRoutes";
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

  const c = {
    text:    isDark ? "#f1f5f9" : "#0f172a",
    textSec: isDark ? "#cbd5e1" : "#475569",
    textMute:isDark ? "#94a3b8" : "#64748b",
    bgCard:  isDark ? "#13131a" : "#ffffff",
    bgInner: isDark ? "#1a1a24" : "#f9fafb",
    border:  isDark ? "#1f1f2e" : "#e5e7eb",
    accent:  "#6366f1",
    success: "#10b981",
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

  const discount = totalMrp - totalSelling;
  const shipping = totalSelling >= 499 ? 0 : 49;
  const finalTotal = totalSelling + shipping;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

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

      {/* ── RIGHT: Price breakdown ── */}
      <div>
        <div style={{
          background: c.bgCard,
          borderRadius: 16,
          padding: 20,
          border: `1px solid ${c.border}`,
          position: "sticky",
          top: 20,
        }}>
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
                <span style={{ color: c.textSec }}>Discount</span>
                <span style={{ color: c.success, fontWeight: 700 }}>− ₹{discount.toLocaleString()}</span>
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

          {discount > 0 && (
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
              🎉 You'll save ₹{discount.toLocaleString()} on this order!
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