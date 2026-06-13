// frontend/src/App.tsx
import './App.css';
import { ThemeProvider } from '@emotion/react';
import customeTheme from './Theme/customeTheme';

import { Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import SellerDashboard            from './seller/pages/SellerDashboard/SellerDashboard';
import CustomerRoutes             from './routes/CustomerRoutes';
import AdminDashboard             from './admin/pages/Dashboard/Dashboard';
import SellerAccountVerification  from './seller/pages/SellerAccountVerification';
import SellerAccountVerified      from './seller/pages/SellerAccountVerified';
import BecomeSeller               from './customer/pages/BecomeSeller/BecomeSeller';
import AdminAuth                  from './admin/pages/Auth/AdminAuth';
import UnauthorizedRedirect       from './admin/pages/AccessDenied/UnauthorizedRedirect';
import ScrollToTop                from './customer/components/ScrollToTop/ScrollToTop';

import { useAppDispatch, useAppSelector } from './Redux Toolkit/Store';
import { fetchSellerProfile }     from './Redux Toolkit/Seller/sellerSlice';
import { fetchUserProfile }       from './Redux Toolkit/Customer/UserSlice';
import { fetchUserCart }          from './Redux Toolkit/Customer/CartSlice';
import { createHomeCategories }   from './Redux Toolkit/Customer/Customer/AsyncThunk';
import { homeCategories }         from './data/homeCategories';

function App() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const auth       = useAppSelector(s => s.auth);
  const sellerAuth = useAppSelector(s => s.sellerAuth);
  const user       = useAppSelector(s => s.user);

  const [authChecked, setAuthChecked] = useState(false);

  // ── Smart auth detection: try seller FIRST, fall back to customer ──
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      setAuthChecked(true);
      return;
    }

    // ✅ Check if we previously detected this user as a seller
    const wasSellerBefore = localStorage.getItem("userRole") === "SELLER";

    if (wasSellerBefore) {
      // Try seller first
      dispatch(fetchSellerProfile(jwt))
        .unwrap()
        .then((data: any) => {
          localStorage.setItem("userRole", "SELLER");
          console.log("✅ Logged in as seller:", data?.email);
          setAuthChecked(true);
        })
        .catch(() => {
          localStorage.removeItem("userRole");
          tryAsCustomer();
        });
    } else {
      // Try customer first (no noisy 404)
      tryAsCustomer();
    }

    function tryAsCustomer() {
      dispatch(fetchUserProfile({ jwt, navigate }))
        .unwrap()
        .then((data: any) => {
          localStorage.setItem("userRole", "CUSTOMER");
          console.log("✅ Logged in as customer:", data?.email);
          dispatch(fetchUserCart(jwt));
        })
        .catch(() => {
          // Not a customer either — try seller as last resort
          dispatch(fetchSellerProfile(jwt))
            .unwrap()
            .then((data: any) => {
              localStorage.setItem("userRole", "SELLER");
              console.log("✅ Logged in as seller:", data?.email);
            })
            .catch(() => {
              console.warn("⚠️ JWT invalid — clearing");
              localStorage.removeItem("jwt");
              localStorage.removeItem("userRole");
            });
        })
        .finally(() => setAuthChecked(true));
    }
  }, [auth.jwt, sellerAuth.jwt]);

  useEffect(() => {
    dispatch(createHomeCategories(homeCategories));
  }, [dispatch]);

  if (!authChecked && localStorage.getItem("jwt")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const isAdmin    = user.user?.role === "ROLE_ADMIN";
  const isLoggedIn = !!localStorage.getItem("jwt");

  return (
    <ThemeProvider theme={customeTheme}>
      <div className='App'>
        {/* ✅ Auto-scroll to top on every route change */}
        <ScrollToTop />

        <Routes>

          {/* ══ Admin (role-based) ══ */}
          <Route
            path='/admin/*'
            element={
              isAdmin
                ? <AdminDashboard />          // ✅ Real admin
                : isLoggedIn
                  ? (                         // ⚠️ Logged in but not admin
                      <>
                        <CustomerRoutes />
                        <UnauthorizedRedirect />
                      </>
                    )
                  : <AdminAuth />             // 🔐 Not logged in
            }
          />

          {/* ✅ Seller routes */}
          <Route path='/seller/*' element={<SellerDashboard />} />

          {/* Public */}
          <Route path='/verify-seller/:otp'      element={<SellerAccountVerification />} />
          <Route path='/seller-account-verified' element={<SellerAccountVerified />} />
          <Route path='/become-seller'           element={<BecomeSeller />} />
          <Route path='/admin-login'             element={<AdminAuth />} />

          {/* Customer catch-all */}
          <Route path='*' element={<CustomerRoutes />} />

        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;