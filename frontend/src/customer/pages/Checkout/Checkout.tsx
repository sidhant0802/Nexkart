import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Stepper, Step, StepLabel, CircularProgress, Alert } from "@mui/material";
import LocationOnIcon  from "@mui/icons-material/LocationOn";
import ReceiptIcon     from "@mui/icons-material/Receipt";
import PaymentIcon     from "@mui/icons-material/Payment";
import { useTheme } from "../../../routes/CustomerRoutes";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { resetCheckout } from "../../../Redux Toolkit/Customer/CheckoutSlice";
import { fetchUserProfile } from "../../../Redux Toolkit/Customer/UserSlice";
import { fetchUserCart } from "../../../Redux Toolkit/Customer/CartSlice";
import Step1Address from "./Step1Address";
import Step2Review  from "./Step2Review";
import Step3Payment from "./Step3Payment";

export interface CheckoutData {
  mode:           "buyNow" | "cart";
  // For buyNow:
  listingId?:     string;
  quantity?:      number;
  productTitle?:  string;
  productImage?:  string;
  sellerId?:      string;
  sellingPrice?:  number;
  mrpPrice?:      number;
}

const Checkout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useAppDispatch();
  const { isDark } = useTheme();

  const user = useAppSelector((s) => s.user);
  const cart = useAppSelector((s) => s.cart);

  // ── Determine mode from location.state OR fall back to cart ──
  const stateData = location.state as CheckoutData | null;
  const mode: "buyNow" | "cart" = stateData?.mode || "cart";

  const [activeStep,    setActiveStep]    = useState(0);
  const [selectedAddr,  setSelectedAddr]  = useState<any>(null);
  const [pageLoading,   setPageLoading]   = useState(true);

  // ── Theme colors ──
  const c = {
    text:     isDark ? "#f1f5f9" : "#0f172a",
    textSec:  isDark ? "#cbd5e1" : "#475569",
    textMute: isDark ? "#94a3b8" : "#64748b",
    bg:       isDark ? "#0a0a0f" : "#f9fafb",
    bgCard:   isDark ? "#13131a" : "#ffffff",
    border:   isDark ? "#1f1f2e" : "#e5e7eb",
    accent:   "#6366f1",
    success:  "#10b981",
  };

  // ── Load user profile + cart on mount ──
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      navigate("/login");
      return;
    }

    dispatch(resetCheckout());
    dispatch(fetchUserProfile({ jwt, navigate }))
      .unwrap()
      .then(() => {
        if (mode === "cart") {
          dispatch(fetchUserCart(jwt));
        }
        setPageLoading(false);
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  // ── Validate cart has items if cart mode ──
  useEffect(() => {
    if (pageLoading) return;
    if (mode === "cart" && (!cart?.cart?.cartItems || cart.cart.cartItems.length === 0)) {
      // Cart is empty — bounce back
      // setTimeout to allow redux to settle
      setTimeout(() => {
        if (!cart?.cart?.cartItems || cart.cart.cartItems.length === 0) {
          navigate("/cart");
        }
      }, 1500);
    }
  }, [cart?.cart?.cartItems?.length, pageLoading]);

  const steps = [
    { label: "Address", icon: <LocationOnIcon /> },
    { label: "Review",  icon: <ReceiptIcon /> },
    { label: "Payment", icon: <PaymentIcon /> },
  ];

  if (pageLoading) {
    return (
      <div style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: c.bg,
      }}>
        <CircularProgress sx={{ color: c.accent }} />
      </div>
    );
  }

  return (
    <div style={{ background: c.bg, minHeight: "100vh", padding: "20px 16px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 24 }}
        >
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: c.text,
            margin: 0, letterSpacing: "-0.5px",
          }}>
            {mode === "buyNow" ? "⚡ Quick Checkout" : "🛒 Checkout"}
          </h1>
          <p style={{ fontSize: 13, color: c.textMute, margin: "4px 0 0" }}>
            {mode === "buyNow"
              ? "Complete your purchase in 3 quick steps"
              : `Checking out ${cart?.cart?.cartItems?.length || 0} items from your cart`}
          </p>
        </motion.div>

        {/* ── Stepper ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: c.bgCard,
            borderRadius: 16,
            padding: "20px 24px",
            border: `1px solid ${c.border}`,
            marginBottom: 20,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((s, i) => (
              <Step key={s.label} completed={activeStep > i}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active":    { color: c.accent + " !important" },
                      "&.Mui-completed": { color: c.success + " !important" },
                      color: isDark ? "#374151 !important" : "#cbd5e1 !important",
                    },
                  }}
                  sx={{
                    "& .MuiStepLabel-label": {
                      color: c.textSec + " !important",
                      fontWeight: 600,
                      fontSize: 13,
                    },
                    "& .Mui-active .MuiStepLabel-label": {
                      color: c.text + " !important",
                      fontWeight: 800,
                    },
                  }}
                >
                  {s.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </motion.div>

        {/* ── Step content ── */}
        <AnimatePresence mode="wait">
          {activeStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Step1Address
                user={user.user}
                selectedAddr={selectedAddr}
                setSelectedAddr={setSelectedAddr}
                onNext={() => setActiveStep(1)}
              />
            </motion.div>
          )}

          {activeStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Step2Review
                mode={mode}
                checkoutData={stateData}
                cart={cart?.cart}
                selectedAddr={selectedAddr}
                onBack={() => setActiveStep(0)}
                onNext={() => setActiveStep(2)}
              />
            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Step3Payment
                mode={mode}
                checkoutData={stateData}
                cart={cart?.cart}
                selectedAddr={selectedAddr}
                user={user.user}
                onBack={() => setActiveStep(1)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Checkout;