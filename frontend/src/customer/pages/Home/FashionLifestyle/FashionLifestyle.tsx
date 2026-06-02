import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import SectionBox from "../SectionBox/SectionBox";
import { useAppSelector } from "../../../../Redux Toolkit/Store";
import CloudImage from "../../../../components/ui/CloudImage";

const FALLBACK = [
  { name: "Streetwear",  categoryId: "men_topwear",              image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=85" },
  { name: "Athleisure",  categoryId: "women_sports_active_wear", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=85" },
  { name: "Wedding",     categoryId: "women_lehenga_cholis",     image: "https://images.unsplash.com/photo-1583391733981-3f0bcf3c2c30?w=400&q=85" },
  { name: "Office Wear", categoryId: "men_formal_shirts",        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=85" },
  { name: "Party Wear",  categoryId: "women_western_wear",       image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=85" },
  { name: "Festive",     categoryId: "women_sarees",             image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=85" },
  { name: "Sports",      categoryId: "men_footwear",             image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=85" },
  { name: "Casual",      categoryId: "men_t_shirts",             image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=85" },
  { name: "Vintage",     categoryId: "women_western_wear",       image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=85" },
  { name: "Minimalist",  categoryId: "men_t_shirts",             image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=85" },
];

const FashionLifestyle = () => {
  const { isDark } = useTheme();
  const scrollRef  = useRef<HTMLDivElement>(null);

  const homePage = useAppSelector((s) => s.homePage);
  const dbItems  = homePage?.homePageData?.fashionItems || [];

  const items = dbItems.length > 0
    ? dbItems.map((i: any) => ({
        name:       i.name,
        categoryId: i.categoryId,
        image:      i.image,
      }))
    : FALLBACK;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <SectionBox accent="purple">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-9 rounded-full bg-gradient-to-b from-purple-500 to-fuchsia-400" />
          <div>
            <h2 className={`text-lg font-black flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Fashion & Lifestyle <span>✨</span>
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Trending vibes & moments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              isDark
                ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
              isDark
                ? "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ChevronRight size={15} />
          </button>
          <Link
            to="/all-fashion"
            className="flex items-center gap-1 ml-2 text-purple-400 text-sm font-semibold hover:text-purple-300"
          >
            View All <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {items.map((cat: any, i: number) => (
          <motion.div
            key={`cat-${cat?.categoryId ?? "x"}-${i}-${cat?.name ?? "y"}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            style={{ scrollSnapAlign: "start", flexShrink: 0 }}
          >
            <Link to={`/products/${cat.categoryId}`}>
              <motion.div
                whileHover={{ y: -4, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl border cursor-pointer transition-all group w-[115px] ${
                  isDark
                    ? "border-white/8 bg-white/5 hover:border-purple-500/40 hover:bg-purple-500/8"
                    : "border-gray-100 bg-white hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-white flex items-center justify-center">
                 <CloudImage
  src={cat.image}
  alt={cat?.name || "category"}
  width={200}
  height={200}
  quality="good"
  objectFit="cover"
  lazy={i > 6}
  fallback={`https://placehold.co/200x200/a855f7/white?text=${(cat?.name || "?").charAt(0)}`}
  className="w-full h-full group-hover:scale-110 transition-transform duration-400"
/>
                </div>
                <span className={`text-[11px] font-semibold text-center leading-tight ${
                  isDark
                    ? "text-white/70 group-hover:text-purple-400"
                    : "text-gray-700 group-hover:text-purple-600"
                }`}>
                  {cat.name}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {/* View All card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          style={{ scrollSnapAlign: "start", flexShrink: 0 }}
        >
          <Link to="/all-fashion">
            <motion.div
              whileHover={{ y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-center justify-center gap-2 p-2.5 rounded-2xl border cursor-pointer w-[115px] h-full ${
                isDark
                  ? "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
                  : "border-purple-200 bg-purple-50 hover:bg-purple-100"
              }`}
            >
              <div className={`w-full aspect-square rounded-xl flex items-center justify-center ${
                isDark ? "bg-white/5" : "bg-white/60"
              }`}>
                <ArrowRight size={22} className="text-purple-400" />
              </div>
              <span className="text-[11px] font-bold text-purple-400 text-center">
                View All
              </span>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </SectionBox>
  );
};

export default FashionLifestyle;