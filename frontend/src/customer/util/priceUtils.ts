/**
 * Get selling price from product (works with both old and new schema)
 */
export const getSellingPrice = (product: any): number => {
  return product?.minPrice ?? product?.sellingPrice ?? 0;
};

/**
 * Get MRP from product (works with both old and new schema)  
 */
export const getMrpPrice = (product: any): number => {
  return product?.minMrpPrice ?? product?.mrpPrice ?? 0;
};

/**
 * Calculate discount percentage — NEVER returns NaN
 */
export const getDiscount = (product: any): number => {
  const mrp  = getMrpPrice(product);
  const sell = getSellingPrice(product);
  if (mrp <= 0 || sell <= 0 || sell >= mrp) return 0;
  return Math.round(((mrp - sell) / mrp) * 100);
};

/**
 * Format price in Indian currency
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style:                 "currency",
    currency:              "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Get seller name from product
 */
export const getSellerName = (product: any): string => {
  return (
    product?.defaultListing?.seller?.businessDetails?.businessName ||
    product?.defaultListing?.seller?.sellerName ||
    product?.seller?.businessDetails?.businessName ||
    product?.seller?.sellerName ||
    product?.brand ||
    "Nexkart"
  );
};