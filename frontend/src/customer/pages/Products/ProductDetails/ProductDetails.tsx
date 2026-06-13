import React, { useEffect, useState }    from "react";
import { useParams, useNavigate }         from "react-router-dom";
import { motion, AnimatePresence }        from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { useTheme }                       from "../../../../routes/CustomerRoutes";
import {
  fetchProductById,
  fetchProductListings,
  setSelectedListing,
  selectProduct,
  selectListings,
  selectListingsLoading,
  selectSelectedListing,
} from "../../../../Redux Toolkit/Customer/ProductSlice";
import {
  addItemToCart,
  fetchUserCart,
  deleteCartItem,
  selectCart,
} from "../../../../Redux Toolkit/Customer/CartSlice";
import CloudImage from "../../../../components/ui/CloudImage";
import {
  addProductToWishlist,
  getWishlistByUserId,
} from "../../../../Redux Toolkit/Customer/WishlistSlice";
import { fetchReviewsByProductId } from "../../../../Redux Toolkit/Customer/ReviewSlice";
import {
  Button, Divider, CircularProgress, Chip,
  Collapse, Radio,
} from "@mui/material";
import AddShoppingCartIcon        from "@mui/icons-material/AddShoppingCart";
import RemoveShoppingCartIcon     from "@mui/icons-material/RemoveShoppingCart";
import FavoriteBorderIcon         from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon               from "@mui/icons-material/Favorite";
import LocalShippingOutlinedIcon  from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon       from "@mui/icons-material/VerifiedOutlined";
import StorefrontOutlinedIcon     from "@mui/icons-material/StorefrontOutlined";
import KeyboardArrowDownIcon      from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon        from "@mui/icons-material/KeyboardArrowUp";
import StarIcon                   from "@mui/icons-material/Star";
import ShoppingBagOutlinedIcon    from "@mui/icons-material/ShoppingBagOutlined";
import BoltIcon                   from "@mui/icons-material/Bolt";          // ✅ NEW
import RatingCard                 from "../../Review/RatingCard";
import ProductReviewCard          from "../../Review/ProductReviewCard";
import SmilarProduct              from "../SimilarProduct/SmilarProduct";
import ZoomableImage              from "./ZoomableImage";
import type { ProductListing }    from "../../../../types/productTypes";
import AIInsights from "./AIInsights";

const isValidObjectId = (id: string) => /^[a-f\d]{24}$/i.test(id);

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate      = useNavigate();
  const dispatch      = useAppDispatch();
  const { isDark }    = useTheme();

  // ── Theme-aware colors ──
  const c = {
    text:        isDark ? "#f1f5f9"               : "#0f172a",
    textSec:     isDark ? "#cbd5e1"               : "#334155",
    textMuted:   isDark ? "#94a3b8"               : "#64748b",
    textSubtle:  isDark ? "#64748b"               : "#94a3b8",
    bg:          isDark ? "#0a0a0f"               : "#ffffff",
    bgImage:     isDark ? "#1e1e2e"               : "#f1f5f9",
    bgCard:      isDark ? "rgba(255,255,255,0.03)": "rgba(0,0,0,0.025)",
    bgCardHover: isDark ? "rgba(255,255,255,0.05)": "rgba(0,0,0,0.04)",
    border:      isDark ? "rgba(255,255,255,0.07)": "rgba(0,0,0,0.08)",
    borderHover: isDark ? "rgba(255,255,255,0.15)": "rgba(0,0,0,0.15)",
    accent:      "#6366f1",
    accentText:  isDark ? "#a5b4fc"               : "#4f46e5",
    accentBg:    isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)",
    accentBorder:isDark ? "rgba(99,102,241,0.2)"  : "rgba(99,102,241,0.25)",
    success:     isDark ? "#22c55e"               : "#16a34a",
    successBg:   isDark ? "rgba(34,197,94,0.08)"  : "rgba(34,197,94,0.06)",
    successBd:   isDark ? "rgba(34,197,94,0.25)"  : "rgba(34,197,94,0.3)",
    danger:      isDark ? "#ef4444"               : "#dc2626",
    pink:        "#ec4899",
    star:        "#fbbf24",
  };

  // ── Redux ──
  const product         = useAppSelector(selectProduct);
  const listings        = useAppSelector(selectListings);
  const listingsLoading = useAppSelector(selectListingsLoading);
  const selectedListing = useAppSelector(selectSelectedListing);
  const review          = useAppSelector((s) => s.review);
  const wishlistState   = useAppSelector((s) => s.wishlist);
  const wishlistItems   = wishlistState?.wishlist?.products ?? [];
  const cart            = useAppSelector(selectCart);
  // ✅ Detect if logged in as seller
const sellerProfile = useAppSelector((s) => s.sellers.profile);
const isSeller = !!sellerProfile;
  const [pageLoading,    setPageLoading]    = useState(true);
  const [selectedImage,  setSelectedImage]  = useState(0);
  const [showAllSellers, setShowAllSellers] = useState(false);
  const [wishLoading,    setWishLoading]    = useState(false);
  const [addingToCart,   setAddingToCart]   = useState(false);

  // ✅ NEW — Buy Now modal state
  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [buyNowQty,  setBuyNowQty]  = useState(1);

  // ── Load ──
useEffect(() => {
  if (!productId || !isValidObjectId(productId)) return;
  setPageLoading(true);
  dispatch(fetchProductById(productId));
  dispatch(fetchProductListings(productId));
  dispatch(fetchReviewsByProductId({ productId }));

  // ✅ Only fetch user-specific data if NOT a seller
  const jwt = localStorage.getItem("jwt");
  if (jwt && !sellerProfile) {
    dispatch(getWishlistByUserId());
    dispatch(fetchUserCart(jwt));
  }
}, [productId, dispatch, sellerProfile]);

  useEffect(() => {
    if (product && product._id) setPageLoading(false);
  }, [product]);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 8000);
    return () => clearTimeout(timer);
  }, [productId]);

  // ── Derived ──
  const activeListing = selectedListing ?? product?.defaultListing ?? null;
  const mrpPrice      = activeListing?.mrpPrice     ?? product?.minMrpPrice ?? 0;
  const sellingPrice  = activeListing?.sellingPrice ?? product?.minPrice    ?? 0;
  const discountPct   = mrpPrice > 0 && mrpPrice > sellingPrice
    ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100)
    : 0;
  const deliveryDays  = activeListing?.deliveryDays ?? 5;
  const sellerName    =
    activeListing?.seller?.businessDetails?.businessName ||
    activeListing?.seller?.sellerName ||
    "Official Store";
  const sellerRating  = activeListing?.sellerRating ?? 0;
  const stock         = activeListing?.quantity     ?? 0;
  const totalSold     = activeListing?.totalSold    ?? 0;
// ✅ Handle both shapes safely
const cartItemsArray = (cart as any)?.cart?.cartItems || (cart as any)?.cartItems || [];
const cartItem = cartItemsArray.find((item: any) =>
  item?.productListing?._id === activeListing?._id ||
  item?.productListing      === activeListing?._id ||
  item?.product?._id        === product?._id        ||
  item?.product             === product?._id
);
const isInCart = !!cartItem;

  const isInWishlist = wishlistItems.some(
    (item: any) =>
      item?._id          === product?._id ||
      item?.product?._id === product?._id ||
      item               === product?._id
  );

  // ── Handlers ──
  const handleAddToCart = async () => {
    if (!activeListing?._id) return;
    const jwt = localStorage.getItem("jwt") || "";
    if (!jwt) { navigate("/login"); return; }

    setAddingToCart(true);
    try {
      await dispatch(
        addItemToCart({
          jwt,
          request: {
            productListingId: activeListing._id,
            size:             product?.sizes || "ONE SIZE",
            quantity:         1,
          },
        })
      ).unwrap();
      await dispatch(fetchUserCart(jwt)).unwrap();
    } catch (err) {
      console.error("Add failed:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!cartItem?._id) return;
    const jwt = localStorage.getItem("jwt") || "";
    if (!jwt) return;

    setAddingToCart(true);
    try {
      await dispatch(deleteCartItem({ jwt, cartItemId: cartItem._id })).unwrap();
      await dispatch(fetchUserCart(jwt)).unwrap();
    } catch (err) {
      console.error("Remove failed:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product?._id) return;
    const jwt = localStorage.getItem("jwt") || "";
    if (!jwt) { navigate("/login"); return; }
    setWishLoading(true);
    await dispatch(addProductToWishlist({ productId: product._id as any }));
    await dispatch(getWishlistByUserId());
    setWishLoading(false);
  };

  const handleSelectSeller = (listing: ProductListing) => {
    dispatch(setSelectedListing(listing));
  };

  // ✅ NEW — Buy Now handler
  const handleOpenBuyNow = () => {
    if (!localStorage.getItem("jwt")) { navigate("/login"); return; }
    if (!activeListing) return;
    setBuyNowQty(1);
    setBuyNowOpen(true);
  };

  const handleProceedToCheckout = () => {
    if (!activeListing) return;
    navigate("/checkout", {
      state: {
        mode:         "buyNow",
        listingId:    activeListing._id,
        quantity:     buyNowQty,
        productTitle: product?.title,
        productImage: product?.images?.[0],
        sellerId:     (activeListing.seller as any)?._id || activeListing.seller,
        sellingPrice: activeListing.sellingPrice,
        mrpPrice:     activeListing.mrpPrice,
      },
    });
  };

  // ── Loading ──
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" style={{ background: c.bg }}>
        <CircularProgress size={48} sx={{ color: c.accent }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" style={{ background: c.bg }}>
        <p style={{ color: c.textMuted }}>Product not found.</p>
      </div>
    );
  }

  return (
    <div
      className="px-4 lg:px-16 pt-6 pb-20"
      style={{ background: c.bg, minHeight: "100vh", color: c.text }}
    >

      {/* ── Top: Image + Details ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-8 lg:gap-12">

        {/* ══════════ LEFT — Images ══════════ */}
        <section className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2 w-16 flex-shrink-0 overflow-y-auto" style={{ maxHeight: "500px" }}>
  {(() => {
    // ✅ Filter out empty/null/invalid images
    const validImages = (product.images || []).filter(
      (img) => img && typeof img === "string" && img.trim() !== ""
    );

    if (validImages.length === 0) {
      return (
        <div style={{
          width: 56, height: 56,
          borderRadius: 8,
          background: c.bgImage,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}>📦</div>
      );
    }

    return validImages.map((img, i) => (
      <motion.button
        key={i}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedImage(i)}
        className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all"
        style={{
          border: selectedImage === i ? `2px solid ${c.accent}` : `2px solid ${c.border}`,
          boxShadow: selectedImage === i ? `0 4px 12px ${c.accent}40` : "none",
        }}
      >
       <CloudImage
  src={img}
  alt={`thumb-${i}`}
  width={80}
  height={80}
  quality="eco"
  objectFit="cover"
  lazy={true}
  fallback={`https://placehold.co/56x56/6366f1/ffffff?text=${encodeURIComponent(product.title?.[0] || "?")}`}
  className="w-full h-full"
/>
      </motion.button>
    ));
  })()}
</div>

    <div className="flex-1 rounded-2xl overflow-hidden border"
  style={{ background: c.bgImage, borderColor: c.border, height: "500px", maxHeight: "500px" }}>
  {(() => {
    const validImages = (product.images || []).filter(
      (img) => img && typeof img === "string" && img.trim() !== ""
    );
    const safeIndex = Math.min(selectedImage, validImages.length - 1);
    const imgSrc = validImages[safeIndex] || validImages[0];

    if (!imgSrc) {
      return (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12, color: c.textMuted,
        }}>
          <span style={{ fontSize: 64 }}>📦</span>
          <p style={{ fontSize: 13, margin: 0 }}>No image available</p>
        </div>
      );
    }

    return (
      <ZoomableImage
        src={imgSrc}
        alt={product.title}
      />
    );
  })()}
</div>
          </div>
        </section>

        {/* ══════════ RIGHT — Details ══════════ */}
        <section className="space-y-4">

          {/* Brand */}
          {product.brand && (
            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: c.accentText }}>
              {product.brand}
            </motion.p>
          )}

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-2xl font-bold leading-snug" style={{ color: c.text }}>
            {product.title}
          </motion.h1>

          {/* Rating */}
          {(product.averageRating ?? 0) > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-2">
              <Chip icon={<StarIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
                label={(product.averageRating ?? 0).toFixed(1)} size="small"
                sx={{ background: c.success, color: "#fff", fontWeight: 700, fontSize: 12 }}
              />
              <span style={{ fontSize: "13px", color: c.textMuted }}>
                ({product.numRatings ?? 0} ratings)
              </span>
            </motion.div>
          )}

          <Divider sx={{ borderColor: c.border }} />

          {/* Price */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="space-y-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black" style={{ color: c.text }}>
                ₹{sellingPrice.toLocaleString("en-IN")}
              </span>
              {mrpPrice > sellingPrice && (
                <>
                  <span className="text-lg line-through" style={{ color: c.textSubtle }}>
                    ₹{mrpPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                    style={{ background: c.successBg, color: c.success }}>
                    {discountPct}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-xs" style={{ color: c.textSubtle }}>Inclusive of all taxes</p>
          </motion.div>

          {/* Stock */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {stock > 0 ? (
              <span className="font-semibold flex items-center gap-1.5" style={{ color: c.success }}>
                <span className="inline-block w-2 h-2 rounded-full"
                  style={{ background: c.success, boxShadow: `0 0 6px ${c.success}`, animation: "pulse 2s infinite" }} />
                In Stock ({stock} units)
              </span>
            ) : (
              <span className="font-semibold" style={{ color: c.danger }}>✗ Out of Stock</span>
            )}
            {totalSold > 0 && <span style={{ color: c.textMuted }}>📦 {totalSold} sold</span>}
            {(product.totalSellers ?? 0) > 1 && (
              <Chip label={`${product.totalSellers} sellers`} size="small" variant="outlined"
                sx={{ fontSize: 11, color: c.accentText, borderColor: c.accentBorder }} />
            )}
          </div>

          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

          <Divider sx={{ borderColor: c.border }} />

          {/* ══════════ SELLER CARD ══════════ */}
          <div className="rounded-2xl p-4 space-y-3 border" style={{ background: c.accentBg, borderColor: c.accentBorder }}>
            <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: c.accentText }}>
              <StorefrontOutlinedIcon fontSize="small" />
              Sold by
            </p>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-base" style={{ color: c.text }}>{sellerName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <StarIcon sx={{ fontSize: 13, color: c.star }} />
                  <span className="text-xs" style={{ color: c.textMuted }}>
                    {sellerRating > 0 ? `${sellerRating.toFixed(1)} seller rating` : "New Seller"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: c.accentText }}>
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </p>
                <p className="text-xs" style={{ color: c.textSubtle }}>🚚 {deliveryDays} day delivery</p>
              </div>
            </div>

            {/* Other sellers */}
            {listings.length > 1 && (
              <>
                <button
                  onClick={() => setShowAllSellers(!showAllSellers)}
                  className="w-full flex items-center justify-between text-sm font-semibold py-2 px-3 rounded-xl"
                  style={{ color: c.accentText, background: c.accentBg, border: `1px solid ${c.accentBorder}` }}
                >
                  <span>{showAllSellers ? "Hide" : "View"} other sellers ({listings.length - 1} more)</span>
                  {showAllSellers ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                </button>

                <Collapse in={showAllSellers}>
                  <div className="space-y-2 mt-2">
                    {listingsLoading ? (
                      <div className="flex justify-center py-4"><CircularProgress size={24} sx={{ color: c.accent }} /></div>
                    ) : (
                      listings.map((listing, idx) => {
                        const isSelected  = activeListing?._id === listing._id;
                        const lSellerName = listing.seller?.businessDetails?.businessName || listing.seller?.sellerName || "Store";
                        const lDiscount = listing.mrpPrice > 0 && listing.mrpPrice > listing.sellingPrice
                          ? Math.round(((listing.mrpPrice - listing.sellingPrice) / listing.mrpPrice) * 100) : 0;

                        return (
                          <motion.div key={listing._id} whileHover={{ scale: 1.01 }}
                            onClick={() => handleSelectSeller(listing)}
                            className="flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer"
                            style={{ borderColor: isSelected ? c.accent : c.border, background: isSelected ? c.accentBg : c.bgCard }}>
                            <div className="flex items-center gap-3">
                              <Radio checked={isSelected} onChange={() => handleSelectSeller(listing)} size="small"
                                sx={{ p: 0, color: c.accent, "&.Mui-checked": { color: c.accent } }} />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-semibold text-sm" style={{ color: c.text }}>{lSellerName}</span>
                                  {idx === 0 && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                      style={{ background: c.successBg, color: c.success }}>LOWEST</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <StarIcon sx={{ fontSize: 11, color: c.star }} />
                                  <span className="text-xs" style={{ color: c.textMuted }}>
                                    {listing.sellerRating > 0 ? listing.sellerRating.toFixed(1) : "New"}
                                    {" · "}{listing.deliveryDays}d delivery
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-sm" style={{ color: c.text }}>
                                ₹{listing.sellingPrice.toLocaleString("en-IN")}
                              </p>
                              {lDiscount > 0 && (
                                <p className="text-xs" style={{ color: c.success }}>{lDiscount}% off</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </Collapse>
              </>
            )}
          </div>

          {/* Delivery info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm" style={{ color: c.textMuted }}>
              <LocalShippingOutlinedIcon fontSize="small" sx={{ color: c.accentText }} />
              <span>Estimated delivery in <b style={{ color: c.text }}>{deliveryDays} days</b></span>
            </div>
            <div className="flex items-center gap-3 text-sm" style={{ color: c.textMuted }}>
              <VerifiedOutlinedIcon fontSize="small" sx={{ color: c.success }} />
              <span>Secure payments · Easy returns</span>
            </div>
          </div>

          {/* Size */}
          {product.sizes && product.sizes !== "FREE" && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: c.textMuted }}>Size</p>
              <Chip label={product.sizes} variant="outlined" sx={{ color: c.text, borderColor: c.borderHover }} />
            </div>
          )}

          <Divider sx={{ borderColor: c.border }} />

          {/* ══════════ CART STATUS BANNER ══════════ */}
          <AnimatePresence>
            {isInCart && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: c.successBg, border: `1px solid ${c.successBd}` }}>
                <ShoppingBagOutlinedIcon sx={{ color: c.success, fontSize: 20 }} />
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: c.success }}>Already in your bag!</p>
                  <p className="text-xs" style={{ color: c.textMuted }}>This item is in your cart. Go to cart to checkout.</p>
                </div>
                <button onClick={() => navigate("/cart")} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: c.success, color: "#fff" }}>View Cart</button>
              </motion.div>
            )}
          </AnimatePresence>
{/* ══════════ ACTION BUTTONS — Hidden for sellers ══════════ */}
{isSeller ? (
  /* ── Seller banner instead of buy buttons ── */
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
    style={{
      padding: "24px",
      borderRadius: "16px",
      background: isDark
        ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05))"
        : "linear-gradient(135deg, #f0fdf4, #ffffff)",
      border: `1.5px solid ${isDark ? "rgba(16,185,129,0.3)" : "#bbf7d0"}`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative blur orb */}
    <div style={{
      position: "absolute",
      top: -30, right: -30,
      width: 120, height: 120,
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)",
      filter: "blur(20px)",
    }} />

    <div style={{ position: "relative", textAlign: "center" }}>
      {/* Icon */}
      <div style={{
        display: "inline-flex",
        width: 60, height: 60,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #10b981, #059669)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
      }}>
        <StorefrontOutlinedIcon sx={{ fontSize: 32, color: "#fff" }} />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 16,
        fontWeight: 800,
        color: isDark ? "#10b981" : "#065f46",
        margin: "0 0 6px",
      }}>
        You're browsing as a seller
      </h3>

      {/* Subtitle */}
      <p style={{
        fontSize: 13,
        color: isDark ? "#94a3b8" : "#6b7280",
        margin: "0 0 16px",
        lineHeight: 1.5,
      }}>
        Seller accounts cannot purchase items. <br/>
        Switch to a customer account or visit your seller dashboard.
      </p>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/seller")}
          style={{
            padding: "10px 22px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: "0 6px 16px rgba(16,185,129,0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          🏪 Seller Dashboard
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
          }}
          style={{
            padding: "10px 22px",
            background: "transparent",
            color: isDark ? "#10b981" : "#059669",
            border: `1.5px solid ${isDark ? "#10b981" : "#059669"}`,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Switch Account
        </button>
      </div>
    </div>
  </motion.div>
) : (
  /* ── Normal buy buttons for customers ── */
  <div className="flex flex-col gap-3">

    <div className="grid grid-cols-2 gap-3">
      {/* Add to Bag */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
          disabled={addingToCart || stock === 0 || !activeListing}
          variant="contained"
          fullWidth
          startIcon={
            addingToCart
              ? <CircularProgress size={16} sx={{ color: "white" }} />
              : isInCart ? <RemoveShoppingCartIcon /> : <AddShoppingCartIcon />
          }
          sx={{
            py: "0.9rem", fontWeight: 800, fontSize: 14,
            borderRadius: "12px", textTransform: "none",
            background: isInCart
              ? "linear-gradient(135deg, #dc2626, #991b1b)"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: isInCart
              ? "0 8px 24px rgba(220,38,38,0.35)"
              : "0 8px 24px rgba(99,102,241,0.35)",
            "&:hover": {
              background: isInCart
                ? "linear-gradient(135deg, #b91c1c, #7f1d1d)"
                : "linear-gradient(135deg, #4f46e5, #7c3aed)",
            },
            "&:disabled": {
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)",
            },
          }}
        >
          {addingToCart
            ? isInCart ? "Removing..." : "Adding..."
            : isInCart ? "Remove" : stock === 0 ? "Out of Stock" : "Add to Bag"}
        </Button>
      </motion.div>

      {/* Buy Now */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleOpenBuyNow}
          disabled={stock === 0 || !activeListing}
          variant="contained"
          fullWidth
          startIcon={<BoltIcon />}
          sx={{
            py: "0.9rem", fontWeight: 800, fontSize: 14,
            borderRadius: "12px", textTransform: "none",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            boxShadow: "0 8px 24px rgba(245,158,11,0.4)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(135deg, #d97706, #dc2626)",
              boxShadow: "0 10px 28px rgba(245,158,11,0.55)",
            },
            "&:disabled": {
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)",
            },
          }}
        >
          Buy Now
        </Button>
      </motion.div>
    </div>

    <AnimatePresence>
      {isInCart && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <Button onClick={() => navigate("/cart")} variant="outlined" fullWidth
            sx={{
              py: "0.9rem", borderRadius: "12px", fontWeight: 700, textTransform: "none",
              color: c.success, borderColor: c.success,
              "&:hover": { background: c.successBg, borderColor: c.success },
            }}>
            🛒 Go to Cart & Checkout
          </Button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Wishlist */}
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Button onClick={handleToggleWishlist} disabled={wishLoading} variant="outlined" fullWidth
        startIcon={isInWishlist ? <FavoriteIcon sx={{ color: c.pink }} /> : <FavoriteBorderIcon />}
        sx={{
          py: "0.9rem", borderRadius: "12px", fontWeight: 700, textTransform: "none",
          borderColor: c.borderHover, color: c.text,
          ...(isInWishlist && {
            color: c.pink, borderColor: c.pink,
            background: isDark ? "rgba(236,72,153,0.05)" : "rgba(236,72,153,0.06)",
            "&:hover": { borderColor: c.pink, background: isDark ? "rgba(236,72,153,0.1)" : "rgba(236,72,153,0.1)" },
          }),
        }}>
        {wishLoading ? "Saving..." : isInWishlist ? "Wishlisted ❤️" : "Add to Wishlist"}
      </Button>
    </motion.div>
  </div>
)}
          {/* Description */}
          <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: c.accentText }}>Description</p>
            <p className="text-sm leading-relaxed" style={{ color: c.textSec }}>{product.description}</p>
          </div>
        </section>
      </div>

      {/* ══════════ REVIEWS ══════════ */}
      <section className="mt-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <motion.h2 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-xl font-black" style={{ color: c.text }}>
            ⭐ Reviews & Ratings
          </motion.h2>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/write-review/${productId}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, #6b46c1, #9333ea)",
              boxShadow: "0 4px 16px rgba(107,70,193,0.35)",
              border: "none", cursor: "pointer",
            }}>
            ✍️ Write a Review
          </motion.button>
        </div>
        
        <RatingCard totalReview={review.reviews?.length ?? 0} reviews={review.reviews ?? []} />

        {/* Customer photos */}
        {(() => {
          const allMedia = (review.reviews ?? [])
            .flatMap((r: any) => (r.productImages ?? []).map((url: string) => ({ url, reviewId: r._id })))
            .filter((m: any) => m.url);

          if (allMedia.length === 0) return null;

          return (
            <div className="mt-5 p-5 rounded-2xl border" style={{ background: c.bgCard, borderColor: c.border }}>
              <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: c.text }}>
                📸 Customer Photos
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: c.accentBg, color: c.accentText }}>{allMedia.length}</span>
              </p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {allMedia.slice(0, 20).map((m: any, i: number) => {
                  const isVideo = m.url.includes("/video/") || /\.(mp4|mov|webm)$/i.test(m.url);
                  return (
                    <motion.div key={`${m.reviewId}-${i}`} whileHover={{ scale: 1.06, y: -3 }}
                      className="relative flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                      style={{ width: "88px", height: "88px", border: `1.5px solid ${c.border}`, background: c.bgImage }}>
                      {isVideo ? (
                        <>
                          <video src={m.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div className="absolute inset-0 flex items-center justify-center text-2xl text-white"
                            style={{ background: "rgba(0,0,0,0.4)" }}>▶</div>
                        </>
                      ) : (
                        <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Review list */}
        <div className="mt-5 flex flex-col gap-3">
          {(review.reviews?.length ?? 0) === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-10 rounded-2xl border border-dashed"
              style={{ background: c.bgCard, borderColor: c.border }}>
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm" style={{ color: c.textMuted }}>No reviews yet — be the first to review!</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {review.reviews.slice(0, 3).map((item: any, i: number) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.07, duration: 0.3 }}>
                  <ProductReviewCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {(review.reviews?.length ?? 0) > 3 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/reviews/${productId}`)}
              className="py-3 rounded-xl font-bold text-sm"
              style={{ border: `1.5px solid ${c.accent}`, background: "transparent", color: c.accentText, cursor: "pointer" }}>
              View All {review.reviews.length} Reviews →
            </motion.button>
          )}
        </div>
      </section>

      {/* ══════════ Similar Products ══════════ */}
      <section className="mt-20">
        <motion.h2 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-lg font-bold mb-5" style={{ color: c.text }}>
          Similar Products
        </motion.h2>
        <SmilarProduct />
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ✅ NEW — BUY NOW MODAL                                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {buyNowOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBuyNowOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              zIndex: 9998,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: c.bg,
                borderRadius: 20,
                maxWidth: 480,
                width: "100%",
                overflow: "hidden",
                border: `1px solid ${c.border}`,
                boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header */}
              <div style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                  <BoltIcon sx={{ fontSize: 28 }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Quick Buy</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.9 }}>
                      Skip the cart — buy in one click
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                {/* Product card */}
                <div style={{
                  display: "flex", gap: 14, padding: 14,
                  background: c.bgCard, borderRadius: 12,
                  border: `1px solid ${c.border}`, marginBottom: 20,
                }}>
               <CloudImage
  src={product?.images?.[0] || ""}
  alt={product?.title || "product"}
  width={64}
  height={64}
  quality="eco"
  objectFit="contain"
  lazy={true}
  className="w-16 h-16 rounded-lg"
/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700, color: c.text, margin: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{product?.title}</p>
                    <p style={{ fontSize: 11, color: c.textMuted, margin: "2px 0" }}>
                      {product?.brand || "—"} • {product?.color}
                    </p>
                    <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginTop: 4 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: c.success }}>
                        ₹{sellingPrice}
                      </span>
                      <span style={{ fontSize: 11, color: c.textMuted, textDecoration: "line-through" }}>
                        ₹{mrpPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: c.textSec, margin: "0 0 10px",
                    textTransform: "uppercase", letterSpacing: 1.2,
                  }}>Quantity</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button
                      onClick={() => setBuyNowQty(Math.max(1, buyNowQty - 1))}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        border: `1.5px solid ${c.border}`,
                        background: c.bgCard, color: c.text,
                        cursor: "pointer", fontSize: 18, fontWeight: 700,
                      }}
                    >−</button>

                    <div style={{
                      flex: 1, textAlign: "center",
                      fontSize: 22, fontWeight: 800, color: c.text,
                      padding: "8px 0", background: c.bgCard,
                      borderRadius: 10, border: `1.5px solid ${c.border}`,
                    }}>{buyNowQty}</div>

                    <button
                      onClick={() => setBuyNowQty(Math.min(stock, buyNowQty + 1))}
                      style={{
                        width: 40, height: 40, borderRadius: 10,
                        border: `1.5px solid ${c.border}`,
                        background: c.bgCard, color: c.text,
                        cursor: "pointer", fontSize: 18, fontWeight: 700,
                      }}
                    >+</button>
                  </div>
                  <p style={{ fontSize: 11, color: c.textMuted, margin: "8px 0 0", textAlign: "center" }}>
                    {stock} units available
                  </p>
                </div>

                {/* Total */}
                <div style={{
                  padding: 16, background: c.successBg,
                  border: `1px solid ${c.successBd}`, borderRadius: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: 13, color: c.textSec, fontWeight: 600 }}>Total amount</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: c.success }}>
                    ₹{(sellingPrice * buyNowQty).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setBuyNowOpen(false)}
                    style={{
                      flex: 1, padding: "13px",
                      border: `1.5px solid ${c.border}`,
                      background: "transparent", color: c.textSec,
                      fontSize: 14, fontWeight: 600, borderRadius: 10,
                      cursor: "pointer",
                    }}
                  >Cancel</button>
                  <button
                    onClick={handleProceedToCheckout}
                    style={{
                      flex: 2, padding: "13px", border: "none",
                      background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                      color: "#fff", fontSize: 14, fontWeight: 800,
                      borderRadius: 10, cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(245,158,11,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <BoltIcon sx={{ fontSize: 18 }} />
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetails;