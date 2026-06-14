import { useEffect, useState } from "react";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, X, CheckCircle, AlertCircle,
  Sparkles, ShoppingBag, Shield, Truck, Star, Award,
} from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const Auth = () => {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false, message: "", type: "success",
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const auth = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  useEffect(() => {
    if (localStorage.getItem("jwt") || auth?.jwt) {
      navigate(from, { replace: true });
    }
  }, [auth?.jwt]);

  useEffect(() => {
    if (auth.otpSent) setSnackbar({ open: true, message: "✉️ OTP sent! Check your inbox.", type: "success" });
  }, [auth.otpSent]);

  useEffect(() => {
    if (auth.error) setSnackbar({ open: true, message: auth.error, type: "error" });
  }, [auth.error]);

  useEffect(() => {
    if (snackbar.open) {
      const t = setTimeout(() => setSnackbar((p) => ({ ...p, open: false })), 5000);
      return () => clearTimeout(t);
    }
  }, [snackbar.open]);

  // ✅ Mouse tracking for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((clientX - left) / width - 0.5) * 20,
      y: ((clientY - top) / height - 0.5) * 20,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#040408]" onMouseMove={handleMouseMove}>

      {/* ═══════════════════════════════════════════════════════
          ANIMATED BACKGROUND — Gradient Mesh + Particles
      ═══════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Animated gradient blobs */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -80, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, -120, 0], y: [0, 100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-32 w-[700px] h-[700px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [-20, -window.innerHeight - 20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              boxShadow: "0 0 6px rgba(167, 139, 250, 0.5)",
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 min-h-screen flex">

        {/* ═══════════ LEFT — Animated Showcase ═══════════ */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">

          {/* Logo */}
                   <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <img 
              src="/logo.png" 
              alt="Nexkart" 
              className="h-16 w-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Center Content */}
          <div className="space-y-10">
            {/* Animated heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                <Sparkles size={12} className="text-purple-400" />
                <span className="text-purple-300 text-xs font-semibold">India's #1 Shopping Hub</span>
              </motion.div>

              <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-5">
                Shop Smarter,
                <br />
                <motion.span
                  className="inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #818cf8 100%)",
                    backgroundSize: "200% 200%",
                  }}
                  animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  Live Better.
                </motion.span>
              </h1>

              <p className="text-white/50 text-base leading-relaxed max-w-md">
                Join millions of happy shoppers. Discover unbeatable deals, fastest delivery, and a seamless shopping experience.
              </p>
            </motion.div>

            {/* Floating Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShoppingBag, num: "50K+", label: "Products", color: "#a78bfa" },
                { icon: Shield,      num: "100%",  label: "Secure",   color: "#22c55e" },
                { icon: Truck,       num: "Free",  label: "Delivery", color: "#3b82f6" },
                { icon: Award,       num: "4.8★",  label: "Rated",    color: "#f59e0b" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  className="relative p-5 rounded-2xl overflow-hidden cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Glow */}
                  <div
                    className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-30 blur-2xl"
                    style={{ background: s.color }}
                  />
                  <s.icon size={20} style={{ color: s.color }} className="mb-3" />
                  <p className="text-white text-2xl font-black">{s.num}</p>
                  <p className="text-white/40 text-xs mt-0.5 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                  P
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">Priya Sharma</p>
                  <p className="text-white/40 text-xs">Verified Buyer • Mumbai</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed italic">
                "Best shopping experience ever! Lightning-fast delivery and amazing products."
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <p className="text-white/20 text-xs">© 2025 Nexkart Technologies · All rights reserved</p>
        </div>

        {/* ═══════════ RIGHT — Form with 3D Tilt ═══════════ */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 0.3}deg) rotateX(${-mousePos.y * 0.3}deg)`,
              transformStyle: "preserve-3d",
              transition: "transform 0.2s ease-out",
            }}
          >
            {/* Mobile Logo */}
                     <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center mb-8 lg:hidden"
            >
              <img 
                src="/logo.png" 
                alt="Nexkart" 
                className="h-12 w-auto"
              />
            </motion.div>

            {/* Glassmorphism Card */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: "rgba(20, 20, 35, 0.6)",
                backdropFilter: "blur(40px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.05)",
              }}
            >
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, transparent 50%, rgba(236,72,153,0.15) 100%)",
                }}
              />

              {/* ── Tab Header ── */}
              <div className="relative flex p-1.5 m-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {["Login", "Sign Up"].map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setIsLoginPage(i === 0)}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all relative z-10 ${
                      (isLoginPage && i === 0) || (!isLoginPage && i === 1)
                        ? "text-white"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {(isLoginPage && i === 0) || (!isLoginPage && i === 1) ? (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                          boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    ) : null}
                    <span className="relative z-10">{tab}</span>
                  </button>
                ))}
              </div>

              {/* ── Form Content ── */}
              <div className="px-7 pb-7">

                {/* Welcome Heading */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLoginPage ? "login-h" : "signup-h"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="mb-6"
                  >
                    <motion.h2
                      className="text-2xl font-black text-white"
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      {isLoginPage ? (
                        <>Welcome back! <span className="inline-block animate-bounce">👋</span></>
                      ) : (
                        <>Join the family! <span className="inline-block animate-bounce">🎉</span></>
                      )}
                    </motion.h2>
                    <p className="text-white/40 text-sm mt-1.5">
                      {isLoginPage
                        ? "Sign in to continue your shopping journey"
                        : "Create your account in just a few steps"}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLoginPage ? "login" : "signup"}
                    initial={{ opacity: 0, x: isLoginPage ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLoginPage ? 30 : -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoginPage ? <LoginForm from={from} /> : <SignupForm from={from} />}
                  </motion.div>
                </AnimatePresence>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <span className="text-white/30 text-xs font-medium">or</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                {/* Switch */}
                <p className="text-center text-white/40 text-sm">
                  {isLoginPage ? "New to Nexkart?" : "Already have an account?"}{" "}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsLoginPage(!isLoginPage)}
                    className="font-bold inline-flex items-center gap-1"
                    style={{ color: "#a78bfa" }}
                  >
                    {isLoginPage ? "Create account →" : "Sign in →"}
                  </motion.button>
                </p>
              </div>
            </motion.div>

            {/* Terms */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-center text-white/20 text-xs mt-5 leading-relaxed"
            >
              By continuing, you agree to our{" "}
              <span className="text-white/40 hover:text-white cursor-pointer transition-colors">Terms</span> &{" "}
              <span className="text-white/40 hover:text-white cursor-pointer transition-colors">Privacy</span>
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SNACKBAR
      ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl z-50 ${
              snackbar.type === "success"
                ? "bg-green-500/15 border border-green-500/30 text-green-400"
                : "bg-red-500/15 border border-red-500/30 text-red-400"
            }`}
            style={{ backdropFilter: "blur(20px)" }}
          >
            {snackbar.type === "success" ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
            <span className="text-sm font-medium">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar((p) => ({ ...p, open: false }))}
              className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;