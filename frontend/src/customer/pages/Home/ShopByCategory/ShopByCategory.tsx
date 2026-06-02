// src/customer/pages/Home/ShopByCategory/ShopByCategory.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../../Redux Toolkit/Store";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ArrowRight } from "lucide-react";
import SectionBox from "../SectionBox/SectionBox";

const MAX_VISIBLE = 11;

const ShopByCategory = () => {
  const { isDark } = useTheme();
const homePage = useAppSelector((s) => s.homePage);

  const all: any[] = homePage?.homePageData?.shopByCategories || [];
  const visible = all.slice(0, MAX_VISIBLE);

  if (visible.length === 0) return null;

  return (
    <SectionBox accent="cyan">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-cyan-500 to-teal-400" />
          <div>
            <h2 className={`text-lg font-black flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Shop By Category <span>🛍️</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Browse all departments
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
        {visible.map((cat: any, i: number) => (
          <motion.div key={cat.categoryId + i}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
            <Link to={`/products/${cat.categoryId}`}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all group ${
                  isDark ? "border-white/6 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5"
                         : "border-gray-100 bg-white hover:border-cyan-300 hover:bg-cyan-50 shadow-sm"
                }`}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
                  <img src={cat.image} alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56"; }} />
                </div>
                <span className={`text-[11px] font-semibold text-center leading-tight capitalize ${
                  isDark ? "text-white/55 group-hover:text-cyan-400" : "text-gray-600 group-hover:text-cyan-600"
                }`}>{cat.name}</span>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {all.length > MAX_VISIBLE && (
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: MAX_VISIBLE * 0.04 }}>
            <Link to="/products/men_topwear">
              <motion.div whileHover={{ y: -4, scale: 1.02 }}
                className={`flex flex-col items-center justify-center gap-2.5 p-3 rounded-2xl border cursor-pointer min-h-[110px] ${
                  isDark ? "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10" : "border-cyan-200 bg-cyan-50 hover:bg-cyan-100"
                }`}>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <ArrowRight size={18} className="text-cyan-400" />
                </div>
                <span className="text-[11px] font-bold text-cyan-400 text-center">+{all.length - MAX_VISIBLE} More</span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </SectionBox>
  );
};

export default ShopByCategory;