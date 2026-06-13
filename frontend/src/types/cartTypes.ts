import { type Product } from "./productTypes";
import { type User }    from "./userTypes";

// ✅ Seller info nested in cart item
export interface CartItemSeller {
  _id: string;
  sellerName?: string;
  businessDetails?: {
    businessName?: string;
    logo?: string;
  };
}

// ✅ Listing info nested in cart item
export interface CartItemListing {
  _id: string;
  product: string;
  seller: CartItemSeller;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent: number;
  deliveryDays: number;
}

export interface CartItem {
  _id: string;
  cart?: Cart;
  product: Product;

  // ✅ NEW - multi-seller fields
  productListing?: CartItemListing;
  seller?: CartItemSeller;

  size: string;
  quantity: number;
  mrpPrice: number;
  sellingPrice: number;
  userId?: string;
}

export interface Cart {
  _id: string;
  user: User;
  cartItems: CartItem[];
  totalSellingPrice: number;
  totalItem: number;
  totalMrpPrice: number;
  discount: number;
  couponCode: string | null;
  couponPrice?: number;
}

// ✅ Request payload for adding to cart
export interface AddItemRequest {
  productListingId: string;   // ✅ NEW - required for multi-seller
  size:             string;
  quantity:         number;
}

// ✅ Cart Redux state
export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}