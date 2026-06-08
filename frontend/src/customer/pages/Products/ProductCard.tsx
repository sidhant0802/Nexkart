import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { addItemToCart } from "../../../Redux Toolkit/Customer/CartSlice";
import { addProductToWishlist } from "../../../Redux Toolkit/Customer/WishlistSlice";

interface Product {
  _id: string;
  title: string;
  images: string[];
  color?: string;
  brand?: string;
  sizes?: string;
  category?: { categoryId: string; name: string } | string;

  // ✅ New schema - aggregated from ProductListing
  minPrice?: number;
  minMrpPrice?: number;
  totalSellers?: number;
  totalStock?: number;
  averageRating?: number;
  numRatings?: number;

  // ✅ Old fields kept as optional fallbacks
  sellingPrice?: number;
  mrpPrice?: number;
  discountPercent?: number;
  ratings?: number;

  // ✅ Default listing (lowest price seller)
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

const ProductCard = ({
  product,
  categoryId: categoryIdProp,
}: {
  product: Product;
  categoryId?: string;
}) => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const { wishlist } = useAppSelector((s) => s.wishlist || {});
  const auth         = useAppSelector((s) => s.auth);

  const [imgError,    setImgError]    = useState(false);
  const [hovered,     setHovered]     = useState(false);
  const [addingCart,  setAddingCart]  = useState(false);
  const [addedCart,   setAddedCart]   = useState(false);

  const isInWishlist = wishlist?.products?.some(
    (p: any) => p._id === product._id || p === product._id
  );

  const avgRating =
    product.numRatings && product.numRatings > 0
      ? (product.ratings! / product.numRatings).toFixed(1)
      : null;

  const categoryId =
    typeof product.category === "object"
      ? product.category?.categoryId
      : product.category;

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const defaultSize = product.sizes?.split(",")?.[0]?.trim() || "ONE SIZE";

const handleNavigate = () => {
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

  // ✅ Need productListingId for multi-seller cart
  const listingId = product.defaultListing?._id;
  if (!listingId) {
    alert("This product is currently unavailable");
    return;
  }

  setAddingCart(true);
  await dispatch(
    addItemToCart({
      jwt,
      request: {
        productListingId: listingId,    // ✅ New field
        size:             defaultSize,
        quantity:         1,
      },
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
    dispatch(addProductToWishlist({ productId: Number(product._id) }));
  };

  return (
    <div
      className="relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group"
      style={{
        backgroundColor: "#16161f",
        border:    hovered ? "1px solid rgba(108,99,255,0.5)" : "1px solid #2a2a3d",
        transform: hovered ? "translateY(-4px)"               : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 40px rgba(108,99,255,0.15)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleNavigate}
    >

      {/* ── Discount Badge */}
      {(() => {
  const mrp  = product.minMrpPrice ?? product.mrpPrice ?? 0;
  const sell = product.minPrice    ?? product.sellingPrice ?? 0;
  const disc = mrp > 0 && mrp > sell
    ? Math.round(((mrp - sell) / mrp) * 100) : 0;
  return disc > 0 ? (
    <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg text-xs font-bold"
      style={{ backgroundColor: "#FF6584", color: "#fff" }}>
      {disc}% off
    </div>
  ) : null;
})()}

      {/* ✅ NEW — Brand Badge (top-right above wishlist) */}
      {product.brand && (
        <div
          className="absolute top-3 right-12 z-10 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur"
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            color: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {product.brand}
        </div>
      )}

      {/* ── Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          backgroundColor: isInWishlist ? "rgba(255,101,132,0.2)" : "rgba(0,0,0,0.4)",
          border: isInWishlist ? "1px solid rgba(255,101,132,0.5)" : "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Heart
          size={14}
          fill={isInWishlist ? "#FF6584" : "none"}
          stroke={isInWishlist ? "#FF6584" : "#fff"}
        />
      </button>

      {/* ── Image Area */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "220px", backgroundColor: "#f8f8ff" }}
      >
        {!imgError ? (
          <img loading="lazy" decoding="async"
            src={product.images?.[0]}
            alt={product.title}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
            style={{ padding: "12px" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">👟</div>
        )}

        {/* ── Add to Cart Slide-up */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-3 transition-all duration-300"
          style={{
            backgroundColor: addedCart ? "rgba(34,197,94,0.95)" : "rgba(108,99,255,0.95)",
            backdropFilter: "blur(8px)",
            transform: hovered ? "translateY(0)" : "translateY(100%)",
          }}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={14} className="mr-2 text-white" />
          <span className="text-white text-xs font-semibold">
            {addingCart ? "Adding..." : addedCart ? "Added ✓" : "Add to Cart"}
          </span>
        </div>
      </div>

      {/* ── Info */}
      <div className="flex flex-col gap-2 p-4">

        {/* ✅ Brand + Category Row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-medium uppercase tracking-wider truncate"
            style={{ color: "#6C63FF" }}
          >
            {categoryName || "Product"}
          </span>
          {product.brand && (
            <span
              className="text-[10px] font-bold flex-shrink-0"
              style={{ color: "#9ca3af" }}
            >
              {product.brand.toUpperCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-sm font-semibold leading-snug"
          style={{
            color: "#fff",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.title}
        </h3>

        {/* Rating */}
        {avgRating && (
          <div className="flex items-center gap-1">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
            >
              <Star size={10} fill="#22c55e" stroke="none" />
              <span className="text-xs font-bold" style={{ color: "#22c55e" }}>{avgRating}</span>
            </div>
            <span className="text-xs" style={{ color: "#6b7280" }}>
              ({product.numRatings?.toLocaleString()})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
        <span className="text-base font-bold" style={{ color: "#fff" }}>
  ₹{(product.minPrice ?? product.sellingPrice ?? 0).toLocaleString("en-IN")}
</span>
{(product.minMrpPrice ?? product.mrpPrice ?? 0) > (product.minPrice ?? product.sellingPrice ?? 0) && (
  <span className="text-xs line-through" style={{ color: "#6b7280" }}>
    ₹{(product.minMrpPrice ?? product.mrpPrice ?? 0).toLocaleString("en-IN")}
  </span>
)}
        </div>

        {/* Color */}
        {product.color && (
          <p className="text-xs" style={{ color: "#6b7280" }}>{product.color}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;