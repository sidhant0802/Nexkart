import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, User, MapPin, CreditCard, LogOut,
  Settings as SettingsIcon,            // ✅ RENAMED to SettingsIcon
  Heart, ChevronRight, X, CheckCircle, AlertCircle,
} from "lucide-react";
import OrderTracking from "./OrderTracking";
import SettingsPage from "./Settings/Settings";   // ✅ RENAMED to SettingsPage
import Order from "./Order";
import UserDetails from "./UserDetails";
import SavedCards from "./SavedCards";
import OrderDetails from "./OrderDetails";
import Addresses from "./Adresses";

import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { performLogout } from "../../../Redux Toolkit/Customer/AuthSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

const menuItems = [
  { name: "Orders",      path: "/account/orders",      icon: ShoppingBag,  color: "#a78bfa" },
  { name: "Profile",     path: "/account/profile",     icon: User,         color: "#3b82f6" },
  { name: "Addresses",   path: "/account/addresses",   icon: MapPin,       color: "#10b981" },
  { name: "Saved Cards", path: "/account/saved-card",  icon: CreditCard,   color: "#f59e0b" },
  { name: "Wishlist",    path: "/wishlist",            icon: Heart,        color: "#ec4899" },
  { name: "Settings",    path: "/account/settings",    icon: SettingsIcon, color: "#06b6d4" },   // ✅ uses SettingsIcon
];

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();
const user   = useAppSelector((s) => s.user);
const orders = useAppSelector((s) => s.orders);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false, message: "", type: "success",
  });

  const handleLogout = () => {
    dispatch(performLogout());
    navigate("/");
  };

  useEffect(() => {
    if (user.profileUpdated) setSnackbar({ open: true, message: "Profile updated successfully!", type: "success" });
    if (orders.orderCanceled) setSnackbar({ open: true, message: "Order canceled successfully", type: "success" });
    if (user.error) setSnackbar({ open: true, message: user.error, type: "error" });
  }, [user.profileUpdated, orders.orderCanceled, user.error]);

  useEffect(() => {
    if (snackbar.open) {
      const t = setTimeout(() => setSnackbar((p) => ({ ...p, open: false })), 4000);
      return () => clearTimeout(t);
    }
  }, [snackbar.open]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const totalOrders = orders?.orders?.length || 0;
  const totalAddresses = user?.user?.addresses?.length || 0;

  return (
    <div className={`min-h-screen py-10 px-4 lg:px-12 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            My Account
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Manage your profile, orders & preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ═══════════ LEFT SIDEBAR ═══════════ */}
          <aside className="lg:col-span-3 space-y-4">

            {/* User Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative rounded-3xl p-6 overflow-hidden ${
                isDark ? "border border-white/10" : "border border-gray-200 shadow-sm"
              }`}
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(99,102,241,0.05) 100%)"
                  : "linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)",
              }}
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 blur-3xl"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
              />

              <div className="relative z-10 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-2xl"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
                  >
                    {getInitials(user.user?.fullName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                <h2 className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                  {user.user?.fullName || "User"}
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  {user.user?.email}
                </p>

                <div className="inline-flex items-center gap-1 mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <CheckCircle size={10} /> Verified Account
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Orders",    value: totalOrders,    color: "#a78bfa", icon: ShoppingBag },
                { label: "Addresses", value: totalAddresses, color: "#10b981", icon: MapPin },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`rounded-2xl p-3 text-center ${
                    isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
                  }`}
                >
                  <div className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5"
                    style={{ background: `${s.color}15` }}
                  >
                    <s.icon size={14} style={{ color: s.color }} />
                  </div>
                  <p className={`text-lg font-black ${isDark ? "text-white" : "text-gray-900"}`}>{s.value}</p>
                  <p className={`text-[10px] font-medium ${isDark ? "text-white/40" : "text-gray-500"}`}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl overflow-hidden ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between px-4 py-3.5 transition-all relative"
                    style={{
                      background: isActive
                        ? isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)"
                        : "transparent",
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeMenu"
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        style={{ background: item.color }}
                      />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}15` }}
                      >
                        <item.icon size={15} style={{ color: item.color }} />
                      </div>
                      <span className={`text-sm font-semibold ${
                        isActive
                          ? isDark ? "text-white" : "text-gray-900"
                          : isDark ? "text-white/70" : "text-gray-600"
                      }`}>
                        {item.name}
                      </span>
                    </div>
                    <ChevronRight size={14} className={isDark ? "text-white/30" : "text-gray-300"} />
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3.5 border-t"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.12)" }}
                  >
                    <LogOut size={15} className="text-red-400" />
                  </div>
                  <span className="text-sm font-semibold text-red-400">Logout</span>
                </div>
                <ChevronRight size={14} className="text-red-400/40" />
              </motion.button>
            </motion.div>
          </aside>

          {/* ═══════════ RIGHT MAIN CONTENT ═══════════ */}
          <main className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-6 lg:p-8 min-h-[600px] ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
             <Routes>
  <Route path="/"           element={<UserDetails />} />
  <Route path="/orders"     element={<Order />} />
  <Route path="/orders/:orderId/track" element={<OrderTracking />} />
  <Route path="/orders/:orderId/item/:orderItemId" element={<OrderDetails />} />
  <Route path="/profile"    element={<UserDetails />} />
  <Route path="/saved-card" element={<SavedCards />} />
  <Route path="/addresses"  element={<Addresses />} />
  <Route path="/settings"   element={<SettingsPage />} />
</Routes>
            </motion.div>
          </main>
        </div>
      </div>

      {/* Snackbar */}
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
            <button onClick={() => setSnackbar((p) => ({ ...p, open: false }))}
              className="ml-1 opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;