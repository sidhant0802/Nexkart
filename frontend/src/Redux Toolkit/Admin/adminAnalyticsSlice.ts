import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

const BASE = "/api/admin/analytics";

// ── Thunks ──────────────────────────────────────────────────

export const fetchStockSold = createAsyncThunk<any, {
  search?: string; page?: number; limit?: number;
}>(
  "adminAnalytics/fetchStockSold",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/stock-sold`, { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed");
    }
  }
);

export const fetchSellerRevenue = createAsyncThunk<any, string>(
  "adminAnalytics/fetchSellerRevenue",
  async (period = "all", { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/seller-revenue`, {
        params: { period },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed");
    }
  }
);

export const fetchProductAnalytics = createAsyncThunk<any, string>(
  "adminAnalytics/fetchProductAnalytics",
  async (period = "month", { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/product-analytics`, {
        params: { period },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed");
    }
  }
);

export const fetchNewSellers = createAsyncThunk<any>(
  "adminAnalytics/fetchNewSellers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${BASE}/new-sellers`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed");
    }
  }
);

export const markSellerSeen = createAsyncThunk<any, string>(
  "adminAnalytics/markSellerSeen",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch(`${BASE}/new-sellers/${id}/seen`);
      return { id, seller: res.data.seller };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed");
    }
  }
);

// ── State ────────────────────────────────────────────────────

interface AdminAnalyticsState {
  // Stock sold
  stockSold:         any[];
  stockTotal:        number;
  stockPage:         number;
  stockTotalUnits:   number;
  stockRevenue:      number;
  stockLoading:      boolean;

  // Seller revenue
  sellerRevenue:     any[];
  totalRevenue:      number;
  revenuePeriod:     string;
  revenueLoading:    boolean;

  // Product analytics
  productAnalytics:  any | null;
  analyticsLoading:  boolean;
  analyticsPeriod:   string;

  // Notifications
  newSellers:        any[];
  pendingCount:      number;
  notifLoading:      boolean;
  notifSeen:         string[];     // ✅ FIXED — was Set<string>, now string[]

  error:             string | null;
}

const initialState: AdminAnalyticsState = {
  stockSold:         [],
  stockTotal:        0,
  stockPage:         1,
  stockTotalUnits:   0,
  stockRevenue:      0,
  stockLoading:      false,

  sellerRevenue:     [],
  totalRevenue:      0,
  revenuePeriod:     "all",
  revenueLoading:    false,

  productAnalytics:  null,
  analyticsLoading:  false,
  analyticsPeriod:   "month",

  newSellers:        [],
  pendingCount:      0,
  notifLoading:      false,
  notifSeen:         [],            // ✅ FIXED — was new Set(), now []

  error:             null,
};

// ── Slice ─────────────────────────────────────────────────────

const slice = createSlice({
  name: "adminAnalytics",
  initialState,
  reducers: {
    clearAnalyticsError: (s) => { s.error = null; },
    setAnalyticsPeriod:  (s, a: PayloadAction<string>) => { s.analyticsPeriod = a.payload; },
    setRevenuePeriod:    (s, a: PayloadAction<string>) => { s.revenuePeriod   = a.payload; },

    // ✅ NEW — Mark seller as seen (uses array, not Set)
    markNotificationSeen: (s, a: PayloadAction<string>) => {
      if (!s.notifSeen.includes(a.payload)) {
        s.notifSeen.push(a.payload);
      }
    },
    clearAllSeen: (s) => {
      s.notifSeen = [];
    },
  },
  extraReducers: (b) => {
    b
      // fetchStockSold
      .addCase(fetchStockSold.pending,   (s) => { s.stockLoading = true;  s.error = null; })
      .addCase(fetchStockSold.fulfilled, (s, a) => {
        s.stockSold       = a.payload.data;
        s.stockTotal      = a.payload.total;
        s.stockPage       = a.payload.page;
        s.stockTotalUnits = a.payload.totalUnitsSold;
        s.stockRevenue    = a.payload.totalRevenue;
        s.stockLoading    = false;
      })
      .addCase(fetchStockSold.rejected,  (s, a) => {
        s.stockLoading = false;
        s.error        = a.payload as string;
      })

      // fetchSellerRevenue
      .addCase(fetchSellerRevenue.pending,   (s) => { s.revenueLoading = true; })
      .addCase(fetchSellerRevenue.fulfilled, (s, a) => {
        s.sellerRevenue  = a.payload.sellers;
        s.totalRevenue   = a.payload.totalRevenue;
        s.revenuePeriod  = a.payload.period;
        s.revenueLoading = false;
      })
      .addCase(fetchSellerRevenue.rejected,  (s) => { s.revenueLoading = false; })

      // fetchProductAnalytics
      .addCase(fetchProductAnalytics.pending,   (s) => { s.analyticsLoading = true; })
      .addCase(fetchProductAnalytics.fulfilled, (s, a) => {
        s.productAnalytics  = a.payload;
        s.analyticsLoading  = false;
      })
      .addCase(fetchProductAnalytics.rejected,  (s) => { s.analyticsLoading = false; })

      // fetchNewSellers
      .addCase(fetchNewSellers.pending,   (s) => { s.notifLoading = true; })
      .addCase(fetchNewSellers.fulfilled, (s, a) => {
        s.newSellers   = a.payload.notifications;
        s.pendingCount = a.payload.pendingCount;
        s.notifLoading = false;
      })
      .addCase(fetchNewSellers.rejected,  (s) => { s.notifLoading = false; })

      // markSellerSeen
      .addCase(markSellerSeen.fulfilled, (s, a) => {
        const idx = s.newSellers.findIndex(
          (x) => x._id === a.payload.id
        );
        if (idx !== -1) {
          s.newSellers[idx].accountStatus = "ACTIVE";
        }
        if (s.pendingCount > 0) s.pendingCount -= 1;
      });
  },
});

export const {
  clearAnalyticsError,
  setAnalyticsPeriod,
  setRevenuePeriod,
  markNotificationSeen,   // ✅ NEW
  clearAllSeen,           // ✅ NEW
} = slice.actions;

export default slice.reducer;