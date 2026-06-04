import { useState }                  from "react";
import MenuIcon                      from "@mui/icons-material/Menu";
import DarkModeIcon                  from "@mui/icons-material/DarkMode";
import LightModeIcon                 from "@mui/icons-material/LightMode";
import { Drawer, IconButton, Avatar } from "@mui/material";
import { useLocation }               from "react-router-dom";
import { useAdminTheme }             from "../../../admin/context/AdminThemeContext";
import { useAppSelector }            from "../../../Redux Toolkit/Store";
import SellerNotificationBell        from "../../../admin/pages/Analytics/SellerNotificationBell";

interface NavbarProps {
  DrawerList:       any;
  onToggleSidebar?: () => void;
  sidebarOpen?:     boolean;
}

const Navbar = ({ DrawerList, onToggleSidebar, sidebarOpen }: NavbarProps) => {
  const location                = useLocation();
  const [open, setOpen]         = useState(false);
  const { isDark, toggleTheme } = useAdminTheme();

  const isSeller      = location.pathname.startsWith("/seller");
  const sellerProfile = useAppSelector((s) => s.sellers.profile);
  const adminUser     = useAppSelector((s) => s.user.user);

  const panelInfo = isSeller
    ? {
        title:    "Nexkart",
        subtitle: "Seller Panel",
        name:     sellerProfile?.sellerName                      || "Seller",
        role:     sellerProfile?.businessDetails?.businessName   || "Store Owner",
        avatar:   (sellerProfile?.sellerName?.[0]               || "S").toUpperCase(),
      }
    : {
        title:    "Nexkart",
        subtitle: "Admin Panel",
        name:     adminUser?.fullName || "Admin",
        role:     "Super Admin",
        avatar:   (adminUser?.fullName?.[0] || "A").toUpperCase(),
      };

  const toggleDrawer = (newOpen: boolean) => () => setOpen(newOpen);

  const btn = {
    borderRadius:    "10px",
    padding:         "8px",
    backgroundColor: isDark ? "#1e2130" : "#f8fafc",
    "&:hover":       { backgroundColor: isDark ? "#2a2f45" : "#f1f5f9" },
    transition:      "all 0.2s",
  };

  return (
    <header style={{
      height:         "64px",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 16px 0 20px",
      position:       "sticky",
      top:            0,
      zIndex:         100,
      background:     isDark ? "rgba(15,17,23,0.96)" : "rgba(255,255,255,0.96)",
      backdropFilter: "blur(14px)",
      borderBottom:   `1px solid ${isDark ? "#1f2937" : "#f1f5f9"}`,
      boxShadow:      isDark
        ? "0 1px 0 rgba(255,255,255,0.04)"
        : "0 1px 0 rgba(0,0,0,0.05)",
    }}>

      {/* ── Left — Hamburger + Logo ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <IconButton onClick={onToggleSidebar || toggleDrawer(true)} sx={btn}>
          <MenuIcon sx={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
        </IconButton>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width:          "38px",
            height:         "38px",
            borderRadius:   "11px",
            background:     isSeller
              ? "linear-gradient(135deg, #10b981, #14b8a6)"
              : "linear-gradient(135deg, #6366f1, #a855f7)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            boxShadow:      isSeller
              ? "0 4px 14px rgba(16,185,129,0.45)"
              : "0 4px 14px rgba(99,102,241,0.45)",
          }}>
            <span style={{ color: "#fff", fontSize: "16px", fontWeight: 900 }}>N</span>
          </div>

          <div>
            <p style={{
              fontSize:   "15px",
              fontWeight: 900,
              color:      isDark ? "#fff" : "#111827",
              margin:     0,
              lineHeight: 1,
            }}>
              {panelInfo.title}
            </p>
            <p style={{
              fontSize:      "9px",
              fontWeight:    700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color:         isSeller
                ? (isDark ? "#10b981" : "#14b8a6")
                : (isDark ? "#6366f1" : "#818cf8"),
              margin: 0,
            }}>
              {panelInfo.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Right — Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* Theme toggle */}
        <IconButton onClick={toggleTheme} sx={btn}>
          {isDark
            ? <LightModeIcon sx={{ color: "#fbbf24", fontSize: 20 }} />
            : <DarkModeIcon  sx={{ color: "#6366f1", fontSize: 20 }} />}
        </IconButton>

        {/* ✅ Seller Notification Bell — only show in admin panel */}
        {!isSeller && <SellerNotificationBell />}

        {/* User profile chip */}
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "10px",
          padding:      "5px 12px 5px 5px",
          borderRadius: "999px",
          background:   isDark ? "#1e2130" : "#f8fafc",
          cursor:       "pointer",
          border:       `1px solid ${isDark ? "#1f2937" : "#e5e7eb"}`,
          transition:   "all .2s",
        }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#6366f1";
            (e.currentTarget as HTMLDivElement).style.boxShadow  =
              "0 0 0 3px rgba(99,102,241,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor =
              isDark ? "#1f2937" : "#e5e7eb";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <Avatar sx={{
            width:      32,
            height:     32,
            background: isSeller
              ? "linear-gradient(135deg, #10b981, #14b8a6)"
              : "linear-gradient(135deg, #6366f1, #a855f7)",
            fontSize:   14,
            fontWeight: 700,
          }}>
            {panelInfo.avatar}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize:     "13px",
              fontWeight:   700,
              color:        isDark ? "#fff" : "#111827",
              margin:       0,
              lineHeight:   1.1,
              maxWidth:     "140px",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {panelInfo.name}
            </p>
            <p style={{
              fontSize:     "10px",
              color:        isDark ? "#9ca3af" : "#6b7280",
              margin:       0,
              maxWidth:     "140px",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {panelInfo.role}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <DrawerList toggleDrawer={toggleDrawer} />
      </Drawer>
    </header>
  );
};

export default Navbar;