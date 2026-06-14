// src/customer/components/Navbar/DrawerList.tsx
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, Search, ShoppingCart, Heart, User, Package,
  LogOut, Settings, Zap, X, Store, Shield, ChevronRight,
  Shirt, Sparkles, Smartphone, Sofa, Flame, Star, Tag,
  Sun, Moon, MapPin, Phone, ArrowRight,
} from "lucide-react";
import { Avatar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { performLogout } from "../../../Redux Toolkit/Customer/AuthSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

interface DrawerListProps {
  toggleDrawer: () => () => void;
}

const DrawerList = ({ toggleDrawer }: DrawerListProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const auth = useAppSelector((s) => s.auth);
  const user = useAppSelector((s) => s.user);
  const cart = useAppSelector((s) => s.cart);
  const wishlist = useAppSelector((s) => s.wishlist);
  const sellerProfile = useAppSelector((s) => s.sellers.profile);

  const cartCount = cart?.cart?.cartItems?.length || 0;
  const wishCount = wishlist?.wishlist?.products?.length || 0;
  const isLoggedIn = !!(localStorage.getItem("jwt") || auth?.jwt);

  const isAdmin = user?.user?.role === "ROLE_ADMIN";
  const isSeller = !!sellerProfile;

  const displayName = isSeller
    ? sellerProfile?.sellerName || "Seller"
    : user?.user?.fullName || user?.user?.email || "User";
  const displayEmail = isSeller ? sellerProfile?.email : user?.user?.email || "";

  const avatarGrad = isAdmin
    ? "linear-gradient(135deg, #ef4444, #dc2626)"
    : isSeller
    ? "linear-gradient(135deg, #10b981, #059669)"
    : "linear-gradient(135deg, #8b5cf6, #6366f1)";

  const closeDrawer = toggleDrawer();

  const handleNavigate = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  const handleLogout = () => {
    dispatch(performLogout() as any);
    localStorage.clear();
    sessionStorage.clear();
    closeDrawer();
    setTimeout(() => { window.location.href = "/"; }, 100);
  };

  // ── Theme colors ──
  const bg = isDark ? "#0D0D12" : "#ffffff";
  const cardBg = isDark ? "#1a1a26" : "#f9fafb";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "rgba(255,255,255,0.6)" : "#6b7280";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const hoverBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  // ── Menu sections ──
  const shopSections = [
    { icon: Shirt,      label: "Men's Fashion",     path: "/all-men",         color: "#3b82f6" },
    { icon: Sparkles,   label: "Women's Fashion",   path: "/all-women",       color: "#ec4899" },
    { icon: Smartphone, label: "Electronics",       path: "/all-electronics", color: "#8b5cf6" },
    { icon: Sofa,       label: "Home & Furniture",  path: "/products/furniture", color: "#f59e0b" },
  ];

  const quickLinks = [
    { icon: Flame, label: "Hot Deals",    path: "/all-deals",   color: "#ef4444", badge: "HOT" },
    { icon: Star,  label: "Top Brands",   path: "/brands",      color: "#f59e0b" },
    { icon: Tag,   label: "New Arrivals", path: "/all-featured", color: "#10b981" },
  ];

  const accountLinks = isLoggedIn
    ? [
        { icon: User,    label: "My Profile",  path: "/account/profile" },
        { icon: Package, label: "My Orders",   path: "/account/orders"  },
        { icon: Heart,   label: "Wishlist",    path: "/wishlist",  count: wishCount },
        { icon: ShoppingCart, label: "My Cart", path: "/cart",    count: cartCount },
      ]
    : [];

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        width: 320,
        maxWidth: "85vw",
        backgroundColor: bg,
        color: textPrimary,
      }}
    >
      {/* ═══════════════ HEADER ═══════════════ */}
      <div
        className="relative px-5 pt-6 pb-5 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #6C63FF 0%, #8B7FFF 50%, #ec4899 100%)",
        }}
      >
        {/* Decorative bubbles */}
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.3)" }}
        />
        <div
          className="absolute top-12 -right-4 w-16 h-16 rounded-full opacity-15"
          style={{ background: "rgba(255,255,255,0.4)" }}
        />

        {/* Close button */}
        <button
          onClick={closeDrawer}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all z-10"
        >
          <X size={18} className="text-white" />
        </button>

        {/* Logo */}
       <Link to="/" onClick={closeDrawer} className="flex items-center mb-5 relative z-10">
  <img 
    src="/logo.png" 
    alt="Nexkart" 
    className="h-12 w-auto"
  />
</Link>

        {/* User info */}
        {isLoggedIn ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => handleNavigate("/account/profile")}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/15 backdrop-blur border border-white/20 cursor-pointer relative z-10"
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: "rgba(255,255,255,0.3)",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                border: "2px solid rgba(255,255,255,0.4)",
              }}
            >
              {displayName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{displayName}</p>
              <p className="text-white/75 text-[11px] truncate">{displayEmail}</p>
            </div>
            <ChevronRight size={16} className="text-white" />
          </motion.div>
        ) : (
          <div className="flex gap-2 relative z-10">
            <button
              onClick={() => handleNavigate("/login")}
              className="flex-1 py-2.5 rounded-xl bg-white text-purple-600 text-sm font-bold hover:bg-white/90 transition-all"
            >
              Login
            </button>
            <button
              onClick={() => handleNavigate("/login")}
              className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur text-white text-sm font-bold border border-white/30 hover:bg-white/30 transition-all"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════ SCROLLABLE CONTENT ═══════════════ */}
      <div className="flex-1 overflow-y-auto pb-4">
        {/* ── Quick Actions ── */}
        <div className="px-4 py-3 grid grid-cols-4 gap-2 border-b" style={{ borderColor: border }}>
          {[
            { icon: Home, label: "Home", path: "/" },
            { icon: Search, label: "Search", path: "/search-products" },
            { icon: ShoppingCart, label: "Cart", path: "/cart", count: cartCount },
            { icon: Heart, label: "Wish", path: "/wishlist", count: wishCount },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative"
              style={{ backgroundColor: hoverBg }}
            >
              <div className="relative">
                <item.icon size={20} style={{ color: textPrimary }} />
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #6C63FF, #8B7FFF)" }}
                  >
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium" style={{ color: textSecondary }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Shop By Category ── */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-1" style={{ color: textSecondary }}>
            Shop By Category
          </p>
          <div className="space-y-1">
            {shopSections.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon size={18} style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-left text-sm font-medium" style={{ color: textPrimary }}>
                  {item.label}
                </span>
                <ChevronRight size={16} style={{ color: textSecondary }} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Quick Links (Deals, Brands, etc.) ── */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-1" style={{ color: textSecondary }}>
            Trending
          </p>
          <div className="space-y-1">
            {quickLinks.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <item.icon size={18} style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-left text-sm font-medium" style={{ color: textPrimary }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} style={{ color: textSecondary }} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── My Account (if logged in) ── */}
        {isLoggedIn && (
          <div className="px-4 pt-3 pb-2 border-t mt-2" style={{ borderColor: border }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-1 pt-2" style={{ color: textSecondary }}>
              My Account
            </p>
            <div className="space-y-1">
              {accountLinks.map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <item.icon size={18} style={{ color: textPrimary }} />
                  <span className="flex-1 text-left text-sm font-medium" style={{ color: textPrimary }}>
                    {item.label}
                  </span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #6C63FF, #8B7FFF)" }}
                    >
                      {item.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Seller/Admin Quick Access ── */}
        {(isSeller || isAdmin) && (
          <div className="px-4 pt-3 pb-2 border-t mt-2" style={{ borderColor: border }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate(isAdmin ? "/admin" : "/seller")}
              className="w-full flex items-center justify-between p-3 rounded-xl mt-2"
              style={{
                background: isAdmin
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              <div className="flex items-center gap-3">
                {isAdmin ? <Shield size={18} className="text-white" /> : <Store size={18} className="text-white" />}
                <div className="text-left">
                  <p className="text-white font-bold text-sm leading-tight">
                    {isAdmin ? "Admin Panel" : "Seller Dashboard"}
                  </p>
                  <p className="text-white/80 text-[10px] leading-tight mt-0.5">
                    {isAdmin ? "Manage platform" : "Manage your store"}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white" />
            </motion.button>
          </div>
        )}

        {/* ── Become a Seller (for customers only) ── */}
        {isLoggedIn && !isSeller && !isAdmin && (
          <div className="px-4 pt-3 pb-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate("/become-seller")}
              className="w-full flex items-center justify-between p-3 rounded-xl"
              style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
            >
              <div className="flex items-center gap-3">
                <Store size={18} className="text-white" />
                <div className="text-left">
                  <p className="text-white font-bold text-sm leading-tight">Become a Seller</p>
                  <p className="text-white/80 text-[10px] leading-tight mt-0.5">Start selling on Nexkart</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white" />
            </motion.button>
          </div>
        )}

        {/* ── Settings ── */}
        <div className="px-4 pt-3 pb-2 border-t mt-2" style={{ borderColor: border }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3 px-1 pt-2" style={{ color: textSecondary }}>
            Settings
          </p>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {isDark ? <Sun size={18} style={{ color: textPrimary }} /> : <Moon size={18} style={{ color: textPrimary }} />}
            <span className="flex-1 text-left text-sm font-medium" style={{ color: textPrimary }}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
            <div
              className="w-10 h-5 rounded-full relative transition-all"
              style={{ backgroundColor: isDark ? "#6C63FF" : "#d1d5db" }}
            >
              <div
                className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
                style={{ left: isDark ? "22px" : "2px" }}
              />
            </div>
          </button>
        </div>

        {/* ── Help & Support ── */}
        <div className="px-4 pt-2 pb-2">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Phone size={14} style={{ color: "#6C63FF" }} />
              <span className="text-xs font-bold" style={{ color: textPrimary }}>Need Help?</span>
            </div>
            <p className="text-[11px] mb-2" style={{ color: textSecondary }}>Call us: 1800-NEXKART</p>
            <button
              onClick={() => handleNavigate("/account/orders")}
              className="flex items-center gap-1.5 text-[11px] font-semibold"
              style={{ color: "#6C63FF" }}
            >
              <MapPin size={12} />
              Track Order
            </button>
          </div>
        </div>

        {/* ── Logout ── */}
        {isLoggedIn && (
          <div className="px-4 pt-2 pb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <LogOut size={18} style={{ color: "#ef4444" }} />
              <span className="flex-1 text-left text-sm font-bold" style={{ color: "#ef4444" }}>
                Sign Out
              </span>
            </motion.button>
          </div>
        )}

        {/* ── App version / Footer ── */}
        <div className="px-4 pt-2 pb-6 text-center">
          <p className="text-[10px]" style={{ color: textSecondary }}>
            Nexkart v1.0.0 • Made with ❤️ in India
          </p>
        </div>
      </div>
    </div>
  );
};

export default DrawerList;