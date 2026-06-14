import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../Config/Api';

export interface ReturnEligibility {
  eligible:         boolean;
  returnWindowDays: number;
  deliveredAt:      string;
  returnDeadline:   string;
  daysLeft:         number;
  reason:           string | null;
}

export interface ReturnRequest {
  _id:              string;
  order:            string;
  orderItem:        string;
  reason:           string;
  description:      string;
  status:           string;
  sellerNote:       string;
  returnDeadline:   string;
  returnWindowDays: number;
  createdAt:        string;
}

interface ReturnState {
  eligibility:    ReturnEligibility | null;
  returnRequest:  ReturnRequest | null;
  loading:        boolean;
  error:          string | null;
  success:        boolean;
}

const initialState: ReturnState = {
  eligibility:   null,
  returnRequest: null,
  loading:       false,
  error:         null,
  success:       false,
};

export const checkReturnEligibility = createAsyncThunk<ReturnEligibility, string>(
  'return/checkEligibility',
  async (orderId, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await api.get(`/api/returns/eligibility/${orderId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed');
    }
  }
);

export const getReturnStatus = createAsyncThunk<ReturnRequest, string>(
  'return/getStatus',
  async (orderItemId, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await api.get(`/api/returns/item/${orderItemId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Not found');
    }
  }
);

export const requestReturn = createAsyncThunk<
  any,
  { orderId: string; orderItemId: string; reason: string; description: string }
>(
  'return/request',
  async ({ orderId, orderItemId, reason, description }, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await api.post(
        `/api/returns/order/${orderId}/item/${orderItemId}`,
        { reason, description },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || 'Failed to request return');
    }
  }
);

const returnSlice = createSlice({
  name: 'return',
  initialState,
  reducers: {
    clearReturnState: (s) => {
      s.eligibility   = null;
      s.returnRequest = null;
      s.error         = null;
      s.success       = false;
    },
  },
  extraReducers: (b) => {
    b
      .addCase(checkReturnEligibility.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(checkReturnEligibility.fulfilled, (s, a) => { s.loading = false; s.eligibility = a.payload; })
      .addCase(checkReturnEligibility.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(getReturnStatus.pending,   (s) => { s.loading = true; })
      .addCase(getReturnStatus.fulfilled, (s, a) => { s.loading = false; s.returnRequest = a.payload; })
      .addCase(getReturnStatus.rejected,  (s) => { s.loading = false; s.returnRequest = null; })

      .addCase(requestReturn.pending,   (s) => { s.loading = true; s.error = null; s.success = false; })
      .addCase(requestReturn.fulfilled, (s, a) => {
        s.loading       = false;
        s.success       = true;
        s.returnRequest = a.payload.return;
      })
      .addCase(requestReturn.rejected, (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      });
  },
});

export const { clearReturnState } = returnSlice.actions;
export default returnSlice.reducer;