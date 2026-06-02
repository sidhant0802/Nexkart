import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { useAppSelector } from "../../../../Redux Toolkit/Store";
import CloudImage from "../../../../components/ui/CloudImage";

// ── Fallback slides (used when DB has no banners) ──────────
const FALLBACK_SLIDES = [
  {
    id: "f1",
    title:      "New Season",
    highlight:  "Fashion Drop",
    subtitle:   "Explore 50,000+ styles from top vendors",
    badge:      "🔥 Trending Now",
    cta:        "Shop Fashion",
    ctaLink:    "/products/women_western_wear",
    secondCta:  "View Deals",
    secondLink: "/products/men_t_shirts",
    image:      "https://www.libas.in/cdn/shop/files/eoss-desktop.jpg?v=1719849154&width=1920",
    overlay:    "from-black/80 via-black/40 to-transparent",
    accent:     "#6366f1",
    stats: [
      { val: "50K+", label: "Products" },
      { val: "2K+",  label: "Vendors"  },
      { val: "70%",  label: "Max Off"  },
    ],
  },
  {
    id: "f2",
    title:      "Top Electronics",
    highlight:  "Best Deals",
    subtitle:   "Mobiles, Laptops, Gadgets at lowest prices",
    badge:      "⚡ Flash Sale",
    cta:        "Shop Electronics",
    ctaLink:    "/products/mobiles",
    secondCta:  "View All",
    secondLink: "/products/laptops",
    image:      "https://rukminim2.flixcart.com/fk-p-flap/1600/270/image/5e7c1ff0288b8a72.jpg?q=20",
    overlay:    "from-black/80 via-black/40 to-transparent",
    accent:     "#06b6d4",
    stats: [
      { val: "500+", label: "Brands" },
      { val: "1M+",  label: "Orders" },
      { val: "4.8★", label: "Rating" },
    ],
  },
  {
    id: "f3",
    title:      "Festival Season",
    highlight:  "Ethnic Wear",
    subtitle:   "Sarees, Lehengas & Traditional outfits",
    badge:      "✨ Festive Special",
    cta:        "Shop Now",
    ctaLink:    "/products/women_sarees",
    secondCta:  "Explore",
    secondLink: "/products/women_lehenga_cholis",
    image:      "https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/22866694/2023/4/24/98951db4-e0a5-47f8-a1be-353863d24dc01682349679664KaliniOrangeSilkBlendEthnicWovenDesignFestiveSareewithMatchi2.jpg",
    overlay:    "from-black/80 via-black/40 to-transparent",
    accent:     "#f59e0b",
    stats: [
      { val: "10K+", label: "Styles"   },
      { val: "Free", label: "Delivery" },
      { val: "7-Day",label: "Returns"  },
    ],
  },
];

const Banner = () => {
  const [current,   setCurrent]   = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { isDark }  = useTheme();

  // ── Get banners from Redux (DB) ──
  const homePage = useAppSelector((s) => s.homePage);
  const dbBanners = homePage?.homePageData?.banners || [];

  // ── Use DB banners if available, else fallback ──
  const slides = dbBanners.length > 0
    ? dbBanners.map((b: any) => ({
        id:         b._id,
        title:      b.title,
        highlight:  b.highlight,
        subtitle:   b.subtitle,
        badge:      b.badge,
        cta:        b.cta,
        ctaLink:    b.ctaLink,
        secondCta:  b.secondCta,
        secondLink: b.secondLink,
        image:      b.image,
        overlay:    b.overlay || "from-black/80 via-black/40 to-transparent",
        accent:     b.accent  || "#6366f1",
        stats:      b.stats   || [],
      }))
    : FALLBACK_SLIDES;

  // reset current if slides change
  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, slides.length]);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(400px, 60vh, 620px)" }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1    }}
          exit={{   opacity: 0, scale: 0.95  }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
<CloudImage
  src={slide.image}
  alt={slide.title}
  width={1600}
  height={620}
  quality="best"
  objectFit="cover"
  lazy={false}      
  priority={true}              // ✅ Above the fold — load immediately!
  fallback="https://placehold.co/1600x620/6366f1/white?text=Banner"
  className="w-full h-full"
/>

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
              <div className="max-w-2xl space-y-5">

                {/* Badge */}
                {slide.badge && (
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white border border-white/30 bg-white/10 backdrop-blur-sm"
                  >
                    {slide.badge}
                  </motion.span>
                )}

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                    {slide.title}{" "}
                    <span className="block" style={{ color: slide.accent }}>
                      {slide.highlight}
                    </span>
                  </h1>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/70 text-lg"
                >
                  {slide.subtitle}
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link to={slide.ctaLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-base shadow-xl"
                      style={{
                        background:  `linear-gradient(135deg, ${slide.accent}, #a855f7)`,
                        boxShadow:   `0 15px 40px ${slide.accent}40`,
                      }}
                    >
                      <ShoppingBag size={18} />
                      {slide.cta}
                    </motion.button>
                  </Link>

                  <Link to={slide.secondLink}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-base border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                    >
                      <Zap size={18} />
                      {slide.secondCta}
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Stats */}
                {slide.stats?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-6 pt-2"
                  >
                    {slide.stats.map((s: any, i: number) => (
                      <div key={i}>
                        <div
                          className="text-xl font-black"
                          style={{ color: slide.accent }}
                        >
                          {s.val}
                        </div>
                        <div className="text-white/50 text-xs">{s.label}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all z-10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all z-10"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative h-1.5 rounded-full transition-all duration-500 overflow-hidden"
            style={{
              width: i === current ? "32px" : "12px",
              backgroundColor: i === current
                ? slide.accent
                : "rgba(255,255,255,0.3)",
            }}
          >
            {i === current && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: slide.accent }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Banner;