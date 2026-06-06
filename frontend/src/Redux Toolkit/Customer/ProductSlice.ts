import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Product, type ProductListing } from "../../types/productTypes";
import { type RootState } from "../Store";
import { api } from "../../Config/Api";

const API_URL = "/products";

interface ProductState {
  product:         Product | null;
  products:        Product[];
  paginatedProducts: any;
  totalPages:      number;
  loading:         boolean;        // ← for getAllProducts / search
  productLoading:  boolean;        // ✅ NEW — only for fetchProductById
  error:           string | null;
  searchProduct:   Product[];
  listings:        ProductListing[];
  listingsLoading: boolean;
  selectedListing: ProductListing | null;
}

const initialState: ProductState = {
  product:          null,
  products:         [],
  paginatedProducts: null,
  totalPages:       1,
  loading:          false,
  productLoading:   false,        // ✅ NEW
  error:            null,
  searchProduct:    [],
  listings:         [],
  listingsLoading:  false,
  selectedListing:  null,
};

// ── Fetch single product ──
export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchProductById",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get<Product>(`${API_URL}/${productId}`);
      console.log("product details", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ── Fetch all seller listings for a product ──
export const fetchProductListings = createAsyncThunk<ProductListing[], string>(
  "products/fetchProductListings",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get<ProductListing[]>(
        `${API_URL}/${productId}/listings`
      );
      console.log("product listings", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ── Search products ──
export const searchProduct = createAsyncThunk<Product[], string>(
  "products/searchProduct",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get<Product[]>(`${API_URL}/search`, {
        params: { q: query },   // ✅ backend reads req.query.q
      });
      console.log("search results:", response.data.length);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ── Get all products with filters ──
export const getAllProducts = createAsyncThunk<
  any,
  {
    category?:    string;
    brand?:       string;
    color?:       string;
    size?:        string;
    minPrice?:    number;
    maxPrice?:    number;
    minDiscount?: number;
    sort?:        string;
    stock?:       string;
    pageNumber?:  number;
    pageSize?:    number;
  }
>("products/getAllProducts", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<any>("/products", { params });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data);
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSelectedListing: (state, action: PayloadAction<ProductListing>) => {
      state.selectedListing = action.payload;
    },
    clearListings: (state) => {
      state.listings        = [];
      state.selectedListing = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── fetchProductById ──
      // ✅ Uses productLoading (NOT loading) so SimilarProduct doesn't interfere
      .addCase(fetchProductById.pending, (state) => {
        state.productLoading = true;
        state.error          = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.product        = action.payload;
        state.productLoading = false;
        if (action.payload.defaultListing) {
          state.selectedListing = action.payload.defaultListing;
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.productLoading = false;
        state.error          = action.error.message || "Failed to fetch product";
      })

      // ── fetchProductListings ──
      .addCase(fetchProductListings.pending, (state) => {
        state.listingsLoading = true;
      })
      .addCase(fetchProductListings.fulfilled, (state, action: PayloadAction<ProductListing[]>) => {
        state.listings        = action.payload;
        state.listingsLoading = false;
        if (action.payload.length > 0 && !state.selectedListing) {
          state.selectedListing = action.payload[0];
        }
      })
      .addCase(fetchProductListings.rejected, (state) => {
        state.listingsLoading = false;
      })

      // ── searchProduct ──
      .addCase(searchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProduct.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.searchProduct = action.payload;
        state.loading       = false;
      })
      .addCase(searchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.error.message || "Failed to search";
      })

      // ── getAllProducts ──
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.paginatedProducts = action.payload;
        state.products          = action.payload.content;
        state.totalPages        = action.payload.totalPages;
        state.loading           = false;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.error.message || "Failed to fetch products";
      });
  },
});

export const { setSelectedListing, clearListings } = productSlice.actions;
export default productSlice.reducer;

// ── Selectors ──
export const selectProduct           = (state: RootState) => state.products.product;
export const selectProducts          = (state: RootState) => state.products.products;
export const selectPaginatedProducts = (state: RootState) => state.products.paginatedProducts;
export const selectProductLoading    = (state: RootState) => state.products.productLoading; // ✅ NEW
export const selectAllLoading        = (state: RootState) => state.products.loading;
export const selectProductError      = (state: RootState) => state.products.error;
export const selectListings          = (state: RootState) => state.products.listings;
export const selectListingsLoading   = (state: RootState) => state.products.listingsLoading;
export const selectSelectedListing   = (state: RootState) => state.products.selectedListing;