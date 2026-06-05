import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, KeyRound, ArrowRight, ArrowLeft,
  Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Zap, RotateCcw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import {
  forgotPassword, resetPassword, clearAuthError, resetOtpState,
} from "../../../../Redux Toolkit/Customer/AuthSlice";
import OTPInput from "../../../components/OtpFild/OTPInput";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const [step, setStep] = useState(1); // 1=email, 2=otp+newPwd, 3=success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(resetOtpState());
  }, []);

  useEffect(() => {
    if (auth.resetOtpSent && step === 1) {
      setStep(2);
      setTimer(30);
      setIsTimerActive(true);
    }
  }, [auth.resetOtpSent]);

  useEffect(() => {
    if (auth.passwordResetSuccess) setStep(3);
  }, [auth.passwordResetSuccess]);

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

  const handleSendOtp = () => {
    setError("");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }
    dispatch(forgotPassword({ email }));
  };

  const handleResetPwd = () => {
    setError("");
    if (!otp || otp.length < 6) return setError("Enter the complete 6-digit code");
    if (newPwd.length < 6)        return setError("Password must be at least 6 characters");
    if (newPwd !== confirmPwd)    return setError("Passwords do not match");
    dispatch(resetPassword({ email, otp, newPassword: newPwd }));
  };

  const handleResend = () => {
    dispatch(forgotPassword({ email }));
    setTimer(30);
    setIsTimerActive(true);
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060610] p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Nexkart
          </span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
          }}
        >
          <AnimatePresence mode="wait">

            {/* ─── STEP 1: Email ─── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-black text-white mb-2">Forgot Password? 🔑</h2>
                <p className="text-white/40 text-sm mb-6">
                  Enter your email and we'll send you a verification code
                </p>

                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Email Address</label>
                <div className="relative mb-4">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    className="w-full py-3.5 pl-10 pr-4 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                {error && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <AlertCircle size={11} /> {error}
                  </p>
                )}
                {auth.error && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <AlertCircle size={11} /> {auth.error}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSendOtp}
                  disabled={auth.loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
                >
                  {auth.loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>Send Reset Code <ArrowRight size={16} /></>
                  )}
                </motion.button>

                <Link to="/login" className="flex items-center justify-center gap-2 text-purple-400 text-sm mt-5 hover:underline">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </motion.div>
            )}

            {/* ─── STEP 2: OTP + New Password ─── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-black text-white mb-2">Reset Password 🔐</h2>
                <p className="text-white/40 text-sm mb-5">
                  Enter the code sent to <span className="text-purple-400 font-semibold">{email}</span>
                </p>

                {/* OTP */}
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Verification Code</label>
                <div className="flex justify-center mb-4">
                  <OTPInput length={6} onChange={(v: string) => { setOtp(v); setError(""); }} error={false} />
                </div>

                {/* Timer */}
                <div className="text-center mb-5">
                  {isTimerActive ? (
                    <span className="text-xs text-white/40">
                      Resend in <span className="font-bold text-purple-400">{timer}s</span>
                    </span>
                  ) : (
                    <button onClick={handleResend}
                      className="flex items-center gap-1.5 mx-auto text-xs font-semibold text-purple-400 hover:opacity-70">
                      <RotateCcw size={11} /> Resend code
                    </button>
                  )}
                </div>

                {/* New Password */}
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">New Password</label>
                <div className="relative mb-4">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => { setNewPwd(e.target.value); setError(""); }}
                    placeholder="Min 6 characters"
                    className="w-full py-3.5 pl-10 pr-10 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                  <button onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Confirm Password</label>
                <div className="relative mb-4">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={confirmPwd}
                    onChange={(e) => { setConfirmPwd(e.target.value); setError(""); }}
                    placeholder="Repeat password"
                    className="w-full py-3.5 pl-10 pr-4 rounded-xl text-sm outline-none"
                    style={inputStyle}
                  />
                </div>

                {(error || auth.error) && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mb-4">
                    <AlertCircle size={11} /> {error || auth.error}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleResetPwd}
                  disabled={auth.loading}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
                >
                  {auth.loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>Reset Password <KeyRound size={16} /></>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ─── STEP 3: Success ─── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}
                >
                  <CheckCircle2 size={40} className="text-green-400" />
                </motion.div>

                <h2 className="text-2xl font-black text-white mb-2">Password Reset! ✨</h2>
                <p className="text-white/50 text-sm mb-6">
                  Your password has been reset successfully.<br />You can now login with your new password.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
                >
                  Go to Login <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;