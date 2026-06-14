import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search, ShoppingCart, Heart,
  Menu, Sun, Moon, User, LogOut,
  Package, ChevronDown, Zap, X,
  Store, Shield, ArrowRight,
} from "lucide-react";
import { Drawer, Avatar } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { performLogout } from "../../../Redux Toolkit/Customer/AuthSlice";
import DrawerList from "./DrawerList";
import CategorySheet from "./CategorySheet";
import { mainCategory } from "../../../data/category/mainCategory";
import { useTheme } from "../../../routes/CustomerRoutes";
import NavbarSearch from "../Search/NavbarSearch";
import NotificationBell from "./NotificationBell"; // ✅ NEW

const Navbar = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const auth          = useAppSelector((s) => s.auth);
  const user          = useAppSelector((s) => s.user);
  const cart          = useAppSelector((s) => s.cart);
  const wishlist      = useAppSelector((s) => s.wishlist);
  const sellerProfile = useAppSelector((s) => s.sellers.profile);

  const { isDark, toggleTheme } = useTheme();

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeCat,    setActiveCat]    = useState<string | null>(null);

  const leaveTimer = useRef<NodeJS.Timeout>();

  const cartCount  = cart?.cart?.cartItems?.length        || 0;
  const wishCount  = wishlist?.wishlist?.products?.length || 0;
  const isLoggedIn = !!(localStorage.getItem("jwt") || auth?.jwt);

  const isAdmin    = user?.user?.role === "ROLE_ADMIN";
  const isSeller   = !!sellerProfile;
  const isCustomer = isLoggedIn && !isSeller && !isAdmin;

  const displayName = isSeller
    ? sellerProfile?.sellerName || sellerProfile?.businessDetails?.businessName || "Seller"
    : user?.user?.fullName || user?.user?.email || "User";
  const displayEmail = isSeller
    ? sellerProfile?.email
    : user?.user?.email || "";
  const displayBadge = isAdmin  ? "Admin"
                     : isSeller ? (sellerProfile?.businessDetails?.businessName || "Seller Account")
                                : "Customer";

  const avatarGrad = isAdmin
    ? "linear-gradient(135deg, #ef4444, #dc2626)"
    : isSeller
    ? "linear-gradient(135deg, #10b981, #059669)"
    : "linear-gradient(135deg, #8b5cf6, #6366f1)";

  const avatarShadow = isAdmin
    ? "0 4px 14px rgba(239,68,68,0.45)"
    : isSeller
    ? "0 4px 14px rgba(16,185,129,0.45)"
    : "0 4px 14px rgba(99,102,241,0.45)";

  const becomeSellerLink = sellerProfile ? "/seller" : "/become-seller";
  const becomeSellerText = sellerProfile ? "Seller Dashboard" : "Become a Seller";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearch(false);
    setActiveCat(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleCatEnter = (catId: string) => {
    clearTimeout(leaveTimer.current);
    setActiveCat(catId);
  };
  const handleCatLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveCat(null), 200);
  };
  const handleSheetEnter = () => clearTimeout(leaveTimer.current);
  const handleSheetLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveCat(null), 200);
  };

  const handleLogout = () => {
    dispatch(performLogout() as any);
    localStorage.clear();
    sessionStorage.clear();
    setUserMenuOpen(false);
    setTimeout(() => { window.location.href = "/"; }, 100);
  };

  const headerBg = isDark ? "#0D0D12" : "#ffffff";
  const tier1Bg  = isDark
    ? "linear-gradient(90deg, #1a1a2e, #16213e, #1a1a2e)"
    : "linear-gradient(90deg, #4f46e5, #7c3aed, #4f46e5)";
  const border = isDark
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(0,0,0,0.08)";

  return (
    <>
      {/* TIER 1 — Top Utility Bar */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            style={{ background: tier1Bg }}
          >
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-9 flex items-center justify-between">
              <div className="flex items-center gap-5 text-xs">
                <span className="flex items-center gap-1.5 text-white/60">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                  />
                  Free delivery above ₹499
                </span>
                <span className="text-white/20 hidden sm:block">|</span>
                <span className="text-white/50 hidden sm:block">📞 1800-NEXKART</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <Link
                  to={becomeSellerLink}
                  className="text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors font-semibold"
                >
                  {isSeller ? <Store size={11} /> : <Zap size={10} />}
                  {becomeSellerText}
                </Link>
                <span className="text-white/20">|</span>
                <Link
                  to="/account/orders"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Track Order
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TIER 2 — Main Header */}
      <header
        className="sticky top-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? isDark ? "rgba(13,13,18,0.95)" : "rgba(255,255,255,0.95)"
            : headerBg,
          backdropFilter:       scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: border,
          boxShadow: scrolled
            ? isDark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.08)"
            : "none",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Nexkart"
                  className="h-10 w-auto hidden sm:block"
                />
                <img
                  src="/logo1.png"
                  alt="Nexkart"
                  className="h-10 w-auto sm:hidden"
                />
              </motion.div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-4 relative">
              <NavbarSearch isDark={isDark} navigate={navigate} />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">

              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={toggleTheme}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  isDark
                    ? "text-white/40 hover:text-white hover:bg-white/8"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun size={17} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon size={17} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile search toggle */}
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => setMobileSearch(!mobileSearch)}
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  isDark
                    ? "text-white/40 hover:text-white hover:bg-white/8"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {mobileSearch ? <X size={17} /> : <Search size={17} />}
              </motion.button>

              {/* ✅ REAL Notification Bell — replaces fake one */}
              {isLoggedIn && <NotificationBell isDark={isDark} />}

              {/* Wishlist */}
              <Link to={isLoggedIn ? "/wishlist" : "/login"}>
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${
                    isDark
                      ? "text-white/40 hover:text-white hover:bg-white/8"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Heart
                    size={17}
                    className="group-hover:text-pink-400 transition-colors"
                  />
                  {wishCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                      style={{ boxShadow: "0 0 8px rgba(236,72,153,0.6)" }}
                    >
                      {wishCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={() =>
                  isLoggedIn ? navigate("/cart") : navigate("/login")
                }
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${
                  isDark
                    ? "text-white/40 hover:text-white hover:bg-white/8"
                    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ShoppingCart
                  size={17}
                  className="group-hover:text-indigo-400 transition-colors"
                />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center"
                    style={{ boxShadow: "0 0 8px rgba(99,102,241,0.6)" }}
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Account Dropdown */}
              {isLoggedIn ? (
                <div className="relative hidden sm:block ml-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all ${
                      isDark ? "bg-white/6 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <Avatar
                      sx={{
                        width:      26,
                        height:     26,
                        fontSize:   "11px",
                        background: avatarGrad,
                        boxShadow:  avatarShadow,
                      }}
                    >
                      {displayName?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                    <span
                      className={`text-sm font-medium max-w-[80px] truncate ${
                        isDark ? "text-white/80" : "text-gray-700"
                      }`}
                    >
                      {displayName?.split(" ")[0] || "Me"}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      } ${isDark ? "text-white/30" : "text-gray-400"}`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
                          style={{
                            background: isDark
                              ? "rgba(15,15,26,0.98)"
                              : "rgba(255,255,255,0.98)",
                            border: isDark
                              ? "1px solid rgba(255,255,255,0.08)"
                              : "1px solid rgba(0,0,0,0.08)",
                            boxShadow: isDark
                              ? "0 20px 60px rgba(0,0,0,0.6)"
                              : "0 20px 60px rgba(0,0,0,0.15)",
                          }}
                        >
                          {/* User header */}
                          <div
                            style={{
                              background: avatarGrad,
                              padding: "16px",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: "-20px",
                                right: "-20px",
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.1)",
                              }}
                            />
                            <div className="flex items-center gap-3 relative z-10">
                              <Avatar
                                sx={{
                                  width: 48,
                                  height: 48,
                                  background: "rgba(255,255,255,0.25)",
                                  color: "#fff",
                                  fontSize: 18,
                                  fontWeight: 700,
                                  border: "2px solid rgba(255,255,255,0.4)",
                                }}
                              >
                                {displayName?.charAt(0)?.toUpperCase() || "U"}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate">
                                  {displayName}
                                </p>
                                <p className="text-white/75 text-xs truncate">
                                  {displayEmail}
                                </p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                                  {isAdmin ? (
                                    <Shield size={9} />
                                  ) : isSeller ? (
                                    <Store size={9} />
                                  ) : (
                                    <User size={9} />
                                  )}
                                  {displayBadge}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Seller/Admin dashboard link */}
                          {(isSeller || isAdmin) && (
                            <div
                              className="p-3 border-b"
                              style={{
                                borderColor: isDark
                                  ? "rgba(255,255,255,0.06)"
                                  : "#f3f4f6",
                              }}
                            >
                              <Link
                                to={isAdmin ? "/admin" : "/seller"}
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center justify-between p-3 rounded-xl"
                                  style={{
                                    background: avatarGrad,
                                    boxShadow:  avatarShadow,
                                  }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {isAdmin ? (
                                      <Shield size={18} className="text-white" />
                                    ) : (
                                      <Store size={18} className="text-white" />
                                    )}
                                    <div>
                                      <p className="text-white font-bold text-sm leading-tight">
                                        {isAdmin ? "Admin Panel" : "Seller Dashboard"}
                                      </p>
                                      <p className="text-white/75 text-[10px] leading-tight mt-0.5">
                                        {isAdmin
                                          ? "Manage platform"
                                          : "Manage your store"}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight size={16} className="text-white" />
                                </motion.div>
                              </Link>
                            </div>
                          )}

                          {/* Become seller CTA */}
                          {isCustomer && (
                            <div
                              className="p-3 border-b"
                              style={{
                                borderColor: isDark
                                  ? "rgba(255,255,255,0.06)"
                                  : "#f3f4f6",
                              }}
                            >
                              <Link
                                to="/become-seller"
                                onClick={() => setUserMenuOpen(false)}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex items-center justify-between p-3 rounded-xl"
                                  style={{
                                    background:
                                      "linear-gradient(135deg, #f59e0b, #ef4444)",
                                    boxShadow:
                                      "0 4px 14px rgba(245,158,11,0.4)",
                                  }}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Store size={18} className="text-white" />
                                    <div>
                                      <p className="text-white font-bold text-sm leading-tight">
                                        Become a Seller
                                      </p>
                                      <p className="text-white/75 text-[10px] leading-tight mt-0.5">
                                        Start selling on Nexkart
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight size={16} className="text-white" />
                                </motion.div>
                              </Link>
                            </div>
                          )}

                          {/* Menu links */}
                          <div className="p-2">
                            {!isSeller && !isAdmin && (
                              <>
                                {[
                                  {
                                    icon: User,
                                    label: "My Profile",
                                    href: "/account/profile",
                                  },
                                  {
                                    icon: Package,
                                    label: "My Orders",
                                    href: "/account/orders",
                                  },
                                  {
                                    icon: Heart,
                                    label: "Wishlist",
                                    href: "/wishlist",
                                  },
                                ].map((item) => (
                                  <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={() => setUserMenuOpen(false)}
                                  >
                                    <motion.div
                                      whileHover={{ x: 4 }}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                        isDark
                                          ? "text-white/60 hover:text-white hover:bg-white/6"
                                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                      }`}
                                    >
                                      <item.icon size={14} />
                                      {item.label}
                                    </motion.div>
                                  </Link>
                                ))}
                              </>
                            )}

                            {isSeller && !isAdmin && (
                              <>
                                {[
                                  {
                                    icon: Package,
                                    label: "My Products",
                                    href: "/seller/products",
                                  },
                                  {
                                    icon: Store,
                                    label: "Marketplace",
                                    href: "/seller/marketplace",
                                  },
                                  {
                                    icon: User,
                                    label: "Seller Profile",
                                    href: "/seller/account",
                                  },
                                ].map((item) => (
                                  <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={() => setUserMenuOpen(false)}
                                  >
                                    <motion.div
                                      whileHover={{ x: 4 }}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                        isDark
                                          ? "text-white/60 hover:text-white hover:bg-white/6"
                                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                      }`}
                                    >
                                      <item.icon size={14} />
                                      {item.label}
                                    </motion.div>
                                  </Link>
                                ))}
                              </>
                            )}

                            <div
                              className={`my-1.5 h-px ${
                                isDark ? "bg-white/5" : "bg-gray-100"
                              }`}
                            />

                            <motion.button
                              whileHover={{ x: 4 }}
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/8 transition-all"
                            >
                              <LogOut size={14} />
                              Sign Out
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block ml-3">
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all whitespace-nowrap"
                    style={{
                      background:
                        "linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)",
                      boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
                    }}
                  >
                    <User size={15} />
                    Login
                  </motion.button>
                </Link>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(true)}
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl ml-1 transition-all ${
                  isDark
                    ? "text-white/50 hover:text-white hover:bg-white/8"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Menu size={19} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden lg:hidden"
              style={{ borderTop: border }}
            >
              <div className="px-4 py-3">
                <NavbarSearch isDark={isDark} navigate={navigate} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TIER 3 — Category Bar */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ height: 44, opacity: 1 }}
              animate={{ height: 44, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:block overflow-hidden"
              style={{
                backgroundColor: isDark ? "#13131a" : "#f3f4f6",
                borderTop: isDark
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
                <div className="flex items-center h-11 gap-1">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mr-2 transition-all"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(108,99,255,0.15)"
                        : "rgba(108,99,255,0.1)",
                      color: "#6C63FF",
                      border: "1px solid rgba(108,99,255,0.25)",
                    }}
                    onClick={() => navigate("/all-categories")}
                  >
                    <Menu size={13} />
                    All Categories
                  </button>

                  <div
                    className="w-px h-5 mx-1"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.1)",
                    }}
                  />

                  {mainCategory.map((cat) => (
                    <div
                      key={cat.categoryId}
                      onMouseEnter={() => handleCatEnter(cat.categoryId)}
                      onMouseLeave={handleCatLeave}
                      className="relative"
                    >
                      <motion.div
                        whileHover={{ y: -1 }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          activeCat === cat.categoryId
                            ? isDark
                              ? "text-white bg-white/10"
                              : "text-indigo-600 bg-indigo-50"
                            : isDark
                            ? "text-white/60 hover:text-white hover:bg-white/8"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white"
                        }`}
                      >
                        {cat.name}
                        <motion.div
                          animate={{
                            rotate: activeCat === cat.categoryId ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={11} className="opacity-50" />
                        </motion.div>
                      </motion.div>
                    </div>
                  ))}

                  <Link to="/products/men_t_shirts">
                    <motion.div
                      whileHover={{ y: -1 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isDark
                          ? "text-white/60 hover:text-white hover:bg-white/8"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white"
                      }`}
                    >
                      Deals
                      <motion.span
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #f97316, #ef4444)",
                          boxShadow: "0 0 8px rgba(239,68,68,0.45)",
                        }}
                      >
                        HOT
                      </motion.span>
                    </motion.div>
                  </Link>

                  {[
                    { label: "New Arrivals", path: "/products/electronics" },
                    { label: "Top Brands",   path: "/products/mobiles" },
                    { label: "Sale",         path: "/products/men_topwear" },
                  ].map((link) => (
                    <Link key={link.label} to={link.path}>
                      <motion.div
                        whileHover={{ y: -1 }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isDark
                            ? "text-white/60 hover:text-white hover:bg-white/8"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white"
                        }`}
                      >
                        {link.label}
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category sheet dropdown */}
        <AnimatePresence>
          {activeCat && (
            <motion.div
              key={activeCat}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 z-40"
              style={{
                boxShadow: isDark
                  ? "0 20px 60px rgba(0,0,0,0.5)"
                  : "0 20px 40px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={handleSheetEnter}
              onMouseLeave={handleSheetLeave}
            >
              <CategorySheet
                selectedCategory={activeCat}
                setShowSheet={(v: boolean) => !v && setActiveCat(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            background: isDark ? "#0D0D12" : "#ffffff",
            borderRight: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.08)",
          },
        }}
      >
        <DrawerList toggleDrawer={() => () => setMobileOpen(false)} />
      </Drawer>
    </>
  );
};

export default Navbar;