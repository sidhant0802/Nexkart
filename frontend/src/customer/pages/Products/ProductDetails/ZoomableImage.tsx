import React, {
  useState, useRef, useCallback, useEffect,
} from "react";

interface Props {
  src: string;
  alt: string;
}

const ZoomableImage: React.FC<Props> = ({ src, alt }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomed,    setZoomed]    = useState(false);
  const [pos,       setPos]       = useState({ x: 50, y: 50 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError,  setImgError]  = useState(false);

  useEffect(() => {
    setZoomed(false);
    setPos({ x: 50, y: 50 });
    setImgLoaded(false);
    setImgError(false);
  }, [src]);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const toPercent = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 50, y: 50 };
    return {
      x: clamp(((clientX - rect.left) / rect.width)  * 100, 0, 100),
      y: clamp(((clientY - rect.top)  / rect.height) * 100, 0, 100),
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!zoomed) return;
    setPos(toPercent(e.clientX, e.clientY));
  }, [zoomed, toPercent]);

  const handleClick = () => {
    setZoomed((z) => {
      if (z) setPos({ x: 50, y: 50 });
      return !z;
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        position:   "relative",
        width:      "100%",
        height:     "100%",         // ✅ Fill parent
        overflow:   "hidden",
        cursor:     zoomed ? "zoom-out" : "zoom-in",
        userSelect: "none",
        background: "#1e1e2e",
      }}
    >
      {/* Loading skeleton */}
      {!imgLoaded && !imgError && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%)",
          backgroundSize: "200% 100%",
          animation: "zi-shimmer 1.5s infinite",
          zIndex: 2,
        }} />
      )}

      <style>{`
        @keyframes zi-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .zi-hint { opacity: 1; transition: opacity 0.3s; }
        .zi-container:hover .zi-hint { opacity: 0; }
      `}</style>

      <img
        src={src}
        alt={alt}
        onLoad={() => setImgLoaded(true)}
        onError={() => { setImgError(true); setImgLoaded(true); }}
        draggable={false}
        style={{
          display:         "block",
          width:           "100%",
          height:          "100%",
          objectFit:       "contain",
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transform:       zoomed ? "scale(2.5)" : "scale(1)",
          transition:      "transform 0.35s cubic-bezier(.4,0,.2,1)",
        }}
      />

      {/* Zoom hint */}
      {!zoomed && imgLoaded && (
        <div
          className="zi-hint"
          style={{
            position: "absolute",
            bottom:   "12px",
            right:    "12px",
            background: "rgba(0,0,0,0.7)",
            color:    "#fff",
            fontSize: "11px",
            fontWeight: 600,
            padding:  "5px 12px",
            borderRadius: "20px",
            display:  "flex",
            alignItems: "center",
            gap:      "5px",
            backdropFilter: "blur(4px)",
            pointerEvents: "none",
          }}
        >
          🔍 Click to zoom
        </div>
      )}

      {zoomed && (
        <div style={{
          position: "absolute",
          top:      "12px",
          right:    "12px",
          background: "rgba(99,102,241,0.85)",
          color:    "#fff",
          fontSize: "11px",
          fontWeight: 700,
          padding:  "4px 10px",
          borderRadius: "20px",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
        }}>
          🔎 Zoomed — click to reset
        </div>
      )}
    </div>
  );
};

export default ZoomableImage;