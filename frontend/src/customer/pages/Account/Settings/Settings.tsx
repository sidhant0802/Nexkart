import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Bell, Eye, EyeOff, Shield, Trash2,
  Moon, Sun, Mail, MessageSquare, Loader2,
  CheckCircle, AlertCircle, Save,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { changePassword } from "../../../../Redux Toolkit/Customer/UserSlice";
import { useTheme } from "../../../../routes/CustomerRoutes";

const Settings = () => {
  const dispatch = useAppDispatch();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAppSelector((s) => s);

  // Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // Notification preferences
  const [prefs, setPrefs] = useState({
    emailMarketing: true,
    emailOrders:    true,
    smsOrders:      true,
    pushNotifs:     true,
  });

  const handlePasswordChange = async () => {
    setPwdError("");
    setPwdSuccess(false);

    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError("Please fill all password fields");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("New password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match");
      return;
    }
    if (newPwd === currentPwd) {
      setPwdError("New password must be different from current");
      return;
    }

    const res: any = await dispatch(changePassword({ currentPassword: currentPwd, newPassword: newPwd }));
    if (res.meta.requestStatus === "fulfilled") {
      setPwdSuccess(true);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } else {
      setPwdError(res.payload || "Failed to change password");
    }
  };

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.04)" : "white",
    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
    color: isDark ? "white" : "#111",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
          Settings
        </h2>
        <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
          Manage your account preferences & security
        </p>
      </div>

      {/* ════════ Change Password ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 ${
          isDark ? "bg-white/3 border border-white/8" : "bg-gray-50 border border-gray-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Lock size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className={`text-base font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              Change Password
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Update your account password
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Current Password", value: currentPwd, set: setCurrentPwd },
            { label: "New Password",     value: newPwd,     set: setNewPwd },
            { label: "Confirm Password", value: confirmPwd, set: setConfirmPwd },
          ].map((f, i) => (
            <div key={i}>
              <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-2 ${
                isDark ? "text-white/40" : "text-gray-500"
              }`}>{f.label}</label>
              <div className="relative">
                <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`} />
                <input
                  type={showPwd ? "text" : "password"}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.label}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none"
                  style={inputStyle}
                />
                {i === 0 && (
                  <button onClick={() => setShowPwd(!showPwd)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                      isDark ? "text-white/40" : "text-gray-400"
                    }`}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {pwdError && (
          <p className="flex items-center gap-1.5 text-red-400 text-xs mt-3">
            <AlertCircle size={11} /> {pwdError}
          </p>
        )}
        {pwdSuccess && (
          <p className="flex items-center gap-1.5 text-green-400 text-xs mt-3">
            <CheckCircle size={11} /> Password updated successfully!
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handlePasswordChange}
          disabled={user.loading}
          className="mt-5 px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
        >
          {user.loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Update Password
        </motion.button>
      </motion.div>

      {/* ════════ Notifications ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 ${
          isDark ? "bg-white/3 border border-white/8" : "bg-gray-50 border border-gray-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Bell size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className={`text-base font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              Notifications
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Choose how you want to be notified
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { key: "emailOrders",    icon: Mail,            label: "Order Updates (Email)",     desc: "Get email about your orders" },
            { key: "emailMarketing", icon: Mail,            label: "Marketing Emails",          desc: "Deals, offers, and news" },
            { key: "smsOrders",      icon: MessageSquare,   label: "SMS Notifications",         desc: "Order updates via SMS" },
            { key: "pushNotifs",     icon: Bell,            label: "Push Notifications",        desc: "Browser push notifications" },
          ].map((p) => (
            <div key={p.key} className={`flex items-center justify-between p-3 rounded-xl ${
              isDark ? "bg-white/3" : "bg-white"
            }`}>
              <div className="flex items-center gap-3">
                <p.icon size={16} className={isDark ? "text-white/60" : "text-gray-500"} />
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{p.label}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>{p.desc}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setPrefs({ ...prefs, [p.key]: !prefs[p.key as keyof typeof prefs] })}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{
                  background: prefs[p.key as keyof typeof prefs]
                    ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                    : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                }}
              >
                <motion.div
                  animate={{ x: prefs[p.key as keyof typeof prefs] ? 22 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ════════ Appearance ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 ${
          isDark ? "bg-white/3 border border-white/8" : "bg-gray-50 border border-gray-100"
        }`}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
            {isDark ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-400" />}
          </div>
          <div>
            <h3 className={`text-base font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              Appearance
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Customize how the app looks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`p-4 rounded-xl border-2 transition-all ${
              !isDark ? "border-purple-500" : "border-white/10"
            }`}
            style={{
              background: !isDark ? "rgba(139,92,246,0.08)" : isDark ? "rgba(255,255,255,0.03)" : "white",
            }}
          >
            <Sun size={20} className="text-amber-400 mb-2 mx-auto" />
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Light</p>
          </button>

          <button
            onClick={() => !isDark && toggleTheme()}
            className={`p-4 rounded-xl border-2 transition-all ${
              isDark ? "border-purple-500" : "border-white/10"
            }`}
            style={{
              background: isDark ? "rgba(139,92,246,0.08)" : "white",
            }}
          >
            <Moon size={20} className="text-purple-400 mb-2 mx-auto" />
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Dark</p>
          </button>
        </div>
      </motion.div>

      {/* ════════ Danger Zone ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 border border-red-500/20"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)"
            : "linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
            <Shield size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-red-400">Danger Zone</h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Irreversible account actions
            </p>
          </div>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-xl ${
          isDark ? "bg-red-500/5" : "bg-white"
        }`}>
          <div>
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Delete Account</p>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              Permanently delete your account and all data
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;