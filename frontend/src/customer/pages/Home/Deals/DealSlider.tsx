import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../../Redux Toolkit/Store";
import { useTheme } from "../../../../routes/CustomerRoutes";
import DealCard from "./DealCard";
import CloudImage from "../../../../components/ui/CloudImage";

// ── Countdown Timer ──
const CountdownTimer = ({ endTime, isDark }: { endTime: Date; isDark: boolean }) => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <motion.div
            key={val}
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`px-2.5 py-1.5 rounded-lg min-w-[36px] text-center font-black text-sm tabular-nums ${
              isDark ? "bg-white/10 text-white" : "bg-gray-900 text-white"
            }`}
          >
            {val}
          </motion.div>
          {i < 2 && (
            <span className={`font-bold text-lg ${isDark ? "text-white/30" : "text-gray-300"}`}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Fallback Lightning Items ──
const LIGHTNING_FALLBACK = [
  { name: "iPhone Deals",   categoryId: "mobiles",                     discount: "Up to 30%", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=85" },
  { name: "Laptop Sale",    categoryId: "laptops",                     discount: "Up to 40%", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=85" },
  { name: "Headphone Loot", categoryId: "headphones_headsets",         discount: "Up to 50%", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=85" },
  { name: "Watch Bonanza",  categoryId: "smart_watches",               discount: "Up to 35%", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=85" },
  { name: "TV Mega Sale",   categoryId: "television",                  discount: "Up to 45%", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&q=85" },
  { name: "Fashion Deals",  categoryId: "men_topwear",                 discount: "Up to 60%", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85" },
  { name: "Saree Special",  categoryId: "women_sarees",                discount: "Up to 70%", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85" },
  { name: "Footwear Sale",  categoryId: "men_footwear",                discount: "Up to 50%", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85" },
  { name: "Bag Bonanza",    categoryId: "women_handbags_bags_wallets", discount: "Up to 55%", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=85" },
  { name: "Beauty Bonanza", categoryId: "women_beauty_personal_care",  discount: "Up to 40%", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=85" },
];

// ── Main Component ──
const DealSlider = () => {
  const { isDark }  = useTheme();
  const homePage    = useAppSelector((s) => s.homePage);
  const lightningRef = useRef<HTMLDivElement>(null);
  const dealsRef     = useRef<HTMLDivElement>(null);
  const endTime      = new Date(Date.now() + 4 * 60 * 60 * 1000);

  // ── Lightning items: DB or fallback ──
  const dbLightning = homePage?.homePageData?.lightningItems || [];
  const LIGHTNING_ITEMS = dbLightning.length > 0
    ? dbLightning.map((i: any) => ({
        name:       i.name,
        categoryId: i.categoryId,
        discount:   i.discount || "",
        image:      i.image,
      }))
    : LIGHTNING_FALLBACK;

  // ── Dynamic deals from Redux ──
  const deals: any[] = homePage?.homePageData?.deals || [];
  const dealItems = deals.length > 0
    ? deals
    : (homePage?.homePageData?.dealCategories || []).map((c: any) => ({
        category: c,
        discount: 40,
      }));

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <>
      {/* ═══ SECTION 1 — Lightning Deals ═══ */}
      <section className={`py-10 transition-colors duration-300 ${isDark ? "bg-[#0d0d15]" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-6">
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
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => scroll(lightningRef, "left")}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                  isDark ? "border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                         : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}>
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => scroll(lightningRef, "right")}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                  isDark ? "border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                         : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}>
                <ChevronRight size={16} />
              </motion.button>
              <Link to="/all-deals"
                className="flex items-center gap-1 text-orange-400 text-sm font-semibold hover:text-orange-300 ml-1 transition-colors">
                View All <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div ref={lightningRef} className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

            {LIGHTNING_ITEMS.map((item: any, i: number) => (
              <motion.div key={`lightning-${item?.categoryId ?? "x"}-${i}`}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
                <Link to={`/products/${item.categoryId}`}>
                  <motion.div whileHover={{ y: -4, scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className={`relative flex flex-col items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all group w-[110px] ${
                      isDark ? "border-orange-500/15 bg-orange-500/5 hover:border-orange-500/40 hover:bg-orange-500/10"
                             : "border-orange-100 bg-orange-50 hover:border-orange-300 shadow-sm hover:shadow-md"
                    }`}>
                    {item.discount && (
                      <span className="absolute -top-1.5 -right-1.5 z-10 px-1.5 py-0.5 rounded-md text-[9px] font-black text-white"
                        style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", boxShadow: "0 0 8px rgba(239,68,68,0.5)" }}>
                        {item.discount}
                      </span>
                    )}
                    <div className="w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center bg-white">
                      <CloudImage
  src={item.image}
  alt={item?.name || "deal"}
  width={200}
  height={200}
  quality="good"
  objectFit="cover"
 lazy={i > 4}
  fallback={`https://placehold.co/200x200/f97316/white?text=${(item?.name || "?").charAt(0)}`}
  className="w-full h-full group-hover:scale-110 transition-transform duration-300"
/>
                    </div>
                    <span className={`text-[11px] font-semibold text-center leading-tight transition-colors ${
                      isDark ? "text-white/70 group-hover:text-orange-400" : "text-gray-700 group-hover:text-orange-600"
                    }`}>{item.name}</span>
                  </motion.div>
                </Link>
              </motion.div>
            ))}

            <motion.div style={{ scrollSnapAlign: "start", flexShrink: 0 }}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <Link to="/all-deals">
                <motion.div whileHover={{ y: -4, scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className={`flex flex-col items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all w-[110px] h-full ${
                    isDark ? "border-orange-500/30 bg-orange-500/8 hover:bg-orange-500/15"
                           : "border-orange-200 bg-orange-50 hover:bg-orange-100"
                  }`}>
                  <div className="w-full aspect-square rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <ArrowRight size={22} className="text-orange-400" />
                  </div>
                  <span className="text-[11px] font-bold text-orange-400 text-center">View All</span>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 — Dynamic Deals ═══ */}
      {dealItems.length > 0 && (
        <section className={`py-10 transition-colors duration-300 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-7">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Zap size={18} className="text-amber-400" />
                  </motion.div>
                  <div>
                    <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                      ⚡ Today's Best Deals
                    </h2>
                    <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      Exclusive limited-time offers
                    </p>
                  </div>
                </div>
                <div className={`h-7 w-px ${isDark ? "bg-white/10" : "bg-gray-200"}`} />
                <CountdownTimer endTime={endTime} isDark={isDark} />
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => scroll(dealsRef, "left")}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    isDark ? "border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                           : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}>
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => scroll(dealsRef, "right")}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    isDark ? "border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                           : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}>
                  <ChevronRight size={16} />
                </motion.button>
                <Link to="/all-deals"
                  className="flex items-center gap-1 text-amber-400 text-sm font-semibold hover:text-amber-300 ml-1 transition-colors">
                  View All <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div ref={dealsRef} className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {dealItems.map((deal: any, i: number) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
                  <DealCard category={deal.category || deal} discount={deal.discount || 40}
                    isDark={isDark} index={i} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default DealSlider;