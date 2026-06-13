import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchSuggestions,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
  clearSuggestions,
} from "../../../Redux Toolkit/Customer/SearchSlice";

const SmartSearchBar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { suggestions, suggestLoading, recentSearches } =
    useAppSelector((s) => s.search);

  const [query, setQuery]         = React.useState("");
  const [open, setOpen]           = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropRef  = React.useRef<HTMLDivElement>(null);

  // Debounce suggestions
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

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard: ⌘K / Ctrl+K / Esc
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSubmit = (searchQuery?: string) => {
    const q = (searchQuery ?? query).trim();
    if (!q) return;
    dispatch(addRecentSearch(q));
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const allItems = [
    ...(query.length >= 2 ? suggestions : []),
    ...(query.length < 2 ? recentSearches.map((r: string) => ({ _id: r, title: r, isRecent: true })) : []),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i: number) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i: number) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && allItems[activeIdx]) {
        const item = allItems[activeIdx] as any;
        if (item.isRecent) {
          setQuery(item.title);
          handleSubmit(item.title);
        } else {
          handleSubmit(item.title);
        }
      } else {
        handleSubmit();
      }
    }
  };

  const showDropdown = open && (suggestions.length > 0 || recentSearches.length > 0 || query.length > 0);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Input wrapper */}
      <div style={{
        position:     "relative",
        background:   "#fff",
        borderRadius: "12px",
        border:       "2px solid transparent",
        boxShadow:    open
          ? "0 0 0 3px rgba(99,102,241,0.15), 0 4px 16px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.08)",
        transition:   "all 0.2s",
      }}>
        {/* Search icon */}
        <div style={{
          position:  "absolute",
          left:      "14px",
          top:       "50%",
          transform: "translateY(-50%)",
          fontSize:  "16px",
          color:     "#9ca3af",
        }}>🔍</div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, brands and more..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            width:        "100%",
            padding:      "12px 100px 12px 42px",
            border:       "none",
            outline:      "none",
            background:   "transparent",
            fontSize:     "14px",
            color:        "#111827",
            borderRadius: "12px",
            fontFamily:   "inherit",
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            style={{
              position:     "absolute",
              right:        "80px",
              top:          "50%",
              transform:    "translateY(-50%)",
              border:       "none",
              background:   "transparent",
              cursor:       "pointer",
              fontSize:     "14px",
              color:        "#9ca3af",
              padding:      "4px 8px",
              borderRadius: "6px",
            }}
          >✕</button>
        )}

        {/* ⌘K hint */}
        <div style={{
          position:   "absolute",
          right:      "12px",
          top:        "50%",
          transform:  "translateY(-50%)",
          display:    "flex",
          gap:        "4px",
          alignItems: "center",
        }}>
          <kbd style={{
            padding:      "2px 6px",
            borderRadius: "4px",
            background:   "#f3f4f6",
            color:        "#6b7280",
            fontSize:     "10px",
            fontWeight:   600,
            fontFamily:   "monospace",
            border:       "1px solid #e5e7eb",
          }}>⌘</kbd>
          <kbd style={{
            padding:      "2px 6px",
            borderRadius: "4px",
            background:   "#f3f4f6",
            color:        "#6b7280",
            fontSize:     "10px",
            fontWeight:   600,
            fontFamily:   "monospace",
            border:       "1px solid #e5e7eb",
          }}>K</kbd>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropRef}
          style={{
            position:      "absolute",
            top:           "calc(100% + 6px)",
            left:          0,
            right:         0,
            background:    "#fff",
            borderRadius:  "12px",
            boxShadow:     "0 12px 40px rgba(0,0,0,0.15)",
            border:        "1px solid #f1f5f9",
            zIndex:        1000,
            maxHeight:     "480px",
            overflow:      "hidden",
            display:       "flex",
            flexDirection: "column",
            animation:     "searchDrop 0.18s ease",
          }}
        >
          <style>{`
            @keyframes searchDrop {
              from { opacity:0; transform: translateY(-8px); }
              to   { opacity:1; transform: translateY(0); }
            }
          `}</style>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* Recent searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  padding:        "12px 16px 6px",
                }}>
                  <span style={{
                    fontSize:      "10px",
                    fontWeight:    800,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color:         "#9ca3af",
                  }}>Recent Searches</span>
                  <button
                    onClick={() => dispatch(clearRecentSearches())}
                    style={{
                      border:     "none",
                      background: "transparent",
                      color:      "#ef4444",
                      fontSize:   "11px",
                      fontWeight: 700,
                      cursor:     "pointer",
                    }}
                  >Clear all</button>
                </div>

                {recentSearches.map((r: string, i: number) => (
                  <div
                    key={r}
                    onClick={() => { setQuery(r); handleSubmit(r); }}
                    onMouseEnter={() => setActiveIdx(i)}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "10px 16px",
                      cursor:         "pointer",
                      background:     activeIdx === i ? "#f8fafc" : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "14px", color: "#9ca3af" }}>🕐</span>
                      <span style={{ fontSize: "13px", color: "#374151" }}>{r}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(removeRecentSearch(r));
                      }}
                      style={{
                        border:     "none",
                        background: "transparent",
                        cursor:     "pointer",
                        color:      "#d1d5db",
                        fontSize:   "12px",
                        padding:    "4px 8px",
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Loading */}
            {query.length >= 2 && suggestLoading && (
              <div style={{ padding: "20px", textAlign: "center" }}>
                <div style={{
                  width:          "20px",
                  height:         "20px",
                  borderRadius:   "50%",
                  border:         "2px solid #6366f1",
                  borderTopColor: "transparent",
                  animation:      "spin 0.8s linear infinite",
                  margin:         "0 auto",
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {/* Suggestions */}
            {query.length >= 2 && !suggestLoading && suggestions.length > 0 && (
              <div>
                <p style={{
                  fontSize:      "10px",
                  fontWeight:    800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color:         "#9ca3af",
                  padding:       "12px 16px 6px",
                  margin:        0,
                }}>Suggestions</p>

                {suggestions.map((s: any, i: number) => (
                  <div
                    key={s._id}
                    onClick={() => navigate(`/product/${s._id}`)}
                    onMouseEnter={() => setActiveIdx(i)}
                    style={{
                      display:    "flex",
                      alignItems: "center",
                      gap:        "12px",
                      padding:    "10px 16px",
                      cursor:     "pointer",
                      background: activeIdx === i ? "#f8fafc" : "transparent",
                    }}
                  >
                    <div style={{
                      width:          "40px",
                      height:         "40px",
                      borderRadius:   "8px",
                      background:     "#f1f5f9",
                      flexShrink:     0,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      overflow:       "hidden",
                    }}>
                      {s.images?.[0] ? (
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
                        color:        "#111827",
                        margin:       "0 0 2px",
                        overflow:     "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace:   "nowrap",
                      }}>{s.title}</p>
                      {s.brand && (
                        <p style={{
                          fontSize:      "11px",
                          color:         "#6366f1",
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

                {/* Search for all */}
                <div
                  onClick={() => handleSubmit()}
                  style={{
                    padding:        "12px 16px",
                    cursor:         "pointer",
                    borderTop:      "1px solid #f1f5f9",
                    background:     "#f8fafc",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            "8px",
                    color:          "#6366f1",
                    fontSize:       "13px",
                    fontWeight:     700,
                  }}
                >
                  <span>🔍</span>
                  Search for "<strong>{query}</strong>"
                </div>
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !suggestLoading && suggestions.length === 0 && (
              <div style={{ padding: "30px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "28px", margin: "0 0 8px" }}>🔍</p>
                <p style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                  No suggestions found
                </p>
                <button
                  onClick={() => handleSubmit()}
                  style={{
                    marginTop:    "12px",
                    padding:      "8px 16px",
                    borderRadius: "8px",
                    border:       "none",
                    background:   "linear-gradient(135deg,#6366f1,#a855f7)",
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

            {/* Empty state */}
            {query.length < 2 && recentSearches.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "32px", margin: "0 0 8px" }}>👋</p>
                <p style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                  Start typing to search
                </p>
                <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                  Try "phone", "shoes", "watch"...
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding:        "8px 16px",
            background:     "#f8fafc",
            borderTop:      "1px solid #f1f5f9",
            display:        "flex",
            justifyContent: "space-between",
            alignItems:     "center",
            fontSize:       "10px",
            color:          "#9ca3af",
          }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>esc Close</span>
            </div>
            <span style={{ fontWeight: 700, color: "#6366f1" }}>
              ⚡ Powered by Atlas Search
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchBar;