import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

const API_URL = "/api/brands";

export interface Brand {
  _id?:          string;
  name:          string;
  slug?:         string;
  logo:          string;
  description?:  string;
  category?:     string;
  featured?:     boolean;
  isActive?:     boolean;
  productCount?: number;
  createdAt?:    string;
  updatedAt?:    string;
}

interface BrandState {
  brands:           Brand[];
  brandsByCategory: Brand[];
  loading:          boolean;
  categoryLoading:  boolean;
  error:            string | null;
  created:          boolean;
  updated:          boolean;
  deleted:          boolean;
}

const initialState: BrandState = {
  brands: [], brandsByCategory: [],
  loading: false, categoryLoading: false, error: null,
  created: false, updated: false, deleted: false,
};

export const fetchBrands = createAsyncThunk<Brand[], { category?: string; featured?: boolean } | undefined>(
  "brand/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get<Brand[]>(API_URL, { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch brands");
    }
  }
);

// ✅ NEW: brands actually selling in a category
export const fetchBrandsByCategory = createAsyncThunk<Brand[], string>(
  "brand/fetchByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const res = await api.get<Brand[]>(`${API_URL}/by-category/${categoryId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch brands");
    }
  }
);

export const createBrand = createAsyncThunk<Brand, Brand>(
  "brand/create",
  async (brand, { rejectWithValue }) => {
    try {
      const res = await api.post<Brand>(API_URL, brand);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to create brand");
    }
  }
);

export const updateBrand = createAsyncThunk<Brand, { id: string; data: Partial<Brand> }>(
  "brand/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put<Brand>(`${API_URL}/${id}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update brand");
    }
  }
);

export const deleteBrand = createAsyncThunk<string, string>(
  "brand/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete brand");
    }
  }
);

export const toggleBrandFeatured = createAsyncThunk<Brand, string>(
  "brand/toggleFeatured",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch<Brand>(`${API_URL}/${id}/featured`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to toggle featured");
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    resetBrandFlags: (s) => {
      s.created = false; s.updated = false; s.deleted = false; s.error = null;
    },
    clearBrandsByCategory: (s) => { s.brandsByCategory = []; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchBrands.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchBrands.fulfilled, (s, a: PayloadAction<Brand[]>) => {
        s.brands = a.payload; s.loading = false;
      })
      .addCase(fetchBrands.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(fetchBrandsByCategory.pending,   (s) => { s.categoryLoading = true; })
      .addCase(fetchBrandsByCategory.fulfilled, (s, a: PayloadAction<Brand[]>) => {
        s.brandsByCategory = a.payload; s.categoryLoading = false;
      })
      .addCase(fetchBrandsByCategory.rejected,  (s) => { s.categoryLoading = false; })

      .addCase(createBrand.pending,   (s) => { s.loading = true; s.error = null; s.created = false; })
      .addCase(createBrand.fulfilled, (s, a: PayloadAction<Brand>) => {
        s.brands.unshift(a.payload); s.loading = false; s.created = true;
      })
      .addCase(createBrand.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(updateBrand.fulfilled, (s, a: PayloadAction<Brand>) => {
        const i = s.brands.findIndex(brand => brand._id === a.payload._id);
        if (i !== -1) s.brands[i] = a.payload;
        s.updated = true;
      })

      .addCase(deleteBrand.fulfilled, (s, a: PayloadAction<string>) => {
        s.brands = s.brands.filter(b => b._id !== a.payload);
        s.deleted = true;
      })

      .addCase(toggleBrandFeatured.fulfilled, (s, a: PayloadAction<Brand>) => {
        const i = s.brands.findIndex(brand => brand._id === a.payload._id);
        if (i !== -1) s.brands[i] = a.payload;
      });
  },
});

export const { resetBrandFlags, clearBrandsByCategory } = brandSlice.actions;
export default brandSlice.reducer;
