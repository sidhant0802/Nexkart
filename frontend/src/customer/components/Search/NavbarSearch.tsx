import * as React from "react";
import { Search, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchSuggestions,
  addRecentSearch,
  clearSuggestions,
} from "../../../Redux Toolkit/Customer/SearchSlice";

interface Props {
  isDark:   boolean;
  navigate: any;
}

const NavbarSearch: React.FC<Props> = ({ isDark, navigate }) => {
  const dispatch = useAppDispatch();
  const { suggestions, suggestLoading } = useAppSelector((s: any) => s.search);

  const [query, setQuery] = React.useState("");
  const [open, setOpen]   = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        dispatch(fetchSuggestions(query));
      } else {
        dispatch(clearSuggestions());
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = (customQuery ?? query).trim();
    if (!q) return;
    dispatch(addRecentSearch(q));
    setOpen(false);
    navigate(`/search-products?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={handleSubmit}>
        <div
          className="flex w-full rounded-xl overflow-hidden transition-all duration-200"
          style={{ border: "2px solid #6C63FF" }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search for products, brands and more..."
            className="flex-1 px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              backgroundColor: isDark ? "#1a1a2e" : "#f9fafb",
              color:           isDark ? "#fff"    : "#111827",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setOpen(false); }}
              className="px-2 flex items-center justify-center"
              style={{
                backgroundColor: isDark ? "#1a1a2e" : "#f9fafb",
                color:           "#9ca3af",
              }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #6C63FF, #a855f7)",
              minWidth:   "52px",
            }}
          >
            <Search size={18} />
          </button>
        </div>
      </form>

      {open && query.length >= 2 && (
        <div
          style={{
            position:     "absolute",
            top:          "calc(100% + 6px)",
            left:         0,
            right:        0,
            background:   isDark ? "#1a1a2e" : "#fff",
            borderRadius: "12px",
            border:       isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb",
            boxShadow:    isDark
              ? "0 12px 40px rgba(0,0,0,0.5)"
              : "0 12px 40px rgba(0,0,0,0.15)",
            zIndex:       1000,
            maxHeight:    "420px",
            overflowY:    "auto",
          }}
        >
          {suggestLoading && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <div style={{
                width:          "20px",
                height:         "20px",
                borderRadius:   "50%",
                border:         "2px solid #6C63FF",
                borderTopColor: "transparent",
                animation:      "navSpin 0.8s linear infinite",
                margin:         "0 auto",
              }} />
              <style>{`@keyframes navSpin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {!suggestLoading && suggestions.length > 0 && (
            <>
              <p style={{
                fontSize:      "10px",
                fontWeight:    800,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color:         isDark ? "rgba(255,255,255,0.4)" : "#9ca3af",
                padding:       "12px 16px 6px",
                margin:        0,
              }}>
                Suggestions
              </p>

              {suggestions.map((s: any) => (
                <div
                  key={s._id}
                  onClick={() => {
  setOpen(false);
  const catId = typeof s.category === "object"
    ? s.category?.categoryId || s.category?._id || "all"
    : s.category || "all";
  navigate(`/product-details/${catId}/${encodeURIComponent(s.title || "product")}/${s._id}`);
}}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        "12px",
                    padding:    "10px 16px",
                    cursor:     "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{
                    width:          "40px",
                    height:         "40px",
                    borderRadius:   "8px",
                    background:     isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                    flexShrink:     0,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    overflow:       "hidden",
                  }}>
                    {s.images && s.images[0] ? (
                      <img loading="lazy" decoding="async"
                        src={s.images[0]}
                        alt={s.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: "16px" }}>📦</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize:     "13px",
                      fontWeight:   600,
                      color:        isDark ? "#fff" : "#111827",
                      margin:       "0 0 2px",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}>{s.title}</p>
                    {s.brand && (
                      <p style={{
                        fontSize:      "11px",
                        color:         "#6C63FF",
                        fontWeight:    600,
                        textTransform: "capitalize",
                        margin:        0,
                      }}>{s.brand}</p>
                    )}
                  </div>

                  {s.minPrice > 0 && (
                    <span style={{
                      fontSize:   "13px",
                      fontWeight: 800,
                      color:      "#10b981",
                      flexShrink: 0,
                    }}>
                      ₹{s.minPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              ))}

              <div
                onClick={() => handleSubmit()}
                style={{
                  padding:        "12px 16px",
                  cursor:         "pointer",
                  borderTop:      isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f1f5f9",
                  background:     isDark ? "rgba(108,99,255,0.1)" : "#eef2ff",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            "8px",
                  color:          "#6C63FF",
                  fontSize:       "13px",
                  fontWeight:     700,
                }}
              >
                <Search size={14} />
                Search for "<strong>{query}</strong>"
              </div>
            </>
          )}

          {!suggestLoading && suggestions.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p style={{
                fontSize: "13px",
                color:    isDark ? "rgba(255,255,255,0.5)" : "#6b7280",
                margin:   "0 0 12px",
              }}>
                No suggestions found
              </p>
              <button
                onClick={() => handleSubmit()}
                style={{
                  padding:      "8px 16px",
                  borderRadius: "8px",
                  border:       "none",
                  background:   "linear-gradient(135deg,#6C63FF,#a855f7)",
                  color:        "#fff",
                  fontSize:     "12px",
                  fontWeight:   700,
                  cursor:       "pointer",
                }}
              >
                Search anyway →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
