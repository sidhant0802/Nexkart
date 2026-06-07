import { Route, Routes }         from "react-router-dom";
import SellersTable               from "../admin/pages/sellers/SellersTable";
import Coupon                     from "../admin/pages/Coupon/Coupon";
import CouponForm                 from "../admin/pages/Coupon/CreateCouponForm";
import Deal                       from "../admin/pages/Home Page/Deal";
import AdminProducts              from "../admin/pages/Products/AdminProducts";
import AdminBrands                from "../admin/pages/Brands/AdminBrands";
import AdminHomePage              from "../admin/pages/Home Page/AdminHomePage";
import { useAdminTheme }          from "../admin/context/AdminThemeContext";
import AdminStockSold             from "../admin/pages/Analytics/AdminStockSold";
import AdminSellerRevenue         from "../admin/pages/Analytics/AdminSellerRevenue";
import AdminProductAnalytics      from "../admin/pages/Analytics/AdminProductAnalytics";
import { useAppDispatch, useAppSelector } from "../Redux Toolkit/Store";
import { fetchAdminStats }        from "../Redux Toolkit/Admin/AdminProductSlice";
import * as React                 from "react";

// ── Helpers ──────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style:                 "currency",
    currency:              "INR",
    maximumFractionDigits: 0,
  }).format(n);

const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-IN").format(n);

// ── Stat Card ─────────────────────────────────────────────────

interface StatCardProps {
  emoji:  string;
  label:  string;
  value:  string;
  color:  string;
  isDark: boolean;
}

const StatCard = ({ emoji, label, value, color, isDark }: StatCardProps) => (
  <div
    style={{
      borderRadius: "16px",
      padding:      "20px",
      display:      "flex",
      alignItems:   "center",
      gap:          "16px",
      background:   isDark ? "#0f1117" : "#ffffff",
      border:       `1px solid ${isDark ? "#1f2937" : "#f1f5f9"}`,
      boxShadow:    isDark
        ? "0 1px 3px rgba(0,0,0,0.4)"
        : "0 1px 3px rgba(0,0,0,0.06)",
      transition:   "transform 0.2s, box-shadow 0.2s",
      cursor:       "default",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform  = "translateY(-2px)";
      el.style.boxShadow  = isDark
        ? "0 8px 24px rgba(0,0,0,0.5)"
        : "0 8px 24px rgba(99,102,241,0.1)";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLDivElement;
      el.style.transform  = "translateY(0)";
      el.style.boxShadow  = isDark
        ? "0 1px 3px rgba(0,0,0,0.4)"
        : "0 1px 3px rgba(0,0,0,0.06)";
    }}
  >
    <div style={{
      width:           "48px",
      height:          "48px",
      borderRadius:    "12px",
      background:      `${color}18`,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      fontSize:        "22px",
      flexShrink:      0,
    }}>
      {emoji}
    </div>
    <div>
      <p style={{
        fontSize:      "11px",
        fontWeight:    600,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color:         isDark ? "#6b7280" : "#9ca3af",
        margin:        0,
      }}>
        {label}
      </p>
      <p style={{
        fontSize:   "24px",
        fontWeight: 900,
        color:      isDark ? "#f9fafb" : "#111827",
        margin:     0,
        lineHeight: 1.2,
      }}>
        {value}
      </p>
    </div>
  </div>
);

// ── Quick Action Card ─────────────────────────────────────────

interface QuickCardProps {
  label:  string;
  path:   string;
  emoji:  string;
  color:  string;
  isDark: boolean;
}

const QuickCard = ({ label, path, emoji, color, isDark }: QuickCardProps) => (
  <a
    href={path}
    style={{
      display:         "flex",
      flexDirection:   "column",
      alignItems:      "center",
      justifyContent:  "center",
      gap:             "10px",
      padding:         "20px 12px",
      borderRadius:    "16px",
      background:      isDark ? "#0f1117" : "#ffffff",
      border:          `1px solid ${isDark ? "#1f2937" : "#f1f5f9"}`,
      textDecoration:  "none",
      transition:      "all 0.2s ease",
      cursor:          "pointer",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLAnchorElement;
      el.style.transform   = "translateY(-3px) scale(1.02)";
      el.style.borderColor = color;
      el.style.boxShadow   = `0 8px 24px ${color}25`;
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLAnchorElement;
      el.style.transform   = "translateY(0) scale(1)";
      el.style.borderColor = isDark ? "#1f2937" : "#f1f5f9";
      el.style.boxShadow   = "none";
    }}
  >
    <span style={{ fontSize: "28px" }}>{emoji}</span>
    <span style={{ fontSize: "12px", fontWeight: 700, color, textAlign: "center" }}>
      {label}
    </span>
  </a>
);

// ── Admin Home ────────────────────────────────────────────────

const AdminHome = () => {
  const { isDark } = useAdminTheme();
  const dispatch   = useAppDispatch();
  const stats      = useAppSelector((s) => s.adminProduct.stats);

  React.useEffect(() => {
    dispatch(fetchAdminStats());
  }, []);

  const statCards = [
    {
      emoji: "🛒",
      label: "Total Orders",
      value: stats?.totalSold != null ? fmtNum(stats.totalSold) : "—",
      color: "#6366f1",
    },
    {
      emoji: "🏪",
      label: "Total Sellers",
      value: stats?.totalUniqueSellers != null
        ? fmtNum(stats.totalUniqueSellers)
        : "—",
      color: "#a855f7",
    },
    {
      emoji: "📦",
      label: "Total Products",
      value: stats?.total != null ? fmtNum(stats.total) : "—",
      color: "#f59e0b",
    },
    {
      emoji: "🏷️",
      label: "Total Stock",
      value: stats?.totalStock != null ? fmtNum(stats.totalStock) : "—",
      color: "#10b981",
    },
  ];

  const quickActions = [
    { label: "Products",          path: "/admin/products",          emoji: "📦", color: "#6366f1" },
    { label: "Sellers",           path: "/admin/sellers",           emoji: "🏪", color: "#a855f7" },
    { label: "Add Coupon",        path: "/admin/add-coupon",        emoji: "🎟️", color: "#10b981" },
    { label: "Home Page",         path: "/admin/home-grid",         emoji: "🏠", color: "#f59e0b" },
    { label: "Deals",             path: "/admin/deals",             emoji: "⚡", color: "#ef4444" },
    { label: "Brands",            path: "/admin/brands",            emoji: "🏷️", color: "#06b6d4" },
    { label: "Stock Sold",        path: "/admin/stock-sold",        emoji: "📦", color: "#8b5cf6" },
    { label: "Seller Revenue",    path: "/admin/seller-revenue",    emoji: "🥧", color: "#ec4899" },
    { label: "Product Analytics", path: "/admin/product-analytics", emoji: "📊", color: "#14b8a6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: "20px",
        padding:      "32px",
        background:   "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
        color:        "#fff",
        position:     "relative",
        overflow:     "hidden",
        boxShadow:    "0 8px 32px rgba(99,102,241,0.35)",
      }}>
        <div style={{
          position:     "absolute",
          top:          "-40px",
          right:        "-40px",
          width:        "180px",
          height:       "180px",
          borderRadius: "50%",
          background:   "rgba(255,255,255,0.08)",
        }} />
        <div style={{
          position:     "absolute",
          bottom:       "-60px",
          right:        "120px",
          width:        "240px",
          height:       "240px",
          borderRadius: "50%",
          background:   "rgba(255,255,255,0.05)",
        }} />

        <p style={{
          fontSize:   "13px",
          fontWeight: 600,
          color:      "rgba(255,255,255,0.75)",
          margin:     "0 0 6px",
        }}>
          Welcome back 👋
        </p>
        <h1 style={{
          fontSize:      "clamp(22px, 4vw, 32px)",
          fontWeight:    900,
          margin:        "0 0 10px",
          letterSpacing: "-0.5px",
        }}>
          Nexkart Admin Panel
        </h1>
        <p style={{
          fontSize:   "14px",
          color:      "rgba(255,255,255,0.75)",
          margin:     0,
          maxWidth:   "440px",
          lineHeight: 1.6,
        }}>
          Manage your products, sellers, coupons and home page content
          all from one beautiful dashboard.
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div>
        <p style={{
          fontSize:      "10px",
          fontWeight:    700,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color:         isDark ? "#374151" : "#d1d5db",
          marginBottom:  "12px",
        }}>
          Overview
        </p>
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap:                 "12px",
        }}>
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} isDark={isDark} />
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <p style={{
          fontSize:      "10px",
          fontWeight:    700,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color:         isDark ? "#374151" : "#d1d5db",
          marginBottom:  "12px",
        }}>
          Quick Actions
        </p>
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap:                 "12px",
        }}>
          {quickActions.map((q) => (
            <QuickCard key={q.label} {...q} isDark={isDark} />
          ))}
        </div>
      </div>

      {/* ── Analytics Preview Cards ── */}
      <div>
        <p style={{
          fontSize:      "10px",
          fontWeight:    700,
          letterSpacing: "2px",
          textTransform: "uppercase",
          color:         isDark ? "#374151" : "#d1d5db",
          marginBottom:  "12px",
        }}>
          Analytics
        </p>
        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap:                 "12px",
        }}>
          {[
            {
              emoji:       "📦",
              title:       "Stock Sold",
              desc:        "Track every unit sold by product and seller",
              path:        "/admin/stock-sold",
              color:       "#8b5cf6",
              gradient:    "linear-gradient(135deg,#8b5cf620,#6366f110)",
            },
            {
              emoji:       "🥧",
              title:       "Seller Revenue",
              desc:        "Pie chart of top 5 sellers + others revenue share",
              path:        "/admin/seller-revenue",
              color:       "#ec4899",
              gradient:    "linear-gradient(135deg,#ec489920,#a855f710)",
            },
            {
              emoji:       "📊",
              title:       "Product Analytics",
              desc:        "What users buy, category & brand preferences",
              path:        "/admin/product-analytics",
              color:       "#14b8a6",
              gradient:    "linear-gradient(135deg,#14b8a620,#06b6d410)",
            },
          ].map((card) => (
            <a
              key={card.title}
              href={card.path}
              style={{
                display:        "flex",
                alignItems:     "flex-start",
                gap:            "14px",
                padding:        "20px",
                borderRadius:   "16px",
                background:     card.gradient,
                border:         `1px solid ${card.color}30`,
                textDecoration: "none",
                transition:     "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform  = "translateY(-2px)";
                el.style.boxShadow  = `0 8px 24px ${card.color}25`;
                el.style.borderColor = card.color + "60";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.transform   = "translateY(0)";
                el.style.boxShadow   = "none";
                el.style.borderColor = card.color + "30";
              }}
            >
              <div style={{
                width:           "46px",
                height:          "46px",
                borderRadius:    "12px",
                background:      `${card.color}25`,
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                fontSize:        "22px",
                flexShrink:      0,
              }}>
                {card.emoji}
              </div>
              <div>
                <p style={{
                  fontSize:   "14px",
                  fontWeight: 800,
                  color:      card.color,
                  margin:     "0 0 4px",
                }}>
                  {card.title}
                </p>
                <p style={{
                  fontSize:   "12px",
                  color:      isDark ? "#9ca3af" : "#6b7280",
                  margin:     "0 0 8px",
                  lineHeight: 1.5,
                }}>
                  {card.desc}
                </p>
                <span style={{
                  fontSize:   "11px",
                  fontWeight: 700,
                  color:      card.color,
                }}>
                  View Details →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div style={{
        borderRadius: "16px",
        padding:      "24px",
        background:   isDark ? "#0f1117" : "#ffffff",
        border:       `1px solid ${isDark ? "#1f2937" : "#f1f5f9"}`,
      }}>
        <p style={{
          fontSize:   "14px",
          fontWeight: 700,
          color:      isDark ? "#f9fafb" : "#111827",
          margin:     "0 0 16px",
        }}>
          📋 Recent Activity
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { icon: "🛒", text: "New order placed",        time: "2m ago",  color: "#6366f1" },
            { icon: "🏪", text: "New seller registered",   time: "15m ago", color: "#a855f7" },
            { icon: "📦", text: "Product stock updated",   time: "1h ago",  color: "#10b981" },
            { icon: "🎟️", text: "Coupon SAVE20 activated", time: "3h ago",  color: "#f59e0b" },
          ].map((a, i) => (
            <div key={i} style={{
              display:     "flex",
              alignItems:  "center",
              gap:         "12px",
              padding:     "10px 12px",
              borderRadius:"10px",
              background:  isDark ? "#080b12" : "#f8fafc",
              transition:  "background 0.2s",
            }}>
              <div style={{
                width:          "34px",
                height:         "34px",
                borderRadius:   "8px",
                background:     `${a.color}18`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "16px",
                flexShrink:     0,
              }}>
                {a.icon}
              </div>
              <p style={{
                flex:       1,
                fontSize:   "13px",
                fontWeight: 500,
                color:      isDark ? "#d1d5db" : "#374151",
                margin:     0,
              }}>
                {a.text}
              </p>
              <span style={{
                fontSize:  "11px",
                color:     isDark ? "#4b5563" : "#9ca3af",
                flexShrink: 0,
              }}>
                {a.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Admin Routes ──────────────────────────────────────────────

const AdminRoutes = () => (
  <Routes>
    <Route path="/"                  element={<AdminHome />} />
    <Route path="/dashboard"         element={<AdminHome />} />
    <Route path="/sellers"           element={<SellersTable />} />
    <Route path="/products"          element={<AdminProducts />} />
    <Route path="/brands"            element={<AdminBrands />} />
    <Route path="/coupon"            element={<Coupon />} />
    <Route path="/add-coupon"        element={<CouponForm />} />
    <Route path="/home-grid"         element={<AdminHomePage />} />
    <Route path="/deals"             element={<Deal />} />
    <Route path="/stock-sold"        element={<AdminStockSold />} />
    <Route path="/seller-revenue"    element={<AdminSellerRevenue />} />
    <Route path="/product-analytics" element={<AdminProductAnalytics />} />
  </Routes>
);

export default AdminRoutes;