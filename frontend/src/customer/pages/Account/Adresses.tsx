import { motion } from "framer-motion";
import { MapPin, Plus, Home } from "lucide-react";
import { useAppSelector } from "../../../Redux Toolkit/Store";
import { useTheme } from "../../../routes/CustomerRoutes";
import UserAddressCard from "./UserAddressCard";

const Addresses = () => {
const user = useAppSelector((s) => s.user);
  const { isDark } = useTheme();
  const addresses = user.user?.addresses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Saved Addresses
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
        >
          <Plus size={13} /> Add Address
        </motion.button>
      </div>

      {addresses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-12 text-center ${
            isDark ? "border border-white/8 bg-white/3" : "border border-gray-100 bg-gray-50"
          }`}
        >
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(16,185,129,0.12)" }}
          >
            <MapPin size={32} className="text-emerald-400" />
          </div>
          <h3 className={`text-lg font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No Addresses Saved
          </h3>
          <p className={`text-sm mb-6 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Add an address for faster checkout
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)" }}
          >
            <Plus size={14} /> Add Your First Address
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {addresses.map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <UserAddressCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;