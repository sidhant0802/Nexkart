// frontend/src/Redux Toolkit/Customer/CartSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Cart, type CartItem } from "../../types/cartTypes";
import { api } from "../../Config/Api";
import { type RootState } from "../Store";
import { applyCoupon } from "./CouponSlice";
import { sumCartItemMrpPrice, sumCartItemSellingPrice } from "../../util/cartCalculator";

interface CartState {
  cart:    Cart | null;
  loading: boolean;
  error:   string | null;
}

const initialState: CartState = {
  cart:    null,
  loading: false,
  error:   null,
};

const API_URL = "/api/cart";

// ── Fetch cart ──
export const fetchUserCart = createAsyncThunk<Cart, string>(
  "cart/fetchUserCart",
  async (jwt, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      console.log("Cart fetched", response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue("Failed to fetch user cart");
    }
  }
);

interface AddItemRequest {
  productListingId: string;   // ✅ matches backend
  size:             string;
  quantity:         number;
}

export const addItemToCart = createAsyncThunk<
  CartItem,
  { jwt: string | null; request: AddItemRequest }
>("cart/addItemToCart", async ({ jwt, request }, { rejectWithValue }) => {
  try {
    const response = await api.put(`${API_URL}/add`, request, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("Cart item added", response.data);
    return response.data;
  } catch (error: any) {
    console.log("Add to cart error", error.response);
    return rejectWithValue("Failed to add item to cart");
  }
});

export const deleteCartItem = createAsyncThunk<
  any,
  { jwt: string; cartItemId: number }
>("cart/deleteCartItem", async ({ jwt, cartItemId }, { rejectWithValue }) => {
  try {
    const response = await api.delete(`${API_URL}/item/${cartItemId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response.data.message || "Failed to delete cart item"
    );
  }
});

export const updateCartItem = createAsyncThunk<
  any,
  { jwt: string | null; cartItemId: number; cartItem: any }
>("cart/updateCartItem", async ({ jwt, cartItemId, cartItem }, { rejectWithValue }) => {
  try {
    const response = await api.put(
      `${API_URL}/item/${cartItemId}`,
      cartItem,
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response.data.message || "Failed to update cart item"
    );
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.cart    = null;
      state.loading = false;
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── fetchUserCart ──
      .addCase(fetchUserCart.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchUserCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart    = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // ── addItemToCart ──
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {

        if (state.cart) {
          // ✅ Update if item already exists, else push
          const existingIndex = state.cart.cartItems.findIndex(
            (item: CartItem) => item._id === action.payload._id
          );

          if (existingIndex !== -1) {
            state.cart.cartItems[existingIndex] = action.payload;
          } else {
            state.cart.cartItems.push(action.payload);
          }

          // ✅ Recalculate totals
          state.cart.totalMrpPrice     = sumCartItemMrpPrice(state.cart.cartItems);
          state.cart.totalSellingPrice = sumCartItemSellingPrice(state.cart.cartItems);

        } else {
          // ✅ Cart was null — build it from the returned item
          state.cart = {
            cartItems:            [action.payload],
            totalMrpPrice:        action.payload.mrpPrice     ?? 0,
            totalSellingPrice:    action.payload.sellingPrice ?? 0,
            totalItem:            1,
            totalDiscountedPrice: 0,
            discounte:            0,
          } as any;
        }

        state.loading = false;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // ── deleteCartItem ──
      .addCase(deleteCartItem.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        if (state.cart) {
          state.cart.cartItems = state.cart.cartItems.filter(
            (item: CartItem) => item._id !== action.meta.arg.cartItemId
          );
          state.cart.totalMrpPrice     = sumCartItemMrpPrice(state.cart.cartItems);
          state.cart.totalSellingPrice = sumCartItemSellingPrice(state.cart.cartItems);
        }
        state.loading = false;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // ── updateCartItem ──
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (state.cart) {
          const index = state.cart.cartItems.findIndex(
            (item: CartItem) => item._id === action.meta.arg.cartItemId
          );
          if (index !== -1) {
            state.cart.cartItems[index] = {
              ...state.cart.cartItems[index],
              ...action.payload,
            };
          }
          state.cart.totalMrpPrice     = sumCartItemMrpPrice(state.cart.cartItems);
          state.cart.totalSellingPrice = sumCartItemSellingPrice(state.cart.cartItems);
        }
        state.loading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })

      // ── applyCoupon ──
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cart    = action.payload;
        state.loading = false;
      });
  },
});

export default cartSlice.reducer;
export const { resetCartState } = cartSlice.actions;

export const selectCart        = (state: RootState) => state.cart.cart;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError   = (state: RootState) => state.cart.error;