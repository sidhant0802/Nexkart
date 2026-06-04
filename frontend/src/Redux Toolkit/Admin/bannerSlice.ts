import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Banner } from "../../types/homeDataTypes";
import { api } from "../../Config/Api";

// ── State ──────────────────────────────────────────────────
interface BannerState {
  banners:       Banner[];
  loading:       boolean;
  error:         string | null;
  bannerCreated: boolean;
  bannerUpdated: boolean;
}

const initialState: BannerState = {
  banners:       [],
  loading:       false,
  error:         null,
  bannerCreated: false,
  bannerUpdated: false,
};

const AUTH = () => ({
  headers: {
    "Content-Type":  "application/json",
    Authorization:   `Bearer ${localStorage.getItem("jwt")}`,
  },
});

// ── Thunks ─────────────────────────────────────────────────

export const fetchBanners = createAsyncThunk<Banner[]>(
  "banners/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/banners", AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch banners");
    }
  }
);

export const createBanner = createAsyncThunk<Banner, Partial<Banner>>(
  "banners/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/banners", data, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to create banner");
    }
  }
);

export const updateBanner = createAsyncThunk<Banner, { id: string; data: Partial<Banner> }>(
  "banners/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/banners/${id}`, data, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update banner");
    }
  }
);

export const deleteBanner = createAsyncThunk<string, string>(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/banners/${id}`, AUTH());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete banner");
    }
  }
);

export const reorderBanners = createAsyncThunk<Banner[], string[]>(
  "banners/reorder",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await api.patch("/admin/banners/reorder", { ids }, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to reorder banners");
    }
  }
);

// ── Slice ──────────────────────────────────────────────────
const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    resetBannerFlags: (state) => {
      state.bannerCreated = false;
      state.bannerUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchBanners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action: PayloadAction<Banner[]>) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // createBanner
      .addCase(createBanner.pending, (state) => {
        state.loading       = true;
        state.bannerCreated = false;
        state.error         = null;
      })
      .addCase(createBanner.fulfilled, (state, action: PayloadAction<Banner>) => {
        state.loading       = false;
        state.bannerCreated = true;
        state.banners.push(action.payload);
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // updateBanner
      .addCase(updateBanner.pending, (state) => {
        state.loading       = true;
        state.bannerUpdated = false;
        state.error         = null;
      })
      .addCase(updateBanner.fulfilled, (state, action: PayloadAction<Banner>) => {
        state.loading       = false;
        state.bannerUpdated = true;
        const idx = state.banners.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) state.banners[idx] = action.payload;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // deleteBanner
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(deleteBanner.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.banners = state.banners.filter((b) => b._id !== action.payload);
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // reorderBanners
      .addCase(reorderBanners.fulfilled, (state, action: PayloadAction<Banner[]>) => {
        state.banners = action.payload;
      });
  },
});

export const { resetBannerFlags } = bannerSlice.actions;
export default bannerSlice.reducer;