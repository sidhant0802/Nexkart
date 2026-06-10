import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import HomeIcon from "@mui/icons-material/Home";
import { useTheme } from "../../../routes/CustomerRoutes";
import { useAppDispatch } from "../../../Redux Toolkit/Store";
import { fetchUserCart } from "../../../Redux Toolkit/Customer/CartSlice";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();

  const orderId = params.get("orderId");
  const method  = params.get("method") || "RAZORPAY";

  const [confetti, setConfetti] = useState<any[]>([]);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) dispatch(fetchUserCart(jwt));

    // Generate confetti
    const c = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotate: Math.random() * 360,
      color: ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"][Math.floor(Math.random() * 5)],
    }));
    setConfetti(c);
  }, []);

  const c = {
    text:    isDark ? "#f1f5f9" : "#0f172a",
    textSec: isDark ? "#cbd5e1" : "#475569",
    textMute:isDark ? "#94a3b8" : "#64748b",
    bg:      isDark ? "#0a0a0f" : "#f9fafb",
    bgCard:  isDark ? "#13131a" : "#ffffff",
    border:  isDark ? "#1f1f2e" : "#e5e7eb",
    success: "#10b981",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: c.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Confetti */}
      {confetti.map((p, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", rotate: p.rotate * 4, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          style={{
            position: "absolute",
            width: 10, height: 10,
            background: p.color,
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        style={{
          background: c.bgCard,
          borderRadius: 24,
          padding: 40,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          border: `1px solid ${c.border}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          style={{
            width: 100, height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 10px 40px rgba(16,185,129,0.5)",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: "#fff" }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 28, fontWeight: 900, color: c.text,
            margin: "0 0 8px", letterSpacing: "-0.5px",
          }}
        >
          Order Placed! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: 14, color: c.textSec,
            margin: "0 0 24px", lineHeight: 1.6,
          }}
        >
          {method === "COD"
            ? "Your order is confirmed. Pay when it arrives at your doorstep."
            : "Payment successful! Your order is being prepared."}
        </motion.p>

        {orderId && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              padding: "12px 18px",
              background: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
              border: `1px solid ${isDark ? "rgba(16,185,129,0.3)" : "#bbf7d0"}`,
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <p style={{ fontSize: 11, color: c.textMute, margin: 0, letterSpacing: 1 }}>
              ORDER ID
            </p>
            <p style={{
              fontSize: 13, fontWeight: 700, color: c.success,
              margin: "4px 0 0", fontFamily: "monospace",
            }}>
              #{orderId.substring(0, 12).toUpperCase()}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ display: "flex", gap: 10 }}
        >
          <Button
            onClick={() => navigate("/account/orders")}
            variant="contained"
            fullWidth
            startIcon={<ShoppingBagIcon />}
            sx={{
              py: 1.3,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              "&:hover": { background: "linear-gradient(135deg, #4f46e5, #7c3aed)" },
            }}
          >
            Track Order
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outlined"
            fullWidth
            startIcon={<HomeIcon />}
            sx={{
              py: 1.3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Continue Shopping
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;