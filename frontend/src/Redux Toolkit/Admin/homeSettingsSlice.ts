import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

// ── Types ──────────────────────────────────────────────────
export interface FeaturedTab {
  label:    string;
  category: string;
  isActive: boolean;
  order:    number;
}

export interface HomeSettings {
  _id?:                  string;
  featuredProductCount:  number;
  featuredSortMode:      "random" | "latest" | "price_low" | "price_high" | "best_selling";
  featuredTabs:          FeaturedTab[];
}

interface HomeSettingsState {
  settings: HomeSettings | null;
  loading:  boolean;
  error:    string | null;
  saved:    boolean;
}

const initialState: HomeSettingsState = {
  settings: null,
  loading:  false,
  error:    null,
  saved:    false,
};

const AUTH = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${localStorage.getItem("jwt")}`,
  },
});

// ── Thunks ─────────────────────────────────────────────────
export const fetchHomeSettings = createAsyncThunk<HomeSettings>(
  "homeSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/admin/home-settings", AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch settings");
    }
  }
);

export const updateHomeSettings = createAsyncThunk<HomeSettings, Partial<HomeSettings>>(
  "homeSettings/update",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.patch("/admin/home-settings", data, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update settings");
    }
  }
);

export const updateFeaturedTabs = createAsyncThunk<HomeSettings, FeaturedTab[]>(
  "homeSettings/updateTabs",
  async (tabs, { rejectWithValue }) => {
    try {
      const res = await api.patch("/admin/home-settings/tabs", { tabs }, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update tabs");
    }
  }
);

// ── Slice ──────────────────────────────────────────────────
const homeSettingsSlice = createSlice({
  name: "homeSettings",
  initialState,
  reducers: {
    resetSaved: (state) => { state.saved = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeSettings.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchHomeSettings.fulfilled, (state, action: PayloadAction<HomeSettings>) => {
        state.loading  = false;
        state.settings = action.payload;
      })
      .addCase(fetchHomeSettings.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(updateHomeSettings.pending, (state) => {
        state.loading = true; state.saved = false;
      })
      .addCase(updateHomeSettings.fulfilled, (state, action: PayloadAction<HomeSettings>) => {
        state.loading  = false;
        state.settings = action.payload;
        state.saved    = true;
      })
      .addCase(updateHomeSettings.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      .addCase(updateFeaturedTabs.fulfilled, (state, action: PayloadAction<HomeSettings>) => {
        state.settings = action.payload;
        state.saved    = true;
      });
  },
});

export const { resetSaved } = homeSettingsSlice.actions;
export default homeSettingsSlice.reducer;