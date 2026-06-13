// Preset sizes for consistent usage across the app

export const getProductImageUrl = (url: string, size: "thumb" | "card" | "detail" = "card") => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("/upload/w_")) return url;

  const presets = {
    thumb:  "w_150,h_150,c_fill,q_auto:eco,f_auto",
    card:   "w_400,h_400,c_fill,q_auto:good,f_auto",
    detail: "w_800,c_limit,q_auto:best,f_auto",
  };

  return url.replace("/upload/", `/upload/${presets[size]}/`);
};

export const getBrandLogoUrl = (url: string) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("/upload/w_")) return url;
  return url.replace("/upload/", "/upload/w_200,h_100,c_fit,q_auto:good,f_auto/");
};

export const getBannerUrl = (url: string) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("/upload/w_")) return url;
  return url.replace("/upload/", "/upload/w_1600,h_500,c_fill,q_auto:good,f_auto/");
};

/**
 * Universal Cloudinary URL optimizer
 * Works for any image - safely returns original if not Cloudinary
 */
export const optimizeImage = (
  url: string | undefined,
  width: number = 400,
  height?: number,
  quality: "eco" | "good" | "best" = "good"
): string => {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url;
  if (url.includes("/upload/q_") || url.includes("/upload/w_")) return url;

  const qualityMap = { eco: "auto:eco", good: "auto:good", best: "auto:best" };
  const transforms = [
    `q_${qualityMap[quality]}`,
    "f_auto",
    `w_${width}`,
    height ? `h_${height}` : null,
    height ? "c_fill" : "c_limit",
  ].filter(Boolean).join(",");

  return url.replace("/upload/", `/upload/${transforms}/`);
};