import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, ArrowRight, RotateCcw, Loader2,
  ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useNavigate, Link } from "react-router-dom";
import {
  sendLoginSignupOtp, signin, signinWithPassword,
} from "../../../Redux Toolkit/Customer/AuthSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import OTPInput from "../../components/OtpFild/OTPInput";

interface Props { from?: string; }

const LoginForm = ({ from = "/" }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email required"),
      password: mode === "password"
        ? Yup.string().required("Password required").min(6)
        : Yup.string(),
    }),
    onSubmit: () => {},
  });

  // Timer
  useEffect(() => {
    if (!isTimerActive) return;
    const t = setInterval(() => {
      setTimer((p) => {
        if (p <= 1) { clearInterval(t); setIsTimerActive(false); return 30; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isTimerActive]);

  // Send OTP
  const handleSendOtp = async () => {
    formik.setTouched({ ...formik.touched, email: true });
    const errs = await formik.validateForm();
    if (errs.email) return;
    setOtpError("");
    dispatch(sendLoginSignupOtp({ email: "signing_" + formik.values.email }));
    setTimer(30);
    setIsTimerActive(true);
  };

  const handleResendOtp = () => {
    setOtpError("");
    dispatch(sendLoginSignupOtp({ email: "signing_" + formik.values.email }));
    setTimer(30);
    setIsTimerActive(true);
  };

  // OTP Login
  const handleOtpLogin = () => {
    if (!otp || otp.length < 6) {
      setOtpError("Enter the complete 6-digit OTP");
      return;
    }
    dispatch(signin({ email: formik.values.email, otp, navigate }));
  };

  // Password Login
  const handlePasswordLogin = async () => {
    formik.setTouched({ email: true, password: true });
    const errs = await formik.validateForm();
    if (errs.email || errs.password) return;
    dispatch(signinWithPassword({
      email: formik.values.email,
      password: formik.values.password,
      navigate,
    }));
  };

  const inputStyle = (hasError: boolean) => ({
    background: hasError ? "rgba(239,68,68,0.06)" : auth.otpSent && mode === "otp"
      ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.04)",
    border: hasError ? "1px solid rgba(239,68,68,0.5)"
      : auth.otpSent && mode === "otp" ? "1px solid rgba(34,197,94,0.3)"
      : "1px solid rgba(255,255,255,0.08)",
    color: "white",
  });

  return (
    <div className="space-y-5">

      {/* ── Mode Toggle ── */}
      <div className="flex p-1 rounded-xl gap-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {(["otp", "password"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setOtpError(""); }}
            className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
            style={{
              background: mode === m ? "linear-gradient(135deg, #8b5cf6, #6366f1)" : "transparent",
              color: mode === m ? "white" : "rgba(255,255,255,0.4)",
            }}
          >
            {m === "otp" ? "🔐 OTP Login" : "🔑 Password"}
          </button>
        ))}
      </div>

      {/* ── Email ── */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Email Address</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={auth.otpSent && mode === "otp"}
            placeholder="your@email.com"
            className="w-full py-3.5 pl-10 pr-10 rounded-xl text-sm outline-none"
            style={inputStyle(!!(formik.touched.email && formik.errors.email))}
          />
          {auth.otpSent && mode === "otp" && (
            <ShieldCheck size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400" />
          )}
        </div>
        {formik.touched.email && formik.errors.email && (
          <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
            <AlertCircle size={11} /> {formik.errors.email}
          </p>
        )}
      </div>

      {/* ═══════════ PASSWORD MODE ═══════════ */}
      {mode === "password" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-purple-400 hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Your password"
              className="w-full py-3.5 pl-10 pr-10 rounded-xl text-sm outline-none"
              style={inputStyle(!!(formik.touched.password && formik.errors.password))}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
              <AlertCircle size={11} /> {formik.errors.password}
            </p>
          )}

          {/* Remember me */}
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 accent-purple-500"
            />
            <span className="text-xs text-white/50">Remember me for 30 days</span>
          </label>
        </motion.div>
      )}

      {/* ═══════════ OTP SECTION ═══════════ */}
      {mode === "otp" && (
        <AnimatePresence>
          {auth.otpSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-4"
            >
              <div className="flex items-start gap-3 p-3.5 rounded-xl"
                style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <KeyRound size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/70 text-xs font-medium">OTP sent to your email</p>
                  <p className="text-xs mt-0.5 font-semibold truncate text-purple-400">{formik.values.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center">
                  <OTPInput length={6} onChange={(v: string) => { setOtp(v); setOtpError(""); }} error={!!otpError} />
                </div>
                {otpError && <p className="text-red-400 text-xs text-center mt-2">{otpError}</p>}
              </div>

              <div className="text-center">
                {isTimerActive ? (
                  <span className="text-xs text-white/40">
                    Resend in <span className="font-bold text-purple-400">{timer}s</span>
                  </span>
                ) : (
                  <button onClick={handleResendOtp}
                    className="flex items-center gap-1.5 mx-auto text-xs font-semibold text-purple-400 hover:opacity-70">
                    <RotateCcw size={11} /> Resend OTP
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ── Error ── */}
      {auth.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-xs">{auth.error}</p>
        </motion.div>
      )}

      {/* ── Submit ── */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={
          mode === "password" ? handlePasswordLogin :
          auth.otpSent ? handleOtpLogin : handleSendOtp
        }
        disabled={auth.loading}
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
      >
        {auth.loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {mode === "password" ? "Login" : auth.otpSent ? "Verify & Login" : "Send OTP"}
            <ArrowRight size={16} />
          </>
        )}
      </motion.button>
    </div>
  );
};

export default LoginForm;