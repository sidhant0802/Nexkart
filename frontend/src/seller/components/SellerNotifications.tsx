import * as React from "react";
import { toast } from "react-hot-toast";
import { useAppSelector } from "../../Redux Toolkit/Store";
import { useSocket, useJoinSellerRoom } from "../../hooks/useSocket";

export default function SellerNotifications() {
  const sellerProfile = useAppSelector((s) => s.sellers.profile);

  // ✅ Join seller's private room
  useJoinSellerRoom(sellerProfile?._id);

  // ── New Order Notification ──
  useSocket("notification:new-order", (data) => {
    console.log("📦 New order:", data);

    toast.custom((t) => (
      <div
        style={{
          padding:      "14px 18px",
          borderRadius: "12px",
          background:   "linear-gradient(135deg,#10b981,#06b6d4)",
          color:        "#fff",
          minWidth:     "300px",
          boxShadow:    "0 10px 32px rgba(16,185,129,0.4)",
          display:      "flex",
          gap:          "12px",
          alignItems:   "flex-start",
          opacity:      t.visible ? 1 : 0,
          transition:   "all .2s",
        }}
      >
        <div style={{ fontSize: "28px" }}>📦</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "14px", fontWeight: 800, margin: "0 0 4px" }}>
            New Order Received!
          </p>
          <p style={{ fontSize: "12px", margin: "0 0 2px", opacity: 0.9 }}>
            Order #{String(data.orderId).slice(-6).toUpperCase()}
          </p>
          <p style={{ fontSize: "13px", fontWeight: 700, margin: 0 }}>
            {data.items} items • ₹{data.total?.toLocaleString("en-IN")}
          </p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border:     "none",
            color:      "#fff",
            cursor:     "pointer",
            width:      "24px",
            height:     "24px",
            borderRadius: "6px",
            fontSize:   "14px",
          }}
        >
          ✕
        </button>
      </div>
    ), { duration: 8000 });

    // Sound
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRl4DAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToDAACBgIB/gn6Cf4F/gn+Bf4F/gn+Bf4F/gn+Bf4F/gn+Bf4F/gX+B");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch {}

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification("📦 New Order!", {
        body: `${data.items} items - ₹${data.total}`,
        icon: "/favicon.ico",
      });
    }
  });

  // ── Low Stock Warning ──
  useSocket("notification:low-stock", (data) => {
    toast(
      `⚠️ Low stock: ${data.productName} (${data.quantity} left)`,
      {
        icon: "⚠️",
        style: {
          background: "#f59e0b",
          color:      "#fff",
        },
        duration: 6000,
      }
    );
  });

  // ── New Review ──
  useSocket("notification:new-review", (data) => {
    toast(
      `⭐ New ${data.rating}-star review on ${data.productName}`,
      {
        icon: "⭐",
        style: {
          background: "#fef3c7",
          color:      "#92400e",
        },
        duration: 5000,
      }
    );
  });

  // Request notification permission
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return null; // This component only listens, no UI
}