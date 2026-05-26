import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Smartphone, Shirt, Home, Dumbbell,
  BookOpen, Car, Headphones, Camera,
  Watch, Laptop, Tv, ArrowRight, Flame, Zap,
} from "lucide-react";

const categories = [
  { name: "Electronics", icon: Smartphone, color: "#6366f1", id: "electronics" },
  { name: "Fashion", icon: Shirt, color: "#ec4899", id: "fashion" },
  { name: "Home & Living", icon: Home, color: "#f59e0b", id: "home" },
  { name: "Sports", icon: Dumbbell, color: "#10b981", id: "sports" },
  { name: "Books", icon: BookOpen, color: "#3b82f6", id: "books" },
  { name: "Automotive", icon: Car, color: "#8b5cf6", id: "automotive" },
];

const popularSubs = [
  { label: "Mobiles", icon: Smartphone, color: "#6366f1", id: "mobiles" },
  { label: "Laptops", icon: Laptop, color: "#8b5cf6", id: "laptops" },
  { label: "Headphones", icon: Headphones, color: "#ec4899", id: "headphones" },
  { label: "Cameras", icon: Camera, color: "#f59e0b", id: "cameras" },
  { label: "Watches", icon: Watch, color: "#10b981", id: "watches" },
  { label: "Smart TVs", icon: Tv, color: "#06b6d4", id: "tv" },
];

const hotDeals = [
  {
    name: "iPhone 15 Pro",
    discount: "11% OFF",
    price: "₹1,19,900",
    image: "/products/iphone.png",
    id: "iphone15",
  },
  {
    name: "Sony WH-1000XM5",
    discount: "28% OFF",
    price: "₹24,999",
    image: "/products/headphones.png",
    id: "sony-xm5",
  },
];

interface MegaMenuProps {
  onClose: () => void;
}

const MegaMenu = ({ onClose }: MegaMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[860px] rounded-3xl border border-white/10 bg-[#0f0f1a]/98 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden z-50"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-12 p-6 gap-0">

        {/* ── All Categories ── */}
        <div className="col-span-4 pr-6 border-r border-white/5">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4 font-semibold">
            All Categories
          </p>
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products/${cat.id}`}
                onClick={onClose}
              >
                <motion.div
                  whileHover={{ x: 6 }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 group transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <cat.icon size={17} style={{ color: cat.color }} />
                    </div>
                    <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-white/20 group-hover:text-white/60 transition-colors"
                  />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Popular ── */}
        <div className="col-span-4 px-6 border-r border-white/5">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4 font-semibold">
            Popular
          </p>
          <div className="grid grid-cols-2 gap-2">
            {popularSubs.map((item) => (
              <Link
                key={item.label}
                to={`/products/${item.id}`}
                onClick={onClose}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5 cursor-pointer group transition-all"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <span className="text-white/50 text-xs font-medium group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Hot Deals ── */}
        <div className="col-span-4 pl-6">
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Flame size={14} className="text-orange-400" />
            </motion.div>
            <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">
              Hot Deals
            </p>
          </div>

          <div className="space-y-3">
            {hotDeals.map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/5 cursor-pointer group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                  <img loading="lazy" decoding="async"
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/48";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold group-hover:text-indigo-400 transition-colors truncate">
                    {deal.name}
                  </div>
                  <div className="text-white/40 text-xs">{deal.price}</div>
                </div>
                <span className="text-green-400 text-xs font-black bg-green-400/10 px-2 py-1 rounded-lg flex-shrink-0">
                  {deal.discount}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Flash Banner */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 border border-amber-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase">
                Flash Sale Live
              </span>
            </div>
            <p className="text-white/50 text-xs">
              Up to 70% off on 500+ products
            </p>
            <div className="flex items-center gap-1 mt-2 text-amber-400 text-xs font-semibold">
              Shop Now <ArrowRight size={12} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MegaMenu;