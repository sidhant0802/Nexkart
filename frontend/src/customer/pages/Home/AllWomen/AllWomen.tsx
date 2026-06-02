import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAppSelector } from "../../../../Redux Toolkit/Store";

const COLORS: Record<string, string> = {
  "Indian Wear":       "#f59e0b",
  "Western Wear":      "#ec4899",
  "Footwear & Bags":   "#8b5cf6",
  "Jewellery & Beauty":"#ef4444",
  "Sports":            "#10b981",
  "Lingerie":          "#f43f5e",
  "General":           "#ec4899",
};

const AllWomen = () => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const homePage = useAppSelector((s) => s.homePage);
  const dbItems  = homePage?.homePageData?.womenViewAll || [];

  const grouped: Record<string, any[]> = {};
  dbItems.forEach((item: any) => {
    const sub = item.subcategory || "General";
    if (!grouped[sub]) grouped[sub] = [];
    grouped[sub].push(item);
  });

  const filtered = (items: any[]) =>
    items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className={`py-12 border-b ${isDark ? "border-white/5" : "border-gray-200"}`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a0a0f 0%, #4a1942 50%, #0a0a0f 100%)"
            : "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
        }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link to="/" className={`inline-flex items-center gap-2 mb-6 text-sm font-medium ${
            isDark ? "text-white/40 hover:text-white" : "text-gray-700"
          }`}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`text-3xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                👗 Women's Fashion
              </motion.h1>
              <p className={isDark ? "text-white/40" : "text-gray-600"}>
                {dbItems.length} items across {Object.keys(grouped).length} categories
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-gray-500"}`} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search women's fashion..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/25"
                    : "bg-white border-gray-200 text-gray-900"
                }`} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
        {Object.entries(grouped).map(([subName, subItems], gIdx) => {
          const items = filtered(subItems);
          if (items.length === 0) return null;
          const color = COLORS[subName] || "#ec4899";

          return (
            <motion.div key={subName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.08 }}>
              <div className="flex items-center justify-between p-5 rounded-2xl border mb-6"
                style={{ background: `${color}10`, borderColor: `${color}30` }}>
                <div>
                  <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>{subName}</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>{items.length} styles</p>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: `${color}20`, color }}>{items.length} items</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map((item: any, i: number) => (
                  <motion.div key={item._id || i}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/products/${item.categoryId}`}>
                      <motion.div whileHover={{ y: -6, scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all group ${
                          isDark
                            ? "border-white/6 bg-white/3 hover:border-white/20 hover:bg-white/8"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg shadow-sm"
                        }`}>
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                          <img src={item.image} alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-400"
                            style={{ padding: "6px" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://placehold.co/80x80/${color.replace("#","")}/white?text=${item.name.charAt(0)}`;
                            }} />
                        </div>
                        <span className={`text-sm font-bold text-center ${isDark ? "text-white/80 group-hover:text-white" : "text-gray-700 group-hover:text-gray-900"}`}>
                          {item.name}
                        </span>
                        <div className="flex items-center gap-0.5 text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
                          Shop Now <ChevronRight size={11} />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AllWomen;