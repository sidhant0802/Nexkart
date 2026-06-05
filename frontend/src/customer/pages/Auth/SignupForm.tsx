import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, User, Phone, Lock, Calendar, MapPin,
  ArrowRight, ArrowLeft, RotateCcw, Loader2,
  ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff,
  CheckCircle2, Navigation,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useNavigate } from "react-router-dom";
import { sendLoginSignupOtp, signup } from "../../../Redux Toolkit/Customer/AuthSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import OTPInput from "../../components/OtpFild/OTPInput";
import { captureUserLocation, type UserLocation } from "../../../util/geolocation";

interface Props { from?: string; }

const SignupForm = ({ from = "/" }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const [step, setStep] = useState(1); // 1=details, 2=password+location, 3=OTP
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Location state
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // ── Form (all 4 steps in one Formik) ──
  const formik = useFormik({
    initialValues: {
      fullName: "", email: "", mobile: "", countryCode: "+91",
      password: "", confirmPassword: "",
      dateOfBirth: "", gender: "",
    },
    validationSchema: Yup.object({
      fullName: Yup.string().min(2).max(50).required("Full name is required"),
      email:    Yup.string().email("Invalid email").required("Email is required"),
      mobile:   Yup.string().matches(/^[0-9]{10}$/, "10 digits only").required("Mobile required"),
      password: Yup.string().min(6, "Min 6 characters").required("Password required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords don't match")
        .required("Please confirm password"),
    }),
    onSubmit: () => {},
  });

  // ── Timer ──
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

  // ── Capture Location ──
  const handleCaptureLocation = async () => {
    setLocationError("");
    setLocationLoading(true);
    try {
      const loc = await captureUserLocation();
      setLocation(loc);
    } catch (err: any) {
      setLocationError(err.message || "Could not get your location");
    } finally {
      setLocationLoading(false);
    }
  };

  // ── Step 1 → Step 2 ──
  const handleNextStep1 = async () => {
    formik.setTouched({ fullName: true, email: true, mobile: true });
    const errs = await formik.validateForm();
    if (!errs.fullName && !errs.email && !errs.mobile) setStep(2);
  };

  // ── Step 2 → Send OTP ──
  const handleSendOtp = async () => {
    formik.setTouched({ ...formik.touched, password: true, confirmPassword: true });
    const errs = await formik.validateForm();
    if (errs.password || errs.confirmPassword) return;
    setOtpError("");
    dispatch(sendLoginSignupOtp({ email: formik.values.email, purpose: "signup_check" }));
    setTimer(30);
    setIsTimerActive(true);
    setStep(3);
  };

  const handleResendOtp = () => {
    setOtpError("");
    dispatch(sendLoginSignupOtp({ email: formik.values.email, purpose: "signup_check" }));
    setTimer(30);
    setIsTimerActive(true);
  };

  // ── Final Signup ──
  const handleSignup = () => {
    if (!otp || otp.length < 6) {
      setOtpError("Enter the complete 6-digit code");
      return;
    }
    setOtpError("");
    dispatch(signup({
      fullName:    formik.values.fullName,
      email:       formik.values.email,
      mobile:      formik.values.mobile,
      countryCode: formik.values.countryCode,
      password:    formik.values.password,
      dateOfBirth: formik.values.dateOfBirth || null,
      gender:      formik.values.gender || "prefer_not_to_say",
      location:    location || {},
      otp,
      navigate,
    }));
  };

  // ── Helpers ──
  const inputStyle = (hasError: boolean) => ({
    background: hasError ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
    border: hasError ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.08)",
    color: "white",
  });

  // ── Password Strength ──
  const getPasswordStrength = (p: string) => {
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = getPasswordStrength(formik.values.password);
  const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];

  return (
    <div className="space-y-4">

      {/* ── Step Indicator ── */}
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                style={{
                  background: step > s ? "#22c55e" : step === s
                    ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                    : "rgba(255,255,255,0.06)",
                  color: step >= s ? "white" : "rgba(255,255,255,0.3)",
                }}
              >
                {step > s ? "✓" : s}
              </div>
              <span className="text-[9px] mt-1 font-medium text-white/40">
                {s === 1 ? "Details" : s === 2 ? "Security" : "Verify"}
              </span>
            </div>
            {s < 3 && (
              <div className="flex-1 h-px mx-2 mb-4" style={{
                background: step > s ? "#22c55e" : "rgba(255,255,255,0.08)",
              }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ═══════════════ STEP 1 — Personal Details ═══════════════ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="fullName"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="John Doe"
                  className="w-full py-3.5 pl-10 pr-4 rounded-xl text-sm outline-none"
                  style={inputStyle(!!(formik.touched.fullName && formik.errors.fullName))}
                />
              </div>
              {formik.touched.fullName && formik.errors.fullName && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={11} /> {formik.errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
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
                  placeholder="your@email.com"
                  className="w-full py-3.5 pl-10 pr-4 rounded-xl text-sm outline-none"
                  style={inputStyle(!!(formik.touched.email && formik.errors.email))}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={11} /> {formik.errors.email}
                </p>
              )}
            </div>

            {/* Mobile + Country Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Mobile Number</label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formik.values.countryCode}
                  onChange={formik.handleChange}
                  className="py-3.5 px-3 rounded-xl text-sm outline-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <div className="relative flex-1">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    name="mobile"
                    value={formik.values.mobile}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full py-3.5 pl-10 pr-4 rounded-xl text-sm outline-none"
                    style={inputStyle(!!(formik.touched.mobile && formik.errors.mobile))}
                  />
                </div>
              </div>
              {formik.touched.mobile && formik.errors.mobile && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={11} /> {formik.errors.mobile}
                </p>
              )}
            </div>

            {/* DOB + Gender (optional) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">DOB <span className="text-white/30">(opt)</span></label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    name="dateOfBirth"
                    type="date"
                    value={formik.values.dateOfBirth}
                    onChange={formik.handleChange}
                    className="w-full py-3.5 pl-10 pr-3 rounded-xl text-sm outline-none"
                    style={inputStyle(false)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Gender <span className="text-white/30">(opt)</span></label>
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  className="w-full py-3.5 px-3 rounded-xl text-sm outline-none cursor-pointer"
                  style={inputStyle(false)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleNextStep1}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
            >
              Continue <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ═══════════════ STEP 2 — Password + Location ═══════════════ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Min 6 characters"
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

              {/* Password Strength Meter */}
              {formik.values.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background: i < strength ? strengthColors[strength - 1] : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: strengthColors[strength - 1] || "rgba(255,255,255,0.4)" }}>
                    {strength > 0 ? strengthLabels[strength - 1] : ""}
                  </p>
                </div>
              )}

              {formik.touched.password && formik.errors.password && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={11} /> {formik.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Repeat password"
                  className="w-full py-3.5 pl-10 pr-10 rounded-xl text-sm outline-none"
                  style={inputStyle(!!(formik.touched.confirmPassword && formik.errors.confirmPassword))}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
                  <AlertCircle size={11} /> {formik.errors.confirmPassword}
                </p>
              )}
            </div>

            {/* ── Live Location ── */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40">
                Location <span className="text-white/30">(optional)</span>
              </label>

              {!location ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleCaptureLocation}
                  disabled={locationLoading}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    border: "1px dashed rgba(99,102,241,0.4)",
                    color: "#a78bfa",
                  }}
                >
                  {locationLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> Detecting your location...</>
                  ) : (
                    <><Navigation size={14} /> Use My Current Location</>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3.5 rounded-xl space-y-1.5"
                  style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-400" />
                    <span className="text-green-400 text-xs font-bold">Location Captured</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    📍 {location.formattedAddress || `${location.city}, ${location.state}`}
                  </p>
                  <div className="flex gap-3 text-[10px] text-white/40">
                    <span>Lat: {location.latitude.toFixed(4)}</span>
                    <span>Lng: {location.longitude.toFixed(4)}</span>
                    {location.pincode && <span>PIN: {location.pincode}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation(null)}
                    className="text-purple-400 text-[10px] font-semibold hover:underline"
                  >
                    Change location
                  </button>
                </motion.div>
              )}

              {locationError && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle size={11} /> {locationError}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
              >
                <ArrowLeft size={14} /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSendOtp}
                className="flex-[2] py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
              >
                Send Verification Code <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ STEP 3 — OTP Verification ═══════════════ */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Info */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <KeyRound size={15} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white/70 text-xs font-medium">Verification code sent to</p>
                <p className="text-xs mt-0.5 font-semibold truncate" style={{ color: "#a78bfa" }}>
                  {formik.values.email}
                </p>
                <p className="text-white/30 text-xs mt-1">Check inbox and spam folder</p>
              </div>
            </div>

            {/* OTP */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                Enter 6-digit Code
              </label>
              <div className="flex justify-center">
                <OTPInput length={6} onChange={(v: string) => { setOtp(v); setOtpError(""); }} error={!!otpError} />
              </div>
              {otpError && <p className="text-red-400 text-xs text-center mt-2">{otpError}</p>}
              {auth.error && <p className="text-red-400 text-xs text-center mt-2">{auth.error}</p>}
            </div>

            {/* Timer / Resend */}
            <div className="text-center">
              {isTimerActive ? (
                <span className="text-xs text-white/40">
                  Resend in <span className="font-bold text-purple-400">{timer}s</span>
                </span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 mx-auto text-xs font-semibold text-purple-400 hover:opacity-70"
                >
                  <RotateCcw size={11} /> Resend code
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "white" }}
              >
                <ArrowLeft size={14} /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSignup}
                disabled={auth.loading}
                className="flex-[2] py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 8px 30px rgba(139,92,246,0.3)" }}
              >
                {auth.loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Create Account <ShieldCheck size={16} /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignupForm;