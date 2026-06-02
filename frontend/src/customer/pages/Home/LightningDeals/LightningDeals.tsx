// src/customer/pages/Home/LightningDeals/LightningDeals.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ArrowRight, Zap } from "lucide-react";

const DEALS_PREVIEW = [
  { name: "iPhone Deals",   categoryId: "mobiles",             discount: "Up to 30%", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=85" },
  { name: "Laptop Sale",    categoryId: "laptops",             discount: "Up to 40%", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=85" },
  { name: "Headphone Loot", categoryId: "headphones_headsets", discount: "Up to 50%", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=85" },
  { name: "Watch Bonanza",  categoryId: "smart_watches",       discount: "Up to 35%", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85" },
  { name: "TV Mega Sale",   categoryId: "television",          discount: "Up to 45%", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=85" },
  { name: "Fashion Deals",  categoryId: "men_topwear",         discount: "Up to 60%", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85" },
  { name: "Saree Special",  categoryId: "women_sarees",        discount: "Up to 70%", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85" },
  { name: "Footwear Sale",  categoryId: "men_footwear",        discount: "Up to 50%", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85" },
  { name: "Bag Bonanza",    categoryId: "women_handbags_bags_wallets", discount: "Up to 55%", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=85" },
  { name: "Beauty Bonanza", categoryId: "women_beauty_personal_care",  discount: "Up to 40%", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=85" },
];

const LightningDeals = () => {
  const { isDark } = useTheme();

  return (
    <section
      className={`py-10 transition-colors duration-300 ${
        isDark ? "bg-[#0d0d15]" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-orange-500 to-red-500" />
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap size={20} className="text-orange-400" fill="#fb923c" />
              </motion.div>
              <div>
                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                  Lightning Deals
                </h2>
                <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                  Hot offers, limited time only
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/all-categories?tab=deals"
            className="flex items-center gap-1 text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">

          {DEALS_PREVIEW.map((cat, i) => (
            <motion.div
              key={cat.categoryId + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/products/${cat.categoryId}`}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex flex-col items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all group h-full ${
                    isDark
                      ? "border-orange-500/15 bg-orange-500/3 hover:border-orange-500/40 hover:bg-orange-500/8"
                      : "border-orange-100 bg-orange-50 hover:border-orange-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Discount badge */}
                  <span
                    className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 rounded-md text-[8px] font-black text-white"
                    style={{
                      background:  "linear-gradient(135deg, #f97316, #ef4444)",
                      boxShadow:   "0 0 8px rgba(239,68,68,0.5)",
                    }}
                  >
                    {cat.discount}
                  </span>

                  {/* Image - original */}
                  <div
                    className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: "#fff" }}
                  >
                    <img loading="lazy" decoding="async"
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-400"
                      style={{ padding: "6px" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/200x200/f97316/white?text=" + cat.name?.charAt(0);
                      }}
                    />
                  </div>

                  {/* Name */}
                  <span
                    className={`text-[11px] font-semibold text-center leading-tight transition-colors ${
                      isDark
                        ? "text-white/70 group-hover:text-orange-400"
                        : "text-gray-700 group-hover:text-orange-600"
                    }`}
                  >
                    {cat.name}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}

          {/* View All Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: DEALS_PREVIEW.length * 0.04 }}
          >
            <Link to="/all-categories?tab=deals">
              <motion.div
                whileHover={{ y: -4, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border cursor-pointer transition-all h-full ${
                  isDark
                    ? "border-orange-500/30 bg-orange-500/8 hover:bg-orange-500/15"
                    : "border-orange-200 bg-orange-50 hover:bg-orange-100"
                }`}
              >
                <div className="w-full aspect-square rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <ArrowRight size={20} className="text-orange-400" />
                </div>
                <span className="text-[11px] font-bold text-orange-400 text-center">
                  View All
                </span>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LightningDeals;