import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

const API_URL = "/api/admin/products";

// ═══════════════════════════════════════════════
// PRODUCT THUNKS
// ═══════════════════════════════════════════════

export const fetchAdminProducts = createAsyncThunk<any[], string | undefined>(
  "adminProduct/fetchAll",
  async (category, { rejectWithValue }) => {
    try {
      const url = category ? `${API_URL}?category=${category}` : API_URL;
      const res = await api.get(url);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch");
    }
  }
);

export const createAdminProduct = createAsyncThunk<any, any>(
  "adminProduct/create",
  async (product, { rejectWithValue }) => {
    try {
      const res = await api.post(API_URL, product);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to create");
    }
  }
);

export const updateAdminProduct = createAsyncThunk<any, { id: string; data: any }>(
  "adminProduct/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${API_URL}/${id}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update");
    }
  }
);

export const deleteAdminProduct = createAsyncThunk<string, string>(
  "adminProduct/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete");
    }
  }
);

// ── ✅ Stats ──
export const fetchAdminStats = createAsyncThunk<any>(
  "adminProduct/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_URL}/stats`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch stats");
    }
  }
);

// ═══════════════════════════════════════════════
// SELLER LISTING THUNKS
// ═══════════════════════════════════════════════

export const fetchProductListingsAdmin = createAsyncThunk<any[], string>(
  "adminProduct/fetchListings",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_URL}/${productId}/listings`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch listings");
    }
  }
);

export const fetchAllSellers = createAsyncThunk<any[]>(
  "adminProduct/fetchSellers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_URL}/sellers/all`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch sellers");
    }
  }
);

export const addSellerToProduct = createAsyncThunk<any, { productId: string; data: any }>(
  "adminProduct/addSeller",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/${productId}/listings`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to add seller");
    }
  }
);

export const updateListing = createAsyncThunk<any, { listingId: string; data: any }>(
  "adminProduct/updateListing",
  async ({ listingId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${API_URL}/listings/${listingId}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update listing");
    }
  }
);

export const deleteListing = createAsyncThunk<string, string>(
  "adminProduct/deleteListing",
  async (listingId, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/listings/${listingId}`);
      return listingId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete listing");
    }
  }
);

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════

interface AdminStats {
  total:                number;
  totalListings:        number;
  totalUniqueSellers:   number;
  totalStock:           number;
  totalSold:            number;
  avgSellersPerProduct: string;
  topBrands:            { _id: string; count: number }[];
  byCategory:           { _id: string; count: number }[];
  topMultiSeller:       any[];
}

interface State {
  // Products
  products:        any[];
  loading:         boolean;
  error:           string | null;
  created:         boolean;
  updated:         boolean;
  deleted:         boolean;

  // Stats
  stats:           AdminStats | null;
  statsLoading:    boolean;

  // Listings
  listings:        any[];
  listingsLoading: boolean;
  listingError:    string | null;

  // Sellers dropdown
  sellers:         any[];
  sellersLoading:  boolean;
}

const initialState: State = {
  products:        [],
  loading:         false,
  error:           null,
  created:         false,
  updated:         false,
  deleted:         false,

  stats:           null,
  statsLoading:    false,

  listings:        [],
  listingsLoading: false,
  listingError:    null,

  sellers:         [],
  sellersLoading:  false,
};

// ═══════════════════════════════════════════════
// SLICE
// ═══════════════════════════════════════════════

const slice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {
    resetAdminProductFlags: (s) => {
      s.created      = false;
      s.updated      = false;
      s.deleted      = false;
      s.error        = null;
      s.listingError = null;
    },
    clearListings: (s) => {
      s.listings     = [];
      s.listingError = null;
    },
  },
  extraReducers: (b) => {
    b
      // ── fetchAdminProducts ──
      .addCase(fetchAdminProducts.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchAdminProducts.fulfilled, (s, a: PayloadAction<any[]>) => {
        s.products = a.payload;
        s.loading  = false;
      })
      .addCase(fetchAdminProducts.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // ── createAdminProduct ──
      .addCase(createAdminProduct.pending,   (s) => { s.loading = true; s.error = null; s.created = false; })
      .addCase(createAdminProduct.fulfilled, (s, a) => {
        s.products.unshift(a.payload);
        s.loading = false;
        s.created = true;
      })
      .addCase(createAdminProduct.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // ── updateAdminProduct ──
      .addCase(updateAdminProduct.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(updateAdminProduct.fulfilled, (s, a) => {
        const i = s.products.findIndex(p => p._id === a.payload._id);
        if (i !== -1) s.products[i] = a.payload;
        s.loading = false;
        s.updated = true;
      })
      .addCase(updateAdminProduct.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // ── deleteAdminProduct ──
      .addCase(deleteAdminProduct.pending,   (s) => { s.loading = true; })
      .addCase(deleteAdminProduct.fulfilled, (s, a) => {
        s.products = s.products.filter(p => p._id !== a.payload);
        s.loading  = false;
        s.deleted  = true;
      })
      .addCase(deleteAdminProduct.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // ── fetchAdminStats ──
      .addCase(fetchAdminStats.pending,   (s) => { s.statsLoading = true; })
      .addCase(fetchAdminStats.fulfilled, (s, a: PayloadAction<AdminStats>) => {
        s.stats        = a.payload;
        s.statsLoading = false;
      })
      .addCase(fetchAdminStats.rejected,  (s) => { s.statsLoading = false; })

      // ── fetchProductListingsAdmin ──
      .addCase(fetchProductListingsAdmin.pending,   (s) => { s.listingsLoading = true;  s.listingError = null; })
      .addCase(fetchProductListingsAdmin.fulfilled, (s, a: PayloadAction<any[]>) => {
        s.listings        = a.payload;
        s.listingsLoading = false;
      })
      .addCase(fetchProductListingsAdmin.rejected,  (s, a) => {
        s.listingsLoading = false;
        s.listingError    = a.payload as string;
      })

      // ── fetchAllSellers ──
      .addCase(fetchAllSellers.pending,   (s) => { s.sellersLoading = true; })
      .addCase(fetchAllSellers.fulfilled, (s, a: PayloadAction<any[]>) => {
        s.sellers        = a.payload;
        s.sellersLoading = false;
      })
      .addCase(fetchAllSellers.rejected,  (s) => { s.sellersLoading = false; })

      // ── addSellerToProduct ──
      .addCase(addSellerToProduct.pending,   (s) => { s.listingError = null; })
      .addCase(addSellerToProduct.fulfilled, (s, a) => {
        s.listings.push(a.payload);
        s.listings.sort((x, y) => x.sellingPrice - y.sellingPrice);
      })
      .addCase(addSellerToProduct.rejected,  (s, a) => {
        s.listingError = a.payload as string;
      })

      // ── updateListing ──
      .addCase(updateListing.pending,   (s) => { s.listingError = null; })
      .addCase(updateListing.fulfilled, (s, a) => {
        const i = s.listings.findIndex(l => l._id === a.payload._id);
        if (i !== -1) s.listings[i] = a.payload;
        s.listings.sort((x, y) => x.sellingPrice - y.sellingPrice);
      })
      .addCase(updateListing.rejected,  (s, a) => {
        s.listingError = a.payload as string;
      })

      // ── deleteListing ──
      .addCase(deleteListing.pending,   (s) => { s.listingError = null; })
      .addCase(deleteListing.fulfilled, (s, a: PayloadAction<string>) => {
        s.listings = s.listings.filter(l => l._id !== a.payload);
        s.listings.sort((x, y) => x.sellingPrice - y.sellingPrice);
      })
      .addCase(deleteListing.rejected,  (s, a) => {
        s.listingError = a.payload as string;
      });
  },
});

export const { resetAdminProductFlags, clearListings } = slice.actions;
export default slice.reducer;