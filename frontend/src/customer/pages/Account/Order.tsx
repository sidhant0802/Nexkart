import { useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Search, Filter, ShoppingBag } from "lucide-react";
import OrderItemCard from "./OrderItemCard";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchUserOrderHistory } from "../../../Redux Toolkit/Customer/OrderSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

const Order = () => {
  const dispatch = useAppDispatch();
  const { isDark } = useTheme();
 const auth   = useAppSelector((s) => s.auth);
const orders = useAppSelector((s) => s.orders);
useEffect(() => {
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    dispatch(fetchUserOrderHistory(jwt));
  }
}, []); 

  const orderItems = orders?.orders?.flatMap((o: any) =>
    o.orderItems.map((item: any) => ({ ...item, order: o }))
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            My Orders
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            {orderItems.length} {orderItems.length === 1 ? "order" : "orders"} so far
          </p>
        </div>
        <button className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
          isDark ? "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                 : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        }`}>
          <Filter size={13} /> Filter
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
          isDark ? "text-white/30" : "text-gray-400"
        }`} />
        <input
          placeholder="Search by order ID, product name..."
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none ${
            isDark ? "bg-white/5 border border-white/10 text-white placeholder-white/30"
                   : "bg-white border border-gray-200 text-gray-900 placeholder-gray-400"
          }`}
        />
      </div>

      {/* Orders */}
      {orders.loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-24 rounded-2xl animate-pulse ${
              isDark ? "bg-white/5" : "bg-gray-100"
            }`} />
          ))}
        </div>
      ) : orderItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-12 text-center ${
            isDark ? "border border-white/8 bg-white/3" : "border border-gray-100 bg-gray-50"
          }`}
        >
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(139,92,246,0.12)" }}
          >
            <ShoppingBag size={32} className="text-purple-400" />
          </div>
          <h3 className={`text-lg font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No Orders Yet
          </h3>
          <p className={`text-sm mb-6 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Start shopping to see your orders here
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
          >
            <Package size={14} /> Start Shopping
          </motion.a>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {orderItems.map((item: any, i: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <OrderItemCard item={item} order={item.order} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;