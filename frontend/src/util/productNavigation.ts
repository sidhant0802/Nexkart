/**
 * Safely build product detail URL
 * Never produces /product-details/undefined/... paths
 */
export const getProductUrl = (
  product: any,
  fallbackCategoryId?: string
): string => {
  // ✅ Extract categoryId from various shapes
  const categoryId =
    product?.category?.categoryId ||                          // populated object
    (typeof product?.category === "string"
      ? undefined
      : null) ||                                              // raw ObjectId - skip
    fallbackCategoryId ||                                     // passed in
    "all";                                                    // final fallback

  const title = encodeURIComponent(
    (product?.title || "product").replace(/\//g, "-")         // remove slashes from title
  );
  const id = product?._id || product?.id || "";

  return `/product-details/${categoryId}/${title}/${id}`;
};

/**
 * Navigate to product detail page safely
 */
export const navigateToProduct = (
  navigate: (path: string) => void,
  product: any,
  fallbackCategoryId?: string
): void => {
  const url = getProductUrl(product, fallbackCategoryId);
  navigate(url);
};