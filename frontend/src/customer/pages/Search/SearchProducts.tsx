import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { searchProducts } from "../../../Redux Toolkit/Customer/SearchSlice";
import ProductCard from "../Products/ProductCard";
import { Package, Filter, X } from "lucide-react";
import { useTheme } from "../../../routes/CustomerRoutes";

const SearchProducts = () => {
  const dispatch     = useAppDispatch();
  const { isDark }   = useTheme();
  const [searchParams] = useSearchParams();

  // ✅ Use NEW search slice
  const { results: searchResults, loading, processingTimeMs } =
    useAppSelector((s: any) => s.search);

  const query = searchParams.get("q") || searchParams.get("query") || "";

  const [activeBrand,    setActiveBrand]    = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [priceRange,     setPriceRange]     = useState<string>("");
  const [sortBy,         setSortBy]         = useState<string>("relevance");

  // ✅ Fetch using NEW API (Atlas Search powered)
  useEffect(() => {
    if (query) {
      dispatch(searchProducts({ q: query, limit: 100 }));
      setActiveBrand("");
      setActiveCategory("");
      setPriceRange("");
    }
  }, [query, dispatch]);

  const { brands, categories } = useMemo(() => {
    const brandSet = new Set<string>();
    const catSet   = new Set<string>();
    searchResults.forEach((p: any) => {
      if (p.brand) brandSet.add(p.brand);
      if (p.category?.name) catSet.add(p.category.name);
    });
    return {
      brands:     Array.from(brandSet).sort(),
      categories: Array.from(catSet).sort(),
    };
  }, [searchResults]);

  const filteredResults = useMemo(() => {
    let filtered = [...searchResults];

    if (activeBrand) {
      filtered = filtered.filter((p: any) => p.brand === activeBrand);
    }
    if (activeCategory) {
      filtered = filtered.filter((p: any) => p.category?.name === activeCategory);
    }
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((p: any) => {
        const price = p.minPrice ?? 0;
        return price >= min && (max ? price <= max : true);
      });
    }
    if (sortBy === "price_low") {
      filtered.sort((a: any, b: any) => (a.minPrice ?? 0) - (b.minPrice ?? 0));
    } else if (sortBy === "price_high") {
      filtered.sort((a: any, b: any) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
    } else if (sortBy === "discount") {
      filtered.sort((a: any, b: any) => {
        const dA = a.minMrpPrice > 0 ? ((a.minMrpPrice - a.minPrice) / a.minMrpPrice) * 100 : 0;
        const dB = b.minMrpPrice > 0 ? ((b.minMrpPrice - b.minPrice) / b.minMrpPrice) * 100 : 0;
        return dB - dA;
      });
    }

    return filtered;
  }, [searchResults, activeBrand, activeCategory, priceRange, sortBy]);

  const hasActiveFilters = activeBrand || activeCategory || priceRange;

  const clearFilters = () => {
    setActiveBrand("");
    setActiveCategory("");
    setPriceRange("");
  };

  const PRICE_RANGES = [
    { label: "Under ₹500",        value: "0-500"      },
    { label: "₹500 - ₹2,000",     value: "500-2000"   },
    { label: "₹2,000 - ₹10,000",  value: "2000-10000" },
    { label: "₹10,000 - ₹50,000", value: "10000-50000" },
    { label: "Above ₹50,000",     value: "50000-"     },
  ];

  return (
    <div className={`min-h-screen px-4 lg:px-20 py-6 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>

      <div className="mb-6">
        <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
          Search Results
        </h1>
        {query && (
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            {loading
              ? "Searching..."
              : (
                <>
                  {filteredResults.length} of {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{query}"
                  {processingTimeMs > 0 && (
                    <span className="text-green-500 ml-2">⚡ {processingTimeMs}ms</span>
                  )}
                </>
              )}
          </p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className="flex gap-6">

          {/* Sidebar Filters */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className={`rounded-2xl p-4 sticky top-4 ${
              isDark ? "bg-white/5 border border-white/8" : "bg-white border border-gray-100"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-indigo-400" />
                  <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                    Filters
                  </h3>
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-indigo-400 hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {categories.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200/10">
                  <p className={`text-xs font-bold uppercase mb-2 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Category
                  </p>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <label key={cat} className={`flex items-center gap-2 cursor-pointer text-xs py-1 px-2 rounded-lg ${
                        activeCategory === cat
                          ? "bg-indigo-500/15 text-indigo-400"
                          : isDark ? "text-white/60 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
                      }`}>
                        <input
                          type="radio"
                          checked={activeCategory === cat}
                          onChange={() => setActiveCategory(activeCategory === cat ? "" : cat)}
                          className="w-3 h-3 accent-indigo-500"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {brands.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200/10">
                  <p className={`text-xs font-bold uppercase mb-2 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Brand
                  </p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand} className={`flex items-center gap-2 cursor-pointer text-xs py-1 px-2 rounded-lg capitalize ${
                        activeBrand === brand
                          ? "bg-indigo-500/15 text-indigo-400"
                          : isDark ? "text-white/60 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
                      }`}>
                        <input
                          type="radio"
                          checked={activeBrand === brand}
                          onChange={() => setActiveBrand(activeBrand === brand ? "" : brand)}
                          className="w-3 h-3 accent-indigo-500"
                        />
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className={`text-xs font-bold uppercase mb-2 ${isDark ? "text-white/40" : "text-gray-500"}`}>
                  Price Range
                </p>
                <div className="space-y-1">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.value} className={`flex items-center gap-2 cursor-pointer text-xs py-1 px-2 rounded-lg ${
                      priceRange === range.value
                        ? "bg-indigo-500/15 text-indigo-400"
                        : isDark ? "text-white/60 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100"
                    }`}>
                      <input
                        type="radio"
                        checked={priceRange === range.value}
                        onChange={() => setPriceRange(priceRange === range.value ? "" : range.value)}
                        className="w-3 h-3 accent-indigo-500"
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {activeCategory && <Chip label={`Category: ${activeCategory}`} onRemove={() => setActiveCategory("")} isDark={isDark} />}
                {activeBrand    && <Chip label={`Brand: ${activeBrand}`}       onRemove={() => setActiveBrand("")}    isDark={isDark} />}
                {priceRange     && <Chip label={PRICE_RANGES.find(r => r.value === priceRange)?.label || ""} onRemove={() => setPriceRange("")} isDark={isDark} />}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg text-xs outline-none ${
                  isDark ? "bg-white/5 border border-white/10 text-white"
                         : "bg-white border border-gray-200 text-gray-700"
                }`}
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            {filteredResults.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-24 rounded-2xl ${
                isDark ? "bg-white/3" : "bg-white border border-gray-100"
              }`}>
                <Package size={48} className={`mb-4 ${isDark ? "text-white/20" : "text-gray-300"}`} />
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  No results match filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 mt-3"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredResults.map((product: any) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    categoryId={
                      typeof product.category === "object"
                        ? product.category?.categoryId
                        : product.category || "all"
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && query && searchResults.length === 0 && (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl ${
          isDark ? "bg-white/3" : "bg-white border border-gray-100"
        }`}>
          <Package size={48} className={`mb-4 ${isDark ? "text-white/20" : "text-gray-300"}`} />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No results found
          </h3>
          <p className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"}`}>
            Try different keywords from the search bar above
          </p>
        </div>
      )}
    </div>
  );
};

const Chip = ({ label, onRemove, isDark }: { label: string; onRemove: () => void; isDark: boolean }) => (
  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
    isDark ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
           : "bg-indigo-50 text-indigo-600 border border-indigo-200"
  }`}>
    {label}
    <X size={11} className="cursor-pointer hover:opacity-70" onClick={onRemove} />
  </span>
);

export default SearchProducts;