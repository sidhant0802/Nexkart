import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { searchProduct } from "../../../Redux Toolkit/Customer/ProductSlice";

const trendingSearches = ["iPhone 15", "Nike Shoes", "Saree", "Laptop", "Smart Watch"];
const recentSearches   = ["Wireless Earbuds", "Men T-Shirts", "Women Kurta"];

interface SearchBarProps {
  autoFocus?: boolean;
  isDark?: boolean;
}

const SearchBar = ({ autoFocus = false, isDark = true }: SearchBarProps) => {
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ✅ Specific selector
  const searchResults = useAppSelector((s) => s.products.searchProduct);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const timer = setTimeout(() => dispatch(searchProduct(query)), 400);
      return () => clearTimeout(timer);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search-products?q=${encodeURIComponent(query)}`);
      setFocused(false);
      setQuery("");
    }
  };

  const handleSuggestionClick = (term: string) => {
    navigate(`/search-products?q=${encodeURIComponent(term)}`);
    setFocused(false);
    setQuery("");
  };

  // ✅ Safe product URL helper
  const getUrl = (product: any) =>
    `/product-details/${
      product.category?.categoryId || "all"
    }/${encodeURIComponent(product.title || "")}/${product._id}`;

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch}>
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
            focused
              ? "border-indigo-500/60 shadow-lg shadow-indigo-500/10"
              : isDark
              ? "border-white/10 hover:border-white/20"
              : "border-gray-200 hover:border-gray-300"
          } ${isDark ? "bg-white/5" : "bg-gray-50"}`}
        >
          <Search
            size={17}
            className={`flex-shrink-0 transition-colors ${
              focused ? "text-indigo-400" : isDark ? "text-white/30" : "text-gray-400"
            }`}
          />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search products, brands..."
            className={`flex-1 bg-transparent text-sm outline-none ${
              isDark ? "text-white placeholder-white/25" : "text-gray-900 placeholder-gray-400"
            }`}
          />

          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setQuery("")}
                className={isDark ? "text-white/30" : "text-gray-400"}
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Search
          </motion.button>
        </div>
      </form>

      {/* Dropdown */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 ${
              isDark ? "bg-[#0f0f1a] border-white/10" : "bg-white border-gray-100"
            }`}
          >
            {/* ✅ Live Search Results */}
            {query.trim().length > 1 && searchResults?.length > 0 ? (
              <div className="p-3">
                <p className={`text-xs px-2 mb-3 uppercase tracking-wider font-semibold ${isDark ? "text-white/30" : "text-gray-400"}`}>
                  Results
                </p>

                {searchResults.slice(0, 5).map((product: any) => {
                  // ✅ Safe price
                  const price = product.minPrice ?? product.sellingPrice ?? 0;

                  return (
                    <motion.div
                      key={product._id}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(getUrl(product))}
                      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                        isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                        <img loading="lazy" decoding="async"
                          src={product.images?.[0] || "https://placehold.co/40"}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/40"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {product.title}
                        </p>
                        {/* ✅ Price - clean, never NaN */}
                        <p className={`text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}>
                          ₹{price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => handleSuggestionClick(query)}
                  className={`w-full flex items-center justify-between p-3 mt-2 rounded-xl border text-sm font-medium transition-colors ${
                    isDark
                      ? "border-white/5 text-indigo-400 hover:border-indigo-500/30"
                      : "border-gray-100 text-indigo-600 hover:border-indigo-200"
                  }`}
                >
                  <span>See all results for "{query}"</span>
                  <ArrowRight size={14} />
                </motion.button>
              </div>

            ) : (
              /* Trending + Recent */
              <div className="p-4 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={13} className="text-green-400" />
                    <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      Trending
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <motion.button
                        key={term}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestionClick(term)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isDark
                            ? "bg-white/5 border border-white/8 text-white/60 hover:text-white hover:border-white/20"
                            : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={13} className={isDark ? "text-white/30" : "text-gray-400"} />
                    <span className={`text-xs uppercase tracking-wider font-semibold ${isDark ? "text-white/40" : "text-gray-400"}`}>
                      Recent
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term) => (
                      <motion.button
                        key={term}
                        whileHover={{ x: 4 }}
                        onClick={() => handleSuggestionClick(term)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-all ${
                          isDark
                            ? "text-white/50 hover:text-white hover:bg-white/5"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Clock size={13} className="opacity-40" />
                        {term}
                        <ArrowRight size={12} className="ml-auto opacity-30" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;