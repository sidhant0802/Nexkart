import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerRoutes     from "../../../routes/SellerRoutes";
import Navbar           from "../../../admin seller/components/navbar/Navbar";
import SellerDrawerList from "../../components/SideBar/DrawerList";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchSellerProfile } from "../../../Redux Toolkit/Seller/sellerSlice";
import { useAdminTheme } from "../../../admin/context/AdminThemeContext";

const SellerDashboard = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const jwt        = localStorage.getItem("jwt");
  const seller     = useAppSelector((s) => s.sellers.profile);
  const sellerAuth = useAppSelector((s) => s.sellerAuth);
  const { isDark } = useAdminTheme();

  // ✅ Sidebar state — desktop collapse + mobile drawer
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    if (jwt && !seller) {
      dispatch(fetchSellerProfile(jwt));
    }
    if (!jwt && !sellerAuth.jwt) {
      navigate("/become-seller");
    }
  }, [jwt]);

  const toggleSidebar = () => {
    // On mobile → open drawer
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen((v) => !v);
    } else {
      // On desktop → collapse
      setSidebarOpen((v) => !v);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: isDark ? "#0a0a0f" : "#f9fafb",
    }}>
      <Navbar
        DrawerList={SellerDrawerList}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      
      <section style={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
      }}>
        {/* Desktop sidebar (toggleable) */}
        <div style={{
          width:      sidebarOpen ? 260 : 0,
          minWidth:   sidebarOpen ? 260 : 0,
          transition: "width 0.3s ease, min-width 0.3s ease",
          overflow:   "hidden",
          display:    window.innerWidth >= 1024 ? "block" : "none",
        }} className="hidden lg:block">
          {sidebarOpen && <SellerDrawerList />}
        </div>

        {/* Mobile drawer */}
        {mobileDrawerOpen && (
          <>
            <div
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 999,
              }}
              className="lg:hidden"
            />
            <div style={{
              position: "fixed",
              top: 0, left: 0, bottom: 0,
              zIndex: 1000,
              background: isDark ? "#0d1117" : "#fff",
              boxShadow: "4px 0 24px rgba(0,0,0,0.2)",
            }} className="lg:hidden">
              <SellerDrawerList toggleDrawer={() => () => setMobileDrawerOpen(false)} />
            </div>
          </>
        )}

        {/* Main content */}
        <div style={{
          flex: 1,
          padding: 24,
          overflowY: "auto",
          maxHeight: "calc(100vh - 64px)",
        }}>
          <SellerRoutes />
        </div>
      </section>
    </div>
  );
};

export default SellerDashboard;