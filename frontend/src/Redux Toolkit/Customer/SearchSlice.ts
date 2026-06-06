import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

export const searchProducts = createAsyncThunk<any, {
  q?: string; page?: number; limit?: number; brand?: string;
  category?: string; minPrice?: number; maxPrice?: number; sort?: string;
}>(
  "search/searchProducts",
  async (params, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/search", { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Search failed");
    }
  }
);

export const fetchSuggestions = createAsyncThunk<any[], string>(
  "search/fetchSuggestions",
  async (query, { rejectWithValue }) => {
    try {
      if (!query.trim()) return [];
      const res = await api.get("/api/search/suggest", {
        params: { q: query, limit: 6 },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue("Failed");
    }
  }
);

interface SearchState {
  results:          any[];
  total:            number;
  page:             number;
  processingTimeMs: number;
  loading:          boolean;
  error:            string | null;
  suggestions:      any[];
  suggestLoading:   boolean;
  recentSearches:   string[];
}

const getRecentSearches = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem("nexkart-recent-searches") || "[]");
  } catch { return []; }
};

const initialState: SearchState = {
  results:          [],
  total:            0,
  page:             1,
  processingTimeMs: 0,
  loading:          false,
  error:            null,
  suggestions:      [],
  suggestLoading:   false,
  recentSearches:   getRecentSearches(),
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch:      (s) => { s.results = []; s.total = 0; s.error = null; },
    clearSuggestions: (s) => { s.suggestions = []; },
    addRecentSearch:  (s, a: PayloadAction<string>) => {
      const q = a.payload.trim();
      if (!q) return;
      s.recentSearches = [q, ...s.recentSearches.filter(x => x !== q)].slice(0, 8);
      localStorage.setItem("nexkart-recent-searches", JSON.stringify(s.recentSearches));
    },
    removeRecentSearch: (s, a: PayloadAction<string>) => {
      s.recentSearches = s.recentSearches.filter(x => x !== a.payload);
      localStorage.setItem("nexkart-recent-searches", JSON.stringify(s.recentSearches));
    },
    clearRecentSearches: (s) => {
      s.recentSearches = [];
      localStorage.removeItem("nexkart-recent-searches");
    },
  },
  extraReducers: (b) => {
    b
      .addCase(searchProducts.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(searchProducts.fulfilled, (s, a) => {
        s.results          = a.payload.hits ?? [];
        s.total            = a.payload.total ?? 0;
        s.page             = a.payload.page ?? 1;
        s.processingTimeMs = a.payload.processingTimeMs ?? 0;
        s.loading          = false;
      })
      .addCase(searchProducts.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })
      .addCase(fetchSuggestions.pending,   (s) => { s.suggestLoading = true; })
      .addCase(fetchSuggestions.fulfilled, (s, a) => {
        s.suggestions    = a.payload;
        s.suggestLoading = false;
      })
      .addCase(fetchSuggestions.rejected,  (s) => { s.suggestLoading = false; });
  },
});

export const {
  clearSearch, clearSuggestions, addRecentSearch,
  removeRecentSearch, clearRecentSearches,
} = searchSlice.actions;

export default searchSlice.reducer;