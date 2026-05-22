import * as React from "react";
import { Avatar, Menu, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
  fetchSellers,
  updateSellerAccountStatus,
} from "../../../Redux Toolkit/Seller/sellerSlice";

const STATUSES = [
  { status: "PENDING_VERIFICATION", label: "Pending",     color: "#f59e0b", bg: "#fef3c7" },
  { status: "ACTIVE",               label: "Active",      color: "#10b981", bg: "#d1fae5" },
  { status: "SUSPENDED",            label: "Suspended",   color: "#ef4444", bg: "#fee2e2" },
  { status: "DEACTIVATED",          label: "Deactivated", color: "#6b7280", bg: "#f3f4f6" },
  { status: "BANNED",               label: "Banned",      color: "#dc2626", bg: "#fee2e2" },
  { status: "CLOSED",               label: "Closed",      color: "#6b7280", bg: "#f3f4f6" },
];

const getStatus = (s: string) =>
  STATUSES.find((x) => x.status === s) ?? STATUSES[3];

// inject CSS once
const injectCSS = () => {
  if (document.getElementById("sellers-css")) return;
  const style = document.createElement("style");
  style.id = "sellers-css";
  style.innerHTML = `
    @keyframes sk-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .sk-row { animation: sk-fade .25s ease forwards; }
    .sk-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,.12)!important; }
    .sk-card { transition: all .2s ease; }
    .sk-btn:hover { opacity:.85; transform:scale(.97); }
    .sk-btn { transition: all .15s; }
  `;
  document.head.appendChild(style);
};

export default function SellersTable() {
  React.useEffect(() => { injectCSS(); }, []);

  const dispatch  = useAppDispatch();
  const sellers   = useAppSelector((s) => s.sellers);

  const [filter,  setFilter]  = React.useState("ACTIVE");
  const [search,  setSearch]  = React.useState("");
  const [menuEl,  setMenuEl]  = React.useState<{ [id: string]: HTMLElement | null }>({});
  const [view,    setView]    = React.useState<"grid" | "table">("table");

  React.useEffect(() => {
    dispatch(fetchSellers(filter));
  }, [filter]);

  const filtered = (sellers.sellers ?? []).filter((s: any) =>
    `${s.sellerName} ${s.email} ${s.businessDetails?.businessName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openMenu  = (e: React.MouseEvent<HTMLElement>, id: string) =>
    setMenuEl((p) => ({ ...p, [id]: e.currentTarget }));
  const closeMenu = (id: string) =>
    setMenuEl((p) => ({ ...p, [id]: null }));
  const changeStatus = (id: any, status: string) => {
    dispatch(updateSellerAccountStatus({ id, status }));
    closeMenu(id);
  };

  const StatBadge = ({ count, label, color }: any) => (
    <div style={{
      display:"flex", alignItems:"center", gap:"6px",
      padding:"8px 14px", borderRadius:"10px",
      background:`${color}12`, border:`1px solid ${color}25`,
    }}>
      <span style={{ fontSize:"18px", fontWeight:900, color }}>{count}</span>
      <span style={{ fontSize:"11px", fontWeight:600, color:"#6b7280" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* ── Header ── */}
      <div style={{
        borderRadius:"16px", padding:"22px 24px",
        background:"#fff", border:"1px solid #f1f5f9",
        boxShadow:"0 1px 3px rgba(0,0,0,.06)",
      }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"12px", marginBottom:"16px" }}>
          <div>
            <h1 style={{ fontSize:"20px", fontWeight:900, color:"#111827", margin:"0 0 4px" }}>
              🏪 Sellers Management
            </h1>
            <p style={{ fontSize:"13px", color:"#9ca3af", margin:0 }}>
              Monitor and control all seller accounts
            </p>
          </div>

          {/* View toggle */}
          <div style={{ display:"flex", gap:"6px" }}>
            {(["table","grid"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className="sk-btn" style={{
                padding:"7px 14px", borderRadius:"9px", border:"none",
                cursor:"pointer", fontSize:"12px", fontWeight:700,
                background: view===v ? "linear-gradient(135deg,#6366f1,#a855f7)" : "#f8fafc",
                color: view===v ? "#fff" : "#6b7280",
                boxShadow: view===v ? "0 4px 12px rgba(99,102,241,.3)" : "none",
              }}>
                {v === "table" ? "☰ Table" : "⊞ Grid"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"16px" }}>
          <StatBadge count={sellers.sellers?.length ?? 0} label="Total"    color="#6366f1" />
          <StatBadge count={(sellers.sellers??[]).filter((s:any)=>s.accountStatus==="ACTIVE").length}      label="Active"    color="#10b981" />
          <StatBadge count={(sellers.sellers??[]).filter((s:any)=>s.accountStatus==="SUSPENDED").length}   label="Suspended" color="#ef4444" />
          <StatBadge count={(sellers.sellers??[]).filter((s:any)=>s.accountStatus==="PENDING_VERIFICATION").length} label="Pending" color="#f59e0b" />
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
          {/* Search */}
          <div style={{ position:"relative", flex:1, minWidth:"220px" }}>
            <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", fontSize:"15px" }}>🔍</span>
            <input
              placeholder="Search by name, email or business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width:"100%", padding:"9px 12px 9px 36px",
                borderRadius:"10px", border:"1px solid #e5e7eb",
                fontSize:"13px", outline:"none", background:"#f9fafb",
                boxSizing:"border-box",
              }}
            />
          </div>

          {/* Status filter pills */}
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {STATUSES.map((s) => (
              <button key={s.status} onClick={() => setFilter(s.status)} className="sk-btn" style={{
                padding:"7px 12px", borderRadius:"9px", border:"none",
                cursor:"pointer", fontSize:"11px", fontWeight:700,
                background: filter===s.status ? s.bg : "#f8fafc",
                color: filter===s.status ? s.color : "#9ca3af",
                border: `1.5px solid ${filter===s.status ? s.color+"40" : "transparent"}`,
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Empty ── */}
      {sellers.loading ? (
        <div style={{ textAlign:"center", padding:"60px", color:"#9ca3af", fontSize:"14px" }}>
          ⏳ Loading sellers...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign:"center", padding:"60px 20px",
          borderRadius:"16px", background:"#f9fafb",
          border:"1px dashed #e5e7eb",
        }}>
          <p style={{ fontSize:"40px", margin:"0 0 8px" }}>🏪</p>
          <p style={{ color:"#9ca3af", fontWeight:600 }}>No sellers found</p>
        </div>
      ) : view === "table" ? (

        /* ── TABLE VIEW ── */
        <div style={{ overflowX:"auto", borderRadius:"16px", border:"1px solid #f1f5f9", background:"#fff" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"800px" }}>
            <thead>
              <tr style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>
                {["Seller","Email","Mobile","GSTIN","Business","Status","Action"].map((h) => (
                  <th key={h} style={{
                    padding:"13px 16px", fontSize:"11px", fontWeight:700,
                    letterSpacing:"1px", textTransform:"uppercase",
                    color:"rgba(255,255,255,.9)", textAlign:"left", whiteSpace:"nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((seller: any, i: number) => {
                const st  = getStatus(seller.accountStatus);
                const id  = String(seller._id ?? i);
                const rowBg = i % 2 === 0 ? "#fff" : "#fafafa";
                return (
                  <tr key={id} className="sk-row"
                    style={{ background:rowBg, borderBottom:"1px solid #f1f5f9",
                      animationDelay:`${i*30}ms`, animationFillMode:"both",
                      transition:"background .15s",
                    }}
                    onMouseEnter={(e)=>((e.currentTarget as HTMLTableRowElement).style.background="#eef2ff")}
                    onMouseLeave={(e)=>((e.currentTarget as HTMLTableRowElement).style.background=rowBg)}
                  >
                    {/* Seller */}
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        <Avatar sx={{
                          width:34, height:34,
                          background:"linear-gradient(135deg,#6366f1,#a855f7)",
                          fontSize:"13px", fontWeight:900,
                        }}>
                          {seller.sellerName?.charAt(0)?.toUpperCase() ?? "S"}
                        </Avatar>
                        <span style={{ fontSize:"13px", fontWeight:600, color:"#111827" }}>
                          {seller.sellerName ?? "—"}
                        </span>
                      </div>
                    </td>
                    {/* Email */}
                    <td style={{ padding:"12px 16px", fontSize:"13px", color:"#6b7280" }}>
                      {seller.email ?? "—"}
                    </td>
                    {/* Mobile */}
                    <td style={{ padding:"12px 16px", fontSize:"13px", color:"#6b7280" }}>
                      {seller.mobile ?? "—"}
                    </td>
                    {/* GSTIN */}
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{
                        fontFamily:"monospace", fontSize:"11px",
                        background:"#f3f4f6", color:"#374151",
                        padding:"3px 8px", borderRadius:"6px",
                      }}>
                        {seller.GSTIN ?? "—"}
                      </span>
                    </td>
                    {/* Business */}
                    <td style={{ padding:"12px 16px", fontSize:"13px", color:"#6b7280" }}>
                      {seller.businessDetails?.businessName ?? "—"}
                    </td>
                    {/* Status */}
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:"5px",
                        padding:"3px 10px", borderRadius:"999px",
                        fontSize:"11px", fontWeight:700,
                        background:st.bg, color:st.color,
                      }}>
                        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:st.color }} />
                        {st.label}
                      </span>
                    </td>
                    {/* Action */}
                    <td style={{ padding:"12px 16px" }}>
                      <button
                        className="sk-btn"
                        onClick={(e) => openMenu(e, id)}
                        style={{
                          padding:"6px 12px", borderRadius:"8px",
                          border:"none", cursor:"pointer",
                          fontSize:"12px", fontWeight:700,
                          background:"#f1f5f9", color:"#374151",
                          display:"inline-flex", alignItems:"center", gap:"4px",
                        }}
                      >
                        ⚙️ Actions
                      </button>
                      <Menu
                        anchorEl={menuEl[id]}
                        open={Boolean(menuEl[id])}
                        onClose={() => closeMenu(id)}
                        PaperProps={{ sx:{ borderRadius:"12px", minWidth:180, boxShadow:"0 4px 20px rgba(0,0,0,.12)" } }}
                      >
                        <div style={{ padding:"8px 12px 4px", fontSize:"10px", fontWeight:800, letterSpacing:"1.5px", textTransform:"uppercase", color:"#9ca3af" }}>
                          Change Status
                        </div>
                        {STATUSES.map((s) => (
                          <MenuItem key={s.status}
                            onClick={() => changeStatus(seller._id, s.status)}
                            disabled={seller.accountStatus === s.status}
                            sx={{ fontSize:"13px", borderRadius:"8px", mx:1, my:.3 }}
                          >
                            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:s.color, marginRight:"8px", display:"inline-block" }} />
                            {s.label}
                          </MenuItem>
                        ))}
                      </Menu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (

        /* ── GRID VIEW ── */
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"14px" }}>
          {filtered.map((seller: any, i: number) => {
            const st = getStatus(seller.accountStatus);
            const id = String(seller._id ?? i);
            return (
              <div key={id} className="sk-card sk-row" style={{
                borderRadius:"16px", background:"#fff",
                border:"1px solid #f1f5f9", overflow:"hidden",
                boxShadow:"0 1px 3px rgba(0,0,0,.06)",
                animationDelay:`${i*30}ms`, animationFillMode:"both",
              }}>
                {/* Card top */}
                <div style={{
                  height:"64px",
                  background:"linear-gradient(135deg,#6366f1,#a855f7)",
                  position:"relative",
                }} />

                {/* Avatar */}
                <div style={{ padding:"0 16px", marginTop:"-24px", marginBottom:"12px" }}>
                  <Avatar sx={{
                    width:48, height:48,
                    background:"linear-gradient(135deg,#6366f1,#a855f7)",
                    fontSize:"18px", fontWeight:900,
                    border:"3px solid #fff",
                    boxShadow:"0 2px 8px rgba(99,102,241,.3)",
                  }}>
                    {seller.sellerName?.charAt(0)?.toUpperCase() ?? "S"}
                  </Avatar>
                </div>

                <div style={{ padding:"0 16px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
                    <h3 style={{ fontSize:"14px", fontWeight:800, color:"#111827", margin:0 }}>
                      {seller.sellerName ?? "—"}
                    </h3>
                    <span style={{
                      padding:"2px 8px", borderRadius:"999px",
                      fontSize:"10px", fontWeight:700,
                      background:st.bg, color:st.color,
                    }}>
                      {st.label}
                    </span>
                  </div>

                  <p style={{ fontSize:"12px", color:"#9ca3af", margin:"0 0 2px" }}>{seller.email ?? "—"}</p>
                  {seller.businessDetails?.businessName && (
                    <p style={{ fontSize:"12px", color:"#6366f1", fontWeight:600, margin:"0 0 8px" }}>
                      🏪 {seller.businessDetails.businessName}
                    </p>
                  )}

                  <div style={{
                    display:"flex", gap:"6px", paddingTop:"10px",
                    borderTop:"1px solid #f1f5f9",
                  }}>
                    {STATUSES.slice(0,3).map((s) => (
                      <button key={s.status}
                        onClick={() => changeStatus(seller._id, s.status)}
                        disabled={seller.accountStatus === s.status}
                        className="sk-btn"
                        style={{
                          flex:1, padding:"6px 4px",
                          borderRadius:"8px", border:"none",
                          cursor: seller.accountStatus===s.status ? "default" : "pointer",
                          fontSize:"10px", fontWeight:700,
                          background: seller.accountStatus===s.status ? s.bg : "#f8fafc",
                          color: seller.accountStatus===s.status ? s.color : "#9ca3af",
                          opacity: seller.accountStatus===s.status ? 1 : .7,
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
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