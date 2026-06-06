import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type User, type UserState } from "../../types/userTypes";
import { api } from "../../Config/Api";

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  profileUpdated: false,
};

const API_URL = "/api/users";

// ── Fetch profile ───────────────────────────────────────
export const fetchUserProfile = createAsyncThunk<User, { jwt: string; navigate?: any }>(
  "user/fetchUserProfile",
  async ({ jwt }, { rejectWithValue }) => {
    try {
      const res = await api.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      // ✅ NO redirect — let routing logic handle it
      return res.data;
    } catch (err: any) {
      return rejectWithValue("Failed to fetch user profile");
    }
  }
);

// ── Update profile ──────────────────────────────────────
export const updateUserProfile = createAsyncThunk<User, any>(
  "user/updateUserProfile",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.put(`${API_URL}/profile`, data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// ── Change password ─────────────────────────────────────
export const changePassword = createAsyncThunk<any, { currentPassword: string; newPassword: string }>(
  "user/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.put(`${API_URL}/password`, data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Password change failed");
    }
  }
);

// ── Address: Add ────────────────────────────────────────
export const addAddress = createAsyncThunk<User, any>(
  "user/addAddress",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.post(`${API_URL}/address`, data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Add address failed");
    }
  }
);

// ── Address: Update ─────────────────────────────────────
export const updateAddress = createAsyncThunk<User, { id: string; data: any }>(
  "user/updateAddress",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.put(`${API_URL}/address/${id}`, data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update address failed");
    }
  }
);

// ── Address: Delete ─────────────────────────────────────
export const deleteAddress = createAsyncThunk<User, string>(
  "user/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.delete(`${API_URL}/address/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Delete address failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.profileUpdated = false;
    },
    clearProfileUpdated: (state) => {
      state.profileUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchUserProfile.fulfilled, (s, a: PayloadAction<User>) => { s.user = a.payload; s.loading = false; })
      .addCase(fetchUserProfile.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(updateUserProfile.pending,   (s) => { s.loading = true; s.error = null; s.profileUpdated = false; })
      .addCase(updateUserProfile.fulfilled, (s, a: PayloadAction<User>) => {
        s.user = a.payload; s.loading = false; s.profileUpdated = true;
      })
      .addCase(updateUserProfile.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(changePassword.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(changePassword.fulfilled, (s) => { s.loading = false; s.profileUpdated = true; })
      .addCase(changePassword.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      .addCase(addAddress.fulfilled,    (s, a: PayloadAction<User>) => { s.user = a.payload; s.profileUpdated = true; })
      .addCase(addAddress.rejected,     (s, a) => { s.error = a.payload as string; })
      .addCase(updateAddress.fulfilled, (s, a: PayloadAction<User>) => { s.user = a.payload; s.profileUpdated = true; })
      .addCase(updateAddress.rejected,  (s, a) => { s.error = a.payload as string; })
      .addCase(deleteAddress.fulfilled, (s, a: PayloadAction<User>) => { s.user = a.payload; s.profileUpdated = true; })
      .addCase(deleteAddress.rejected,  (s, a) => { s.error = a.payload as string; });
  },
});

export const { resetUserState, clearProfileUpdated } = userSlice.actions;
export default userSlice.reducer;