import { useEffect, useState } from "react";
import { Button, CircularProgress, TextField, IconButton, InputAdornment } from "@mui/material";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import OTPInput from "../../components/OtpFild/OTPInput";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useTheme } from "../../../routes/CustomerRoutes";
import {
  sendLoginOtp,
  verifyLoginOtp,
  loginWithPassword,
} from "../../../Redux Toolkit/Seller/sellerAuthenticationSlice";
import EmailOutlinedIcon  from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon   from "@mui/icons-material/LockOutlined";
import LoginIcon          from "@mui/icons-material/Login";
import VisibilityIcon     from "@mui/icons-material/Visibility";
import VisibilityOffIcon  from "@mui/icons-material/VisibilityOff";
import KeyIcon            from "@mui/icons-material/Key";
import SmsOutlinedIcon    from "@mui/icons-material/SmsOutlined";
import SendIcon           from "@mui/icons-material/Send";

const SellerLoginForm = () => {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const { isDark } = useTheme();
  const sellerAuth = useAppSelector((s) => s.sellerAuth);

  const [tab, setTab]              = useState<"otp" | "password">("password");
  const [otp, setOtp]              = useState("");
  const [showPwd, setShowPwd]      = useState(false);
  const [timer, setTimer]          = useState(30);
  const [isTimerActive, setActive] = useState(false);

  // ── Theme palette ──
  const c = {
    text:        isDark ? "#f1f5f9"               : "#0f172a",
    textMuted:   isDark ? "#94a3b8"               : "#64748b",
    bgInput:     isDark ? "#1a1a24"               : "#ffffff",
    bgCard:      isDark ? "#13131a"               : "#ffffff",
    bgTab:       isDark ? "#0d0d12"               : "#f1f5f9",
    border:      isDark ? "rgba(255,255,255,0.08)": "rgba(0,0,0,0.08)",
    borderHover: isDark ? "rgba(255,255,255,0.15)": "rgba(0,0,0,0.15)",
    accent:      "#6366f1",
    accentText:  isDark ? "#a5b4fc"               : "#4f46e5",
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      background:   c.bgInput,
      borderRadius: "14px",
      color:        c.text,
      fontSize:     "14px",
      transition:   "all 0.25s",
      "& fieldset":             { borderColor: c.border, borderWidth: "1.5px" },
      "&:hover fieldset":       { borderColor: c.borderHover },
      "&.Mui-focused fieldset": { borderColor: c.accent, borderWidth: 2 },
    },
    "& .MuiInputLabel-root":             { color: c.textMuted, fontSize: "14px" },
    "& .MuiInputLabel-root.Mui-focused": { color: c.accent },
    "& input":                           { color: c.text, padding: "14px 12px" },
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: (values) => {
      if (tab === "password") {
        dispatch(
          loginWithPassword({
            email:    values.email,
            password: values.password,
            navigate,
          })
        );
      } else {
        dispatch(
          verifyLoginOtp({
            email: values.email,
            otp,
            navigate,
          })
        );
      }
    },
  });

  const handleSendOtp = () => {
    if (!formik.values.email) return;
    dispatch(sendLoginOtp(formik.values.email));
    setTimer(30);
    setActive(true);
  };

  useEffect(() => {
    let interval: any;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setActive(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isTimerActive]);

  const handleTabSwitch = (newTab: "otp" | "password") => {
    setTab(newTab);
    setOtp("");
    formik.setFieldValue("password", "");
  };

  const canSubmit =
    !!formik.values.email &&
    ((tab === "password" && !!formik.values.password) ||
      (tab === "otp" && otp.length === 6));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ═══════ Header ═══════ */}
      <div className="mb-6">
        <motion.h2
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black mb-2 leading-tight"
          style={{ color: c.text }}
        >
          Welcome back 👋
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm"
          style={{ color: c.textMuted }}
        >
          Sign in to manage your store
        </motion.p>
      </div>

      {/* ═══════ Tabs ═══════ */}
      <div
        className="grid grid-cols-2 p-1.5 rounded-2xl mb-6 relative"
        style={{
          background: c.bgTab,
          border:     `1px solid ${c.border}`,
        }}
      >
        {/* Sliding indicator */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute top-1.5 bottom-1.5 w-1/2 rounded-xl"
          style={{
            background:  "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow:   "0 4px 14px rgba(99,102,241,0.35)",
            left:        tab === "password" ? "0.375rem" : "calc(50% - 0.375rem)",
            width:       "calc(50% - 0.375rem)",
            transition:  "left 0.3s cubic-bezier(.4,0,.2,1)",
          }}
        />

        <button
          type="button"
          onClick={() => handleTabSwitch("password")}
          className="relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors"
          style={{ color: tab === "password" ? "#fff" : c.textMuted }}
        >
          <KeyIcon sx={{ fontSize: 16 }} />
          Password
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("otp")}
          className="relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors"
          style={{ color: tab === "otp" ? "#fff" : c.textMuted }}
        >
          <SmsOutlinedIcon sx={{ fontSize: 16 }} />
          OTP
        </button>
      </div>

      {/* ═══════ Form ═══════ */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit();
        }}
      >
        {/* Email */}
        <TextField
          fullWidth
          name="email"
          type="email"
          label="Email Address"
          placeholder="seller@example.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {/* ═══════ Password tab ═══════ */}
        <AnimatePresence mode="wait">
          {tab === "password" && (
            <motion.div
              key="pwd"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{   opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
            >
              <TextField
                fullWidth
                name="password"
                type={showPwd ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: c.textMuted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd(!showPwd)}
                        edge="end"
                        sx={{ color: c.textMuted }}
                        size="small"
                      >
                        {showPwd
                          ? <VisibilityOffIcon sx={{ fontSize: 20 }} />
                          : <VisibilityIcon    sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Forgot password */}
              <p
                className="text-xs text-right mt-2 cursor-pointer hover:underline font-semibold"
                style={{ color: c.accentText }}
                onClick={() => handleTabSwitch("otp")}
              >
                Forgot password? →
              </p>
            </motion.div>
          )}

          {/* ═══════ OTP tab ═══════ */}
          {tab === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{   opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!sellerAuth.otpSent ? (
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  disabled={sellerAuth.loading || !formik.values.email}
                  onClick={handleSendOtp}
                  startIcon={
                    sellerAuth.loading
                      ? <CircularProgress size={16} sx={{ color: c.accent }} />
                      : <SendIcon />
                  }
                  sx={{
                    py:            "12px",
                    borderRadius:  "14px",
                    fontWeight:    700,
                    fontSize:      14,
                    textTransform: "none",
                    color:         c.accentText,
                    borderColor:   c.accent,
                    borderWidth:   "1.5px",
                    transition:    "all 0.2s",
                    "&:hover":     {
                      borderColor: c.accent,
                      borderWidth: "1.5px",
                      background:  "rgba(99,102,241,0.06)",
                      transform:   "translateY(-1px)",
                    },
                  }}
                >
                  {sellerAuth.loading ? "Sending..." : "Send OTP to Email"}
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3 p-4 rounded-2xl"
                  style={{
                    background:  "rgba(99,102,241,0.05)",
                    border:      `1px solid rgba(99,102,241,0.15)`,
                  }}
                >
                  <div>
                    <p className="text-sm font-bold mb-1" style={{ color: c.text }}>
                      Verification code 🔐
                    </p>
                    <p className="text-xs" style={{ color: c.textMuted }}>
                      Enter the 6-digit code sent to{" "}
                      <b style={{ color: c.accentText }}>{formik.values.email}</b>
                    </p>
                  </div>

                  <OTPInput length={6} onChange={setOtp} error={false} />

                  <p className="text-xs flex items-center justify-between" style={{ color: c.textMuted }}>
                    {isTimerActive ? (
                      <span>
                        Resend in <b style={{ color: c.accentText }}>{timer}s</b>
                      </span>
                    ) : (
                      <span>
                        Didn't receive?{" "}
                        <span
                          onClick={handleSendOtp}
                          className="cursor-pointer font-bold hover:underline"
                          style={{ color: c.accentText }}
                        >
                          Resend
                        </span>
                      </span>
                    )}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ Submit ═══════ */}
        {(tab === "password" || sellerAuth.otpSent) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={sellerAuth.loading || !canSubmit}
              startIcon={
                sellerAuth.loading
                  ? <CircularProgress size={16} sx={{ color: "white" }} />
                  : <LoginIcon />
              }
              sx={{
                py:            "13px",
                fontWeight:    800,
                fontSize:      15,
                borderRadius:  "14px",
                textTransform: "none",
                background:    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow:     "0 8px 24px rgba(99,102,241,0.35)",
                transition:    "all 0.2s",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  transform:  "translateY(-2px)",
                  boxShadow:  "0 12px 32px rgba(99,102,241,0.4)",
                },
                "&:disabled": {
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color:      isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)",
                  boxShadow:  "none",
                },
              }}
            >
              {sellerAuth.loading ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </motion.div>
        )}
      </form>

      {/* ═══════ Demo credentials ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 rounded-2xl"
        style={{
          background:  isDark ? "rgba(99,102,241,0.05)" : "rgba(99,102,241,0.04)",
          border:      `1px dashed ${c.accent}40`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🧪</span>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: c.accentText }}>
            Demo Accounts
          </p>
        </div>
        <div className="space-y-1.5 text-xs" style={{ color: c.textMuted }}>
          <p className="flex items-center justify-between">
            <span>📧 seller@techhub.com</span>
            <span
              className="font-mono px-2 py-0.5 rounded"
              style={{ background: c.bgInput, color: c.text }}
            >
              Test@1234
            </span>
          </p>
          <p className="flex items-center justify-between">
            <span>📧 seller@fashionforward.com</span>
            <span
              className="font-mono px-2 py-0.5 rounded"
              style={{ background: c.bgInput, color: c.text }}
            >
              Test@1234
            </span>
          </p>
        </div>
        <p className="text-[10px] mt-2 italic" style={{ color: c.textMuted }}>
          Click any email to auto-fill ↑
        </p>

        {/* Quick fill buttons */}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => {
              formik.setFieldValue("email",    "seller@techhub.com");
              formik.setFieldValue("password", "Test@1234");
              setTab("password");
            }}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
            style={{
              background:  c.bgInput,
              color:       c.accentText,
              border:      `1px solid ${c.border}`,
            }}
          >
            TechHub
          </button>
          <button
            type="button"
            onClick={() => {
              formik.setFieldValue("email",    "seller@fashionforward.com");
              formik.setFieldValue("password", "Test@1234");
              setTab("password");
            }}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all"
            style={{
              background:  c.bgInput,
              color:       c.accentText,
              border:      `1px solid ${c.border}`,
            }}
          >
            Fashion
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SellerLoginForm;