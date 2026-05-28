import { useEffect, useState }   from "react";
import CouponTable                from "./CouponTable";
import CreateCouponForm           from "./CreateCouponForm";
import { useAppDispatch }         from "../../../Redux Toolkit/Store";
import { fetchAllCoupons }        from "../../../Redux Toolkit/Admin/AdminCouponSlice";
import { useAdminTheme }          from "../../context/AdminThemeContext";

const tabs = [
  { name: "All Coupons", emoji: "🎟️" },
  { name: "Create",      emoji: "➕" },
];

const Coupon = () => {
  const dispatch              = useAppDispatch();
  const { isDark }            = useAdminTheme();
  const [activeTab, setActiveTab] = useState("All Coupons");

  useEffect(() => {
    dispatch(fetchAllCoupons(localStorage.getItem("jwt") || ""));
  }, []);

  const bg   = isDark ? "#0f1117" : "#ffffff";
  const bdr  = isDark ? "#1f2937" : "#f1f5f9";
  const txt  = isDark ? "#f9fafb" : "#111827";
  const txt2 = isDark ? "#9ca3af" : "#6b7280";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Header ── */}
      <div style={{
        borderRadius: "16px",
        padding:      "22px 24px",
        background:   bg,
        border:       `1px solid ${bdr}`,
        boxShadow:    isDark
          ? "0 1px 3px rgba(0,0,0,.4)"
          : "0 1px 3px rgba(0,0,0,.06)",
      }}>
        <h1 style={{
          fontSize:   "20px",
          fontWeight: 900,
          color:      txt,
          margin:     "0 0 4px",
        }}>
          🎟️ Coupon Management
        </h1>
        <p style={{ fontSize: "13px", color: txt2, margin: 0 }}>
          Create and manage discount coupons for your customers
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "6px",
                  padding:      "8px 16px",
                  borderRadius: "10px",
                  border:       "none",
                  cursor:       "pointer",
                  fontSize:     "13px",
                  fontWeight:   700,
                  transition:   "all 0.2s ease",
                  background:   isActive
                    ? "linear-gradient(135deg, #6366f1, #a855f7)"
                    : isDark ? "#1e2130" : "#f8fafc",
                  color:        isActive ? "#fff" : txt2,
                  boxShadow:    isActive
                    ? "0 4px 12px rgba(99,102,241,0.35)"
                    : "none",
                  transform:    isActive ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span>{tab.emoji}</span>
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        borderRadius: "16px",
        padding:      "24px",
        background:   bg,
        border:       `1px solid ${bdr}`,
        boxShadow:    isDark
          ? "0 1px 3px rgba(0,0,0,.4)"
          : "0 1px 3px rgba(0,0,0,.06)",
      }}>
        {activeTab === "All Coupons" && <CouponTable />}
        {activeTab === "Create"      && <CreateCouponForm />}
      </div>
    </div>
  );
};

export default Coupon;