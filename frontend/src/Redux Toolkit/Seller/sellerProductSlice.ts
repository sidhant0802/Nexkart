import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';
import { type Product } from '../../types/productTypes';

// ── Backend returns ProductListing with nested product ──
export interface SellerListing {
  _id:             string;
  product:         Product;
  seller:          string;
  mrpPrice:        number;
  sellingPrice:    number;
  discountPercent: number;
  quantity:        number;
  deliveryDays:    number;
  isActive:        boolean;
  totalSold:       number;
  createdAt:       string;
  updatedAt:       string;
}

const SELLER_URL  = '/sellers';
const PRODUCT_URL = '/api/sellers/product';

// ── Fetch seller's own listings ──
export const fetchSellerProducts = createAsyncThunk<SellerListing[], string>(
  'sellerProduct/fetchSellerProducts',
  async (jwt, { rejectWithValue }) => {
    try {
      // Try the new endpoint first (returns populated listings)
      const response = await api.get<SellerListing[]>(`${SELLER_URL}/listings`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("✅ seller listings:", response.data.length);
      return response.data;
    } catch (error: any) {
      console.error("fetchSellerProducts error:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch");
    }
  }
);

// ── Fetch products available to claim (not already sold by this seller) ──
export const fetchAvailableCatalog = createAsyncThunk<Product[], string>(
  'sellerProduct/fetchAvailableCatalog',
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get<Product[]>(`${SELLER_URL}/catalog/available`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("✅ available catalog:", response.data.length);
      return response.data;
    } catch (error: any) {
      console.error("fetchAvailableCatalog error:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch catalog");
    }
  }
);

// ── Claim a product (start selling) ──
export const claimProduct = createAsyncThunk<
  SellerListing,
  {
    productId:    string;
    sellingPrice: number;
    mrpPrice:     number;
    quantity:     number;
    deliveryDays?: number;
  }
>(
  'sellerProduct/claimProduct',
  async ({ productId, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.post<SellerListing>(
        `${SELLER_URL}/catalog/claim/${productId}`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      );
      console.log("✅ claimed product:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to claim");
    }
  }
);

// ── Create a brand new product ──
export const createProduct = createAsyncThunk<Product, { request: any; jwt: string | null }>(
  'sellerProduct/createProduct',
  async ({ request, jwt }, { rejectWithValue }) => {
    try {
      const response = await api.post<Product>(PRODUCT_URL, request, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create");
    }
  }
);

// ── Update listing (price, stock, active) ──
export const updateListing = createAsyncThunk<
  SellerListing,
  { listingId: string; data: Partial<SellerListing> }
>(
  'sellerProduct/updateListing',
  async ({ listingId, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch<SellerListing>(
        `${SELLER_URL}/listings/${listingId}`,
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update listing");
    }
  }
);

// ── Delete a listing (stop selling) ──
export const deleteListing = createAsyncThunk<string, string>(
  'sellerProduct/deleteListing',
  async (listingId, { rejectWithValue }) => {
    try {
      await api.delete(`${SELLER_URL}/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      return listingId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete");
    }
  }
);

// ── Delete a whole product (only if seller owns it & it's the only listing) ──
export const deleteProduct = createAsyncThunk<void, string>(
  'sellerProduct/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`${PRODUCT_URL}/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete");
    }
  }
);

// ── Update Product ──
export const updateProduct = createAsyncThunk<Product, { productId: string; product: any }>(
  'sellerProduct/updateProduct',
  async ({ productId, product }, { rejectWithValue }) => {
    try {
      const response = await api.put<Product>(`${PRODUCT_URL}/${productId}`, product, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update");
    }
  }
);

interface SellerProductState {
  listings:        SellerListing[];
  catalog:         Product[];
  products:        Product[];          // legacy
  loading:         boolean;
  catalogLoading:  boolean;
  error:           string | null;
  productCreated:  boolean;
  claimSuccess:    boolean;
}

const initialState: SellerProductState = {
  listings:       [],
  catalog:        [],
  products:       [],
  loading:        false,
  catalogLoading: false,
  error:          null,
  productCreated: false,
  claimSuccess:   false,
};

const sellerProductSlice = createSlice({
  name: 'sellerProduct',
  initialState,
  reducers: {
    clearProductCreated: (s) => { s.productCreated = false; },
    clearClaimSuccess:   (s) => { s.claimSuccess   = false; },
    clearSellerError:    (s) => { s.error          = null;  },
  },
  extraReducers: (builder) => {
    builder
      // fetch listings
      .addCase(fetchSellerProducts.pending, (s) => {
        s.loading = true; s.error = null; s.productCreated = false;
      })
      .addCase(fetchSellerProducts.fulfilled, (s, a: PayloadAction<SellerListing[]>) => {
        s.listings = a.payload;
        s.products = a.payload.map(l => l.product).filter(Boolean);
        s.loading  = false;
      })
      .addCase(fetchSellerProducts.rejected, (s, a) => {
        s.loading = false;
        s.error   = (a.payload as string) || 'Failed to fetch listings';
      })

      // fetch available catalog
      .addCase(fetchAvailableCatalog.pending, (s) => {
        s.catalogLoading = true; s.error = null;
      })
      .addCase(fetchAvailableCatalog.fulfilled, (s, a: PayloadAction<Product[]>) => {
        s.catalog = a.payload;
        s.catalogLoading = false;
      })
      .addCase(fetchAvailableCatalog.rejected, (s, a) => {
        s.catalogLoading = false;
        s.error = (a.payload as string) || 'Failed to fetch catalog';
      })

      // claim
      .addCase(claimProduct.pending, (s) => {
        s.loading = true; s.error = null; s.claimSuccess = false;
      })
      .addCase(claimProduct.fulfilled, (s, a: PayloadAction<SellerListing>) => {
        s.listings.unshift(a.payload);
        // remove from available catalog
        s.catalog = s.catalog.filter(p => p._id !== a.payload.product?._id);
        s.loading = false;
        s.claimSuccess = true;
      })
      .addCase(claimProduct.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || 'Failed to claim product';
      })

      // create
      .addCase(createProduct.pending, (s) => {
        s.loading = true; s.error = null; s.productCreated = false;
      })
      .addCase(createProduct.fulfilled, (s, a: PayloadAction<Product>) => {
        s.products.push(a.payload);
        s.loading = false; s.productCreated = true;
      })
      .addCase(createProduct.rejected, (s, a) => {
        s.loading = false;
        s.error = (a.payload as string) || 'Failed to create product';
      })

      // update listing
      .addCase(updateListing.fulfilled, (s, a: PayloadAction<SellerListing>) => {
        const i = s.listings.findIndex(l => l._id === a.payload._id);
        if (i !== -1) s.listings[i] = { ...s.listings[i], ...a.payload };
      })

      // delete listing
      .addCase(deleteListing.fulfilled, (s, a: PayloadAction<string>) => {
        s.listings = s.listings.filter(l => l._id !== a.payload);
      });
  },
});

export const { clearProductCreated, clearClaimSuccess, clearSellerError } = sellerProductSlice.actions;
export default sellerProductSlice.reducer;