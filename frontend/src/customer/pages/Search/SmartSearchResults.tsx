import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { searchProducts } from "../../../Redux Toolkit/Customer/SearchSlice";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style:                 "currency",
    currency:              "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function SmartSearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { results, total, processingTimeMs, loading } =
    useAppSelector((s) => s.search);

  const q        = searchParams.get("q")        || "";
  const brand    = searchParams.get("brand")    || "";
  const sort     = searchParams.get("sort")     || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  React.useEffect(() => {
    dispatch(searchProducts({
      q,
      brand:    brand || undefined,
      sort:     sort  || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit:    24,
    }));
  }, [q, brand, sort, minPrice, maxPrice]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else        next.delete(key);
    setSearchParams(next);
  };

  const brands = Array.from(new Set(
    results.map((r: any) => r.brand).filter(Boolean)
  )).slice(0, 8);

  const sortOptions = [
    { key: "",           label: "Relevance" },
    { key: "price-asc",  label: "Price: Low to High" },
    { key: "price-desc", label: "Price: High to Low" },
    { key: "rating",     label: "Highest Rated" },
    { key: "newest",     label: "Newest First" },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{
          fontSize:   "24px",
          fontWeight: 900,
          color:      "#111827",
          margin:     "0 0 6px",
        }}>
          Search results for "<span style={{ color: "#6366f1" }}>{q}</span>"
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          {loading ? "Searching..." : (
            <>
              <strong>{total.toLocaleString("en-IN")}</strong> results found
              <span style={{ color: "#10b981", marginLeft: "8px" }}>
                ⚡ in {processingTimeMs}ms
              </span>
            </>
          )}
        </p>
      </div>

      {/* Filters bar */}
      <div style={{
        display:      "flex",
        gap:          "8px",
        flexWrap:     "wrap",
        padding:      "14px",
        background:   "#fff",
        borderRadius: "12px",
        border:       "1px solid #f1f5f9",
        marginBottom: "16px",
        alignItems:   "center",
      }}>
        {brands.length > 0 && (
          <>
            <span style={{
              fontSize:      "11px",
              fontWeight:    700,
              color:         "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
              Brand:
            </span>
            {brands.map((b: any) => (
              <button
                key={b}
                onClick={() => updateParam("brand", brand === b ? "" : b)}
                style={{
                  padding:       "5px 12px",
                  borderRadius:  "999px",
                  border:        "none",
                  cursor:        "pointer",
                  fontSize:      "12px",
                  fontWeight:    700,
                  background:    brand === b
                    ? "linear-gradient(135deg,#6366f1,#a855f7)"
                    : "#f1f5f9",
                  color:         brand === b ? "#fff" : "#6b7280",
                  textTransform: "capitalize",
                  transition:    "all .15s",
                }}
              >
                {b}
              </button>
            ))}
          </>
        )}

        <div style={{ flex: 1 }} />

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          style={{
            padding:      "6px 12px",
            borderRadius: "8px",
            border:       "1px solid #e5e7eb",
            background:   "#fff",
            fontSize:     "12px",
            fontWeight:   600,
            color:        "#374151",
            cursor:       "pointer",
            outline:      "none",
          }}
        >
          {sortOptions.map(o => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ padding: "80px", textAlign: "center" }}>
          <div style={{
            width:        "44px",
            height:       "44px",
            borderRadius: "50%",
            border:       "3px solid #6366f1",
            borderTopColor: "transparent",
            animation:    "spin 0.8s linear infinite",
            margin:       "0 auto 16px",
          }} />
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Searching...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : results.length === 0 ? (
        <div style={{
          padding:      "80px 20px",
          textAlign:    "center",
          background:   "#fff",
          borderRadius: "16px",
          border:       "1px solid #f1f5f9",
        }}>
          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>🔍</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
            No results for "{q}"
          </p>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Try different keywords or remove filters
          </p>
        </div>
      ) : (
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap:                 "16px",
        }}>
          {results.map((p: any) => (
            <div
              key={p._id}
              onClick={() => navigate(`/product/${p._id}`)}
              style={{
                background:   "#fff",
                borderRadius: "12px",
                border:       "1px solid #f1f5f9",
                overflow:     "hidden",
                cursor:       "pointer",
                transition:   "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                aspectRatio:    "1",
                background:     "#f8fafc",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                overflow:       "hidden",
              }}>
                {p.images?.[0] ? (
                  <img loading="lazy" decoding="async"
                    src={p.images[0]}
                    alt={p.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "32px" }}>📦</span>
                )}
              </div>

              <div style={{ padding: "12px 14px" }}>
                {p.brand && (
                  <p style={{
                    fontSize:      "10px",
                    fontWeight:    700,
                    color:         "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin:        "0 0 4px",
                  }}>
                    {p.brand}
                  </p>
                )}
                <p style={{
                  fontSize:    "13px",
                  fontWeight:  600,
                  color:       "#111827",
                  margin:      "0 0 8px",
                  height:      "32px",
                  overflow:    "hidden",
                  display:     "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                  {p.title}
                </p>

                <div style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                }}>
                  <span style={{
                    fontSize:   "16px",
                    fontWeight: 900,
                    color:      "#10b981",
                  }}>
                    {fmt(p.minPrice ?? 0)}
                  </span>

                  {p.averageRating > 0 && (
                    <span style={{
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "2px",
                      padding:      "2px 6px",
                      borderRadius: "6px",
                      background:   "#fef3c7",
                      fontSize:     "11px",
                      fontWeight:   700,
                      color:        "#f59e0b",
                    }}>
                      ⭐ {p.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}