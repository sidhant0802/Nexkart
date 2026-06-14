import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

// ── Seller ──
import dashboardSlice            from "./Seller/dashboardSlice";
import sellerSlice               from "./Seller/sellerSlice";
import sellerAuthenticationSlice from "./Seller/sellerAuthenticationSlice";
import sellerProductSlice        from "./Seller/sellerProductSlice";
import sellerOrderSlice          from "./Seller/sellerOrderSlice";
import payoutSlice               from "./Seller/payoutSlice";
import transactionSlice          from "./Seller/transactionSlice";
import revenueChartSlice         from "./Seller/revenueChartSlice";

// ── Customer ──
import ProductSlice   from "./Customer/ProductSlice";
import CartSlice      from "./Customer/CartSlice";
import AuthSlice      from "./Customer/AuthSlice";
import UserSlice      from "./Customer/UserSlice";
import OrderSlice     from "./Customer/OrderSlice";
import CouponSlice    from "./Customer/CouponSlice";
import ReviewSlice    from "./Customer/ReviewSlice";
import WishlistSlice  from "./Customer/WishlistSlice";
import AiChatBotSlice from "./Customer/AiChatBotSlice";
import CheckoutSlice  from "./Customer/CheckoutSlice";
import TrackingSlice  from "./Customer/TrackingSlice";
import SearchSlice    from "./Customer/SearchSlice";
import CustomerSlice  from "./Customer/Customer/CustomerSlice";

// ✅ NEW Customer slices
import NotificationSlice from "./Customer/NotificationSlice";
import ReturnSlice       from "./Customer/ReturnSlice";
import ChatSlice         from "./Customer/ChatSlice";

// ── Admin ──
import AdminCouponSlice    from "./Admin/AdminCouponSlice";
import DealSlice           from "./Admin/DealSlice";
import AdminSlice          from "./Admin/AdminSlice";
import AdminProductSlice   from "./Admin/AdminProductSlice";
import BrandSlice          from "./Admin/BrandSlice";
import bannerReducer       from "./Admin/bannerSlice";
import homeSettingsReducer from "./Admin/homeSettingsSlice";
import sectionItemReducer  from "./Admin/sectionItemSlice";
import adminAnalyticsReducer from "./Admin/adminAnalyticsSlice";

const rootReducer = combineReducers({

  // ── Customer ──────────────────────────────────
  auth:          AuthSlice,
  user:          UserSlice,
  products:      ProductSlice,
  cart:          CartSlice,
  orders:        OrderSlice,
  coupone:       CouponSlice,
  review:        ReviewSlice,
  wishlist:      WishlistSlice,
  aiChatBot:     AiChatBotSlice,
  homePage:      CustomerSlice,
  checkout:      CheckoutSlice,
  tracking:      TrackingSlice,
  search:        SearchSlice,

  // ✅ NEW
  notifications: NotificationSlice,
  returnReq:     ReturnSlice,
  chat:          ChatSlice,

  // ── Seller ────────────────────────────────────
  sellers:       sellerSlice,
  sellerAuth:    sellerAuthenticationSlice,
  sellerProduct: sellerProductSlice,
  sellerOrder:   sellerOrderSlice,
  payouts:       payoutSlice,
  transaction:   transactionSlice,
  revenueChart:  revenueChartSlice,
  dashboard:     dashboardSlice,

  // ── Admin ─────────────────────────────────────
  adminCoupon:    AdminCouponSlice,
  deal:           DealSlice,
  admin:          AdminSlice,
  adminProduct:   AdminProductSlice,
  brand:          BrandSlice,
  banner:         bannerReducer,
  homeSettings:   homeSettingsReducer,
  sectionItem:    sectionItemReducer,
  adminAnalytics: adminAnalyticsReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type AppDispatch = typeof store.dispatch;
export type RootState   = ReturnType<typeof rootReducer>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;