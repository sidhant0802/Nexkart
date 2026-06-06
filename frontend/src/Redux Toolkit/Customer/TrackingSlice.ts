import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import type { Tracking } from "../../types/trackingTypes";

interface TrackingState {
  tracking: Tracking | null;
  loading:  boolean;
  error:    string | null;
}

const initialState: TrackingState = {
  tracking: null,
  loading:  false,
  error:    null,
};

export const fetchTracking = createAsyncThunk<Tracking, string>(
  "tracking/fetch",
  async (orderId, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.get(`/api/tracking/${orderId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch tracking");
    }
  }
);

export const updateTrackingStatus = createAsyncThunk<any, {
  orderId: string;
  status:  string;
  message?: string;
  location?: string;
  estimatedDelivery?: string;
  carrier?: string;
  trackingNumber?: string;
}>(
  "tracking/updateStatus",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const { orderId, ...payload } = data;
      const res = await api.put(`/api/tracking/${orderId}/status`, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Update failed");
    }
  }
);

const slice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    clearTracking: (s) => { s.tracking = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchTracking.pending,   (s) => { s.loading = true; })
      .addCase(fetchTracking.fulfilled, (s, a) => { s.loading = false; s.tracking = a.payload; })
      .addCase(fetchTracking.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(updateTrackingStatus.fulfilled, (s, a: any) => {
        if (a.payload?.tracking) s.tracking = a.payload.tracking;
      });
  },
});

export const { clearTracking } = slice.actions;
export default slice.reducer;