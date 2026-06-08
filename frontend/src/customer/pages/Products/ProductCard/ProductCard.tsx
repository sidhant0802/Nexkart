import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { addItemToCart } from "../../../../Redux Toolkit/Customer/CartSlice";
import { addProductToWishlist } from "../../../../Redux Toolkit/Customer/WishlistSlice";
import CloudImage from "../../../../components/ui/CloudImage"; // ✅ Import your new CloudImage component

interface Product {
  _id: string;
  title: string;
  images: string[];
  color?: string;
  brand?: string;
  sizes?: string;
  category?: { categoryId: string; name: string } | string;
  minPrice?: number;
  minMrpPrice?: number;
  totalSellers?: number;
  totalStock?: number;
  averageRating?: number;
  numRatings?: number;
  sellingPrice?: number;
  mrpPrice?: number;
  discountPercent?: number;
  ratings?: number;
  defaultListing?: {
    _id: string;
    sellingPrice: number;
    mrpPrice: number;
    discountPercent: number;
    seller?: {
      sellerName?: string;
      businessDetails?: { businessName?: string };
    };
  };
}

// ✅ Accept optional categoryId prop from parent
const ProductCard = ({
  product,
  categoryId: categoryIdProp,
}: {
  product: Product;
  categoryId?: string;
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const wishlist = useAppSelector((s) => s.wishlist.wishlist);
  const auth     = useAppSelector((s) => s.auth);

  const [hovered,    setHovered]    = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [addedCart,  setAddedCart]  = useState(false);

  // ✅ Safe price helpers - NEVER NaN
  const sellPrice = product.minPrice    ?? product.sellingPrice ?? 0;
  const mrpPrice  = product.minMrpPrice ?? product.mrpPrice    ?? 0;
  const disc      = mrpPrice > 0 && mrpPrice > sellPrice
    ? Math.round(((mrpPrice - sellPrice) / mrpPrice) * 100)
    : 0;

  const isInWishlist = wishlist?.products?.some(
    (p: any) => p._id === product._id || p === product._id
  );

  const defaultSize = product.sizes?.split(",")?.[0]?.trim() || "ONE SIZE";

  // ✅ Safe navigate - reads from product.category, never undefined
  const handleNavigate = () => {
    // Priority: prop → product.category.categoryId → product.category string → "all"
    const catId =
      categoryIdProp ||
      (typeof product.category === "object"
        ? product.category?.categoryId
        : (product.category as string)) ||
      "all";

    navigate(
      `/product-details/${catId}/${encodeURIComponent(product.title || "")}/${product._id}`
    );
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const jwt = localStorage.getItem("jwt") || auth?.jwt;
    if (!jwt) { navigate("/login"); return; }
    setAddingCart(true);
    await dispatch(
      addItemToCart({
        jwt,
        request: { productId: product._id, size: defaultSize, quantity: 1 },
      })
    );
    setAddingCart(false);
    setAddedCart(true);
    setTimeout(() => setAddedCart(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const jwt = localStorage.getItem("jwt") || auth?.jwt;
    if (!jwt) { navigate("/login"); return; }
    dispatch(addProductToWishlist({ productId: product._id as any }));
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(n ?? 0);

  return (
    <div
      onClick={handleNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {/* ✅ Swapped normal img with optimized lazy-loaded CloudImage */}
        <CloudImage
          src={product.images?.[0]}
          alt={product.title}
          width={400}    // Optimized responsive width for product list cards
          height={533}   // Optimized matching 3:4 height
          quality="good" // Balanced quality setting
          objectFit="cover"
          lazy={true}
          fallback="https://placehold.co/300x400/f3f4f6/9ca3af?text=No+Image"
          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount badge */}
        {disc > 0 && (
          <div
            className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: "#FF6584", color: "#fff" }}
          >
            {disc}% off
          </div>
        )}

        {/* Multi-seller badge */}
        {(product.totalSellers ?? 0) > 1 && (
          <div className="absolute top-3 right-10 z-10 px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-600 text-white">
            {product.totalSellers} sellers
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            size={14}
            className={isInWishlist ? "text-pink-500 fill-pink-500" : "text-gray-500"}
          />
        </button>

        {/* Add to Cart overlay */}
        {hovered && (
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <button
              onClick={handleAddToCart}
              disabled={addingCart}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                addedCart
                  ? "bg-green-500 text-white"
                  : "bg-gray-900/90 backdrop-blur-sm text-white hover:bg-indigo-600"
              }`}
            >
              <ShoppingCart size={12} />
              {addingCart ? "Adding..." : addedCart ? "✓ Added!" : "Add to Cart"}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Seller/Brand */}
        <p className="text-[10px] text-gray-400 font-medium truncate mb-0.5">
          {product.defaultListing?.seller?.businessDetails?.businessName ||
           product.defaultListing?.seller?.sellerName ||
           product.brand || "Nexkart"}
        </p>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-snug">
          {product.title}
        </h3>

        {/* Rating */}
        {(product.numRatings ?? 0) > 0 && (product.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-green-500/15">
              <Star size={9} className="text-green-500 fill-green-500" />
              <span className="text-[10px] font-bold text-green-600">
                {(product.averageRating ?? 0).toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">({product.numRatings})</span>
          </div>
        )}

        {/* Price - NEVER NaN */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base font-bold text-gray-900">
            {fmt(sellPrice)}
          </span>
          {mrpPrice > sellPrice && (
            <span className="text-xs line-through text-gray-400">
              {fmt(mrpPrice)}
            </span>
          )}
          {disc > 0 && (
            <span className="text-xs font-bold text-green-600">{disc}% off</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;