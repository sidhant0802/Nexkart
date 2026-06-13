import React, { useState, useRef, useEffect } from "react";

interface CloudImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  quality?: "auto" | "eco" | "good" | "best" | "low" | number;
  lazy?: boolean;
  fallback?: string;
  onClick?: () => void;
  priority?: boolean; // ✅ NEW — for above-the-fold images
}

function optimizeUrl(
  src: string,
  width?: number,
  height?: number,
  quality: string | number = "auto"
): string {
  if (!src) return "";
  if (!src.includes("cloudinary.com")) return src;
  if (src.includes("/upload/q_") || src.includes("/upload/w_")) return src;

  const qualityMap: Record<string, string> = {
    auto: "auto",
    eco: "auto:eco",
    low: "auto:low",
    good: "auto:good",
    best: "auto:best",
  };

  const finalQuality =
    typeof quality === "number" ? String(quality) : qualityMap[quality] || "auto";

  const transforms: string[] = [`q_${finalQuality}`, "f_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width && height) transforms.push("c_fill");

  return src.replace("/upload/", `/upload/${transforms.join(",")}/`);
}

const CloudImage: React.FC<CloudImageProps> = ({
  src = "",
  alt,
  width,
  height,
  className = "",
  objectFit = "cover",
  quality = "auto",
  lazy = true,
  fallback = "",
  onClick,
  priority = false,
}) => {
  const optimizedSrc = optimizeUrl(src, width, height, quality);

  // ✅ Priority/non-lazy → load immediately (no IntersectionObserver)
  const shouldLoadNow = !lazy || priority;

  const [imgSrc, setImgSrc] = useState<string>(shouldLoadNow ? optimizedSrc : "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // ── Lazy load with IntersectionObserver ──
  useEffect(() => {
    if (shouldLoadNow) {
      setImgSrc(optimizedSrc);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImgSrc(optimizedSrc);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" } // ✅ Increased from 300px - start loading earlier!
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [optimizedSrc, shouldLoadNow]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const finalSrc = hasError && fallback ? fallback : imgSrc || fallback;

  return (
    <img
      ref={imgRef}
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      onClick={onClick}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        setHasError(true);
        setIsLoaded(true);
      }}
      className={`
        ${shouldLoadNow ? "" : "transition-opacity duration-300"}
        ${isLoaded || shouldLoadNow ? "opacity-100" : "opacity-0"}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{ objectFit }}
      loading={shouldLoadNow ? "eager" : "lazy"}
      decoding="async"
      // ✅ fetchpriority hint for browsers
   {...(priority && { fetchPriority: "high" as any })}
    />
  );
};

export default CloudImage;