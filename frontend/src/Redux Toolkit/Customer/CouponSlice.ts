import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Cart } from "../../types/cartTypes";
import { type CouponState } from "../../types/couponTypes";
import { api } from "../../Config/Api";

const API_URL = "/api/coupons";

export const applyCoupon = createAsyncThunk<
  Cart,
  {
    apply: string;
    code: string;
    orderValue: number;
    jwt: string;
  },
  { rejectValue: string }
>(
  "coupon/applyCoupon",
  async ({ apply, code, orderValue, jwt }, { rejectWithValue }) => {
    try {
      // ✅ FIXED - send data in BODY not params, no null
      const response = await api.post(
        `${API_URL}/apply`,
        { apply, code, orderValue },  // ✅ body
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      console.log("apply coupon", response.data);
      return response.data;
    } catch (error: any) {
      console.log("error", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply coupon"
      );
    }
  }
);

const initialState: CouponState = {
  coupons: [],
  cart: null,
  loading: false,
  error: null,
  couponCreated: false,
  couponApplied: false,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    // ✅ Add reset action
    resetCouponState: (state) => {
      state.couponApplied = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.couponApplied = false;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        if (action.meta.arg.apply === "true") {
          state.couponApplied = true;
        }
      })
      .addCase(
        applyCoupon.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to apply coupon";
          state.couponApplied = false;
        }
      );
  },
});

export const { resetCouponState } = couponSlice.actions;
export default couponSlice.reducer;