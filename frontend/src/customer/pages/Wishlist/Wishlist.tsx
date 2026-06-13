import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { getWishlistByUserId } from "../../../Redux Toolkit/Customer/WishlistSlice";
import { useTheme } from "../../../routes/CustomerRoutes";
import WishlistProductCard from "./WishlistProductCard";

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();
 const wishlist = useAppSelector((s) => s.wishlist);
const auth     = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (localStorage.getItem("jwt") || auth?.jwt) {
      dispatch(getWishlistByUserId());
    }
  }, [auth?.jwt]);

  const products = wishlist?.wishlist?.products || [];
  const isLoading = wishlist?.loading;

  return (
    <div className={`min-h-screen py-10 px-4 lg:px-8 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">

        {/* ═══════════ Premium Box Container ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-3xl border p-6 lg:p-8 overflow-hidden ${
            isDark
              ? "border-pink-500/20 shadow-2xl shadow-black/40"
              : "border-pink-200 shadow-lg shadow-pink-100/50"
          }`}
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(244,63,94,0.03) 100%)"
              : "linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)",
          }}
        >
          {/* Decorative blur orb */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
          />

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/30">
                <Heart size={22} className="text-white" fill="white" />
              </div>
              <div>
                <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                  My Wishlist
                </h1>
                <p className={`text-sm mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  {products.length > 0
                    ? `${products.length} ${products.length === 1 ? "item" : "items"} saved for later`
                    : "Save items you love for later"}
                </p>
              </div>
            </div>

            {products.length > 0 && (
              <Link
                to="/"
                className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isDark
                    ? "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                    : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                Continue Shopping <ArrowRight size={13} />
              </Link>
            )}
          </div>

          {/* ── Loading ── */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-72 rounded-2xl animate-pulse ${
                    isDark ? "bg-white/5" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {!isLoading && products.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 relative z-10"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center relative"
                style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(244,63,94,0.1))" }}
              >
                <Heart size={48} className="text-pink-400" />
                <motion.div
                  animate={{ y: [-20, -40, -20], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4"
                >
                  <Sparkles size={16} className="text-amber-400" />
                </motion.div>
              </motion.div>

              <h2 className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Your Wishlist is Empty
              </h2>
              <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                Tap the ❤️ icon on any product to save it here for later.
              </p>

              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                    boxShadow: "0 10px 30px rgba(236,72,153,0.4)",
                  }}
                >
                  <ShoppingBag size={15} />
                  Start Shopping
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
            </motion.div>
          )}

          {/* ═══════════ PRODUCTS GRID — FIXED ═══════════ */}
          {!isLoading && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10"
            >
              {products.map((product: any, i: number) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <WishlistProductCard item={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;