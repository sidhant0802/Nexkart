import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

interface SellerAuthState {
  otpSent:        boolean;
  error:          string | null;
  loading:        boolean;
  jwt:            string | null;
  sellerCreated:  string | null;
  accountStatus:  string | null;
}

const initialState: SellerAuthState = {
  otpSent:       false,
  error:         null,
  loading:       false,
  jwt:           null,
  sellerCreated: "",
  accountStatus: null,
};

const API_URL = "/sellers";

// ── Send login OTP ──
export const sendLoginOtp = createAsyncThunk(
  "sellerAuth/sendLoginOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`${API_URL}/send/login-otp`, { email });
      console.log("OTP sent:", data);
      return { email };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);

// ── Verify login OTP ──
export const verifyLoginOtp = createAsyncThunk(
  "sellerAuth/verifyLoginOtp",
  async (
    data: { email: string; otp: string; navigate: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`${API_URL}/verify/login-otp`, {
        email: data.email,
        otp:   data.otp,
      });
      console.log("Seller OTP login success:", response.data);

      localStorage.setItem("jwt", response.data.jwt);
      data.navigate("/seller");

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify OTP"
      );
    }
  }
);

// ✅ Login with password
export const loginWithPassword = createAsyncThunk(
  "sellerAuth/loginWithPassword",
  async (
    data: { email: string; password: string; navigate: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`${API_URL}/login/password`, {
        email:    data.email,
        password: data.password,
      });
      console.log("Seller password login success:", response.data);

      localStorage.setItem("jwt", response.data.jwt);
      data.navigate("/seller");

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid credentials"
      );
    }
  }
);

// ── Create seller ──
export const createSeller = createAsyncThunk<any, any>(
  "sellerAuth/createSeller",
  async (seller, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URL, seller);
      console.log("Seller created:", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create seller"
      );
    }
  }
);

const sellerAuthSlice = createSlice({
  name: "sellerAuth",
  initialState,
  reducers: {
    resetSellerAuthState: (state) => {
      state.otpSent       = false;
      state.error         = null;
      state.loading       = false;
      state.jwt           = null;
      state.sellerCreated = "";
    },
    clearSellerAuthMessage: (state) => {
      state.error         = null;
      state.sellerCreated = "";
    },
  },
  extraReducers: (builder) => {
    builder

      // sendLoginOtp
      .addCase(sendLoginOtp.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(sendLoginOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // verifyLoginOtp
      .addCase(verifyLoginOtp.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading       = false;
        state.jwt           = action.payload.jwt;
        state.accountStatus = action.payload.accountStatus;
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // loginWithPassword
      .addCase(loginWithPassword.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginWithPassword.fulfilled, (state, action) => {
        state.loading       = false;
        state.jwt           = action.payload.jwt;
        state.accountStatus = action.payload.accountStatus;
      })
      .addCase(loginWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // createSeller
      .addCase(createSeller.pending, (state) => {
        state.loading       = true;
        state.error         = null;
        state.sellerCreated = "";
      })
      .addCase(createSeller.fulfilled, (state) => {
        state.loading       = false;
        state.sellerCreated = "Account created! Check your email for verification.";
      })
      .addCase(createSeller.rejected, (state, action) => {
        state.loading = false;
        state.error   = (action.payload as string) || "Failed to create seller";
      });
  },
});

export const { resetSellerAuthState, clearSellerAuthMessage } = sellerAuthSlice.actions;
export default sellerAuthSlice.reducer;