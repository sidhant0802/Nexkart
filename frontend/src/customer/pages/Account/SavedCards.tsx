import { motion } from "framer-motion";
import { CreditCard, Plus, Shield, Lock, CheckCircle } from "lucide-react";
import { useTheme } from "../../../routes/CustomerRoutes";

const SavedCards = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Saved Cards
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Manage your payment methods
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)" }}
        >
          <Plus size={13} /> Add Card
        </motion.button>
      </div>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-12 text-center relative overflow-hidden ${
          isDark ? "border border-white/8 bg-white/3" : "border border-gray-100 bg-gray-50"
        }`}
      >
        {/* Animated card preview */}
        <motion.div
          initial={{ rotateY: -30, scale: 0.9 }}
          animate={{ rotateY: 0, scale: 1 }}
          className="w-72 h-44 mx-auto mb-6 rounded-2xl p-5 text-white relative overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #6366f1 50%, #8b5cf6 100%)",
            boxShadow: "0 20px 60px rgba(99,102,241,0.3)",
          }}
        >
          {/* Card patterns */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="flex justify-between items-start">
            <CreditCard size={32} className="text-white/80" />
            <span className="text-xs font-bold opacity-70">VISA</span>
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-lg font-mono tracking-widest opacity-80">•••• •••• •••• ••••</p>
            <div className="flex justify-between items-end mt-2">
              <div>
                <p className="text-[8px] opacity-60 uppercase">Card Holder</p>
                <p className="text-xs font-bold mt-0.5">YOUR NAME</p>
              </div>
              <div>
                <p className="text-[8px] opacity-60 uppercase">Expires</p>
                <p className="text-xs font-bold mt-0.5">MM/YY</p>
              </div>
            </div>
          </div>
        </motion.div>

        <h3 className={`text-lg font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          No Saved Cards Yet
        </h3>
        <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? "text-white/50" : "text-gray-500"}`}>
          Save your debit/credit cards securely for faster checkout
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {[
            { icon: Lock,        text: "Bank-level Security" },
            { icon: Shield,      text: "PCI DSS Certified" },
            { icon: CheckCircle, text: "128-bit Encryption" },
          ].map((f) => (
            <div key={f.text} className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                isDark ? "bg-white/5" : "bg-white"
              }`}>
                <f.icon size={16} className="text-amber-400" />
              </div>
              <p className={`text-[10px] font-medium ${isDark ? "text-white/60" : "text-gray-600"}`}>{f.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SavedCards;