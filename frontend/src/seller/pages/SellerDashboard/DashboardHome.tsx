import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, ShoppingBag, DollarSign, Clock,
  Package, ArrowUpRight, Activity,  // ✅ added Activity
} from "lucide-react";
import { CircularProgress } from "@mui/material";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchDashboardStats } from "../../../Redux Toolkit/Seller/dashboardSlice";
import { fetchRevenueChart } from "../../../Redux Toolkit/Seller/revenueChartSlice";

const DashboardHome = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { stats, loading } = useAppSelector((s) => s.dashboard);
  const { chart }          = useAppSelector((s) => s.revenueChart);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRevenueChart({ type: "daily" }));
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  const statCards = [
    {
      label:    "Today's Revenue",
      value:    `₹${stats.today.revenue.toLocaleString()}`,
      sub:      `${stats.today.orders} orders today`,
      icon:     DollarSign,
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      bg:       "rgba(16,185,129,0.1)",
    },
    {
      label:    "Monthly Revenue",
      value:    `₹${stats.month.revenue.toLocaleString()}`,
      sub:      `${stats.month.orders} orders this month`,
      icon:     TrendingUp,
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      bg:       "rgba(99,102,241,0.1)",
    },
    {
      label:    "Total Revenue",
      value:    `₹${stats.total.revenue.toLocaleString()}`,
      sub:      `${stats.total.orders} delivered orders`,
      icon:     ShoppingBag,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      bg:       "rgba(245,158,11,0.1)",
    },
    {
      label:    "Total Orders",
      value:    stats.totalOrders ?? 0,
      sub:      `${stats.inProcess ?? 0} in process`,
      icon:     Activity,
      gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
      bg:       "rgba(6,182,212,0.1)",
      onClick:  () => navigate("/seller/orders"),
    },
    {
      label:    "Pending Orders",
      value:    stats.pendingOrders,
      sub:      "Need your attention",
      icon:     Clock,
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
      bg:       "rgba(239,68,68,0.1)",
      onClick:  () => navigate("/seller/orders"),
    },
  ];

  // ── rest of JSX unchanged ──
  return (
    <div style={{ padding: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
          📊 Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          Welcome back! Here's how your store is performing.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={card.onClick}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e5e7eb",
                cursor: card.onClick ? "pointer" : "default",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 100, height: 100,
                background: card.bg,
                borderRadius: "50%",
                filter: "blur(20px)",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: card.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}>
                  <Icon size={22} color="#fff" />
                </div>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 600 }}>
                  {card.label}
                </p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
                  {card.value}
                </p>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                  {card.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          background: "#fff", borderRadius: 16,
          padding: 24, border: "1px solid #e5e7eb", marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 20px" }}>
          📈 Revenue (Last 30 days)
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 11 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 12 }}
              formatter={(v: any) => [`₹${v.toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top products */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: "#fff", borderRadius: 16,
          padding: 24, border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
          🏆 Top Selling Products
        </h2>
        {stats.topProducts.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 24 }}>
            No sales yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.topProducts.map((p, i) => (
              <div key={p._id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: 10, background: "#f9fafb",
                borderRadius: 10, border: "1px solid #f1f5f9",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "#6366f1",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 12,
                }}>
                  #{i + 1}
                </div>
                <img loading="lazy" decoding="async" src={p.image} alt="" style={{
                  width: 44, height: 44, borderRadius: 8,
                  objectFit: "cover", background: "#fff",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {p.title}
                  </p>
                  <p style={{ fontSize: 11, color: "#64748b", margin: "2px 0 0" }}>
                    {p.totalSold} sold · ₹{p.revenue.toLocaleString()} revenue
                  </p>
                </div>
                <ArrowUpRight size={16} color="#6366f1" />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardHome;