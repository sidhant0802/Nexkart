import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../../../routes/CustomerRoutes";
import { ArrowLeft, Search, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchBrands } from "../../../Redux Toolkit/Admin/BrandSlice";

const AllBrands = () => {
  const { isDark }  = useTheme();
  const dispatch    = useAppDispatch();
  const { brands, loading } = useAppSelector((s) => s.brand);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const activeBrands = brands.filter((b) => b.isActive !== false);

  const filtered = activeBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group alphabetically
  const grouped: Record<string, typeof brands> = {};
  filtered.forEach((brand) => {
    const letter = brand.name.charAt(0).toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(brand);
  });

  const sortedLetters = Object.keys(grouped).sort();

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>

      {/* Header */}
      <div
        className={`py-12 border-b ${isDark ? "border-white/5" : "border-gray-200"}`}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #0a0a0f 0%, #312e81 50%, #0a0a0f 100%)"
            : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 mb-6 text-sm font-medium ${
              isDark ? "text-white/40 hover:text-white" : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-3xl font-black mb-2 flex items-center gap-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                🏆 All Brands
              </motion.h1>
              <p className={isDark ? "text-white/40" : "text-gray-600"}>
                {activeBrands.length} brands •{" "}
                {activeBrands.filter((b) => b.featured).length} featured
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isDark ? "text-white/30" : "text-gray-500"
                }`}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brands..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none ${
                  isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-indigo-500/50"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"
                }`}
              />
            </div>
          </div>

          {/* Alphabet quick jump */}
          <div className="flex flex-wrap gap-1.5 mt-6">
            {sortedLetters.map((letter) => (
              <a
                key={letter}
                href={`#brand-${letter}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  isDark
                    ? "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                    : "bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
            <p className={`mt-3 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              Loading brands...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className={isDark ? "text-white/40" : "text-gray-400"}>
              {search ? `No brands found for "${search}"` : "No brands available"}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedLetters.map((letter) => (
              <div key={letter} id={`brand-${letter}`}>
                {/* Letter Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      isDark
                        ? "bg-indigo-500/20 text-indigo-400"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {letter}
                  </div>
                  <div
                    className={`flex-1 h-px ${
                      isDark ? "bg-white/10" : "bg-gray-200"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isDark ? "text-white/30" : "text-gray-400"
                    }`}
                  >
                    {grouped[letter].length} brands
                  </span>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {grouped[letter].map((brand, i) => {
                    const brandCategory =
                      Array.isArray((brand as any).categories) &&
                      (brand as any).categories.length > 0
                        ? (brand as any).categories[0]
                        : (brand as any).category || "";

                    return (
                      <motion.div
                        key={brand._id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
                          to={`/products/${brandCategory}?brand=${encodeURIComponent(brand.name)}`}
                        >
                          <motion.div
                            whileHover={{ y: -6, scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all group ${
                              isDark
                                ? "border-white/6 bg-white/3 hover:border-indigo-500/30 hover:bg-white/8"
                                : "border-gray-100 bg-white hover:border-indigo-300 hover:shadow-lg shadow-sm"
                            }`}
                          >
                            {/* Featured badge */}
                            {brand.featured && (
                              <div className="absolute top-2 right-2">
                                <Star
                                  size={14}
                                  className="text-amber-400 fill-amber-400"
                                />
                              </div>
                            )}

                            {/* Logo */}
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-gray-100">
                              <img loading="lazy" decoding="async"
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 p-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://placehold.co/64x64/6366f1/white?text=${brand.name.charAt(0)}`;
                                }}
                              />
                            </div>

                            {/* Name */}
                            <span
                              className={`text-sm font-bold text-center truncate w-full ${
                                isDark
                                  ? "text-white/80 group-hover:text-white"
                                  : "text-gray-700 group-hover:text-gray-900"
                              }`}
                            >
                              {brand.name}
                            </span>

                            {/* Description */}
                            {brand.description && (
                              <span
                                className={`text-[10px] text-center line-clamp-1 ${
                                  isDark ? "text-white/30" : "text-gray-400"
                                }`}
                              >
                                {brand.description}
                              </span>
                            )}
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBrands;