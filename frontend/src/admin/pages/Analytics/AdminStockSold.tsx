import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchStockSold,
} from "../../../Redux Toolkit/Admin/adminAnalyticsSlice";
import { useAdminTheme } from "../../context/AdminThemeContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-IN").format(n);

export default function AdminStockSold() {
  const dispatch   = useAppDispatch();
  const { isDark } = useAdminTheme();
  const {
    stockSold, stockTotal, stockTotalUnits,
    stockRevenue, stockLoading,
  } = useAppSelector((s) => s.adminAnalytics);

  const [search, setSearch]   = React.useState("");
  const [page,   setPage]     = React.useState(1);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const limit = 20;

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    dispatch(fetchStockSold({ search: debouncedSearch, page, limit }));
  }, [debouncedSearch, page]);

  const totalPages = Math.ceil(stockTotal / limit);

  const bg   = isDark ? "#0f1117" : "#ffffff";
  const bg2  = isDark ? "#080b12" : "#f8fafc";
  const bdr  = isDark ? "#1f2937" : "#f1f5f9";
  const txt  = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";

  // Stock status badge
  const stockBadge = (qty: number) => {
    if (qty === 0)   return { label: "Out of Stock", color: "#ef4444", bg: "#fee2e2" };
    if (qty <= 10)   return { label: "Low Stock",    color: "#f59e0b", bg: "#fef3c7" };
    return               { label: "In Stock",       color: "#10b981", bg: "#d1fae5" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Header ── */}
      <div style={{
        borderRadius: "20px", padding: "28px",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        color: "#fff", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
      }}>
        {[
          { top: "-50px", right: "-50px", size: "200px", op: "0.08" },
          { top: "40px",  right: "150px", size: "120px", op: "0.05" },
        ].map((c, i) => (
          <div key={i} style={{
            position: "absolute", top: c.top, right: c.right,
            width: c.size, height: c.size, borderRadius: "50%",
            background: `rgba(255,255,255,${c.op})`,
          }} />
        ))}
        <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,.7)", margin: "0 0 4px" }}>
          Admin Analytics
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          📦 Stock Sold by Product & Seller
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,.75)", margin: 0 }}>
          Track every unit sold — broken down by product and the seller who sold it
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "12px",
      }}>
        {[
          { label: "Total Records",  value: fmtNum(stockTotal),      emoji: "📋", color: "#6366f1" },
          { label: "Units Sold",     value: fmtNum(stockTotalUnits), emoji: "📦", color: "#a855f7" },
          { label: "Total Revenue",  value: fmt(stockRevenue),       emoji: "💰", color: "#10b981" },
          { label: "Avg Per Record", value: stockTotal > 0
              ? fmtNum(Math.round(stockTotalUnits / stockTotal))
              : "0",                                                  emoji: "📊", color: "#f59e0b" },
        ].map((card) => (
          <div key={card.label} style={{
            borderRadius: "16px", padding: "20px",
            display: "flex", alignItems: "center", gap: "14px",
            background: bg, border: `1px solid ${bdr}`,
            boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: `${card.color}18`, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "20px", flexShrink: 0,
            }}>
              {card.emoji}
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px",
                textTransform: "uppercase", color: txt2, margin: 0 }}>
                {card.label}
              </p>
              <p style={{ fontSize: "22px", fontWeight: 900, color: txt, margin: 0, lineHeight: 1.2 }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div style={{
        borderRadius: "16px", background: bg,
        border: `1px solid ${bdr}`,
        boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
        overflow: "hidden",
      }}>

        {/* Table Header */}
        <div style={{
          padding: "16px 20px",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
          borderBottom: `1px solid ${bdr}`,
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
            <span style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", fontSize: "14px",
            }}>🔍</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search product, seller, brand..."
              style={{
                width: "100%", padding: "9px 12px 9px 36px",
                borderRadius: "10px", border: `1px solid ${bdr}`,
                background: bg2, color: txt, fontSize: "13px",
                outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <span style={{ fontSize: "13px", color: txt2, flexShrink: 0 }}>
            {fmtNum(stockTotal)} results
          </span>
        </div>

        {/* Table */}
        {stockLoading ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "3px solid #6366f1", borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
            }} />
            <p style={{ color: txt2, fontSize: "14px" }}>Loading stock data...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : stockSold.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📦</p>
            <p style={{ color: txt2, fontWeight: 600 }}>No sales data found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ background: isDark ? "#1a1f2e" : "#f8fafc" }}>
                  {[
                    "#", "Product", "Brand", "Seller", "Units Sold",
                    "Revenue", "Curr. Stock", "Avg Price", "Status",
                  ].map((h) => (
                    <th key={h} style={{
                      padding: "12px 14px", fontSize: "11px", fontWeight: 700,
                      letterSpacing: "0.8px", textTransform: "uppercase",
                      color: txt2, textAlign: "left", whiteSpace: "nowrap",
                      borderBottom: `2px solid ${bdr}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockSold.map((row: any, i: number) => {
                  const badge   = stockBadge(row.currentStock ?? 0);
                  const rowIdx  = (page - 1) * limit + i + 1;
                  const rowBg   = i % 2 === 0 ? bg : bg2;
                  return (
                    <tr key={`${row.productId}-${row.sellerId}`}
                      style={{
                        background: rowBg,
                        borderBottom: `1px solid ${bdr}`,
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isDark ? "#1a1f2e" : "#eef2ff")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = rowBg)}
                    >
                      {/* # */}
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: txt2, fontWeight: 600 }}>
                        {rowIdx}
                      </td>

                      {/* Product */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {row.productImage ? (
                            <img loading="lazy" decoding="async"
                              src={row.productImage}
                              alt={row.productTitle}
                              style={{
                                width: "38px", height: "38px",
                                borderRadius: "8px", objectFit: "cover",
                                border: `1px solid ${bdr}`, flexShrink: 0,
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div style={{
                              width: "38px", height: "38px", borderRadius: "8px",
                              background: "#6366f118", display: "flex",
                              alignItems: "center", justifyContent: "center",
                              fontSize: "16px", flexShrink: 0,
                            }}>📦</div>
                          )}
                          <span style={{
                            fontSize: "13px", fontWeight: 600, color: txt,
                            maxWidth: "180px", overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                            display: "block",
                          }}>
                            {row.productTitle}
                          </span>
                        </div>
                      </td>

                      {/* Brand */}
                      <td style={{ padding: "12px 14px" }}>
                        {row.productBrand ? (
                          <span style={{
                            fontSize: "11px", fontWeight: 700,
                            background: "#6366f115", color: "#6366f1",
                            padding: "3px 8px", borderRadius: "6px",
                            textTransform: "capitalize",
                          }}>
                            {row.productBrand}
                          </span>
                        ) : (
                          <span style={{ color: txt2, fontSize: "12px" }}>—</span>
                        )}
                      </td>

                      {/* Seller */}
                      <td style={{ padding: "12px 14px" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: txt, margin: "0 0 2px" }}>
                            {row.sellerName ?? "—"}
                          </p>
                          {row.businessName && (
                            <p style={{ fontSize: "11px", color: "#a855f7", margin: 0 }}>
                              🏪 {row.businessName}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Units Sold */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            background: "#6366f118", display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontSize: "14px" }}>📊</span>
                          </div>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: "#6366f1" }}>
                            {fmtNum(row.totalSold)}
                          </span>
                        </div>
                      </td>

                      {/* Revenue */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#10b981" }}>
                          {fmt(row.totalRevenue)}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: txt }}>
                          {fmtNum(row.currentStock ?? 0)}
                        </span>
                      </td>

                      {/* Avg Price */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ fontSize: "13px", color: txt2 }}>
                          {row.sellingPrice ? fmt(row.sellingPrice) : "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "3px 10px", borderRadius: "999px",
                          fontSize: "11px", fontWeight: 700,
                          background: badge.bg, color: badge.color,
                        }}>
                          <span style={{
                            width: "5px", height: "5px", borderRadius: "50%",
                            background: badge.color,
                          }} />
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: `1px solid ${bdr}`, flexWrap: "wrap", gap: "8px",
          }}>
            <span style={{ fontSize: "13px", color: txt2 }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { label: "← Prev", disabled: page <= 1,         onClick: () => setPage(p => p - 1) },
                { label: "Next →", disabled: page >= totalPages, onClick: () => setPage(p => p + 1) },
              ].map((btn) => (
                <button
                  key={btn.label}
                  disabled={btn.disabled}
                  onClick={btn.onClick}
                  style={{
                    padding: "7px 16px", borderRadius: "9px",
                    border: `1px solid ${bdr}`, cursor: btn.disabled ? "default" : "pointer",
                    fontSize: "12px", fontWeight: 700,
                    background: btn.disabled
                      ? (isDark ? "#1a1f2e" : "#f8fafc")
                      : "linear-gradient(135deg,#6366f1,#a855f7)",
                    color: btn.disabled ? txt2 : "#fff",
                    opacity: btn.disabled ? 0.5 : 1,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}