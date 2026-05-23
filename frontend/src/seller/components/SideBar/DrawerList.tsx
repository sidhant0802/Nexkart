import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { useAdminTheme } from "../../../admin/context/AdminThemeContext";
import { clearSellerProfile } from "../../../Redux Toolkit/Seller/sellerSlice";
import DashboardIcon           from "@mui/icons-material/Dashboard";
import DashboardOutlinedIcon   from "@mui/icons-material/DashboardOutlined";
import InventoryIcon           from "@mui/icons-material/Inventory";
import InventoryOutlinedIcon   from "@mui/icons-material/InventoryOutlined";
import StorefrontIcon          from "@mui/icons-material/Storefront";
import StorefrontOutlinedIcon  from "@mui/icons-material/StorefrontOutlined";
import AddBoxIcon              from "@mui/icons-material/AddBox";
import AddBoxOutlinedIcon      from "@mui/icons-material/AddBoxOutlined";
import ShoppingBagIcon         from "@mui/icons-material/ShoppingBag";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PaymentsIcon            from "@mui/icons-material/Payments";
import PaymentsOutlinedIcon    from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongIcon         from "@mui/icons-material/ReceiptLong";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PersonIcon              from "@mui/icons-material/Person";
import PersonOutlinedIcon      from "@mui/icons-material/PersonOutlined";
import LogoutIcon              from "@mui/icons-material/Logout";
// ── inject CSS once ──
const injectCSS = () => {
  if (document.getElementById("seller-sidebar-css")) return;
  const style = document.createElement("style");
  style.id = "seller-sidebar-css";
  style.innerHTML = `
    .sk-sidebar-scroll { scrollbar-width: thin; scrollbar-color: #059669 transparent; }
    .sk-sidebar-scroll::-webkit-scrollbar { width: 3px; }
    .sk-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
    .sk-sidebar-scroll::-webkit-scrollbar-thumb { background: #059669; border-radius: 99px; }
    .sk-item-inner { transition: all 0.18s cubic-bezier(.4,0,.2,1); }
    .sk-item-inner:hover { transform: translateX(4px); }
    @keyframes sk-item-in {
      from { opacity:0; transform: translateX(-10px); }
      to   { opacity:1; transform: translateX(0); }
    }
    .sk-item { animation: sk-item-in 0.3s ease forwards; }
    @keyframes sk-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    .sk-shimmer { animation: sk-shimmer 2.5s ease-in-out infinite; }
    @keyframes sk-pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.5; transform:scale(1.5); }
    }
    .sk-pulse { animation: sk-pulse 2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
};

interface DrawerListProps {
  toggleDrawer?: any;
  onCollapse?:   () => void;
}
const MENU = [
  {
    name:       "Dashboard",
    path:       "/seller",
    icon:       <DashboardOutlinedIcon fontSize="small" />,
    activeIcon: <DashboardIcon fontSize="small" />,
  },
  {
    name:       "My Products",
    path:       "/seller/products",
    icon:       <InventoryOutlinedIcon fontSize="small" />,
    activeIcon: <InventoryIcon fontSize="small" />,
  },
  {
    name:       "Marketplace",
    path:       "/seller/marketplace",
    icon:       <StorefrontOutlinedIcon fontSize="small" />,
    activeIcon: <StorefrontIcon fontSize="small" />,
  },
  {
    name:       "Add Product",
    path:       "/seller/add-product",
    icon:       <AddBoxOutlinedIcon fontSize="small" />,
    activeIcon: <AddBoxIcon fontSize="small" />,
  },
  {
    name:       "Orders",
    path:       "/seller/orders",
    icon:       <ShoppingBagOutlinedIcon fontSize="small" />,
    activeIcon: <ShoppingBagIcon fontSize="small" />,
  },
  {
    name:       "Payments",
    path:       "/seller/payment",
    icon:       <PaymentsOutlinedIcon fontSize="small" />,
    activeIcon: <PaymentsIcon fontSize="small" />,
  },
  {
    name:       "Transactions",
    path:       "/seller/transaction",
    icon:       <ReceiptLongOutlinedIcon fontSize="small" />,
    activeIcon: <ReceiptLongIcon fontSize="small" />,
  },
];

const MENU2 = [
  {
    name:       "Profile",
    path:       "/seller/account",
    icon:       <PersonOutlinedIcon fontSize="small" />,
    activeIcon: <PersonIcon fontSize="small" />,
  },
  {
    name:       "Logout",
    path:       "/",
    icon:       <LogoutIcon fontSize="small" />,
    activeIcon: <LogoutIcon fontSize="small" />,
  },
];
const SellerDrawerList = ({ toggleDrawer, onCollapse }: DrawerListProps) => {
  const dispatch  = useAppDispatch();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isDark } = useAdminTheme();
  const seller    = useAppSelector((s) => s.sellers.profile);

  React.useEffect(() => { injectCSS(); }, []);

  // ── theme tokens ──
  const bg      = isDark ? "#0d1117" : "#ffffff";
  const border  = isDark ? "#1f2937" : "#f0fdf4";
  const labelC  = isDark ? "#2d3748" : "#bbf7d0";
  const textC   = isDark ? "#9ca3af" : "#6b7280";
  const hoverBg = isDark ? "#052e16" : "#f0fdf4";
  const hoverC  = isDark ? "#34d399" : "#059669";

  // Green accent for seller
  const accentGrad   = "linear-gradient(135deg, #10b981, #059669)";
  const accentShadow = "0 4px 14px rgba(16,185,129,0.45)";
  const accentColor  = isDark ? "#10b981" : "#059669";

  const handleClick = (item: typeof MENU[0]) => () => {
    if (item.name === "Logout") {
      dispatch(clearSellerProfile());
      localStorage.removeItem("jwt");
      sessionStorage.clear();
      if (toggleDrawer) toggleDrawer(false)();
      setTimeout(() => { window.location.href = "/"; }, 100);
      return;
    }
    navigate(item.path);
    if (toggleDrawer) toggleDrawer(false)();
  };

  const isActive = (item: typeof MENU[0]) => {
    if (item.path === "/seller") {
      return location.pathname === "/seller" || location.pathname === "/seller/";
    }
    return location.pathname.startsWith(item.path);
  };

  // ── MenuItem ──
  const MenuItem = ({ item, index }: { item: typeof MENU[0]; index: number }) => {
    const active = isActive(item);
    const [hov, setHov] = React.useState(false);

    return (
      <div
        className="sk-item"
        style={{
          padding:           "2px 8px",
          cursor:            "pointer",
          animationDelay:    `${index * 35}ms`,
          animationFillMode: "both",
        }}
        onClick={handleClick(item)}
      >
        <div
          className="sk-item-inner"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display:      "flex",
            alignItems:   "center",
            gap:          "10px",
            padding:      "9px 12px",
            borderRadius: "12px",
            position:     "relative",
            overflow:     "hidden",
            background:   active ? accentGrad : hov ? hoverBg : "transparent",
            boxShadow:    active ? "0 4px 16px rgba(16,185,129,0.35)" : "none",
            color:        active ? "#fff" : hov ? hoverC : textC,
          }}
        >
          {/* Shimmer */}
          {active && (
            <div
              className="sk-shimmer"
              style={{
                position:      "absolute", top: 0, left: 0,
                width:         "40%", height: "100%",
                background:    "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Left bar */}
          {active && (
            <span style={{
              position: "absolute", left: 0, top: "50%",
              transform: "translateY(-50%)", width: "3px", height: "54%",
              background: "rgba(255,255,255,0.7)", borderRadius: "0 3px 3px 0",
            }} />
          )}

          {/* Icon */}
          <span style={{
            fontSize: "19px", display: "flex", flexShrink: 0,
            filter: active ? "drop-shadow(0 0 5px rgba(255,255,255,0.4))" : "none",
          }}>
            {active ? item.activeIcon : item.icon}
          </span>

          {/* Label */}
          <span style={{
            fontSize: "13px", fontWeight: active ? 700 : 500,
            flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {item.name}
          </span>

          {/* Pulse dot */}
          {active && (
            <span className="sk-pulse" style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: "rgba(255,255,255,0.85)", flexShrink: 0,
            }} />
          )}
        </div>
      </div>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <p style={{
      fontSize: "9px", fontWeight: 800, letterSpacing: "2.5px",
      textTransform: "uppercase", color: labelC,
      padding: "0 20px", margin: "8px 0 4px", userSelect: "none",
    }}>
      {label}
    </p>
  );

  return (
    <div style={{
      height: "100%", width: "260px", display: "flex",
      flexDirection: "column", background: bg,
      borderRight: `1px solid ${border}`,
    }}>

      {/* ── Brand Header ── */}
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${border}`,
        flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Logo */}
          <div style={{
            width: "38px", height: "38px", borderRadius: "11px",
            background: accentGrad, display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: accentShadow, flexShrink: 0,
            position: "relative", overflow: "hidden",
          }}>
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: 900, zIndex: 1 }}>
              {seller?.sellerName?.[0]?.toUpperCase() || "S"}
            </span>
            <div style={{
              position: "absolute", top: "-10px", left: "-10px",
              width: "28px", height: "28px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
            }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: "14px", fontWeight: 900, letterSpacing: "-0.3px",
              color: isDark ? "#fff" : "#111827", margin: 0, lineHeight: 1.1,
              maxWidth: "160px", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {seller?.businessDetails?.businessName || seller?.sellerName || "My Store"}
            </p>
            <p style={{
              fontSize: "9px", fontWeight: 700, letterSpacing: "2px",
              textTransform: "uppercase", color: accentColor, margin: 0,
            }}>
              Seller Panel
            </p>
          </div>
        </div>

        {onCollapse && (
          <button
            onClick={onCollapse}
            style={{
              width: "28px", height: "28px", borderRadius: "8px",
              border: "none", cursor: "pointer",
              background: isDark ? "#1f2937" : "#f0fdf4",
              color: isDark ? "#9ca3af" : "#6b7280",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "14px",
            }}
          >◀</button>
        )}
      </div>

      {/* ── Seller info chip ── */}
      {seller && (
        <div style={{
          margin: "10px 12px 0",
          padding: "8px 12px",
          borderRadius: "10px",
          background: isDark ? "#052e16" : "#f0fdf4",
          border: `1px solid ${isDark ? "#064e3b" : "#bbf7d0"}`,
        }}>
          <p style={{ fontSize: "11px", color: accentColor, fontWeight: 700, margin: 0 }}>
            {seller.email}
          </p>
          <p style={{ fontSize: "10px", color: textC, margin: "2px 0 0" }}>
            {seller.accountStatus}
          </p>
        </div>
      )}

      {/* ── Scrollable menu ── */}
      <div className="sk-sidebar-scroll" style={{
        flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0",
      }}>
        <SectionLabel label="Main Menu" />
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {MENU.map((item, i) => (
            <MenuItem key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* ── Account / Logout ── */}
      <div style={{ flexShrink: 0, borderTop: `1px solid ${border}`, padding: "8px 0 4px" }}>
        <SectionLabel label="Account" />
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {MENU2.map((item, i) => (
            <MenuItem key={item.name} item={item} index={i} />
          ))}
        </div>
        <p style={{
          fontSize: "10px", color: isDark ? "#1e2937" : "#d1fae5",
          padding: "8px 20px 4px", margin: 0,
        }}>
          Nexkart Seller v1.0.0
        </p>
      </div>
    </div>
  );
};

export default SellerDrawerList;