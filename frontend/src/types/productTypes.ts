import { type Seller } from "./sellerTypes";

export interface Category {
  _id?: string;
  name: string;
  categoryId: string;
  parentCategory?: Category;
  level: number;
}

export interface ProductListing {
  _id: string;
  product: string;
  seller: {
    _id: string;
    sellerName?: string;
    businessDetails?: {
      businessName?: string;
    };
  };
  mrpPrice: number;
  sellingPrice: number;
  discountPercent: number;
  quantity: number;
  deliveryDays: number;
  sellerRating: number;
  sellerTotalReviews: number;
  isActive: boolean;
  totalSold: number;
  createdAt?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  color: string;
  brand?: string;
  images: string[];
  sizes?: string;
  category?: Category;

  // ✅ Aggregated fields (from ProductListing)
  minPrice: number;       // lowest selling price across all sellers
  maxPrice: number;       // highest selling price
  minMrpPrice: number;    // lowest MRP
  totalSellers: number;
  totalStock: number;
  numRatings?: number;
  averageRating?: number;
  isActive?: boolean;

  // ✅ Default listing (lowest price seller — pre-populated)
  defaultListing?: ProductListing;

  createdAt?: string;
}