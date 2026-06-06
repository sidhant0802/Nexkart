import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";
import { type RootState } from "../Store";
import { resetUserState } from "./UserSlice";
import { resetCartState } from "./CartSlice";

interface AuthState {
  jwt:     string | null;
  role:    string | null;
  loading: boolean;
  error:   string | null;
  otpSent: boolean;
  resetOtpSent: boolean;
  passwordResetSuccess: boolean;
}

const initialState: AuthState = {
  jwt:     null,
  role:    null,
  loading: false,
  error:   null,
  otpSent: false,
  resetOtpSent: false,
  passwordResetSuccess: false,
};

const API_URL = "/auth";

// ════════════════════════════════════════════════════════
// THUNKS
// ════════════════════════════════════════════════════════

export const sendLoginSignupOtp = createAsyncThunk<any, { email: string; purpose?: string }>(
  "auth/sendLoginSignupOtp",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/sent/login-signup-otp`, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to send OTP");
    }
  }
);

export const signup = createAsyncThunk<any, any>(
  "auth/signup",
  async (req, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/signup`, req);
      localStorage.setItem("jwt", res.data.jwt);
      if (req.navigate) req.navigate("/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Signup failed");
    }
  }
);

export const signin = createAsyncThunk<any, any>(
  "auth/signin",
  async (req, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/signin`, req);
      localStorage.setItem("jwt", res.data.jwt);
      if (req.navigate) req.navigate("/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Signin failed");
    }
  }
);

export const signinWithPassword = createAsyncThunk<any, any>(
  "auth/signinWithPassword",
  async (req, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/signin/password`, req);
      localStorage.setItem("jwt", res.data.jwt);
      if (req.navigate) req.navigate("/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Invalid credentials");
    }
  }
);

export const forgotPassword = createAsyncThunk<any, { email: string }>(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/forgot-password`, { email });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Failed to send reset code");
    }
  }
);

export const resetPassword = createAsyncThunk<any, any>(
  "auth/resetPassword",
  async (req, { rejectWithValue }) => {
    try {
      const res = await api.post(`${API_URL}/reset-password`, req);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Password reset failed");
    }
  }
);

// ════════════════════════════════════════════════════════
// SLICE
// ════════════════════════════════════════════════════════

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.jwt = null;
      state.role = null;
      localStorage.clear();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.resetOtpSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // OTP send
      .addCase(sendLoginSignupOtp.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(sendLoginSignupOtp.fulfilled, (s) => { s.loading = false; s.otpSent = true; })
      .addCase(sendLoginSignupOtp.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Signup
      .addCase(signup.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signup.fulfilled, (s, a: PayloadAction<any>) => {
        s.jwt = a.payload.jwt; s.role = a.payload.role; s.loading = false;
      })
      .addCase(signup.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // OTP signin
      .addCase(signin.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signin.fulfilled, (s, a: PayloadAction<any>) => {
        s.jwt = a.payload.jwt; s.role = a.payload.role; s.loading = false;
      })
      .addCase(signin.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Password signin
      .addCase(signinWithPassword.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(signinWithPassword.fulfilled, (s, a: PayloadAction<any>) => {
        s.jwt = a.payload.jwt; s.role = a.payload.role; s.loading = false;
      })
      .addCase(signinWithPassword.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Forgot password
      .addCase(forgotPassword.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(forgotPassword.fulfilled, (s) => { s.loading = false; s.resetOtpSent = true; })
      .addCase(forgotPassword.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; })

      // Reset password
      .addCase(resetPassword.pending, (s) => { s.loading = true; s.error = null; s.passwordResetSuccess = false; })
      .addCase(resetPassword.fulfilled, (s) => { s.loading = false; s.passwordResetSuccess = true; s.resetOtpSent = false; })
      .addCase(resetPassword.rejected,  (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export const { logout, clearAuthError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;

export const performLogout = () => async (dispatch: any) => {
  dispatch(logout());
  dispatch(resetUserState());
  dispatch(resetCartState());
};

export const selectAuth = (state: RootState) => state.auth;