import { Route, Routes, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import Home from '../customer/pages/Home/Home'
import Products from '../customer/pages/Products/Products'
import ProductDetails from '../customer/pages/Products/ProductDetails/ProductDetails'
import Cart from '../customer/pages/Cart/Cart'
import Address from '../customer/pages/Checkout/AddressPage'
import Profile from '../customer/pages/Account/Profile'
import Footer from '../customer/components/Footer/Footer'
import Navbar from '../customer/components/Navbar/Navbar'
import NotFound from '../customer/pages/NotFound/NotFound'
import Auth from '../customer/pages/Auth/Auth'
import ForgotPassword from '../customer/pages/Auth/ForgotPassword/ForgotPassword'
import { useAppDispatch, useAppSelector } from '../Redux Toolkit/Store'
import { fetchUserCart } from '../Redux Toolkit/Customer/CartSlice'
import PaymentSuccessHandler from '../customer/pages/Pyement/PaymentSuccessHandler'
import Reviews from '../customer/pages/Review/Reviews'
import WriteReviews from '../customer/pages/Review/WriteReview'
import Wishlist from '../customer/pages/Wishlist/Wishlist'
import { getWishlistByUserId } from '../Redux Toolkit/Customer/WishlistSlice'
import SearchProducts from '../customer/pages/Search/SearchProducts'
import AllCategories  from '../customer/pages/Home/AllCategories/AllCategories'
import AllElectronics from '../customer/pages/Home/AllElectronics/AllElectronics'
import AllMen         from '../customer/pages/Home/AllMen/AllMen'
import AllWomen       from '../customer/pages/Home/AllWomen/AllWomen'
import AllDeals       from '../customer/pages/Home/AllDeals/AllDeals'
import AllFashion     from '../customer/pages/Home/AllFashion/AllFashion'
import AllFeatured    from '../customer/pages/Home/AllFeatured/AllFeatured'
import BrandProducts  from '../customer/pages/Brands/BrandProducts'
import AllBrands      from '../customer/pages/Brands/AllBrands'
import SmartSearchResults from '../customer/pages/Search/SmartSearchResults'
import ChatBot       from '../customer/pages/ChatBot/ChatBot'
import ChatBotButton from '../customer/pages/ChatBot/ChatBotButton'
import Checkout         from '../customer/pages/Checkout/Checkout'
import CheckoutSuccess  from '../customer/pages/Checkout/CheckoutSuccess'

// ✅ NEW imports
import ReturnRequest from '../customer/pages/Account/ReturnRequest'
import OrderChat     from '../customer/pages/Account/OrderChat'
import { initSocket, disconnectSocket } from '../config/socket'
import { fetchUserNotifications } from '../Redux Toolkit/Customer/NotificationSlice'

export const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({ isDark: true, toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth       = useAppSelector((s) => s.auth);
  const isLoggedIn = !!localStorage.getItem('jwt') || !!auth?.jwt;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const CustomerRoutes = () => {
  const dispatch = useAppDispatch();
  const auth     = useAppSelector((s) => s.auth);

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('nexkart-theme') !== 'light'
  );

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('nexkart-theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt') || auth?.jwt;
    if (jwt) {
      dispatch(fetchUserCart(typeof jwt === 'string' ? jwt : ''));
      dispatch(getWishlistByUserId());
      // ✅ Fetch notifications
      dispatch(fetchUserNotifications());
      // ✅ Init socket for real-time
      initSocket(typeof jwt === 'string' ? jwt : '');
    } else {
      disconnectSocket();
    }

    return () => {
      // Don't disconnect on re-render, only on logout
    };
  }, [auth.jwt]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          backgroundColor: isDark ? '#0D0D12' : '#f9fafb',
          color:           isDark ? '#ffffff'  : '#111827',
        }}
      >
        <Navbar />
        <Routes>
          {/* ── Public ── */}
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── Category pages ── */}
          <Route path="/all-categories"  element={<AllCategories />} />
          <Route path="/all-electronics" element={<AllElectronics />} />
          <Route path="/all-men"         element={<AllMen />} />
          <Route path="/all-women"       element={<AllWomen />} />
          <Route path="/all-deals"       element={<AllDeals />} />
          <Route path="/all-fashion"     element={<AllFashion />} />
          <Route path="/all-featured"    element={<AllFeatured />} />
          <Route path="/brands"          element={<AllBrands />} />

          {/* ── Products ── */}
          <Route path="/products/:categoryId"   element={<Products />} />
          <Route path="/brands/:brandName"      element={<BrandProducts />} />
          <Route path="/search-products"        element={<SearchProducts />} />
          <Route path="/reviews/:productId"     element={<Reviews />} />
          <Route
            path="/product-details/:categoryId/:name/:productId"
            element={<ProductDetails />}
          />

          {/* ── Reviews ── */}
          <Route path="/write-review/:productId" element={
            <ProtectedRoute><WriteReviews /></ProtectedRoute>
          } />
          <Route path="/reviews/:productId/create" element={
            <ProtectedRoute><WriteReviews /></ProtectedRoute>
          } />

          {/* ── Protected ── */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/search" element={<SmartSearchResults />} />

          {/* ── Checkout ── */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
          <Route path="/checkout/address" element={<ProtectedRoute><Address /></ProtectedRoute>} />

          {/* ── Account ── */}
          <Route path="/account/*" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* ✅ NEW — Return & Chat (standalone pages outside Profile layout) */}
          <Route
            path="/account/orders/:orderId/item/:orderItemId/return"
            element={<ProtectedRoute><ReturnRequest /></ProtectedRoute>}
          />
          <Route
            path="/account/orders/:orderId/chat"
            element={<ProtectedRoute><OrderChat /></ProtectedRoute>}
          />

          <Route path="/payment-success/:orderId" element={
            <ProtectedRoute><PaymentSuccessHandler /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
        <ChatBotButton />
        <ChatBot />
      </div>
    </ThemeContext.Provider>
  );
};

export default CustomerRoutes;