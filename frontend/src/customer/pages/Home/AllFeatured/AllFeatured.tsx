import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { getAllProducts } from "../../../../Redux Toolkit/Customer/ProductSlice";
import { addItemToCart } from "../../../../Redux Toolkit/Customer/CartSlice";
import { addProductToWishlist } from "../../../../Redux Toolkit/Customer/WishlistSlice";
import { useTheme } from "../../../../routes/CustomerRoutes";
import {
  ArrowLeft, Search, Star, ShoppingCart,
  Heart, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal,
} from "lucide-react";

const PER_PAGE_OPTIONS = [25, 50, 100];

const TABS = [
  { label: "All",       category: ""                  },
  { label: "Mobiles",   category: "mobiles"            },
  { label: "Fashion",   category: "women_western_wear" },
  { label: "Footwear",  category: "men_footwear"       },
  { label: "Ethnic",    category: "women_sarees"       },
  { label: "Furniture", category: "home_furniture"     },
  { label: "Laptops",   category: "laptops"            },
  { label: "Watches",   category: "smart_watches"      },
];

const AllFeatured = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { isDark } = useTheme();

  // ✅ Specific selectors
  const products      = useAppSelector((s) => s.products);
  const auth          = useAppSelector((s) => s.auth);
  const wishlistState = useAppSelector((s) => s.wishlist);

  const [activeTab, setActiveTab] = useState(0);
  const [page,      setPage]      = useState(0);
  const [perPage,   setPerPage]   = useState(25);
  const [search,    setSearch]    = useState("");
  const [addedIds,  setAddedIds]  = useState<string[]>([]);

  const isWishlisted = (id: string) =>
    wishlistState?.wishlist?.products?.some((p: any) => p._id === id) || false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(getAllProducts({
      ...(TABS[activeTab].category ? { category: TABS[activeTab].category } : {}),
      pageNumber: page,
      pageSize:   perPage,
    }));
  }, [activeTab, page, perPage]);

  const handleTabChange = (i: number) => {
    setActiveTab(i);
    setPage(0);
    setSearch("");
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const jwt = localStorage.getItem("jwt") || auth?.jwt || "";
    if (!jwt) { navigate("/login"); return; }
    dispatch(addItemToCart({
      jwt,
      request: { productId: product._id, size: product.sizes || "FREE SIZE", quantity: 1 },
    }));
    setAddedIds((p) => [...p, product._id]);
    setTimeout(() => setAddedIds((p) => p.filter((x) => x !== product._id)), 2000);
  };

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

  const allItems: any[] = products.products || [];
  const searched = search.trim()
    ? allItems.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const totalPages = products.totalPages || 1;

  const pageNumbers = () => {
    const total   = totalPages;
    const current = page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current < 4)          return [0, 1, 2, 3, 4, -1, total - 1];
    if (current > total - 5)  return [0, -1, total-5, total-4, total-3, total-2, total-1];
    return [0, -1, current-1, current, current+1, -1, total-1];
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>

      {/* Hero Header */}
      <div
        className={`py-10 border-b ${isDark ? "border-white/5" : "border-gray-200"}`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 50%, #0a0a0f 100%)"
            : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors ${
              isDark ? "text-white/40 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-3xl font-black mb-2 flex items-center gap-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <Star size={28} className="text-indigo-400" fill="#818cf8" />
                Featured Products
              </motion.h1>
              <p className={isDark ? "text-white/40" : "text-gray-500"}>
                {searched.length} products found
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? "text-white/30" : "text-gray-400"
              }`} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-indigo-500/50"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {TABS.map((tab, i) => (
              <motion.button
                key={tab.label}
                onClick={() => handleTabChange(i)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                  activeTab === i
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25"
                    : isDark
                    ? "border-white/8 bg-white/3 text-white/50 hover:text-white hover:bg-white/8"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className={isDark ? "text-white/40" : "text-gray-400"} />
            <span className={`text-xs font-medium ${isDark ? "text-white/40" : "text-gray-500"}`}>
              Per page:
            </span>
            <div className="flex gap-1">
              {PER_PAGE_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => { setPerPage(n); setPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    perPage === n
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : isDark
                      ? "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {products.loading ? (
          <div className="flex items-center justify-center h-72">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={36} className="text-indigo-400 animate-spin" />
              <p className={isDark ? "text-white/30" : "text-gray-400"}>Loading products...</p>
            </div>
          </div>

        ) : searched.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 gap-4">
            <ShoppingCart size={32} className={isDark ? "text-white/20" : "text-gray-300"} />
            <p className={isDark ? "text-white/40" : "text-gray-400"}>
              No products found{search && ` for "${search}"`}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="text-indigo-400 text-sm hover:underline">
                Clear search
              </button>
            )}
          </div>

        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${page}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {searched.map((product: any, idx: number) => {
                // ✅ Safe price calculation
                const sellPrice = product.minPrice    ?? product.sellingPrice   ?? 0;
                const mrpPrice  = product.minMrpPrice ?? product.mrpPrice       ?? 0;
                const disc      = mrpPrice > 0 && mrpPrice > sellPrice
                  ? Math.round(((mrpPrice - sellPrice) / mrpPrice) * 100) : 0;
                const sellerName =
                  product.defaultListing?.seller?.businessDetails?.businessName ||
                  product.defaultListing?.seller?.sellerName ||
                  product.brand || "Nexkart";

                // ✅ Safe URL - never undefined
                const productUrl = `/product-details/${
                  product.category?.categoryId || "all"
                }/${encodeURIComponent(product.title || "")}/${product._id}`;

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                  >
                    <Link to={productUrl}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 h-full ${
                          isDark
                            ? "bg-white/3 border-white/8 hover:border-indigo-500/40 hover:bg-white/6"
                            : "bg-white border-gray-100 hover:border-indigo-300 hover:shadow-lg"
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

                          {/* ✅ Discount - never NaN */}
                          {disc > 0 && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow">
                              -{disc}%
                            </span>
                          )}

                          {/* Multi-seller */}
                          {(product.totalSellers ?? 0) > 1 && (
                            <span className="absolute bottom-10 left-2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              {product.totalSellers} sellers
                            </span>
                          )}

                          {/* Wishlist */}
                          <motion.button
                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                            onClick={(e) => toggleWish(e, product._id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                          >
                            <Heart
                              size={13}
                              className={isWishlisted(product._id) ? "text-pink-400 fill-pink-400" : "text-white"}
                            />
                          </motion.button>

                          {/* Add to Cart hover */}
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
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          {/* ✅ Seller name from defaultListing */}
                          <p className={`text-[10px] mb-0.5 font-medium ${isDark ? "text-white/30" : "text-gray-400"}`}>
                            {sellerName}
                          </p>
                          <h3 className={`text-xs font-semibold line-clamp-2 mb-2 leading-snug ${
                            isDark ? "text-white/80" : "text-gray-800"
                          }`}>
                            {product.title}
                          </h3>

                          {/* ✅ Rating - uses averageRating */}
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

                          {/* ✅ Price - NEVER NaN */}
                          <div className="flex items-baseline gap-1.5">
                            <span className={`font-black text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
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
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && !products.loading && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-30 ${
                isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                       : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={15} /> Prev
            </motion.button>

            <div className="flex items-center gap-1">
              {pageNumbers().map((n, i) =>
                n === -1 ? (
                  <span key={`dot-${i}`} className={`px-1 ${isDark ? "text-white/20" : "text-gray-300"}`}>•••</span>
                ) : (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      page === n
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : isDark
                        ? "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {n + 1}
                  </motion.button>
                )
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-30 ${
                isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                       : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next <ChevronRight size={15} />
            </motion.button>
          </div>
        )}

        {!products.loading && searched.length > 0 && (
          <p className={`text-center text-xs mt-4 ${isDark ? "text-white/25" : "text-gray-400"}`}>
            Page {page + 1} of {totalPages} · Showing {searched.length} products
          </p>
        )}
      </div>
    </div>
  );
};

export default AllFeatured;