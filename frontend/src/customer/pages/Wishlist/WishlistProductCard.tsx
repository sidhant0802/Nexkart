import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star, Loader2, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { addProductToWishlist } from "../../../Redux Toolkit/Customer/WishlistSlice";
import { addItemToCart } from "../../../Redux Toolkit/Customer/CartSlice";
import { useTheme } from "../../../routes/CustomerRoutes";

interface Props {
  item: any; // ✅ use any — Product type has old fields
}

const WishlistProductCard: React.FC<Props> = ({ item }) => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const { isDark } = useTheme();
const auth = useAppSelector((s) => s.auth);

  const [removing,    setRemoving]    = useState(false);
  const [adding,      setAdding]      = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [hover,       setHover]       = useState(false);

  // ✅ Price helpers - NEVER NaN
  const sellPrice = item?.minPrice    ?? item?.sellingPrice   ?? 0;
  const mrpPrice  = item?.minMrpPrice ?? item?.mrpPrice       ?? 0;
  const disc      = mrpPrice > 0 && mrpPrice > sellPrice
    ? Math.round(((mrpPrice - sellPrice) / mrpPrice) * 100)
    : 0;
  const stock     = item?.totalStock  ?? item?.quantity       ?? 0;
  const rating    = item?.averageRating ?? 0;
  const numRatings = item?.numRatings ?? 0;

  // ✅ Seller name from defaultListing
  const sellerName =
    item?.defaultListing?.seller?.businessDetails?.businessName ||
    item?.defaultListing?.seller?.sellerName ||
    item?.seller?.businessDetails?.businessName ||
    item?.brand ||
    "Nexkart";

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n ?? 0);

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoving(true);
    if (item._id) await dispatch(addProductToWishlist({ productId: item._id }));
    setRemoving(false);
  };

 const handleAddToCart = async (e: React.MouseEvent) => {
  e.stopPropagation();
  const jwt = localStorage.getItem("jwt") || auth?.jwt || "";
  if (!jwt) { navigate("/login"); return; }

  const listingId = item.defaultListing?._id;
  if (!listingId) {
    alert("Product unavailable - no active sellers");
    return;
  }

  setAdding(true);
  await dispatch(addItemToCart({
    jwt,
    request: {
      productListingId: listingId,
      size:             item.sizes || "FREE SIZE",
      quantity:         1,
    },
  }));
  setAdding(false);
  setAddedToCart(true);
  setTimeout(() => setAddedToCart(false), 2000);
};

  const handleView = () => {
    navigate(`/product-details/${item.category?.categoryId || "all"}/${encodeURIComponent(item.title || "")}/${item._id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleView}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 w-full ${
        isDark
          ? "bg-white/5 border border-white/10 hover:border-pink-500/40"
          : "bg-white border border-gray-200 hover:border-pink-300 hover:shadow-lg"
      }`}
    >
      {/* ── IMAGE ── */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-gray-100">
        <motion.img
          src={item.images?.[0] || "https://placehold.co/300x400/f3f4f6/9ca3af?text=No+Image"}
          alt={item.title}
          className="w-full h-full object-cover"
          animate={{ scale: hover ? 1.08 : 1 }}
          transition={{ duration: 0.5 }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/300x400/f3f4f6/9ca3af?text=No+Image";
          }}
        />

        {/* Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
          animate={{ opacity: hover ? 1 : 0 }}
        />

        {/* ✅ Discount badge - never NaN */}
        {disc > 0 && (
          <span
            className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-black text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #22c55e, #15803d)" }}
          >
            -{disc}% OFF
          </span>
        )}

        {/* Heart badge */}
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-xl flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(135deg, #ec4899, #f43f5e)",
            boxShadow: "0 4px 12px rgba(236,72,153,0.4)",
          }}
        >
          <Heart size={12} className="text-white" fill="white" />
        </div>

        {/* Multi-seller badge */}
        {(item.totalSellers ?? 0) > 1 && (
          <span className="absolute bottom-10 left-2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {item.totalSellers} sellers
          </span>
        )}

        {/* Hover Actions */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-2 bottom-2 flex gap-1.5"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 ${
                  addedToCart
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                {adding ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : addedToCart ? (
                  <>✓ Added</>
                ) : (
                  <><ShoppingCart size={10} /> Add</>
                )}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); handleView(); }}
                className="w-9 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30"
              >
                <Eye size={11} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── INFO ── */}
      <div className="p-3 relative">
        {/* Remove button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRemove}
          disabled={removing}
          className={`absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
            isDark
              ? "bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400"
              : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
          }`}
        >
          {removing
            ? <Loader2 size={10} className="animate-spin" />
            : <Trash2 size={10} />}
        </motion.button>

        {/* ✅ Seller name */}
        <p className={`text-[9px] font-medium mb-0.5 truncate pr-7 ${
          isDark ? "text-white/40" : "text-gray-400"
        }`}>
          {sellerName}
        </p>

        {/* Title */}
        <h3 className={`text-xs font-semibold line-clamp-2 mb-1.5 leading-snug pr-2 min-h-[32px] ${
          isDark ? "text-white/85" : "text-gray-800"
        }`}>
          {item.title}
        </h3>

        {/* ✅ Rating - uses averageRating not ratings/numRatings */}
        {numRatings > 0 && rating > 0 && (
          <div className="flex items-center gap-1 mb-1.5">
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              <Star size={8} className="text-green-500 fill-green-500" />
              <span className="text-[9px] font-bold text-green-500">
                {rating.toFixed(1)}
              </span>
            </div>
            <span className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"}`}>
              ({numRatings})
            </span>
          </div>
        )}

        {/* ✅ Price - NEVER NaN */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-sm font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            {fmt(sellPrice)}
          </span>
          {mrpPrice > sellPrice && (
            <span className={`text-[10px] line-through ${isDark ? "text-white/30" : "text-gray-400"}`}>
              {fmt(mrpPrice)}
            </span>
          )}
          {disc > 0 && (
            <span className="text-[10px] text-green-500 font-bold">
              {disc}% off
            </span>
          )}
        </div>

        {/* ✅ Stock - uses totalStock */}
        {stock > 0 ? (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-[9px] font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
              In Stock
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="w-1 h-1 rounded-full bg-red-500" />
            <span className="text-[9px] font-medium text-red-400">Out of Stock</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WishlistProductCard;