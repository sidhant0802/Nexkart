import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Star, Heart, ShoppingBag, ArrowLeft, Filter } from "lucide-react";
import { useTheme } from "../../../routes/CustomerRoutes";

const API_URL = "http://localhost:8080";

const BrandProducts = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchBrandProducts();
  }, [slug, sort]);

  const fetchBrandProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/brands/${slug}/products?sort=${sort}`);
      setData(res.data);
    } catch (error) {
      console.error("Error fetching brand products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-3" />
          <p className={isDark ? "text-white/50" : "text-gray-500"}>Loading {slug} products...</p>
        </div>
      </div>
    );
  }

  if (!data?.brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Brand not found</p>
      </div>
    );
  }

  const { brand, products, pagination } = data;

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      {/* ── Brand Banner ── */}
      <div
        className="relative h-64 lg:h-80 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${brand.bannerImage})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white px-4"
          >
            {brand.logo && (
              <img loading="lazy" decoding="async"
                src={brand.logo}
                alt={brand.name}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 p-3 backdrop-blur-sm"
              />
            )}
            <h1 className="text-4xl lg:text-5xl font-black mb-2">{brand.name}</h1>
            {brand.tagline && (
              <p className="text-lg lg:text-xl text-white/80 italic">"{brand.tagline}"</p>
            )}
            <p className="mt-4 text-sm max-w-2xl mx-auto opacity-80">{brand.description}</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <span className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                📦 {pagination.total} Products
              </span>
              {brand.featured && (
                <span className="px-4 py-1.5 rounded-full bg-amber-500/30 backdrop-blur-sm">
                  ⭐ Featured Brand
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm font-medium ${
              isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <Filter size={14} className={isDark ? "text-white/50" : "text-gray-500"} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={`px-3 py-2 rounded-lg text-sm outline-none ${
                isDark ? "bg-white/5 border border-white/10 text-white"
                       : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any, i: number) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
             onClick={() => navigate(`/product-details/${product.category?.categoryId || "all"}/${encodeURIComponent(product.title)}/${product._id}`)}
              className={`rounded-2xl overflow-hidden cursor-pointer group ${
                isDark ? "bg-white/5 border border-white/8 hover:border-white/20"
                       : "bg-white border border-gray-100 hover:shadow-lg"
              } transition-all`}
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <img loading="lazy" decoding="async"
                  src={product.images?.[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {(() => {
  const mrp  = product.minMrpPrice ?? product.mrpPrice ?? 0;
  const sell = product.minPrice    ?? product.sellingPrice ?? 0;
  const disc = mrp > 0 && mrp > sell
    ? Math.round(((mrp - sell) / mrp) * 100) : 0;
  return disc > 0 ? (
    <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-500 text-white text-xs font-bold">
      {disc}% OFF
    </span>
  ) : null;
})()}
                <button className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${
                  isDark ? "bg-black/40 text-white" : "bg-white/80 text-gray-700"
                }`}>
                  <Heart size={14} />
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${
                  isDark ? "text-amber-400" : "text-amber-600"
                }`}>
                  {brand.name}
                </p>
                <h3 className={`text-sm font-semibold line-clamp-2 mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  {product.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span className={`text-xs ${isDark ? "text-white/60" : "text-gray-600"}`}>
                    {product.averageRating?.toFixed(1) || "New"}
                  </span>
                  <span className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    ({product.numRatings || 0})
                  </span>
                </div>

                {/* Price */}
           <div className="flex items-baseline gap-2">
  <span className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>
    {fmt(product.minPrice ?? product.sellingPrice ?? 0)}
  </span>
  {(product.minMrpPrice ?? product.mrpPrice ?? 0) > (product.minPrice ?? product.sellingPrice ?? 0) && (
    <span className={`text-xs line-through ${isDark ? "text-white/30" : "text-gray-400"}`}>
      {fmt(product.minMrpPrice ?? product.mrpPrice ?? 0)}
    </span>
  )}
</div>
              </div>
            </motion.div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
            <p className={isDark ? "text-white/50" : "text-gray-500"}>
              No products available for this brand yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;