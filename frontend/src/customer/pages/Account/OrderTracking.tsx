import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CircularProgress, Button, Chip } from "@mui/material";
import {
  Package, Truck, MapPin, CheckCircle, Clock,
  Phone, ArrowLeft, Calendar, ShoppingBag,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchTracking } from "../../../Redux Toolkit/Customer/TrackingSlice";
import { fetchOrderById } from "../../../Redux Toolkit/Customer/OrderSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

const STEPS = [
  { key: "ORDER_PLACED",     label: "Order Placed",     icon: ShoppingBag, color: "#a78bfa" },
  { key: "CONFIRMED",        label: "Confirmed",        icon: CheckCircle, color: "#06b6d4" },
  { key: "PACKED",           label: "Packed",           icon: Package,     color: "#f59e0b" },
  { key: "SHIPPED",          label: "Shipped",          icon: Truck,       color: "#3b82f6" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck,       color: "#8b5cf6" },
  { key: "DELIVERED",        label: "Delivered",        icon: CheckCircle, color: "#10b981" },
];

const getStepIndex = (status: string) => {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate    = useNavigate();
  const dispatch    = useAppDispatch();
  const { isDark }  = useTheme();

  const { tracking, loading } = useAppSelector((s) => s.tracking);
  const { currentOrder }      = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (!orderId) return;
    dispatch(fetchTracking(orderId));
    dispatch(fetchOrderById({ orderId, jwt: localStorage.getItem("jwt") || "" }));
  }, [orderId]);

  const c = {
    bg:       isDark ? "#0a0a0f" : "#f9fafb",
    bgCard:   isDark ? "#13131a" : "#ffffff",
    bgInner:  isDark ? "#1a1a24" : "#f9fafb",
    border:   isDark ? "#1f1f2e" : "#e5e7eb",
    text:     isDark ? "#f1f5f9" : "#0f172a",
    textSec:  isDark ? "#cbd5e1" : "#475569",
    textMute: isDark ? "#94a3b8" : "#64748b",
    accent:   "#6366f1",
    success:  "#10b981",
  };

  if (loading || !tracking) {
    return (
      <div style={{
        minHeight: "70vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: c.bg,
      }}>
        <CircularProgress sx={{ color: c.accent }} />
      </div>
    );
  }

  const currentStepIdx = getStepIndex(tracking.currentStatus);
  const isCancelled    = tracking.currentStatus === "CANCELLED";
  const orderItem      = currentOrder?.orderItems?.[0];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", padding: "20px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none",
            color: c.textMute, cursor: "pointer", fontSize: 13,
            marginBottom: 16, fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to orders
        </button>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: c.bgCard,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${c.border}`,
            marginBottom: 16,
          }}
        >
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 11, color: c.textMute, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
                ORDER #{orderId?.slice(-8).toUpperCase()}
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: "6px 0 4px" }}>
                {isCancelled ? "❌ Order Cancelled" : "📦 Track Your Order"}
              </h1>
              <p style={{ fontSize: 13, color: c.textSec, margin: 0 }}>
                {tracking.currentLocation}
              </p>
            </div>

            {!isCancelled && (
              <div style={{
                padding: "10px 16px",
                background: `${c.success}15`,
                border: `1px solid ${c.success}30`,
                borderRadius: 10,
                textAlign: "right",
              }}>
                <p style={{ fontSize: 10, color: c.textMute, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
                  ESTIMATED DELIVERY
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: c.success, margin: "2px 0 0" }}>
                  {formatDate(tracking.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>

          {/* Tracking number */}
          <div style={{
            marginTop: 16, padding: 12,
            background: c.bgInner, borderRadius: 10,
            border: `1px solid ${c.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 8,
          }}>
            <div>
              <p style={{ fontSize: 10, color: c.textMute, margin: 0, fontWeight: 700 }}>
                TRACKING NUMBER
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: "2px 0 0", fontFamily: "monospace" }}>
                {tracking.trackingNumber}
              </p>
            </div>
            <Chip
              label={tracking.carrier}
              size="small"
              icon={<Truck size={12} />}
              sx={{
                background: `${c.accent}15`,
                color: c.accent,
                fontWeight: 700,
                "& .MuiChip-icon": { color: c.accent },
              }}
            />
          </div>
        </motion.div>

        {/* Progress steps */}
        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: c.bgCard,
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${c.border}`,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 24px" }}>
              📍 Delivery Progress
            </h2>

            <div style={{ position: "relative" }}>
              {/* Progress bar */}
              <div style={{
                position: "absolute",
                top: 24, left: 24, right: 24,
                height: 3,
                background: c.border,
                borderRadius: 2,
                zIndex: 0,
              }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${c.success}, ${c.accent})`,
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* Steps */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 1,
              }}>
                {STEPS.map((step, idx) => {
                  const isDone   = idx <= currentStepIdx;
                  const isActive = idx === currentStepIdx;
                  const Icon     = step.icon;

                  return (
                    <motion.div
                      key={step.key}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        flex: 1,
                      }}
                    >
                      <div style={{
                        width: 48, height: 48,
                        borderRadius: "50%",
                        background: isDone
                          ? `linear-gradient(135deg, ${step.color}, ${step.color}cc)`
                          : c.bgInner,
                        border: `2px solid ${isDone ? step.color : c.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isDone ? "#fff" : c.textMute,
                        boxShadow: isActive ? `0 0 20px ${step.color}80` : "none",
                        animation: isActive ? "pulse 2s infinite" : undefined,
                      }}>
                        <Icon size={20} />
                      </div>
                      <p style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isDone ? c.text : c.textMute,
                        margin: 0,
                        textAlign: "center",
                        maxWidth: 70,
                      }}>
                        {step.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <style>{`@keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.1) } }`}</style>
          </motion.div>
        )}

     {/* Route visualization */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
  style={{
    background: c.bgCard,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${c.border}`,
    marginBottom: 16,
  }}
>
  <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 20px" }}>
    🗺️ Shipment Route
  </h2>

  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    {/* Pickup */}
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: `${c.accent}15`,
        border: `2px solid ${c.accent}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}>
        <MapPin size={22} style={{ color: c.accent }} />
      </div>
      <p style={{ fontSize: 10, color: c.textMute, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
        FROM SELLER
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: "4px 0 0" }}>
        {tracking.pickupLocation?.city && tracking.pickupLocation.city !== "—"
          ? tracking.pickupLocation.city
          : "Seller Warehouse"}
      </p>
      <p style={{ fontSize: 11, color: c.textSec, margin: "2px 0 0" }}>
        {tracking.pickupLocation?.state && tracking.pickupLocation.state !== "—"
          ? tracking.pickupLocation.state
          : ""}
      </p>
      {tracking.pickupLocation?.pinCode && tracking.pickupLocation.pinCode !== "—" && (
        <p style={{ fontSize: 10, color: c.textMute, margin: "2px 0 0" }}>
          PIN: {tracking.pickupLocation.pinCode}
        </p>
      )}
    </div>

    {/* Truck + transit days */}
    <div style={{ flex: 1, position: "relative", height: 80 }}>
      <div style={{
        position: "absolute", top: "50%",
        left: 0, right: 0,
        borderTop: `2px dashed ${c.border}`,
      }} />
      <motion.div
        animate={{ x: [0, 80, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "30%",
          left: "30%",
          transform: "translateY(-50%)",
        }}
      >
        <div style={{
          width: 40, height: 40,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${c.accent}, #8b5cf6)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 14px ${c.accent}60`,
        }}>
          <Truck size={20} color="#fff" />
        </div>
      </motion.div>
      
      {/* ✅ Transit estimate */}
      <p style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        textAlign: "center",
        fontSize: 10,
        color: c.textMute,
        fontWeight: 700,
        margin: 0,
        letterSpacing: 1,
      }}>
        {(() => {
          const eta  = new Date(tracking.estimatedDelivery);
          const days = Math.ceil((eta.getTime() - Date.now()) / (1000*60*60*24));
          if (tracking.currentStatus === "DELIVERED") return "✅ DELIVERED";
          if (days <= 0)  return "ARRIVING TODAY";
          if (days === 1) return "ARRIVING TOMORROW";
          return `${days} DAYS REMAINING`;
        })()}
      </p>
    </div>

    {/* Delivery */}
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: `${c.success}15`,
        border: `2px solid ${c.success}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}>
        <Package size={22} style={{ color: c.success }} />
      </div>
      <p style={{ fontSize: 10, color: c.textMute, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
        TO YOU
      </p>
      <p style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: "4px 0 0" }}>
        {currentOrder?.shippingAddress?.city || "Your City"}
      </p>
      <p style={{ fontSize: 11, color: c.textSec, margin: "2px 0 0" }}>
        {currentOrder?.shippingAddress?.state || ""}
      </p>
      {(currentOrder?.shippingAddress as any)?.pinCode && (
        <p style={{ fontSize: 10, color: c.textMute, margin: "2px 0 0" }}>
          PIN: {(currentOrder.shippingAddress as any).pinCode}
        </p>
      )}
    </div>
  </div>
</motion.div>

        {/* Timeline events */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: c.bgCard,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${c.border}`,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 20px" }}>
            🕒 Activity Timeline
          </h2>

          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div style={{
              position: "absolute",
              left: 10, top: 6, bottom: 6,
              width: 2,
              background: c.border,
            }} />

            {[...tracking.events].reverse().map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  position: "relative",
                  paddingBottom: i === tracking.events.length - 1 ? 0 : 20,
                }}
              >
                <div style={{
                  position: "absolute",
                  left: -23, top: 3,
                  width: 14, height: 14,
                  borderRadius: "50%",
                  background: i === 0 ? c.success : c.accent,
                  border: `3px solid ${c.bgCard}`,
                  boxShadow: i === 0 ? `0 0 10px ${c.success}` : "none",
                }} />

                <p style={{ fontSize: 13, fontWeight: 700, color: c.text, margin: 0 }}>
                  {event.description}
                </p>
                {event.location && (
                  <p style={{ fontSize: 11, color: c.textSec, margin: "2px 0" }}>
                    📍 {event.location}
                  </p>
                )}
                <p style={{ fontSize: 11, color: c.textMute, margin: "2px 0 0" }}>
                  {formatDate(event.timestamp)} • {formatTime(event.timestamp)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Order summary */}
        {orderItem && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: c.bgCard,
              borderRadius: 16,
              padding: 20,
              border: `1px solid ${c.border}`,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 16px" }}>
              📦 Order Details
            </h2>

            <div style={{ display: "flex", gap: 14 }}>
              <img loading="lazy" decoding="async"
                src={(orderItem as any).product?.images?.[0]}
                alt=""
                style={{
                  width: 72, height: 72,
                  borderRadius: 10, objectFit: "cover",
                  background: c.bgInner, padding: 4,
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>
                  {(orderItem as any).product?.title}
                </p>
                <p style={{ fontSize: 12, color: c.textMute, margin: "4px 0" }}>
                  Qty: {(orderItem as any).quantity} • Size: {(orderItem as any).size}
                </p>
                <p style={{ fontSize: 16, fontWeight: 800, color: c.success, margin: "4px 0 0" }}>
                  ₹{((orderItem as any).sellingPrice * (orderItem as any).quantity).toLocaleString()}
                </p>
              </div>
            </div>

            {currentOrder?.shippingAddress && (
              <div style={{
                marginTop: 14, padding: 12,
                background: c.bgInner, borderRadius: 10,
                border: `1px solid ${c.border}`,
              }}>
                <p style={{ fontSize: 10, color: c.textMute, margin: 0, fontWeight: 700, letterSpacing: 1 }}>
                  DELIVERING TO
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: c.text, margin: "4px 0 2px" }}>
                  {(currentOrder.shippingAddress as any).name}
                </p>
                <p style={{ fontSize: 11, color: c.textSec, margin: 0 }}>
                  {(currentOrder.shippingAddress as any).address}, {(currentOrder.shippingAddress as any).city} - {(currentOrder.shippingAddress as any).pinCode}
                </p>
                <p style={{ fontSize: 11, color: c.textMute, margin: "4px 0 0" }}>
                  📞 {(currentOrder.shippingAddress as any).mobile}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;