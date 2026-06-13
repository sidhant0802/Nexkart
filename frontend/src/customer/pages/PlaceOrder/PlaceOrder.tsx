import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, MapPin, CreditCard, Truck, Shield,
  CheckCircle, Lock, ArrowRight, ArrowLeft, Tag,
  Package, Clock, Award, X, AlertCircle, Loader2,
  Edit2, ChevronRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchUserCart } from "../../../Redux Toolkit/Customer/CartSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();
  const { cart, auth, user } = useAppSelector((s) => s);

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod">("card");
  const [placing, setPlacing] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; type: "success" | "error" }>({
    open: false, msg: "", type: "success",
  });

  const items = cart?.cart?.cartItems || [];
  const itemCount = items.length;
  const addresses = user?.user?.addresses || [];
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchUserCart(localStorage.getItem("jwt") || ""));
  }, [auth.jwt]);

  // Redirect if cart empty
  useEffect(() => {
    if (cart.cart && items.length === 0) {
      navigate("/cart");
    }
  }, [items]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n);

  // Calculations
  const subtotal       = cart.cart?.totalMrpPrice || 0;
  const sellingTotal   = cart.cart?.totalSellingPrice || 0;
  const discount       = subtotal - sellingTotal;
  const couponDiscount = cart.cart?.discount || 0;
  const shipping       = sellingTotal > 1500 ? 0 : 79;
  const tax            = Math.round(sellingTotal * 0.05);
  const grandTotal     = sellingTotal - couponDiscount + shipping + tax;
  const totalSavings   = discount + couponDiscount;

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      setSnackbar({ open: true, msg: "Please add a delivery address first", type: "error" });
      setTimeout(() => navigate("/checkout/address"), 1500);
      return;
    }

    setPlacing(true);
    // TODO: Dispatch createOrder thunk here
    // For now, redirect to payment
    setTimeout(() => {
      navigate("/checkout/address");
      setPlacing(false);
    }, 1500);
  };

  useEffect(() => {
    if (snackbar.open) {
      const t = setTimeout(() => setSnackbar((p) => ({ ...p, open: false })), 4000);
      return () => clearTimeout(t);
    }
  }, [snackbar.open]);

  if (!cart.cart || items.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-indigo-400 mx-auto mb-3" />
          <p className={isDark ? "text-white/50" : "text-gray-500"}>Loading order...</p>
        </div>
      </div>
    );
  }

  const selectedAddress = addresses[selectedAddressIndex];

  return (
    <div className={`min-h-screen py-6 px-4 lg:px-8 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/cart")}
            className={`flex items-center gap-2 text-sm font-medium mb-3 transition-colors ${
              isDark ? "text-white/50 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={14} /> Back to Cart
          </button>

          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Review Your Order
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Confirm details before placing your order
          </p>
        </motion.div>

        {/* ── Stepper ── */}
        <div className={`flex items-center gap-3 mb-8 p-4 rounded-2xl ${
          isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100"
        }`}>
          {[
            { label: "Cart",     icon: ShoppingBag, done: true },
            { label: "Review",   icon: Package,     active: true },
            { label: "Payment",  icon: CreditCard,  done: false },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: step.done
                      ? "#22c55e"
                      : step.active
                      ? "linear-gradient(135deg, #8b5cf6, #6366f1)"
                      : isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
                  }}
                >
                  {step.done ? (
                    <CheckCircle size={16} className="text-white" />
                  ) : (
                    <step.icon size={16} className={step.active ? "text-white" : isDark ? "text-white/30" : "text-gray-400"} />
                  )}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${
                  step.done ? "text-green-500"
                  : step.active ? (isDark ? "text-white" : "text-gray-900")
                  : (isDark ? "text-white/30" : "text-gray-400")
                }`}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-0.5 -mt-5 mx-2 ${
                  step.done ? "bg-green-500" : isDark ? "bg-white/10" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ═══════════ LEFT — Address + Items + Payment ═══════════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* ── 1. Delivery Address ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-5 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <MapPin size={15} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Delivery Address
                    </h3>
                    <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      Where should we ship your order?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/checkout/address")}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  <Edit2 size={11} /> Change
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className={`p-4 rounded-xl text-center ${
                  isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
                }`}>
                  <AlertCircle size={20} className="mx-auto mb-2 text-amber-500" />
                  <p className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                    No address added yet
                  </p>
                  <button
                    onClick={() => navigate("/checkout/address")}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
                  >
                    + Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr: any, i: number) => (
                    <button
                      key={addr._id}
                      onClick={() => setSelectedAddressIndex(i)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        selectedAddressIndex === i
                          ? isDark
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-indigo-500 bg-indigo-50"
                          : isDark
                          ? "border-white/10 bg-white/3 hover:border-white/20"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          selectedAddressIndex === i
                            ? "border-indigo-500 bg-indigo-500"
                            : isDark ? "border-white/30" : "border-gray-300"
                        }`}>
                          {selectedAddressIndex === i && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                              {addr.name}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${
                              isDark ? "bg-white/10 text-white/70" : "bg-gray-200 text-gray-700"
                            }`}>
                              HOME
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}>
                            {addr.address}, {addr.locality}, {addr.city}, {addr.state} - {addr.pinCode}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                            📞 {addr.mobile}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── 2. Order Items ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl p-5 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                    <Package size={15} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      Order Items ({itemCount})
                    </h3>
                    <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      Review your products
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/cart")}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  <Edit2 size={11} /> Edit Cart
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item: any) => (
                  <div key={item._id} className={`flex gap-3 p-3 rounded-xl ${
                    isDark ? "bg-white/3" : "bg-gray-50"
                  }`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img loading="lazy" decoding="async"
                        src={item.product?.images?.[0]}
                        alt={item.product?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-medium ${isDark ? "text-white/40" : "text-gray-400"}`}>
                        {item.product?.seller?.businessDetails?.businessName || "Nexkart"}
                      </p>
                      <h4 className={`text-xs font-semibold line-clamp-2 mt-0.5 ${
                        isDark ? "text-white/90" : "text-gray-900"
                      }`}>
                        {item.product?.title}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>
                          Qty: <span className="font-bold">{item.quantity}</span>
                          {item.size && item.size !== "FREE SIZE" && (
                            <> • Size: <span className="font-bold">{item.size}</span></>
                          )}
                        </span>
                        <span className={`text-sm font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                          {fmt(item.sellingPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── 3. Payment Method ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl p-5 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <CreditCard size={15} className="text-purple-400" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                    Payment Method
                  </h3>
                  <p className={`text-[10px] ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Choose how you'd like to pay
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "card", label: "Card",        icon: "💳", desc: "Credit/Debit" },
                  { id: "upi",  label: "UPI",         icon: "📱", desc: "PhonePe, GPay" },
                  { id: "cod",  label: "Cash on Delivery", icon: "💵", desc: "Pay on receive" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id as any)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === p.id
                        ? isDark
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-500 bg-purple-50"
                        : isDark
                        ? "border-white/10 bg-white/3 hover:border-white/20"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{p.icon}</div>
                    <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {p.label}
                    </p>
                    <p className={`text-[9px] mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      {p.desc}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ═══════════ RIGHT — Order Summary ═══════════ */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl p-5 sticky top-6 ${
                isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              <h3 className={`font-black text-base mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Order Summary
              </h3>

              {/* Delivery info */}
              <div className={`flex items-start gap-2 p-3 rounded-xl mb-4 ${
                isDark ? "bg-emerald-500/10" : "bg-emerald-50"
              }`}>
                <Truck size={14} className="text-emerald-500 mt-0.5" />
                <div>
                  <p className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Estimated Delivery
                  </p>
                  <p className="text-emerald-500 text-xs font-bold">
                    {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short",
                    })} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-sm">
                <Row label={`Items (${itemCount})`} value={fmt(subtotal)} isDark={isDark} />
                <Row label="Discount"    value={`- ${fmt(discount)}`} color="text-green-500" isDark={isDark} />
                {couponDiscount > 0 && (
                  <Row label={`Coupon (${cart.cart?.couponCode})`} value={`- ${fmt(couponDiscount)}`} color="text-green-500" isDark={isDark} />
                )}
                <Row label="Delivery"
                  value={shipping === 0 ? "FREE" : fmt(shipping)}
                  color={shipping === 0 ? "text-green-500" : ""}
                  isDark={isDark} />
                <Row label="Tax (5% GST)" value={fmt(tax)} isDark={isDark} />

                <div className={`h-px my-3 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />

                <div className="flex justify-between items-baseline">
                  <span className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                    Total
                  </span>
                  <div className="text-right">
                    <p className={`font-black text-2xl ${isDark ? "text-white" : "text-gray-900"}`}>
                      {fmt(grandTotal)}
                    </p>
                    <p className="text-[10px] text-green-500 font-bold mt-0.5">
                      You save {fmt(totalSavings)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ Place Order Button */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={placing || addresses.length === 0}
                className="w-full mt-5 py-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  boxShadow: "0 15px 40px rgba(245,158,11,0.4)",
                }}
              >
                {placing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={14} />
                    Place Order
                    <ArrowRight size={14} />
                  </>
                )}
              </motion.button>

              <div className={`flex items-center justify-center gap-1.5 mt-3 text-[10px] ${
                isDark ? "text-white/40" : "text-gray-500"
              }`}>
                <Shield size={10} /> Safe & Secure Checkout
              </div>

              {/* Trust badges */}
              <div className={`grid grid-cols-3 gap-2 mt-4 pt-4 border-t ${
                isDark ? "border-white/10" : "border-gray-100"
              }`}>
                {[
                  { icon: Truck, label: "Free Returns" },
                  { icon: Shield, label: "Secure Pay" },
                  { icon: Award, label: "Authentic" },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center gap-1">
                    <t.icon size={14} className={isDark ? "text-white/40" : "text-gray-400"} />
                    <p className={`text-[9px] font-medium text-center ${
                      isDark ? "text-white/50" : "text-gray-500"
                    }`}>
                      {t.label}
                    </p>
                  </div>
                ))}
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

const Row = ({
  label, value, color = "", isDark,
}: { label: string; value: string; color?: string; isDark: boolean }) => (
  <div className="flex justify-between items-center">
    <span className={isDark ? "text-white/60" : "text-gray-600"}>{label}</span>
    <span className={`font-bold ${color || (isDark ? "text-white" : "text-gray-900")}`}>{value}</span>
  </div>
);

export default PlaceOrder;