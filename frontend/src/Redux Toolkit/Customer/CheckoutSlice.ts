import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../Config/Api";

// ── Types ──
export interface RazorpayPayload {
  razorpayOrderId: string;
  amount:          number;
  currency:        string;
  key:             string;
  nexkartOrderId:  string;
}

export interface CheckoutOrder {
  _id:               string;
  totalSellingPrice: number;
  totalMrpPrice:     number;
  totalItem:         number;
  orderStatus:       string;
  paymentStatus:     string;
  razorpayOrderId?:  string;
}

export interface SellerPaymentOptions {
  razorpayEnabled: boolean;
  codEnabled:      boolean;
  codMaxAmount:    number;
  sellerName:      string;
}

interface CheckoutState {
  loading:          boolean;
  error:            string | null;
  currentOrder:     CheckoutOrder | null;
  currentOrders:    CheckoutOrder[];        // for cart checkout (multi-seller)
  razorpay:         RazorpayPayload | null;
  razorpayOrders:   RazorpayPayload[];
  totalAmount:      number;
  paymentMethod:    "RAZORPAY" | "COD" | null;
  paymentVerifying: boolean;
  paymentSuccess:   boolean;
  sellerOptions:    Record<string, SellerPaymentOptions>;
}

const initialState: CheckoutState = {
  loading:          false,
  error:            null,
  currentOrder:     null,
  currentOrders:    [],
  razorpay:         null,
  razorpayOrders:   [],
  totalAmount:      0,
  paymentMethod:    null,
  paymentVerifying: false,
  paymentSuccess:   false,
  sellerOptions:    {},
};

// ── Buy Now ──
export const buyNow = createAsyncThunk<any, {
  listingId:        string;
  quantity:         number;
  shippingAddress:  any;
  paymentMethod:    "RAZORPAY" | "COD";
}>(
  "checkout/buyNow",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.post("/api/checkout/buy-now", data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Buy now failed");
    }
  }
);

// ── Cart checkout ──
export const checkoutCart = createAsyncThunk<any, {
  shippingAddress: any;
  paymentMethod:   "RAZORPAY" | "COD";
}>(
  "checkout/checkoutCart",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.post("/api/checkout/cart", data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Checkout failed");
    }
  }
);

// ── Verify Razorpay payment ──
export const verifyPayment = createAsyncThunk<any, {
  razorpayOrderId:   string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  nexkartOrderId:    string;
}>(
  "checkout/verifyPayment",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.post("/api/checkout/verify-payment", data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Verification failed");
    }
  }
);

// ── Mark payment failed (release stock) ──
export const markPaymentFailed = createAsyncThunk<any, { nexkartOrderId: string }>(
  "checkout/markPaymentFailed",
  async (data, { rejectWithValue }) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await api.post("/api/checkout/payment-failed", data, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      return res.data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to mark");
    }
  }
);

// ── Fetch seller payment options ──
export const fetchSellerPaymentOptions = createAsyncThunk<
  { sellerId: string; options: SellerPaymentOptions },
  string
>(
  "checkout/fetchSellerOptions",
  async (sellerId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/checkout/seller-payment-options/${sellerId}`);
      return { sellerId, options: res.data };
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || "Failed to fetch");
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    resetCheckout: () => initialState,
    clearError:    (s) => { s.error = null; },
  },
  extraReducers: (b) => {
    b
      // buy now
      .addCase(buyNow.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(buyNow.fulfilled, (s, a: PayloadAction<any>) => {
        s.loading       = false;
        s.currentOrder  = a.payload.order;
        s.razorpay      = a.payload.razorpay || null;
        s.paymentMethod = a.payload.paymentMethod;
        s.totalAmount   = a.payload.order?.totalSellingPrice || 0;
      })
      .addCase(buyNow.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // cart checkout
      .addCase(checkoutCart.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(checkoutCart.fulfilled, (s, a: PayloadAction<any>) => {
        s.loading        = false;
        s.currentOrders  = a.payload.orders || [];
        s.razorpayOrders = a.payload.razorpayOrders || [];
        s.razorpay       = a.payload.razorpayOrders?.[0] || null;
        s.paymentMethod  = a.payload.paymentMethod;
        s.totalAmount    = a.payload.totalAmount || 0;
      })
      .addCase(checkoutCart.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.payload as string;
      })

      // verify
      .addCase(verifyPayment.pending,   (s) => { s.paymentVerifying = true; })
      .addCase(verifyPayment.fulfilled, (s) => {
        s.paymentVerifying = false;
        s.paymentSuccess   = true;
      })
      .addCase(verifyPayment.rejected,  (s, a) => {
        s.paymentVerifying = false;
        s.error = a.payload as string;
      })

      // seller options
      .addCase(fetchSellerPaymentOptions.fulfilled, (s, a) => {
        s.sellerOptions[a.payload.sellerId] = a.payload.options;
      });
  },
});

export const { resetCheckout, clearError } = checkoutSlice.actions;
export default checkoutSlice.reducer;