// src/customer/pages/Home/CategoryShowcase/CategoryShowcase.tsx

import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../../../../routes/CustomerRoutes";
import CloudImage from "../../../../components/ui/CloudImage";

export interface CategoryItem {
  name: string;
  categoryId: string;
  image: string;
}

interface Props {
  title:        string;
  subtitle:     string;
  emoji?:       string;
  items:        CategoryItem[];
  viewAllLink:  string;
  accent:       "indigo" | "blue" | "pink" | "amber";
}

// ── Color presets ──────────────────────────────────────────────
const PRESETS = {
  indigo: {
    barFrom: "from-indigo-500", barTo: "to-cyan-400",
    text: "text-indigo-400",   textHover: "hover:text-indigo-300",
    border: "border-indigo-500/20",
    bgDark:   "from-indigo-500/8 via-indigo-500/3 to-transparent",
    bgLight:  "from-indigo-50 via-white to-white",
    cardHoverDark:  "hover:border-indigo-500/40 hover:bg-indigo-500/8",
    cardHoverLight: "hover:border-indigo-300 hover:bg-indigo-50",
    btnDark:  "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20",
    btnLight: "border-indigo-200 bg-indigo-50 hover:bg-indigo-100",
    nameHoverDark:  "group-hover:text-indigo-400",
    nameHoverLight: "group-hover:text-indigo-600",
    placeholder: "6366f1",
  },
  blue: {
    barFrom: "from-blue-500",  barTo: "to-cyan-400",
    text: "text-blue-400",     textHover: "hover:text-blue-300",
    border: "border-blue-500/20",
    bgDark:   "from-blue-500/8 via-blue-500/3 to-transparent",
    bgLight:  "from-blue-50 via-white to-white",
    cardHoverDark:  "hover:border-blue-500/40 hover:bg-blue-500/8",
    cardHoverLight: "hover:border-blue-300 hover:bg-blue-50",
    btnDark:  "border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20",
    btnLight: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    nameHoverDark:  "group-hover:text-blue-400",
    nameHoverLight: "group-hover:text-blue-600",
    placeholder: "3b82f6",
  },
  pink: {
    barFrom: "from-pink-500",  barTo: "to-rose-400",
    text: "text-pink-400",     textHover: "hover:text-pink-300",
    border: "border-pink-500/20",
    bgDark:   "from-pink-500/8 via-pink-500/3 to-transparent",
    bgLight:  "from-pink-50 via-white to-white",
    cardHoverDark:  "hover:border-pink-500/40 hover:bg-pink-500/8",
    cardHoverLight: "hover:border-pink-300 hover:bg-pink-50",
    btnDark:  "border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20",
    btnLight: "border-pink-200 bg-pink-50 hover:bg-pink-100",
    nameHoverDark:  "group-hover:text-pink-400",
    nameHoverLight: "group-hover:text-pink-600",
    placeholder: "ec4899",
  },
  amber: {
    barFrom: "from-amber-500", barTo: "to-orange-400",
    text: "text-amber-400",    textHover: "hover:text-amber-300",
    border: "border-amber-500/20",
    bgDark:   "from-amber-500/8 via-amber-500/3 to-transparent",
    bgLight:  "from-amber-50 via-white to-white",
    cardHoverDark:  "hover:border-amber-500/40 hover:bg-amber-500/8",
    cardHoverLight: "hover:border-amber-300 hover:bg-amber-50",
    btnDark:  "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20",
    btnLight: "border-amber-200 bg-amber-50 hover:bg-amber-100",
    nameHoverDark:  "group-hover:text-amber-400",
    nameHoverLight: "group-hover:text-amber-600",
    placeholder: "f59e0b",
  },
};

const CategoryShowcase = ({ title, subtitle, emoji, items, viewAllLink, accent }: Props) => {
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const c = PRESETS[accent];

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <section className={`py-5 transition-colors duration-300 ${
      isDark ? "bg-[#0a0a0f]" : "bg-gray-50"
    }`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* ═══ Distinguishable Box Container ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`relative rounded-3xl border p-5 lg:p-6 overflow-hidden 
                      bg-gradient-to-br ${isDark ? c.bgDark : c.bgLight} ${c.border} ${
                        isDark ? "shadow-2xl shadow-black/40" : "shadow-md shadow-gray-200/60"
                      }`}
        >
          {/* Decorative blur orb */}
          <div
            className={`absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none bg-gradient-to-br ${c.barFrom} ${c.barTo}`}
          />

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-9 rounded-full bg-gradient-to-b ${c.barFrom} ${c.barTo}`} />
              <div>
                <h2 className={`text-lg font-black flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {title}
                  {emoji && <span>{emoji}</span>}
                </h2>
                <p className={`text-xs mt-0.5 ${
                  isDark ? "text-white/40" : "text-gray-500"
                }`}>
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll("left")}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft size={15} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll("right")}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                <ChevronRight size={15} />
              </motion.button>

              <Link
                to={viewAllLink}
                className={`flex items-center gap-1 ml-2 text-sm font-semibold transition-colors ${c.text} ${c.textHover}`}
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* ── Horizontal Scroll Cards ── */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 relative z-10"
            style={{
              scrollSnapType:    "x mandatory",
              scrollbarWidth:    "none",
              msOverflowStyle:   "none",
            }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

            {items.map((item, i) => (
              <motion.div
                key={`item-${item?.categoryId ?? "x"}-${i}`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                style={{ scrollSnapAlign: "start", flexShrink: 0 }}
              >
                <Link to={`/products/${item.categoryId}`}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl border cursor-pointer transition-all group w-[115px] ${
                      isDark
                        ? `border-white/8 bg-white/5 ${c.cardHoverDark}`
                        : `border-gray-100 bg-white ${c.cardHoverLight} shadow-sm hover:shadow-md`
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
  <CloudImage
  src={item.image}
  alt={item?.name || "category"}
  width={200}
  height={200}
  quality="good"
  objectFit="cover"
  lazy={i > 6}
  fallback={`https://placehold.co/200x200/${c.placeholder}/white?text=${(item?.name || "?").charAt(0)}`}
  className="w-full h-full group-hover:scale-110 transition-transform duration-400"
/>
                    </div>

                    <span className={`text-[11px] font-semibold text-center leading-tight transition-colors ${
                      isDark ? `text-white/70 ${c.nameHoverDark}` : `text-gray-700 ${c.nameHoverLight}`
                    }`}>
                      {item.name}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}

            {/* View All card at end */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: items.length * 0.04 }}
              style={{ scrollSnapAlign: "start", flexShrink: 0 }}
            >
              <Link to={viewAllLink}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex flex-col items-center justify-center gap-2 p-2.5 rounded-2xl border cursor-pointer transition-all w-[115px] h-full ${
                    isDark ? c.btnDark : c.btnLight
                  }`}
                >
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center ${
                    isDark ? "bg-white/5" : "bg-white/60"
                  }`}>
                    <ArrowRight size={22} className={c.text} />
                  </div>
                  <span className={`text-[11px] font-bold text-center ${c.text}`}>
                    View All
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryShowcase;