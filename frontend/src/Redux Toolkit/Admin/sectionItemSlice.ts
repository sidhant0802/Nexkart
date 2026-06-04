import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type SectionItem } from "../../types/homeDataTypes";
import { api } from "../../Config/Api";

type Section = "men" | "women" | "electronics" | "fashion" | "lightning";

// ── State ──────────────────────────────────────────────────
interface SectionItemState {
  items:        SectionItem[];
  loading:      boolean;
  error:        string | null;
  itemCreated:  boolean;
  itemUpdated:  boolean;
}

const initialState: SectionItemState = {
  items:       [],
  loading:     false,
  error:       null,
  itemCreated: false,
  itemUpdated: false,
};

const AUTH = () => ({
  headers: {
    "Content-Type": "application/json",
    Authorization:  `Bearer ${localStorage.getItem("jwt")}`,
  },
});

// ── Thunks ─────────────────────────────────────────────────

// Admin — fetch all (including inactive) for a section
export const fetchSectionItems = createAsyncThunk<SectionItem[], Section | undefined>(
  "sectionItems/fetchAll",
  async (section, { rejectWithValue }) => {
    try {
      const params = section ? { section } : {};
      const res    = await api.get("/admin/section-items/all", { ...AUTH(), params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch items");
    }
  }
);

export const createSectionItem = createAsyncThunk<SectionItem, Partial<SectionItem>>(
  "sectionItems/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/admin/section-items", data, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to create item");
    }
  }
);

export const updateSectionItem = createAsyncThunk<
  SectionItem,
  { id: string; data: Partial<SectionItem> }
>(
  "sectionItems/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/admin/section-items/${id}`, data, AUTH());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to update item");
    }
  }
);

export const deleteSectionItem = createAsyncThunk<string, string>(
  "sectionItems/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/section-items/${id}`, AUTH());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete item");
    }
  }
);

export const reorderSectionItems = createAsyncThunk<void, string[]>(
  "sectionItems/reorder",
  async (ids, { rejectWithValue }) => {
    try {
      await api.patch("/admin/section-items/reorder", { ids }, AUTH());
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to reorder");
    }
  }
);

// ── Slice ──────────────────────────────────────────────────
const sectionItemSlice = createSlice({
  name: "sectionItems",
  initialState,
  reducers: {
    resetSectionItemFlags: (state) => {
      state.itemCreated = false;
      state.itemUpdated = false;
    },
    // optimistic reorder in UI
    reorderLocally: (state, action: PayloadAction<SectionItem[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder

      // fetchSectionItems
      .addCase(fetchSectionItems.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchSectionItems.fulfilled, (state, action: PayloadAction<SectionItem[]>) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchSectionItems.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // createSectionItem
      .addCase(createSectionItem.pending, (state) => {
        state.loading     = true;
        state.itemCreated = false;
        state.error       = null;
      })
      .addCase(createSectionItem.fulfilled, (state, action: PayloadAction<SectionItem>) => {
        state.loading     = false;
        state.itemCreated = true;
        state.items.push(action.payload);
      })
      .addCase(createSectionItem.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // updateSectionItem
      .addCase(updateSectionItem.pending, (state) => {
        state.loading     = true;
        state.itemUpdated = false;
        state.error       = null;
      })
      .addCase(updateSectionItem.fulfilled, (state, action: PayloadAction<SectionItem>) => {
        state.loading     = false;
        state.itemUpdated = true;
        const idx = state.items.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateSectionItem.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // deleteSectionItem
      .addCase(deleteSectionItem.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(deleteSectionItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items   = state.items.filter((i) => i._id !== action.payload);
      })
      .addCase(deleteSectionItem.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { resetSectionItemFlags, reorderLocally } = sectionItemSlice.actions;
export default sectionItemSlice.reducer;