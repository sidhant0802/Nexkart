import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { deleteCoupon }                   from "../../../Redux Toolkit/Admin/AdminCouponSlice";
import type { Coupon }                    from "../../../types/couponTypes";
import { useState }                       from "react";

const fmt = (d: any) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
};

export default function CouponTable() {
  const adminCoupon = useAppSelector((s) => s.adminCoupon);
  const dispatch    = useAppDispatch();
  const [search, setSearch] = useState("");

  const filtered = (adminCoupon.coupons ?? []).filter((c: Coupon) =>
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this coupon?")) {
      dispatch(deleteCoupon({ id, jwt: localStorage.getItem("jwt") || "" }));
    }
  };

  const isExpired = (end: any) => end && new Date(end) < new Date();
const isActive  = (c: Coupon) => c.isActive && !isExpired(c.validityEndDate);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Search bar */}
      <div style={{ position: "relative", maxWidth: "340px" }}>
        <span
          style={{
            position:  "absolute",
            left:      "12px",
            top:       "50%",
            transform: "translateY(-50%)",
            fontSize:  "16px",
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search coupon code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width:        "100%",
            padding:      "9px 12px 9px 36px",
            borderRadius: "10px",
            border:       "1px solid #e5e7eb",
            fontSize:     "13px",
            outline:      "none",
            background:   "#f9fafb",
            boxSizing:    "border-box",
          }}
        />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[
          {
            label: "Total",
            value: adminCoupon.coupons?.length ?? 0,
            color: "#6366f1",
            emoji: "🎟️",
          },
          {
            label: "Active",
            value: (adminCoupon.coupons ?? []).filter((c: Coupon) => isActive(c)).length,
            color: "#10b981",
            emoji: "✅",
          },
          {
            label: "Expired",
            value: (adminCoupon.coupons ?? []).filter((c: Coupon) => isExpired(c.validityEndDate)).length,
            color: "#ef4444",
            emoji: "❌",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "8px",
              padding:      "8px 14px",
              borderRadius: "10px",
              background:   `${s.color}12`,
              border:       `1px solid ${s.color}30`,
            }}
          >
            <span>{s.emoji}</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: s.color }}>
              {s.value} {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign:    "center",
            padding:      "60px 20px",
            borderRadius: "16px",
            background:   "#f9fafb",
            border:       "1px dashed #e5e7eb",
          }}
        >
          <p style={{ fontSize: "40px", margin: "0 0 8px" }}>🎟️</p>
          <p style={{ color: "#9ca3af", fontWeight: 600 }}>No coupons found</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr
                style={{
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  color:      "#fff",
                }}
              >
                {["Code", "Start Date", "End Date", "Min Order", "Discount %", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding:   "12px 16px",
                        fontSize:  "11px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        textAlign: h === "" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon: Coupon, i: number) => {
                const active  = isActive(coupon);
                const expired = isExpired(coupon.validityEndDate);
                const rowBg   = i % 2 === 0 ? "#ffffff" : "#fafafa";

                return (
                  <tr
                    key={coupon._id}
                    style={{
                      background:  rowBg,
                      borderBottom: "1px solid #f1f5f9",
                      transition:  "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = "#eef2ff")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = rowBg)
                    }
                  >
                    {/* Code */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontFamily:   "monospace",
                          fontWeight:   800,
                          fontSize:     "13px",
                          background:   "linear-gradient(135deg,#6366f1,#a855f7)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor:  "transparent",
                          letterSpacing: "1px",
                        }}
                      >
                        {coupon.code}
                      </span>
                    </td>

                    {/* Dates */}
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                      {fmt(coupon.validityStartDate)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: expired ? "#ef4444" : "#6b7280" }}>
                      {fmt(coupon.validityEndDate)}
                    </td>

                    {/* Min order */}
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151", fontWeight: 600 }}>
                      ₹{coupon.minimumOrderValue?.toLocaleString()}
                    </td>

                    {/* Discount */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display:      "inline-flex",
                          alignItems:   "center",
                          gap:          "4px",
                          padding:      "3px 10px",
                          borderRadius: "999px",
                          background:   "#fef3c7",
                          color:        "#d97706",
                          fontWeight:   800,
                          fontSize:     "12px",
                        }}
                      >
                        🏷️ {coupon.discountPercentage}% OFF
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display:      "inline-flex",
                          alignItems:   "center",
                          gap:          "5px",
                          padding:      "3px 10px",
                          borderRadius: "999px",
                          fontSize:     "11px",
                          fontWeight:   700,
                          background:   active ? "#d1fae5" : expired ? "#fee2e2" : "#f3f4f6",
                          color:        active ? "#059669" : expired ? "#dc2626" : "#6b7280",
                        }}
                      >
                        <span
                          style={{
                            width:        "6px",
                            height:       "6px",
                            borderRadius: "50%",
                            background:   active ? "#10b981" : expired ? "#ef4444" : "#9ca3af",
                          }}
                        />
                        {active ? "Active" : expired ? "Expired" : "Inactive"}
                      </span>
                    </td>

                    {/* Delete */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        style={{
                          padding:      "6px 12px",
                          borderRadius: "8px",
                          border:       "none",
                          cursor:       "pointer",
                          fontSize:     "12px",
                          fontWeight:   700,
                          background:   "#fee2e2",
                          color:        "#dc2626",
                          transition:   "all 0.15s",
                          display:      "inline-flex",
                          alignItems:   "center",
                          gap:          "4px",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#ef4444";
                          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2";
                          (e.currentTarget as HTMLButtonElement).style.color = "#dc2626";
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}