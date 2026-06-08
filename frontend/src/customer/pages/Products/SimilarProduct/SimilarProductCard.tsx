import { useNavigate } from 'react-router-dom';

const SimilarProductCard = ({ product }: any) => {
  const navigate = useNavigate();

  // ✅ Safe price helpers - never NaN
  const sellPrice = product?.minPrice    ?? product?.sellingPrice   ?? 0;
  const mrpPrice  = product?.minMrpPrice ?? product?.mrpPrice       ?? 0;
  const disc      = mrpPrice > 0 && mrpPrice > sellPrice
    ? Math.round(((mrpPrice - sellPrice) / mrpPrice) * 100)
    : 0;

  const sellerName =
    product?.defaultListing?.seller?.businessDetails?.businessName ||
    product?.defaultListing?.seller?.sellerName ||
    product?.seller?.businessDetails?.businessName ||
    product?.brand ||
    "Nexkart";

  return (
    <div
      onClick={() =>
        navigate(
  `/product-details/${product.category?.categoryId || "all"}/${encodeURIComponent(product.title || "")}/${product._id ?? product.id}`
)
      }
      className="group cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-[300px] overflow-hidden rounded-xl">
        <img
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={product.images?.[0] || "https://placehold.co/300x300/f3f4f6/9ca3af?text=No+Image"}
          alt={product.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/300x300";
          }}
        />

        {/* Discount badge */}
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
            -{disc}%
          </span>
        )}

        {/* Multi-seller badge */}
        {(product.totalSellers ?? 0) > 1 && (
          <span className="absolute bottom-2 left-2 bg-indigo-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {product.totalSellers} sellers
          </span>
        )}
      </div>

      {/* Details */}
      <div className="details pt-3 space-y-1 group-hover-effect rounded-md">
        <div className="name space-y-0.5">
          <h1 className="font-semibold text-lg">{sellerName}</h1>
          <p className="text-sm text-gray-600 line-clamp-2">{product.title}</p>
        </div>

        {/* ✅ Price - never NaN */}
        <div className="price flex items-center gap-3">
          <span className="font-semibold text-gray-800">
            ₹{sellPrice.toLocaleString("en-IN")}
          </span>
          {mrpPrice > sellPrice && (
            <span className="text-sm line-through text-gray-400">
              ₹{mrpPrice.toLocaleString("en-IN")}
            </span>
          )}
          {disc > 0 && (
            <span className="text-[#00927c] font-semibold text-sm">
              {disc}% off
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarProductCard;