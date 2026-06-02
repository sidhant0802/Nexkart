// frontend/src/customer/pages/BecomeSeller/BecomeSeller.tsx
import { useEffect, useState } from "react";
import { Alert, Snackbar, Avatar } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useTheme } from "../../../routes/CustomerRoutes";
import { clearSellerAuthMessage } from "../../../Redux Toolkit/Seller/sellerAuthenticationSlice";
import SellerAccountForm from "./SellerAccountForm";
import SellerLoginForm   from "./SellerLoginForm";
import StorefrontIcon         from "@mui/icons-material/Storefront";
import RocketLaunchIcon       from "@mui/icons-material/RocketLaunch";
import TrendingUpIcon         from "@mui/icons-material/TrendingUp";
import VerifiedUserIcon       from "@mui/icons-material/VerifiedUser";
import PaymentsIcon           from "@mui/icons-material/Payments";
import LogoutIcon             from "@mui/icons-material/Logout";

const BecomeSeller = () => {
  const dispatch        = useAppDispatch();
  const navigate        = useNavigate();
  const { isDark }      = useTheme();
  const sellerAuth      = useAppSelector((s) => s.sellerAuth);
  const user            = useAppSelector((s) => s.user.user);
  const sellerProfile   = useAppSelector((s) => s.sellers.profile);

  const isLoggedIn      = !!user;
  const isAlreadySeller = !!sellerProfile;

  const [isLoginPage,  setIsLoginPage]  = useState(!isLoggedIn); // logged in → register tab
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // ── Theme colors ──
  const c = {
    bg:         isDark ? "#0a0a0f"               : "#ffffff",
    bgCard:     isDark ? "#13131a"               : "#ffffff",
    bgSection:  isDark ? "#0d0d12"               : "#f8fafc",
    text:       isDark ? "#f1f5f9"               : "#0f172a",
    textMuted:  isDark ? "#94a3b8"               : "#64748b",
    border:     isDark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.08)",
    accent:     "#6366f1",
    accentText: isDark ? "#a5b4fc"               : "#4f46e5",
  };

  useEffect(() => {
    if (sellerAuth.sellerCreated || sellerAuth.error || sellerAuth.otpSent) {
      setSnackbarOpen(true);
    }
  }, [sellerAuth.sellerCreated, sellerAuth.error, sellerAuth.otpSent]);

  // ✅ Auto-redirect if already a seller
  useEffect(() => {
    if (isAlreadySeller) {
      navigate("/seller");
    }
  }, [isAlreadySeller, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    dispatch(clearSellerAuthMessage());
  };

  const benefits = [
    { icon: <RocketLaunchIcon />, title: "Quick Onboarding", desc: "Start selling in 5 minutes" },
    { icon: <TrendingUpIcon />,   title: "Millions of Buyers", desc: "Reach customers nationwide" },
    { icon: <PaymentsIcon />,     title: "Fast Payouts",       desc: "Get paid within 7 days" },
    { icon: <VerifiedUserIcon />, title: "Trusted Platform",   desc: "Secure & verified" },
  ];

  return (
    <div style={{ background: c.bg, minHeight: "100vh", color: c.text }}>
      <div className="grid lg:grid-cols-5 min-h-screen">

        {/* ═══════ LEFT — Hero ═══════ */}
        <section
          className="hidden lg:flex lg:col-span-3 flex-col justify-center p-12 relative overflow-hidden"
          style={{ background: c.bgSection }}
        >
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
          />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 font-bold text-xs tracking-wider uppercase"
              style={{
                background: "rgba(99,102,241,0.1)",
                color:      c.accentText,
                border:     `1px solid rgba(99,102,241,0.2)`,
              }}
            >
              <StorefrontIcon sx={{ fontSize: 14 }} />
              Sell on Nexkart
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black leading-tight mb-4"
              style={{ color: c.text }}
            >
              Start Selling Today.<br />
              <span
                style={{
                  background:           "linear-gradient(135deg, #6366f1, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                }}
              >
                Grow Your Business.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg mb-10"
              style={{ color: c.textMuted }}
            >
              Join thousands of sellers earning more on India's fastest growing
              marketplace. Zero setup fees. Easy onboarding.
            </motion.p>

            <div className="grid grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-2xl border"
                  style={{ background: c.bgCard, borderColor: c.border }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #a855f7)",
                      color:      "#fff",
                    }}
                  >
                    {b.icon}
                  </div>
                  <p className="font-bold mb-1" style={{ color: c.text }}>{b.title}</p>
                  <p className="text-sm" style={{ color: c.textMuted }}>{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ RIGHT — Form ═══════ */}
        <section className="lg:col-span-2 flex flex-col justify-center p-6 lg:p-10">
          <div className="w-full max-w-md mx-auto">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  color:      "#fff",
                }}
              >
                <StorefrontIcon />
              </div>
              <span className="font-black text-xl" style={{ color: c.text }}>
                Nexkart Seller
              </span>
            </div>

            {/* ✅ Logged-in user banner */}
            {isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl mb-6 border"
                style={{
                  background:  "rgba(99,102,241,0.06)",
                  borderColor: "rgba(99,102,241,0.2)",
                }}
              >
                <Avatar
                  sx={{
                    width:      40,
                    height:     40,
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    fontSize:   16,
                    fontWeight: 700,
                  }}
                >
                  {(user?.fullName || user?.email || "U")[0].toUpperCase()}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: c.textMuted }}>
                    Logged in as
                  </p>
                  <p className="text-sm font-bold truncate" style={{ color: c.text }}>
                    {user?.fullName || user?.email}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ color: c.textMuted }}
                  title="Go home"
                >
                  <LogoutIcon sx={{ fontSize: 14 }} />
                </button>
              </motion.div>
            )}

            {/* Tab toggle (only show if NOT logged in) */}
            {!isLoggedIn && (
              <div
                className="grid grid-cols-2 p-1 rounded-2xl mb-6"
                style={{ background: c.bgSection, border: `1px solid ${c.border}` }}
              >
                {["login", "register"].map((tab, i) => {
                  const active = (tab === "login" && isLoginPage) || (tab === "register" && !isLoginPage);
                  return (
                    <button
                      key={tab}
                      onClick={() => setIsLoginPage(i === 0)}
                      className="py-2.5 rounded-xl font-bold text-sm capitalize transition-all"
                      style={{
                        background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                        color:      active ? "#fff" : c.textMuted,
                        boxShadow:  active ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLoginPage && !isLoggedIn ? "login" : "register"}
                initial={{ opacity: 0, x: isLoginPage ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: isLoginPage ?  20 : -20 }}
                transition={{ duration: 0.25 }}
              >
                {isLoginPage && !isLoggedIn
                  ? <SellerLoginForm />
                  : <SellerAccountForm prefillUser={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={sellerAuth.error ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {sellerAuth.error || sellerAuth.sellerCreated || "OTP sent to your email!"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default BecomeSeller;