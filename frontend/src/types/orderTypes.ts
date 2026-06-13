import { type Product } from './productTypes';
import { type Address, type User } from './userTypes';

export interface OrderState {
  orders: Order[];
  orderItem: OrderItem | null;
  currentOrder: Order | null;
  paymentOrder: any | null;
  loading: boolean;
  error: string | null;
  orderCanceled: boolean;
}

export interface Order {
  _id: string;           // ✅ string not number
  orderId: string;
  user: User;
  seller: any;
  sellerId: string;      // ✅ string
  orderItems: OrderItem[];
  orderDate: string;
  shippingAddress: Address;
  paymentDetails: any;
  totalMrpPrice: number;
  totalSellingPrice?: number;
  discount?: number;
  orderStatus: string;   // ✅ wider type to handle all statuses
  totalItem: number;
  deliverDate: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'PLACED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  _id: string;           // ✅ string not number
  order: Order;
  product: Product;
  seller: any;
  size: string;
  quantity: number;
  mrpPrice: number;
  sellingPrice: number;
  userId: string;        // ✅ string
}