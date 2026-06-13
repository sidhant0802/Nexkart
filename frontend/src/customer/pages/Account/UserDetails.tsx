import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Calendar, Shield,
  Edit2, Save, X, Camera, Check, Navigation,
  Lock, Award, Clock, ChevronRight, Loader2, Lock as LockIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { updateUserProfile } from "../../../Redux Toolkit/Customer/UserSlice";
import { useTheme } from "../../../routes/CustomerRoutes";
import { captureUserLocation } from "../../../util/geolocation";

const UserDetails = () => {
  const user = useAppSelector((s) => s.user);
  const { isDark } = useTheme();
  const dispatch = useAppDispatch();
  const u = user.user;

  const [editMode, setEditMode] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const [form, setForm] = useState({
    fullName:    u?.fullName    || "",
    dateOfBirth: u?.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : "",
    gender:      u?.gender      || "",
  });

  const handleSave = async () => {
    await dispatch(updateUserProfile({
      fullName:    form.fullName,
      dateOfBirth: form.dateOfBirth || null,
      gender:      form.gender,
    }));
    setEditMode(false);
  };

  const handleCancel = () => {
    setForm({
      fullName:    u?.fullName    || "",
      dateOfBirth: u?.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : "",
      gender:      u?.gender      || "",
    });
    setEditMode(false);
  };

  const handleUpdateLocation = async () => {
    setLocLoading(true);
    try {
      const loc = await captureUserLocation();
      await dispatch(updateUserProfile({ location: loc }));
    } catch (err) {
      alert("Could not get location. Please allow permission.");
    } finally {
      setLocLoading(false);
    }
  };

  const formatDate = (d?: string | Date) => {
    if (!d) return "Not set";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  // ── Reusable Field Component ──
  const Field = ({
    icon: Icon, label, value, name, type = "text", editable = true, options, locked,
  }: any) => (
    <div className={`p-4 rounded-2xl transition-all ${
      isDark ? "bg-white/3 border border-white/8 hover:border-white/15"
             : "bg-gray-50 border border-gray-100 hover:border-gray-200"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: locked ? "rgba(156,163,175,0.12)" : "rgba(139,92,246,0.12)" }}>
            <Icon size={13} className={locked ? "text-gray-400" : "text-purple-400"} />
          </div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? "text-white/40" : "text-gray-500"
          }`}>
            {label}
          </p>
        </div>
        {locked && (
          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400">
            <LockIcon size={9} /> LOCKED
          </div>
        )}
      </div>

      {editMode && editable && !locked ? (
        options ? (
          <select
            value={form[name as keyof typeof form] as string}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
              isDark ? "bg-white/5 border border-purple-500/30 text-white"
                     : "bg-white border border-purple-300 text-gray-900"
            }`}
          >
            <option value="">Select</option>
            {options.map((o: string) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={form[name as keyof typeof form] as string}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg text-sm outline-none ${
              isDark ? "bg-white/5 border border-purple-500/30 text-white"
                     : "bg-white border border-purple-300 text-gray-900"
            }`}
          />
        )
      ) : (
        <p className={`text-sm font-semibold pl-9 ${
          isDark ? "text-white/90" : "text-gray-800"
        }`}>
          {value || <span className="opacity-40">Not set</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Personal Details
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Manage your personal information
          </p>
        </div>

        <div className="flex gap-2">
          {editMode ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={user.loading}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                  isDark ? "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <X size={13} /> Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={user.loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              >
                {user.loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save Changes
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
            >
              <Edit2 size={13} /> Edit Profile
            </motion.button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 relative overflow-hidden ${
          isDark ? "border border-white/10" : "border border-gray-200"
        }`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.04) 100%)"
            : "linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%)",
        }}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }} />

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
              {u?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
              <Camera size={14} className="text-gray-700" />
            </button>
          </div>

          <div className="flex-1">
            <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              {u?.fullName}
            </h3>
            <p className={`text-sm mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              {u?.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
                <Check size={10} /> Email Verified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
                <Award size={10} /> {u?.role?.replace("ROLE_", "") || "CUSTOMER"}
              </span>
              {u?.createdAt && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
                  <Clock size={10} /> Joined {formatDate(u.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Info */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
          isDark ? "text-white/40" : "text-gray-500"
        }`}>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field icon={User}     label="Full Name"     name="fullName" value={u?.fullName} />
          <Field icon={Mail}     label="Email"         name="email"    value={u?.email}    locked />
          <Field icon={Phone}    label="Mobile"        name="mobile"
            value={u?.mobile ? `${u?.countryCode || "+91"} ${u.mobile}` : ""} locked />
          <Field icon={Calendar} label="Date of Birth" name="dateOfBirth" type="date"
            value={u?.dateOfBirth ? formatDate(u.dateOfBirth) : ""} />
          <Field icon={User}     label="Gender" name="gender" value={u?.gender}
            options={["male", "female", "other", "prefer_not_to_say"]} />
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isDark ? "text-white/40" : "text-gray-500"
          }`}>
            Saved Location
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleUpdateLocation}
            disabled={locLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-400"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            {locLoading ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
            {u?.location?.formattedAddress ? "Update Location" : "Capture Location"}
          </motion.button>
        </div>

        {u?.location?.formattedAddress ? (
          <motion.div
            className={`p-5 rounded-2xl relative overflow-hidden ${
              isDark ? "border border-emerald-500/20" : "border border-emerald-200"
            }`}
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.04) 100%)"
                : "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Navigation size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {u?.location?.city}{u?.location?.state ? `, ${u.location.state}` : ""}
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-white/50" : "text-gray-600"}`}>
                  {u?.location?.formattedAddress}
                </p>
                <div className="flex flex-wrap gap-3 mt-3 text-[10px]">
                  {u?.location?.pincode && (
                    <span className={isDark ? "text-white/40" : "text-gray-500"}>
                      📍 PIN: <span className="font-bold">{u.location.pincode}</span>
                    </span>
                  )}
                  {u?.location?.latitude && (
                    <span className={isDark ? "text-white/40" : "text-gray-500"}>
                      🌐 {u.location.latitude.toFixed(4)}, {u.location.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className={`p-6 rounded-2xl text-center ${
            isDark ? "border border-white/8 bg-white/3" : "border border-gray-100 bg-gray-50"
          }`}>
            <Navigation size={24} className="mx-auto mb-2 text-emerald-400" />
            <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
              No location saved. Click "Capture Location" above.
            </p>
          </div>
        )}
      </div>

      {/* Security */}
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
          isDark ? "text-white/40" : "text-gray-500"
        }`}>
          Security
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => window.location.href = "/account/settings"}
            className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
              isDark ? "bg-white/3 border border-white/8 hover:border-white/15"
                     : "bg-gray-50 border border-gray-100 hover:border-gray-200"
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Lock size={15} className="text-amber-400" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Change Password</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>Update your password</p>
              </div>
            </div>
            <ChevronRight size={14} className={isDark ? "text-white/30" : "text-gray-300"} />
          </button>

          <button className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
            isDark ? "bg-white/3 border border-white/8 hover:border-white/15"
                   : "bg-gray-50 border border-gray-100 hover:border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Shield size={15} className="text-blue-400" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>2-Step Verification</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>Add extra security</p>
              </div>
            </div>
            <ChevronRight size={14} className={isDark ? "text-white/30" : "text-gray-300"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;