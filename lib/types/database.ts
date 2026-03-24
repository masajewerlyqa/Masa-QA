/**
 * Shared domain types for MASA.
 * When integrating Supabase, you can replace or extend these with generated types
 * (e.g. from supabase gen types typescript) and keep this file as the app's public API.
 */

export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";

export interface Product {
  id: string;
  slug: string;
  image: string;
  images: string[];
  title: string;
  brand: string;
  storeId: string;
  storeSlug?: string;
  storeName: string;
  /** Effective selling price (discounted if valid discount, else base). Use for cart/checkout. */
  price: number;
  /** Original price for display (strikethrough when discounted); or compare_at_price when no discount. */
  originalPrice?: number;
  category: string;
  metal?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  isVerifiedStore?: boolean;
  description?: string;
  specifications?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
  /** Available quantity; used for stock checks and buyer/seller UI. */
  stockQuantity: number;
  /** Product status; out_of_stock when stock reaches 0. */
  status: ProductStatus;
  /** When product has a valid discount, end of discount window (for "ending soon" sort). */
  discountEndAt?: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  coverImage: string;
  logo?: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
  /** Store location on map (Qatar). */
  latitude?: number | null;
  longitude?: number | null;
}

export interface Order {
  id: string;
  customerName: string;
  productName: string;
  amount: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  sellerId?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
