import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Tag, Heart, Trash2, Plus, Minus, Truck,
  Shield, Award, ArrowRight, X, CheckCircle, AlertCircle,
  Gift, Loader2, Clock, Lock,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchUserCart, deleteCartItem, updateCartItem } from "../../../Redux Toolkit/Customer/CartSlice";
import { applyCoupon } from "../../../Redux Toolkit/Customer/CouponSlice";
import { addProductToWishlist } from "../../../Redux Toolkit/Customer/WishlistSlice";
import { useTheme } from "../../../routes/CustomerRoutes";
import CloudImage from "../../../components/ui/CloudImage";

const Cart = () => {
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const { isDark } = useTheme();

  // ✅ Specific selectors
  const cart    = useAppSelector((s) => s.cart);
  const auth    = useAppSelector((s) => s.auth);
  const coupone = useAppSelector((s) => s.coupone);

  const [couponCode, setCouponCode] = useState("");
  const [snackbar, setSnackbar]     = useState<{
    open: boolean; msg: string; type: "success" | "error";
  }>({ open: false, msg: "", type: "success" });

  const items     = cart?.cart?.cartItems || [];
  const itemCount = items.length;

  useEffect(() => {
    dispatch(fetchUserCart(localStorage.getItem("jwt") || ""));
  }, [auth.jwt]);

  useEffect(() => {
    if (coupone.couponApplied)
      setSnackbar({ open: true, msg: "Coupon applied successfully! 🎉", type: "success" });
    if (coupone.error)
      setSnackbar({ open: true, msg: coupone.error, type: "error" });
    if (coupone.couponApplied || coupone.error)
      setCouponCode("");
  }, [coupone.couponApplied, coupone.error]);

  useEffect(() => {
    if (snackbar.open) {
      const t = setTimeout(() => setSnackbar((p) => ({ ...p, open: false })), 4000);
      return () => clearTimeout(t);
    }
  }, [snackbar.open]);

  const handleApplyCoupon = (apply: string) => {
    let code = couponCode;
    if (apply === "false") code = cart.cart?.couponCode || "";
    dispatch(applyCoupon({
      apply,
      code,
      orderValue: cart.cart?.totalSellingPrice || 100,
      jwt: localStorage.getItem("jwt") || "",
    }));
  };

  const handleQuantity = (item: any, delta: number) => {
    if (item.quantity + delta < 1) return;
    dispatch(updateCartItem({
      jwt: localStorage.getItem("jwt"),
      cartItemId: item._id,
      cartItem: { quantity: item.quantity + delta },
    }));
  };

  const handleRemove = (item: any) => {
    dispatch(deleteCartItem({
      jwt: localStorage.getItem("jwt") || "",
      cartItemId: item._id,
    }));
  };

  const handleSaveForLater = (item: any) => {
    if (item.product?._id) {
      dispatch(addProductToWishlist({ productId: item.product._id }));
      handleRemove(item);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(isNaN(n) ? 0 : n);

  // ✅ Price calculations
  const subtotal      = cart.cart?.totalMrpPrice     || 0;
  const sellingTotal  = cart.cart?.totalSellingPrice  || 0;
  const discount      = Math.max(0, subtotal - sellingTotal);
  const couponDiscount = (cart.cart as any)?.couponPrice || 0;
  const shipping      = sellingTotal > 1500 ? 0 : 79;
  const tax           = Math.round(sellingTotal * 0.05);
  const grandTotal    = Math.max(0, sellingTotal - couponDiscount + shipping + tax);
  const totalSavings  = discount + couponDiscount;

  // ✅ Safe item price helper
  const getItemPrice = (item: any) => {
    const qty      = item.quantity ?? 1;
    const unitSell = item.sellingPrice ?? item.product?.minPrice ?? item.product?.sellingPrice ?? 0;
    const unitMrp  = item.mrpPrice    ?? item.product?.minMrpPrice ?? item.product?.mrpPrice ?? 0;
    return {
      sellingPrice: unitSell * qty,
      mrpPrice:     unitMrp  * qty,
    };
  };

  // ✅ Safe product URL
  const getProductUrl = (product: any) =>
    `/product-details/${
      product?.category?.categoryId || "all"
    }/${encodeURIComponent(product?.title || "")}/${product?._id}`;

  // ── Empty Cart ──
  if (!cart.cart || items.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${
        isDark ? "bg-[#0a0a0f]" : "bg-gray-50"
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`max-w-md w-full text-center p-10 rounded-3xl ${
            isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-lg"
          }`}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))" }}
          >
            <ShoppingBag size={42} className="text-indigo-400" />
          </motion.div>
          <h2 className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Your cart is empty
          </h2>
          <p className={`text-sm mb-6 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Looks like you haven't added anything yet
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <ShoppingBag size={15} /> Start Shopping
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/wishlist")}
              className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                isDark ? "bg-white/5 text-white border border-white/10"
                       : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <Heart size={15} /> View Wishlist
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 px-4 lg:px-8 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Shopping Cart
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══ LEFT — Items ═══ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Delivery Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 p-4 rounded-2xl ${
                isDark ? "bg-emerald-500/8 border border-emerald-500/20"
                       : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Truck size={18} className="text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {sellingTotal > 1500
                    ? "🎉 You qualify for FREE delivery!"
                    : `Add ₹${(1500 - sellingTotal).toLocaleString("en-IN")} more for FREE delivery`}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  Estimated delivery: 3-5 business days
                </p>
              </div>
            </motion.div>

            {/* Cart Items */}
            <AnimatePresence>
              {items.map((item: any, i: number) => {
                const { sellingPrice, mrpPrice } = getItemPrice(item);
                // ✅ Safe URL - never undefined
                const productUrl = getProductUrl(item.product);

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative rounded-2xl overflow-hidden ${
                      isDark ? "bg-white/5 border border-white/8 hover:border-white/15"
                             : "bg-white border border-gray-100 hover:border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="p-4 flex gap-4">
                      {/* ✅ Image - safe URL */}
                      <div
                        onClick={() => navigate(productUrl)}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer"
                      >
                        <CloudImage
  src={item.product?.images?.[0]}
  alt={item.product?.title || "product"}
  width={200}
  height={200}
  quality="good"
  objectFit="cover"
  lazy={true}
  fallback="https://placehold.co/200x200?text=No+Image"
  className="w-full h-full hover:scale-105 transition-transform"
/>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-medium mb-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                          {item.product?.seller?.businessDetails?.businessName ||
                           item.product?.defaultListing?.seller?.businessDetails?.businessName ||
                           "Nexkart"}
                        </p>

                        {/* ✅ Title - safe URL */}
                        <h3
                          onClick={() => navigate(productUrl)}
                          className={`text-sm font-semibold line-clamp-2 mb-1 cursor-pointer hover:text-indigo-400 transition-colors ${
                            isDark ? "text-white/90" : "text-gray-900"
                          }`}
                        >
                          {item.product?.title || "Product"}
                        </h3>

                        {item.size && item.size !== "FREE SIZE" && (
                          <p className={`text-xs mb-2 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                            Size: <span className="font-bold">{item.size}</span>
                          </p>
                        )}

                        {/* ✅ Price - never NaN */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className={`font-black text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                            {fmt(sellingPrice)}
                          </span>
                          {mrpPrice > sellingPrice && (
                            <>
                              <span className={`text-xs line-through ${isDark ? "text-white/30" : "text-gray-400"}`}>
                                {fmt(mrpPrice)}
                              </span>
                              <span className="text-xs font-bold text-green-500">
                                {Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)}% off
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="flex items-center gap-1 text-green-500 font-medium">
                            <CheckCircle size={11} /> In Stock
                          </span>
                          <span className={`flex items-center gap-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                            <Clock size={11} /> Delivery in 3-5 days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className={`flex items-center justify-between px-4 py-2.5 border-t ${
                      isDark ? "border-white/5 bg-white/2" : "border-gray-100 bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium mr-2 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                          Qty:
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantity(item, -1)}
                          disabled={item.quantity === 1}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 ${
                            isDark ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                   : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Minus size={11} />
                        </motion.button>
                        <span className={`px-3 font-bold text-sm min-w-[30px] text-center ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantity(item, 1)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                            isDark ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                   : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Plus size={11} />
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleSaveForLater(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-pink-500 hover:bg-pink-500/10 transition-colors"
                        >
                          <Heart size={11} /> Save
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={11} /> Remove
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Trust Badges */}
            <div className={`grid grid-cols-3 gap-3 p-4 rounded-2xl ${
              isDark ? "bg-white/3 border border-white/8" : "bg-white border border-gray-100"
            }`}>
              {[
                { icon: Lock,  label: "Secure Payment", desc: "256-bit SSL"  },
                { icon: Truck, label: "Free Delivery",  desc: "Above ₹1500"  },
                { icon: Award, label: "Easy Returns",   desc: "7-day policy" },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <t.icon size={15} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className={`text-[11px] font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t.label}</p>
                    <p className={`text-[9px] ${isDark ? "text-white/40" : "text-gray-500"}`}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══ RIGHT — Summary ═══ */}
          <div className="lg:col-span-1 space-y-4">

            {/* Coupon */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl p-5 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Gift size={16} className="text-amber-400" />
                <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Apply Coupon</h3>
              </div>

              {!cart.cart?.couponCode ? (
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none uppercase font-bold ${
                      isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                             : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleApplyCoupon("true")}
                    disabled={!couponCode || coupone.loading}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
                  >
                    {coupone.loading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                  </motion.button>
                </div>
              ) : (
                <div className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-green-500/10 border border-green-500/30" : "bg-green-50 border border-green-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-green-500" />
                    <div>
                      <p className="text-green-500 text-xs font-bold">{cart.cart.couponCode}</p>
                      <p className={`text-[10px] ${isDark ? "text-white/50" : "text-gray-500"}`}>Coupon applied</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApplyCoupon("false")}
                    className="w-7 h-7 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center hover:bg-red-500/25"
                  >
                    <X size={11} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Price Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl p-5 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <h3 className={`font-bold text-sm mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Price Details ({itemCount} {itemCount === 1 ? "item" : "items"})
              </h3>
              <div className="space-y-3 text-sm">
                <Row label="Total MRP" value={fmt(subtotal)} isDark={isDark} />
                {discount > 0 && (
                  <Row label="Discount on MRP" value={`- ${fmt(discount)}`} color="text-green-500" isDark={isDark} />
                )}
                {couponDiscount > 0 && (
                  <Row label="Coupon Discount" value={`- ${fmt(couponDiscount)}`} color="text-green-500" isDark={isDark} />
                )}
                <Row
                  label="Delivery Charges"
                  value={shipping === 0 ? "FREE" : fmt(shipping)}
                  color={shipping === 0 ? "text-green-500" : ""}
                  strike={shipping === 0 ? "₹79" : undefined}
                  isDark={isDark}
                />
                <Row label="Platform Fee" value="FREE" color="text-green-500" isDark={isDark} />
                <Row label="Tax (5% GST)" value={fmt(tax)} isDark={isDark} />
                <div className={`h-px my-3 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <div className="flex justify-between items-center">
                  <span className={`font-black ${isDark ? "text-white" : "text-gray-900"}`}>Total Amount</span>
                  <span className={`font-black text-xl ${isDark ? "text-white" : "text-gray-900"}`}>
                    {fmt(grandTotal)}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className={`text-xs font-bold text-center py-2 rounded-lg mt-2 ${
                    isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"
                  }`}>
                    🎉 You're saving {fmt(totalSavings)} on this order!
                  </div>
                )}
              </div>
            </motion.div>

            {/* Checkout Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl p-4 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/place-order")}
                className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  boxShadow: "0 10px 30px rgba(245,158,11,0.3)",
                }}
              >
                <Lock size={14} /> Proceed to Checkout <ArrowRight size={14} />
              </motion.button>
              <button
                onClick={() => navigate("/")}
                className={`w-full mt-2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                ← Continue Shopping
              </button>
              <div className={`flex items-center justify-center gap-1.5 mt-3 text-[10px] ${
                isDark ? "text-white/40" : "text-gray-500"
              }`}>
                <Shield size={10} /> Safe & Secure Payment
              </div>
            </motion.div>

            {/* Wishlist Promo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate("/wishlist")}
              className={`rounded-2xl p-4 cursor-pointer transition-all ${
                isDark ? "bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/15"
                       : "bg-pink-50 border border-pink-200 hover:bg-pink-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center">
                    <Heart size={15} className="text-pink-500" fill="currentColor" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Add from Wishlist
                    </p>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>View saved items</p>
                  </div>
                </div>
                <ArrowRight size={14} className={isDark ? "text-white/40" : "text-gray-400"} />
              </div>
            </motion.div>
          </div>
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
            <span className="text-sm font-medium">{snackbar.msg}</span>
            <button
              onClick={() => setSnackbar((p) => ({ ...p, open: false }))}
              className="ml-1 opacity-50 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Row = ({
  label, value, color = "", strike, isDark,
}: {
  label: string; value: string; color?: string; strike?: string; isDark: boolean;
}) => (
  <div className="flex justify-between items-center">
    <span className={isDark ? "text-white/60" : "text-gray-600"}>{label}</span>
    <div className="flex items-center gap-2">
      {strike && (
        <span className={`text-xs line-through ${isDark ? "text-white/30" : "text-gray-400"}`}>{strike}</span>
      )}
      <span className={`font-bold ${color || (isDark ? "text-white" : "text-gray-900")}`}>{value}</span>
    </div>
  </div>
);

export default Cart;