// src/customer/pages/Home/HomeCategory/HomeCategory.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../../Redux Toolkit/Store";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ArrowRight } from "lucide-react";
import SectionBox from "../SectionBox/SectionBox";

const MAX_VISIBLE = 6;

const HomeCategory = () => {
  const { isDark } = useTheme();
  const homePage = useAppSelector((s) => s.homePage);

  const all: any[] = homePage?.homePageData?.grid || [];
  const visible = all.slice(0, MAX_VISIBLE);

  if (visible.length === 0) return null;

  return (
    <SectionBox accent="rose">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-rose-500 to-pink-400" />
          <div>
            <h2 className={`text-lg font-black flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Trending Now <span>🔥</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Trending styles this season
            </p>
          </div>
        </div>
        <Link to="/products/women_western_wear"
          className="flex items-center gap-1 text-rose-400 text-sm font-semibold hover:text-rose-300">
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {visible.map((cat: any, i: number) => (
<motion.div key={cat?.categoryId ? `${cat.categoryId}-${i}` : `cat-${i}`}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
            <Link to={`/products/${cat.categoryId}`}>
              <motion.div whileHover={{ y: -4 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl"
                style={{ aspectRatio: "3/4" }}>
                <img src={cat.image} alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x267"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-white text-xs font-bold capitalize">{cat.name}</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {all.length > MAX_VISIBLE && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: MAX_VISIBLE * 0.07 }}>
            <Link to="/products/women_western_wear">
              <motion.div whileHover={{ y: -4 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border flex flex-col items-center justify-center gap-2 ${
                  isDark ? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10" : "border-rose-200 bg-rose-50 hover:bg-rose-100"
                }`}
                style={{ aspectRatio: "3/4" }}>
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <ArrowRight size={18} className="text-rose-400" />
                </div>
                <span className="text-xs font-bold text-rose-400 text-center px-2">
                  View All<br />({all.length - MAX_VISIBLE}+)
                </span>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </SectionBox>
  );
};

export default HomeCategory;