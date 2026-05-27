import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchSellerRevenue,
  setRevenuePeriod,
} from "../../../Redux Toolkit/Admin/adminAnalyticsSlice";
import { useAdminTheme } from "../../context/AdminThemeContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);

// ── Pie Chart (pure SVG, no library) ────────────────────────
const COLORS = ["#6366f1","#a855f7","#10b981","#f59e0b","#ef4444","#94a3b8"];

interface PieSlice {
  sellerName:   string;
  businessName: string;
  revenue:      number;
  orders:       number;
  percentage:   number;
  rank:         number;
}

function PieChart({ data, total }: { data: PieSlice[]; total: number }) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const size   = 260;
  const cx     = size / 2;
  const cy     = size / 2;
  const radius = 90;
  const inner  = 52;

  // Build slices
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const pct   = d.percentage / 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, start, end: cumulative, color: COLORS[i] ?? "#94a3b8" };
  });

  const polarToXY = (pct: number, r: number) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const arcPath = (
    start: number, end: number,
    outerR: number, innerR: number,
    expand = 0
  ) => {
    if (end - start >= 1) end = 0.9999;
    const s1 = polarToXY(start, outerR + expand);
    const e1 = polarToXY(end,   outerR + expand);
    const s2 = polarToXY(end,   innerR);
    const e2 = polarToXY(start, innerR);
    const lg  = end - start > 0.5 ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${outerR + expand} ${outerR + expand} 0 ${lg} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${innerR} ${innerR} 0 ${lg} 0 ${e2.x} ${e2.y}`,
      "Z",
    ].join(" ");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
      {/* SVG Donut */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={size} height={size} style={{ overflow: "visible" }}>
          <defs>
            {slices.map((s, i) => (
              <radialGradient key={i} id={`grad-${i}`}>
                <stop offset="0%" stopColor={s.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={s.color} stopOpacity="1" />
              </radialGradient>
            ))}
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>

          {slices.map((s, i) => (
            <path
              key={i}
              d={arcPath(s.start, s.end, radius, inner, hovered === i ? 8 : 0)}
              fill={`url(#grad-${i})`}
              filter={hovered === i ? "url(#shadow)" : "none"}
              style={{
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Center text */}
          <text
            x={cx} y={cy - 10}
            textAnchor="middle"
            fontSize="11"
            fill="#9ca3af"
            fontWeight="600"
          >
            Total Revenue
          </text>
          <text
            x={cx} y={cy + 12}
            textAnchor="middle"
            fontSize="15"
            fill={hovered !== null ? COLORS[hovered] : "#6366f1"}
            fontWeight="900"
          >
            {hovered !== null
              ? `${slices[hovered].percentage}%`
              : fmt(total)}
          </text>
          {hovered !== null && (
            <text
              x={cx} y={cy + 28}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {slices[hovered].sellerName?.slice(0, 18)}
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minWidth: "200px" }}>
        {slices.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px", borderRadius: "12px",
              background: hovered === i ? `${s.color}15` : "transparent",
              border: `1px solid ${hovered === i ? s.color + "40" : "transparent"}`,
              cursor: "pointer", transition: "all .2s ease",
            }}
          >
            {/* Color dot */}
            <div style={{
              width: "12px", height: "12px", borderRadius: "4px",
              background: s.color, flexShrink: 0,
            }} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "13px", fontWeight: 700,
                color: hovered === i ? s.color : "#111827",
                margin: "0 0 1px",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {s.sellerName ?? "Others"}
              </p>
              {s.businessName && (
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                  {s.businessName}
                </p>
              )}
            </div>

            {/* Stats */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 800, color: s.color, margin: "0 0 1px" }}>
                {s.percentage}%
              </p>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                {fmt(s.revenue)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar chart for seller comparison ─────────────────────────
function BarChart({ data, isDark }: { data: PieSlice[]; isDark: boolean }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  const txt = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Rank */}
          <div style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: COLORS[i] + "20", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 800, color: COLORS[i], flexShrink: 0,
          }}>
            {s.rank}
          </div>

          {/* Name */}
          <div style={{ width: "120px", flexShrink: 0 }}>
            <p style={{
              fontSize: "12px", fontWeight: 600, color: txt,
              margin: 0, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {s.sellerName ?? "Others"}
            </p>
            <p style={{ fontSize: "10px", color: txt2, margin: 0 }}>
              {s.orders} orders
            </p>
          </div>

          {/* Bar */}
          <div style={{
            flex: 1, height: "28px", background: isDark ? "#1a1f2e" : "#f1f5f9",
            borderRadius: "8px", overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(s.revenue / max) * 100}%`,
              background: `linear-gradient(90deg, ${COLORS[i]}cc, ${COLORS[i]})`,
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              paddingRight: "8px",
              transition: "width 1s cubic-bezier(.34,1.56,.64,1)",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>
                {s.percentage}%
              </span>
            </div>
          </div>

          {/* Value */}
          <div style={{ width: "90px", textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: COLORS[i] }}>
              {fmt(s.revenue)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function AdminSellerRevenue() {
  const dispatch   = useAppDispatch();
  const { isDark } = useAdminTheme();
  const {
    sellerRevenue, totalRevenue, revenueLoading, revenuePeriod,
  } = useAppSelector((s) => s.adminAnalytics);

  const [chartType, setChartType] = React.useState<"donut" | "bar">("donut");

  React.useEffect(() => {
    dispatch(fetchSellerRevenue(revenuePeriod));
  }, [revenuePeriod]);

  const bg   = isDark ? "#0f1117" : "#ffffff";
  const bg2  = isDark ? "#080b12" : "#f8fafc";
  const bdr  = isDark ? "#1f2937" : "#f1f5f9";
  const txt  = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";

  const periods = [
    { key: "all",   label: "All Time" },
    { key: "year",  label: "This Year" },
    { key: "month", label: "This Month" },
    { key: "week",  label: "This Week" },
  ];

  // Top seller spotlight
  const topSeller = sellerRevenue.find(s => s.rank === 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Header ── */}
      <div style={{
        borderRadius: "20px", padding: "28px",
        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)",
        color: "#fff", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(168,85,247,0.35)",
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
          🥧 Seller Revenue Distribution
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,.75)", margin: 0 }}>
          Top 5 sellers + others — see who drives the most revenue
        </p>
      </div>

      {/* ── Controls ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        flexWrap: "wrap",
      }}>
        {/* Period filter */}
        <div style={{
          display: "flex", gap: "6px",
          background: bg, border: `1px solid ${bdr}`,
          borderRadius: "12px", padding: "4px",
        }}>
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => dispatch(setRevenuePeriod(p.key))}
              style={{
                padding: "7px 14px", borderRadius: "9px", border: "none",
                cursor: "pointer", fontSize: "12px", fontWeight: 700,
                background: revenuePeriod === p.key
                  ? "linear-gradient(135deg,#6366f1,#a855f7)"
                  : "transparent",
                color: revenuePeriod === p.key ? "#fff" : txt2,
                transition: "all .2s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chart type toggle */}
        <div style={{
          display: "flex", gap: "6px",
          background: bg, border: `1px solid ${bdr}`,
          borderRadius: "12px", padding: "4px",
          marginLeft: "auto",
        }}>
          {(["donut","bar"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              style={{
                padding: "7px 14px", borderRadius: "9px", border: "none",
                cursor: "pointer", fontSize: "12px", fontWeight: 700,
                background: chartType === t
                  ? "linear-gradient(135deg,#a855f7,#6366f1)"
                  : "transparent",
                color: chartType === t ? "#fff" : txt2,
                transition: "all .2s",
              }}
            >
              {t === "donut" ? "🥧 Donut" : "📊 Bar"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Seller Spotlight ── */}
      {topSeller && (
        <div style={{
          borderRadius: "16px", padding: "20px 24px",
          background: "linear-gradient(135deg, #6366f115, #a855f715)",
          border: "1px solid #6366f130",
          display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
        }}>
          <div style={{
            width: "50px", height: "50px", borderRadius: "14px",
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", flexShrink: 0,
          }}>
            🏆
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#6366f1",
              letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 2px" }}>
              Top Revenue Seller
            </p>
            <p style={{ fontSize: "18px", fontWeight: 900, color: txt, margin: "0 0 2px" }}>
              {topSeller.sellerName}
            </p>
            {topSeller.businessName && (
              <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
                {topSeller.businessName}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "24px", fontWeight: 900, color: "#6366f1", margin: "0 0 2px" }}>
              {fmt(topSeller.revenue)}
            </p>
            <p style={{ fontSize: "12px", color: txt2, margin: 0 }}>
              {topSeller.percentage}% of total • {topSeller.orders} orders
            </p>
          </div>
        </div>
      )}

      {/* ── Chart Card ── */}
      <div style={{
        borderRadius: "16px", padding: "28px",
        background: bg, border: `1px solid ${bdr}`,
        boxShadow: isDark ? "0 1px 3px rgba(0,0,0,.4)" : "0 1px 3px rgba(0,0,0,.06)",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "24px",
        }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: txt, margin: "0 0 2px" }}>
              Revenue by Seller
            </h2>
            <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
              Total: {fmt(totalRevenue)}
            </p>
          </div>
        </div>

        {revenueLoading ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "3px solid #a855f7", borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
            }} />
            <p style={{ color: txt2, fontSize: "14px" }}>Loading revenue data...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : sellerRevenue.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "48px", margin: "0 0 12px" }}>📊</p>
            <p style={{ color: txt2, fontWeight: 600 }}>No revenue data for this period</p>
          </div>
        ) : chartType === "donut" ? (
          <PieChart data={sellerRevenue} total={totalRevenue} />
        ) : (
          <BarChart data={sellerRevenue} isDark={isDark} />
        )}
      </div>

      {/* ── Seller Cards Grid ── */}
      {sellerRevenue.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "12px",
        }}>
          {sellerRevenue.map((s: PieSlice, i: number) => {
            const color = COLORS[i] ?? "#94a3b8";
            const isOthers = s.sellerName === "Others";
            return (
              <div key={i} style={{
                borderRadius: "16px", overflow: "hidden",
                background: bg, border: `1px solid ${bdr}`,
                boxShadow: isDark
                  ? "0 1px 3px rgba(0,0,0,.4)"
                  : "0 1px 3px rgba(0,0,0,.06)",
                transition: "transform .2s, box-shadow .2s",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isDark
                    ? "0 1px 3px rgba(0,0,0,.4)"
                    : "0 1px 3px rgba(0,0,0,.06)";
                }}
              >
                {/* Top bar */}
                <div style={{
                  height: "6px",
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                }} />

                <div style={{ padding: "16px" }}>
                  {/* Rank + Name */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: color + "20", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: 900, color, flexShrink: 0,
                    }}>
                      {isOthers ? "+" : `#${s.rank}`}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "14px", fontWeight: 800, color: txt, margin: "0 0 2px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {s.sellerName ?? "—"}
                      </p>
                      <p style={{ fontSize: "11px", color: txt2, margin: 0 }}>
                        {s.businessName ?? (isOthers ? "Combined" : "")}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: "8px", paddingTop: "12px",
                    borderTop: `1px solid ${bdr}`,
                  }}>
                    {[
                      { label: "Revenue", value: fmt(s.revenue),    color },
                      { label: "Share",   value: `${s.percentage}%`, color },
                      { label: "Orders",  value: String(s.orders),  color: txt2 },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p style={{ fontSize: "10px", color: txt2, margin: "0 0 2px",
                          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {stat.label}
                        </p>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: stat.color, margin: 0 }}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Revenue bar */}
                  <div style={{ marginTop: "12px" }}>
                    <div style={{
                      height: "6px", borderRadius: "3px",
                      background: isDark ? "#1a1f2e" : "#f1f5f9",
                    }}>
                      <div style={{
                        height: "100%", borderRadius: "3px",
                        width: `${s.percentage}%`,
                        background: `linear-gradient(90deg, ${color}88, ${color})`,
                        transition: "width 1s cubic-bezier(.34,1.56,.64,1)",
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}