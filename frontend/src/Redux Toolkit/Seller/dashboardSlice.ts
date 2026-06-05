import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

interface DashboardStats {
  today:         { revenue: number; orders: number };
  month:         { revenue: number; orders: number };
  total:         { revenue: number; orders: number };
  pendingOrders: number;
  inProcess:     number;   // ✅ NEW
  totalOrders:   number;   // ✅ NEW
  topProducts:   any[];
}

interface DashboardState {
  stats:   DashboardStats | null;
  loading: boolean;
  error:   string | null;
}

const initialState: DashboardState = {
  stats:   null,
  loading: false,
  error:   null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStats>(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.get("/api/sellers/revenue/stats", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || "Failed");
    }
  }
);

const slice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b
      .addCase(fetchDashboardStats.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload; })
      .addCase(fetchDashboardStats.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export default slice.reducer;