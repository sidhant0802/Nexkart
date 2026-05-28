import { useEffect, useRef, useState, useCallback } from "react";
import AdminRoutes               from "../../../routes/AdminRoutes";
import Navbar                    from "../../../admin seller/components/navbar/Navbar";
import AdminDrawerList           from "../../components/DrawerList";
import { Alert, Snackbar }       from "@mui/material";
import { useAppSelector }        from "../../../Redux Toolkit/Store";
import {
  AdminThemeProvider,
  useAdminTheme,
} from "../../context/AdminThemeContext";

// ── inject CSS once ──
const injectCSS = () => {
  if (document.getElementById("nk-dashboard-css")) return;
  const s = document.createElement("style");
  s.id = "nk-dashboard-css";
  s.innerHTML = `
    /* Sidebar slide in/out */
    @keyframes nk-slide-in {
      from { transform: translateX(-100%); opacity: 0; }
      to   { transform: translateX(0);     opacity: 1; }
    }
    @keyframes nk-slide-out {
      from { transform: translateX(0);     opacity: 1; }
      to   { transform: translateX(-100%); opacity: 0; }
    }
    .nk-sidebar-in  { animation: nk-slide-in  0.32s cubic-bezier(.4,0,.2,1) forwards; }
    .nk-sidebar-out { animation: nk-slide-out 0.28s cubic-bezier(.4,0,.2,1) forwards; }

    /* Toggle button pulse */
    @keyframes nk-toggle-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
      50%      { box-shadow: 0 0 0 8px rgba(99,102,241,0);  }
    }
    .nk-toggle-btn { animation: nk-toggle-pulse 2.5s ease-in-out infinite; }
    .nk-toggle-btn:hover { transform: scale(1.1) !important; }

    /* Overlay fade */
    @keyframes nk-overlay-in  { from{opacity:0} to{opacity:1} }
    @keyframes nk-overlay-out { from{opacity:1} to{opacity:0} }
    .nk-overlay-in  { animation: nk-overlay-in  0.25s ease forwards; }
    .nk-overlay-out { animation: nk-overlay-out 0.22s ease forwards; }

    /* Main content shift */
    .nk-main { transition: margin-left 0.32s cubic-bezier(.4,0,.2,1); }

    /* Scrollbar for main */
    .nk-main::-webkit-scrollbar { width: 5px; }
    .nk-main::-webkit-scrollbar-track { background: transparent; }
    .nk-main::-webkit-scrollbar-thumb { background: #6366f130; border-radius: 99px; }
    .nk-main::-webkit-scrollbar-thumb:hover { background: #6366f160; }
  `;
  document.head.appendChild(s);
};

const AdminLayout = () => {
  const deal  = useAppSelector((s) => s.deal);
  const admin = useAppSelector((s) => s.admin);
  const { isDark } = useAdminTheme();

  // sidebar open/close state
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [animClass,      setAnimClass]      = useState("nk-sidebar-in");
  const [overlayClass,   setOverlayClass]   = useState("");
  const [showOverlay,    setShowOverlay]    = useState(false);
  const [snackbarOpen,   setSnackbarOpen]   = useState(false);

  // scroll-to-hide on desktop
  const lastScrollY  = useRef(0);
  const mainRef      = useRef<HTMLDivElement>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { injectCSS(); }, []);

  // ── open sidebar ──
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    setAnimClass("nk-sidebar-in");
    setShowOverlay(true);
    setOverlayClass("nk-overlay-in");
  }, []);

  // ── close sidebar (with animation) ──
  const closeSidebar = useCallback(() => {
    setAnimClass("nk-sidebar-out");
    setOverlayClass("nk-overlay-out");
    setTimeout(() => {
      setSidebarOpen(false);
      setShowOverlay(false);
    }, 280);
  }, []);

  // ── toggle ──
  const toggleSidebar = useCallback(() => {
    if (sidebarOpen) closeSidebar();
    else             openSidebar();
  }, [sidebarOpen, openSidebar, closeSidebar]);

  // ── scroll-to-hide: hide sidebar when scrolling DOWN, show when scrolling UP ──
  const handleScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;

    const currentY = el.scrollTop;
    const diff     = currentY - lastScrollY.current;

    // scrolling DOWN > 40px → close sidebar
    if (diff > 40 && sidebarOpen) {
      closeSidebar();
    }
    // scrolling UP > 20px → open sidebar
    if (diff < -20 && !sidebarOpen) {
      openSidebar();
    }

    lastScrollY.current = currentY;
  }, [sidebarOpen, openSidebar, closeSidebar]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // snackbar
  useEffect(() => {
    if (deal.dealCreated || deal.dealUpdated || deal.error || admin.categoryUpdated) {
      setSnackbarOpen(true);
    }
  }, [deal.dealCreated, deal.dealUpdated, deal.error, admin.categoryUpdated]);

  const bg      = isDark ? "#080b12" : "#f8fafc";
  const sidebarW = 260;

  return (
    <div style={{
      minHeight:      "100vh",
      display:        "flex",
      flexDirection:  "column",
      background:     bg,
      color:          isDark ? "#f9fafb" : "#111827",
      transition:     "background 0.3s ease, color 0.3s ease",
      overflow:       "hidden",
    }}>

      {/* ── Navbar ── */}
      <Navbar
        DrawerList={AdminDrawerList}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>

        {/* ── Desktop Sidebar ── */}
        <aside
          className={`hidden lg:block ${animClass}`}
          style={{
            position:   "fixed",
            top:        "64px",
            left:       0,
            height:     "calc(100vh - 64px)",
            width:      `${sidebarW}px`,
            zIndex:     50,
            flexShrink: 0,
            overflowY:  "auto",
            overflowX:  "hidden",
          }}
        >
          <AdminDrawerList onCollapse={closeSidebar} />
        </aside>

        {/* ── Mobile Overlay ── */}
        {showOverlay && (
          <div
            className={`lg:hidden ${overlayClass}`}
            onClick={closeSidebar}
            style={{
              position:   "fixed",
              inset:      0,
              zIndex:     40,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
            }}
          />
        )}

        {/* ── Main Content ── */}
        <main
          ref={mainRef}
          className="nk-main"
          style={{
            flex:        1,
            overflowY:   "auto",
            overflowX:   "hidden",
            padding:     "24px",
            minWidth:    0,
            marginLeft:  sidebarOpen ? `${sidebarW}px` : "0px",
          }}
        >
          <AdminRoutes />
        </main>
      </div>

      {/* ── Floating Toggle Button ── */}
      <button
        className="nk-toggle-btn hidden lg:flex"
        onClick={toggleSidebar}
        title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        style={{
          position:       "fixed",
          bottom:         "32px",
          left:           sidebarOpen ? `${sidebarW - 18}px` : "16px",
          zIndex:         60,
          width:          "36px",
          height:         "36px",
          borderRadius:   "50%",
          border:         "none",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       "16px",
          background:     "linear-gradient(135deg, #6366f1, #a855f7)",
          color:          "#fff",
          boxShadow:      "0 4px 16px rgba(99,102,241,0.5)",
          transition:     "left 0.32s cubic-bezier(.4,0,.2,1), transform 0.2s",
        }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* ── Snackbar ── */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={deal.error ? "error" : "success"}
          variant="filled"
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {deal.error
            ? deal.error
            : deal.dealCreated
            ? "✅ Deal created successfully"
            : deal.dealUpdated
            ? "✅ Deal updated successfully"
            : admin.categoryUpdated
            ? "✅ Category updated successfully"
            : ""}
        </Alert>
      </Snackbar>
    </div>
  );
};

const AdminDashboard = () => (
  <AdminThemeProvider>
    <AdminLayout />
  </AdminThemeProvider>
);

export default AdminDashboard;