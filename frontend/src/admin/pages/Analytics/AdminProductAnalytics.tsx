import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchProductAnalytics,
  setAnalyticsPeriod,
} from "../../../Redux Toolkit/Admin/adminAnalyticsSlice";
import { useAdminTheme } from "../../context/AdminThemeContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);

const fmtNum = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const CAT_COLORS = [
  "#6366f1","#a855f7","#10b981","#f59e0b",
  "#ef4444","#06b6d4","#ec4899","#84cc16",
];

const PRICE_LABELS: Record<string, string> = {
  "0":     "₹0–500",
  "500":   "₹500–1K",
  "1000":  "₹1K–2K",
  "2000":  "₹2K–5K",
  "5000":  "₹5K–10K",
  "10000": "₹10K–50K",
  "50000+":"₹50K+",
};

// ── Donut Chart ──────────────────────────────────────────────
function DonutChart({
  data, labelKey, valueKey, colors,
}: {
  data: any[]; labelKey: string; valueKey: string; colors: string[];
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const total = data.reduce((s, d) => s + (d[valueKey] ?? 0), 0);
  const size = 200; const cx = 100; const cy = 100;
  const R = 75; const r = 45;

  const polar = (pct: number, rad: number) => ({
    x: cx + rad * Math.cos(pct * 2 * Math.PI - Math.PI / 2),
    y: cy + rad * Math.sin(pct * 2 * Math.PI - Math.PI / 2),
  });

  let cum = 0;
  const slices = data.map((d, i) => {
    const pct = total > 0 ? (d[valueKey] ?? 0) / total : 0;
    const s   = cum;
    cum       += pct;
    return { ...d, start: s, end: cum, color: colors[i % colors.length], pct };
  });

  const arc = (s: number, e: number, exp = 0) => {
    if (e - s >= 1) e = 0.9999;
    const a = polar(s, R + exp), b = polar(e, R + exp);
    const c = polar(e, r),       d2 = polar(s, r);
    const lg = e - s > 0.5 ? 1 : 0;
    return `M${a.x} ${a.y} A${R+exp} ${R+exp} 0 ${lg} 1 ${b.x} ${b.y} L${c.x} ${c.y} A${r} ${r} 0 ${lg} 0 ${d2.x} ${d2.y}Z`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
      <svg width={size} height={size} style={{ overflow: "visible", flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={arc(s.start, s.end, hovered === i ? 6 : 0)}
            fill={s.color}
            style={{ cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">
          {hovered !== null ? slices[hovered][labelKey]?.slice(0, 12) : "Total"}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="13" fontWeight="900"
          fill={hovered !== null ? slices[hovered].color : "#6366f1"}>
          {hovered !== null
            ? `${((slices[hovered].pct) * 100).toFixed(1)}%`
            : fmtNum(total)}
        </text>
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        {slices.map((s, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "6px 10px", borderRadius: "8px", cursor: "pointer",
              background: hovered === i ? `${s.color}15` : "transparent",
              transition: "background .15s",
            }}
          >
            <div style={{
              width: "10px", height: "10px", borderRadius: "3px",
              background: s.color, flexShrink: 0,
            }} />
            <span style={{
              fontSize: "12px", flex: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              color: hovered === i ? s.color : "#374151", fontWeight: hovered === i ? 700 : 500,
            }}>
              {s[labelKey] ?? "Unknown"}
            </span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: s.color }}>
              {fmtNum(s[valueKey])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sparkline ────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data?.length) return null;
  const w = 160; const h = 40;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (v / max) * (h - 4) - 2,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`spark-${color.replace("#","")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h}Z`}
        fill={`url(#spark-${color.replace("#","")})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function AdminProductAnalytics() {
  const dispatch   = useAppDispatch();
  const { isDark } = useAdminTheme();
  const { productAnalytics, analyticsLoading, analyticsPeriod } =
    useAppSelector((s) => s.adminAnalytics);

  React.useEffect(() => {
    dispatch(fetchProductAnalytics(analyticsPeriod));
  }, [analyticsPeriod]);

  const bg   = isDark ? "#0f1117" : "#ffffff";
  const bg2  = isDark ? "#080b12" : "#f8fafc";
  const bdr  = isDark ? "#1f2937" : "#f1f5f9";
  const txt  = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";

  const periods = [
    { key: "week",  label: "7 Days" },
    { key: "month", label: "3 Months" },
    { key: "year",  label: "1 Year" },
    { key: "all",   label: "All Time" },
  ];

  const d = productAnalytics;

  // Daily trend sparkline data
  const trendRevenue = d?.dailyTrend?.map((t: any) => t.revenue) ?? [];
  const trendUnits   = d?.dailyTrend?.map((t: any) => t.units)   ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Header ── */}
      <div style={{
        borderRadius: "20px", padding: "28px",
        background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)",
        color: "#fff", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(16,185,129,0.35)",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "220px", height: "220px", borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
        }} />
        <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,.7)", margin: "0 0 4px" }}>
          Admin Analytics
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          🛍️ Product & User Preference Analytics
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,.75)", margin: 0 }}>
          What users buy, which categories they love, brand preferences & price ranges
        </p>
      </div>

      {/* ── Period Filter ── */}
      <div style={{
        display: "inline-flex", gap: "6px",
        background: bg, border: `1px solid ${bdr}`,
        borderRadius: "12px", padding: "4px",
        alignSelf: "flex-start",
      }}>
        {periods.map((p) => (
          <button key={p.key}
            onClick={() => dispatch(setAnalyticsPeriod(p.key))}
            style={{
              padding: "7px 16px", borderRadius: "9px", border: "none",
              cursor: "pointer", fontSize: "12px", fontWeight: 700,
              background: analyticsPeriod === p.key
                ? "linear-gradient(135deg,#10b981,#06b6d4)"
                : "transparent",
              color: analyticsPeriod === p.key ? "#fff" : txt2,
              transition: "all .2s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {analyticsLoading ? (
        <div style={{
          padding: "100px", textAlign: "center",
          background: bg, borderRadius: "16px",
          border: `1px solid ${bdr}`,
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            border: "3px solid #10b981", borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: txt2, fontSize: "14px" }}>Crunching the numbers...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : !d ? (
        <div style={{ padding: "60px", textAlign: "center", background: bg,
          borderRadius: "16px", border: `1px solid ${bdr}` }}>
          <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📊</p>
          <p style={{ color: txt2, fontWeight: 600 }}>No analytics data yet</p>
        </div>
      ) : (
        <>
          {/* ── Summary Stats ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
          }}>
            {[
              {
                label: "Total Units Sold",
                value: fmtNum(d.summary?.totalUnits ?? 0),
                emoji: "📦",
                color: "#6366f1",
                spark: trendUnits,
              },
              {
                label: "Total Revenue",
                value: fmt(d.summary?.totalRevenue ?? 0),
                emoji: "💰",
                color: "#10b981",
                spark: trendRevenue,
              },
              {
                label: "Total Orders",
                value: fmtNum(d.summary?.totalOrders ?? 0),
                emoji: "🛒",
                color: "#a855f7",
                spark: [],
              },
              {
                label: "Avg Order Value",
                value: fmt(d.summary?.avgOrderValue ?? 0),
                emoji: "💳",
                color: "#f59e0b",
                spark: [],
              },
              {
                label: "Unique Products",
                value: fmtNum(d.summary?.uniqueProducts ?? 0),
                emoji: "🏷️",
                color: "#ef4444",
                spark: [],
              },
            ].map((card) => (
              <div key={card.label} style={{
                borderRadius: "16px", padding: "18px 20px",
                background: bg, border: `1px solid ${bdr}`,
                boxShadow: isDark
                  ? "0 1px 3px rgba(0,0,0,.4)"
                  : "0 1px 3px rgba(0,0,0,.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `${card.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px",
                  }}>
                    {card.emoji}
                  </div>
                  <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.8px",
                    textTransform: "uppercase", color: txt2, margin: 0 }}>
                    {card.label}
                  </p>
                </div>
                <p style={{ fontSize: "20px", fontWeight: 900, color: card.color,
                  margin: "0 0 8px" }}>
                  {card.value}
                </p>
                {card.spark.length > 1 && (
                  <Sparkline data={card.spark} color={card.color} />
                )}
              </div>
            ))}
          </div>

          {/* ── Top Products Table ── */}
          <div style={{
            borderRadius: "16px", background: bg,
            border: `1px solid ${bdr}`, overflow: "hidden",
            boxShadow: isDark
              ? "0 1px 3px rgba(0,0,0,.4)"
              : "0 1px 3px rgba(0,0,0,.06)",
          }}>
            <div style={{
              padding: "18px 20px", borderBottom: `1px solid ${bdr}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 800, color: txt, margin: "0 0 2px" }}>
                  🔥 Top Selling Products
                </h2>
                <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
                  Products users love the most
                </p>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: isDark ? "#1a1f2e" : "#f8fafc" }}>
                    {["Rank","Product","Category","Brand","Units Sold",
                      "Revenue","Avg Price","Rating"].map((h) => (
                      <th key={h} style={{
                        padding: "11px 14px", fontSize: "10px", fontWeight: 700,
                        letterSpacing: "0.8px", textTransform: "uppercase",
                        color: txt2, textAlign: "left",
                        borderBottom: `2px solid ${bdr}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d.topProducts ?? []).map((p: any, i: number) => {
                    const rankColors = ["#f59e0b","#94a3b8","#cd7c2f"];
                    const rankEmoji  = ["🥇","🥈","🥉"];
                    const rowBg = i % 2 === 0 ? bg : bg2;
                    return (
                      <tr key={p.productId}
                        style={{ background: rowBg, borderBottom: `1px solid ${bdr}`, transition: "background .15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1a1f2e" : "#f0fdf4")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
                      >
                        {/* Rank */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "8px",
                            background: i < 3 ? `${rankColors[i]}20` : `${txt2}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: i < 3 ? "16px" : "12px",
                            fontWeight: 900,
                            color: i < 3 ? rankColors[i] : txt2,
                          }}>
                            {i < 3 ? rankEmoji[i] : i + 1}
                          </div>
                        </td>

                        {/* Product */}
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {p.image ? (
                              <img loading="lazy" decoding="async" src={p.image} alt={p.title}
                                style={{
                                  width: "36px", height: "36px", borderRadius: "8px",
                                  objectFit: "cover", border: `1px solid ${bdr}`, flexShrink: 0,
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div style={{
                                width: "36px", height: "36px", borderRadius: "8px",
                                background: "#10b98118", display: "flex",
                                alignItems: "center", justifyContent: "center", fontSize: "16px",
                              }}>🛍️</div>
                            )}
                            <span style={{
                              fontSize: "13px", fontWeight: 600, color: txt,
                              maxWidth: "160px", overflow: "hidden",
                              textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                            }}>
                              {p.title}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 600,
                            background: "#10b98115", color: "#10b981",
                            padding: "3px 8px", borderRadius: "6px",
                          }}>
                            {p.categoryName ?? "—"}
                          </span>
                        </td>

                        {/* Brand */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            fontSize: "12px", color: txt,
                            textTransform: "capitalize",
                          }}>
                            {p.brand || "—"}
                          </span>
                        </td>

                        {/* Units Sold */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: "15px", fontWeight: 800, color: "#6366f1" }}>
                            {fmtNum(p.totalSold)}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#10b981" }}>
                            {fmt(p.totalRevenue)}
                          </span>
                        </td>

                        {/* Avg Price */}
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ fontSize: "12px", color: txt2 }}>
                            {fmt(p.avgPrice)}
                          </span>
                        </td>

                        {/* Rating */}
                        <td style={{ padding: "12px 14px" }}>
                          {p.rating > 0 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "13px" }}>⭐</span>
                              <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>
                                {Number(p.rating).toFixed(1)}
                              </span>
                              <span style={{ fontSize: "11px", color: txt2 }}>
                                ({p.numRatings})
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: txt2, fontSize: "12px" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Category + Brand Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Category Donut */}
            <div style={{
              borderRadius: "16px", padding: "22px",
              background: bg, border: `1px solid ${bdr}`,
              boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
            }}>
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: txt, margin: "0 0 4px" }}>
                🗂️ Category Preferences
              </h2>
              <p style={{ fontSize: "12px", color: txt2, margin: "0 0 20px" }}>
                Which categories users buy from most
              </p>
              {d.categoryBreakdown?.length > 0 ? (
                <DonutChart
                  data={d.categoryBreakdown}
                  labelKey="categoryName"
                  valueKey="totalSold"
                  colors={CAT_COLORS}
                />
              ) : (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <p style={{ color: txt2 }}>No category data</p>
                </div>
              )}
            </div>

            {/* Brand Donut */}
            <div style={{
              borderRadius: "16px", padding: "22px",
              background: bg, border: `1px solid ${bdr}`,
              boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
            }}>
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: txt, margin: "0 0 4px" }}>
                🏷️ Brand Preferences
              </h2>
              <p style={{ fontSize: "12px", color: txt2, margin: "0 0 20px" }}>
                Which brands users prefer
              </p>
              {d.brandPreferences?.length > 0 ? (
                <DonutChart
                  data={d.brandPreferences}
                  labelKey="brand"
                  valueKey="totalSold"
                  colors={["#f59e0b","#ef4444","#06b6d4","#a855f7",
                    "#10b981","#6366f1","#ec4899","#84cc16"]}
                />
              ) : (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <p style={{ color: txt2 }}>No brand data</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Price Distribution ── */}
          <div style={{
            borderRadius: "16px", padding: "22px",
            background: bg, border: `1px solid ${bdr}`,
            boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
          }}>
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: txt, margin: "0 0 4px" }}>
              💳 Price Range Distribution
            </h2>
            <p style={{ fontSize: "12px", color: txt2, margin: "0 0 20px" }}>
              What price range users buy in
            </p>
            {d.priceDistribution?.length > 0 ? (() => {
              const maxCount = Math.max(
                ...d.priceDistribution.map((p: any) => p.count), 1
              );
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {d.priceDistribution.map((p: any, i: number) => {
                    const label = PRICE_LABELS[String(p._id)] ?? `₹${p._id}+`;
                    const color = CAT_COLORS[i % CAT_COLORS.length];
                    const pct   = (p.count / maxCount) * 100;
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                      }}>
                        {/* Label */}
                        <div style={{ width: "90px", flexShrink: 0 }}>
                          <span style={{
                            fontSize: "12px", fontWeight: 600,
                            color: txt, display: "block",
                          }}>
                            {label}
                          </span>
                        </div>

                        {/* Bar */}
                        <div style={{
                          flex: 1, height: "30px",
                          background: isDark ? "#1a1f2e" : "#f1f5f9",
                          borderRadius: "8px", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${color}88, ${color})`,
                            borderRadius: "8px",
                            display: "flex", alignItems: "center",
                            paddingLeft: "10px",
                            transition: "width 1s cubic-bezier(.34,1.56,.64,1)",
                          }}>
                            {pct > 15 && (
                              <span style={{
                                fontSize: "11px", fontWeight: 700, color: "#fff",
                              }}>
                                {fmtNum(p.count)} orders
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div style={{ width: "120px", textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: "12px", fontWeight: 700, color, margin: "0 0 1px" }}>
                            {fmtNum(p.units)} units
                          </p>
                          <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>
                            {fmt(p.revenue)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })() : (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ color: txt2 }}>No price data available</p>
              </div>
            )}
          </div>

          {/* ── Daily Trend Chart ── */}
          {d.dailyTrend?.length > 1 && (
            <div style={{
              borderRadius: "16px", padding: "22px",
              background: bg, border: `1px solid ${bdr}`,
              boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
            }}>
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: txt, margin: "0 0 4px" }}>
                📈 30-Day Sales Trend
              </h2>
              <p style={{ fontSize: "12px", color: txt2, margin: "0 0 20px" }}>
                Daily units sold and revenue over the last 30 days
              </p>

              {(() => {
                const trend = d.dailyTrend;
                const maxRev = Math.max(...trend.map((t: any) => t.revenue), 1);
                const w = "100%"; const h = 140;
                const pts = trend.map((t: any, i: number) => ({
                  x: (i / (trend.length - 1)) * 100,
                  y: 100 - (t.revenue / maxRev) * 90,
                  date:    t.date,
                  revenue: t.revenue,
                  units:   t.units,
                }));

                const pathD = pts
                  .map((p: any, i: number) => `${i === 0 ? "M" : "L"}${p.x}% ${p.y}%`)
                  .join(" ");

                const areaD =
                  pts.map((p: any, i: number) => `${i === 0 ? "M" : "L"}${p.x}% ${p.y}%`).join(" ") +
                  ` L100% 100% L0% 100% Z`;

                const [tooltip, setTooltip] = React.useState<any>(null);

                return (
                  <div style={{ position: "relative" }}>
                    <svg
                      width={w} height={h}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      style={{ display: "block", overflow: "visible" }}
                    >
                      <defs>
                        <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaD} fill="url(#trendGrad)" />
                      <path d={pathD} fill="none" stroke="#6366f1"
                        strokeWidth="0.5" strokeLinecap="round" />
                      {pts.map((p: any, i: number) => (
                        <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="1"
                          fill="#6366f1" style={{ cursor: "pointer" }}
                          onMouseEnter={() => setTooltip({ ...p, i })}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      ))}
                    </svg>

                    {/* Tooltip */}
                    {tooltip && (
                      <div style={{
                        position: "absolute",
                        left: `${Math.min(tooltip.x, 80)}%`,
                        top: "0px",
                        transform: "translateX(-50%)",
                        background: isDark ? "#1a1f2e" : "#fff",
                        border: `1px solid #6366f140`,
                        borderRadius: "10px",
                        padding: "8px 12px",
                        pointerEvents: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,.15)",
                        zIndex: 10,
                      }}>
                        <p style={{ fontSize: "11px", color: txt2, margin: "0 0 3px" }}>
                          {tooltip.date}
                        </p>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: "#6366f1", margin: "0 0 1px" }}>
                          {fmt(tooltip.revenue)}
                        </p>
                        <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>
                          {fmtNum(tooltip.units)} units
                        </p>
                      </div>
                    )}

                    {/* X axis labels — first, mid, last */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                      {[trend[0], trend[Math.floor(trend.length / 2)], trend[trend.length - 1]]
                        .filter(Boolean)
                        .map((t: any, i: number) => (
                          <span key={i} style={{ fontSize: "10px", color: txt2 }}>
                            {t.date?.slice(5)}
                          </span>
                        ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}