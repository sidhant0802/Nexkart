import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { getAllProducts } from "../../../../Redux Toolkit/Customer/ProductSlice";
import { addItemToCart } from "../../../../Redux Toolkit/Customer/CartSlice";
import { addProductToWishlist } from "../../../../Redux Toolkit/Customer/WishlistSlice";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, Loader2, Eye, ArrowRight } from "lucide-react";

// ── Fallback tabs (used when no settings in DB) ────────────
const FALLBACK_TABS = [
  { label: "All",      category: ""                   },
  { label: "Mobiles",  category: "mobiles"             },
  { label: "Fashion",  category: "women_western_wear"  },
  { label: "Footwear", category: "men_footwear"        },
  { label: "Ethnic",   category: "women_sarees"        },
  { label: "Furniture",category: "home_furniture"      },
];

const FeaturedProducts = () => {
  const dispatch       = useAppDispatch();
  const navigate       = useNavigate();
  const { isDark }     = useTheme();

  // ── Selectors ──────────────────────────────────────────
  const productsState  = useAppSelector((s) => s.products);
  const auth           = useAppSelector((s) => s.auth);
  const wishlistState  = useAppSelector((s) => s.wishlist);
  const homePage       = useAppSelector((s) => s.homePage);

  // ── Settings from DB ──────────────────────────────────
  const settings = (homePage?.homePageData as any)?.homeSettings;

  // ── Dynamic tabs from DB or fallback ──────────────────
  const tabs = settings?.featuredTabs?.length
    ? [...settings.featuredTabs]
        .filter((t: any) => t.isActive)
        .sort((a: any, b: any) => a.order - b.order)
        .map((t: any) => ({ label: t.label, category: t.category }))
    : FALLBACK_TABS;

  // ── Dynamic count from DB or fallback ─────────────────
  const MAX_HOME_ITEMS: number = settings?.featuredProductCount || 20;

  // ── Sort mode ─────────────────────────────────────────
  const sortMode: string = settings?.featuredSortMode || "random";

  const [activeTab, setActiveTab] = useState(0);
  const [addedIds,  setAddedIds]  = useState<string[]>([]);

  // Reset activeTab if tabs change and index is out of range
  useEffect(() => {
    if (activeTab >= tabs.length) {
      setActiveTab(0);
    }
  }, [tabs.length]);

  // ── Check wishlist ─────────────────────────────────────
  const isWishlisted = (id: string) =>
    wishlistState?.wishlist?.products?.some((p: any) => p._id === id) || false;

  // ── Fetch products when tab or settings change ─────────
  useEffect(() => {
    const currentCategory = tabs[activeTab]?.category || "";

    dispatch(
      getAllProducts({
        ...(currentCategory ? { category: currentCategory } : {}),
        pageNumber: 0,
        pageSize:   MAX_HOME_ITEMS,
        // Only pass sort if not random
        ...(sortMode !== "random" ? { sort: sortMode } : {}),
      })
    );
  }, [activeTab, MAX_HOME_ITEMS, sortMode]);

  // ── Add to cart ────────────────────────────────────────
  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    const jwt = localStorage.getItem("jwt") || auth?.jwt || "";
    if (!jwt) { navigate("/login"); return; }

    const listingId = product.defaultListing?._id;
    if (!listingId) { alert("Product unavailable"); return; }

    dispatch(addItemToCart({
      jwt,
      request: {
        productListingId: listingId,
        size:             product.sizes || "FREE SIZE",
        quantity:         1,
      },
    }));
    setAddedIds((p) => [...p, product._id]);
    setTimeout(() => setAddedIds((p) => p.filter((x) => x !== product._id)), 2000);
  };

  // ── Toggle wishlist ────────────────────────────────────
  const toggleWish = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const jwt = localStorage.getItem("jwt") || auth?.jwt || "";
    if (!jwt) { navigate("/login"); return; }
    dispatch(addProductToWishlist({ productId }));
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n ?? 0);

  const border = isDark ? "border-white/8" : "border-gray-100";

  const displayProducts = (productsState.products || []).slice(0, MAX_HOME_ITEMS);

  return (
    <section className={`py-12 transition-colors duration-300 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
            <div>
              <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-gray-900"}`}>
                Featured Products
              </h2>
              <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                Showing {MAX_HOME_ITEMS} handpicked products
                {sortMode === "random"        && " • Randomly selected"}
                {sortMode === "latest"        && " • Latest added"}
                {sortMode === "price_low"     && " • Price: Low to High"}
                {sortMode === "price_high"    && " • Price: High to Low"}
                {sortMode === "best_selling"  && " • Best Selling"}
              </p>
            </div>
          </div>
          <Link
            to="/all-featured"
            className="flex items-center gap-1 text-indigo-400 text-sm font-semibold hover:text-indigo-300 transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-7 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab: any, i: number) => (
            <motion.button
              key={tab.label + i}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                activeTab === i
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25"
                  : isDark
                  ? `${border} bg-white/3 text-white/50 hover:text-white hover:bg-white/8`
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* ── Loading ── */}
        {productsState.loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-indigo-400 animate-spin" />
              <p className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>
                Loading products...
              </p>
            </div>
          </div>

        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 gap-3">
            <ShoppingCart size={24} className={isDark ? "text-white/20" : "text-gray-300"} />
            <p className={isDark ? "text-white/30" : "text-gray-400"}>No products found</p>
          </div>

        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {displayProducts.map((product: any) => {
                const sellPrice = product.minPrice    ?? product.sellingPrice   ?? 0;
                const mrpPrice  = product.minMrpPrice ?? product.mrpPrice       ?? 0;
                const disc      = mrpPrice > 0 && mrpPrice > sellPrice
                  ? Math.round(((mrpPrice - sellPrice) / mrpPrice) * 100)
                  : 0;
                const sellerName =
                  product.defaultListing?.seller?.businessDetails?.businessName ||
                  product.defaultListing?.seller?.sellerName ||
                  product.brand || "Nexkart";

                const productUrl = `/product-details/${
                  product.category?.categoryId || "all"
                }/${encodeURIComponent(product.title || "")}/${product._id}`;

                return (
                  <Link key={product._id} to={productUrl}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                        isDark
                          ? "bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/6"
                          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg"
                      }`}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "3/4" }}>
                        <img loading="lazy" decoding="async"
                          src={product.images?.[0] || "https://placehold.co/200x267/f3f4f6/9ca3af?text=No+Image"}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x267"; }}
                        />

                        {disc > 0 && (
                          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
                            -{disc}%
                          </span>
                        )}

                        {(product.totalSellers ?? 0) > 1 && (
                          <span className="absolute bottom-10 left-2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            {product.totalSellers} sellers
                          </span>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={(e) => toggleWish(e, product._id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                          <Heart
                            size={13}
                            className={isWishlisted(product._id) ? "text-pink-400 fill-pink-400" : "text-white"}
                          />
                        </motion.button>

                        {/* Hover Actions */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-1.5 p-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleAddToCart(e, product)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                              addedIds.includes(product._id)
                                ? "bg-green-500 text-white"
                                : "bg-indigo-600 text-white hover:bg-indigo-500"
                            }`}
                          >
                            <ShoppingCart size={11} />
                            {addedIds.includes(product._id) ? "Added!" : "Add to Cart"}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="w-8 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center"
                          >
                            <Eye size={11} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className={`text-[10px] mb-0.5 font-medium ${isDark ? "text-white/30" : "text-gray-400"}`}>
                          {sellerName}
                        </p>

                        <h3 className={`text-xs font-semibold line-clamp-2 mb-2 leading-snug ${isDark ? "text-white/80" : "text-gray-800"}`}>
                          {product.title}
                        </h3>

                        {(product.numRatings ?? 0) > 0 && (product.averageRating ?? 0) > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center gap-0.5 bg-green-500/20 px-1.5 py-0.5 rounded-md">
                              <Star size={9} className="text-green-400 fill-green-400" />
                              <span className="text-[10px] font-bold text-green-400">
                                {(product.averageRating ?? 0).toFixed(1)}
                              </span>
                            </div>
                            <span className={`text-[10px] ${isDark ? "text-white/25" : "text-gray-400"}`}>
                              ({product.numRatings})
                            </span>
                          </div>
                        )}

                        <div className="flex items-baseline gap-1.5">
                          <span className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                            {fmt(sellPrice)}
                          </span>
                          {mrpPrice > sellPrice && (
                            <span className={`text-xs line-through ${isDark ? "text-white/25" : "text-gray-400"}`}>
                              {fmt(mrpPrice)}
                            </span>
                          )}
                          {disc > 0 && (
                            <span className="text-xs text-green-500 font-bold">{disc}% off</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* View All Button */}
        {(productsState.products?.length || 0) >= MAX_HOME_ITEMS && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <Link to="/all-featured">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-colors"
              >
                View All Featured Products <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        )}

      </div>
    </section>
  );
};

export default FeaturedProducts;