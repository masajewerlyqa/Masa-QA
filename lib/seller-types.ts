/**
 * Client-safe seller dashboard types.
 * Safe to import from Client Components. Do not add server imports here.
 */

export type StoreRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: string;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: Record<string, string> | null;
  latitude: number | null;
  longitude: number | null;
  business_timezone: string;
  working_days: number[] | null;
  opening_time_local: string | null;
  closing_time_local: string | null;
  /** Set when store is approved; drives catalog limits and placement flags. */
  seller_plan: string | null;
  returns_enabled: boolean;
  exchanges_enabled: boolean;
  return_period_days: number;
  exchange_period_days: number;
  policy_custom_conditions: string | null;
  same_day_delivery_enabled: boolean;
  same_day_cutoff_local: string | null;
  /** Last policy save; 14-day cooldown applies after each update. */
  store_policy_updated_at: string | null;
};

export type ProductRow = {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  price: number;
  metal_type: string | null;
  gold_karat: string | null;
  weight: number | null;
  craftsmanship_margin: number | null;
  stock_quantity: number;
  status: string;
  deleted_at: string | null;
  image_urls: string[];
  discount_type: "percentage" | "fixed" | null;
  discount_value: number | null;
  discount_start_at: string | null;
  discount_end_at: string | null;
  discount_active: boolean;
  created_at: string;
  /** Units sold (excl. cancelled/refunded orders). */
  units_sold: number;
  /** Wishlist saves for this product. */
  wishlist_count: number;
  /** Line revenue USD (excl. cancelled/refunded). */
  revenue_usd: number;
  /** Units on orders with status cancelled. */
  units_cancelled: number;
};

/** Full product for edit form (includes product_images). */
export type SellerProductDetail = ProductRow & {
  product_images: { id: string; url: string; alt: string | null; sort_order: number }[];
};

export type SellerStats = {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  avgOrderValue: number;
};

export type SellerOrderRow = {
  id: string;
  order_number: string | null;
  status: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  item_summary: string;
  /** This store's earnings share for this order (after commission). */
  store_earnings?: number;
  seller_response_deadline: string | null;
};

/** Single order detail for seller (only items from their store). */
export type SellerOrderDetail = {
  id: string;
  order_number: string | null;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  payment_method: string | null;
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  /** Line items that belong to this store only */
  items: {
    id: string;
    product_id: string;
    product_name: string;
    product_image: string | null;
    product_category: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  /** This store's earnings share for this order (after commission). */
  store_earnings?: number;
  delivery_country: string | null;
  delivery_city_area: string | null;
  delivery_building_type: string | null;
  delivery_zone_no: string | null;
  delivery_street_no: string | null;
  delivery_building_no: string | null;
  delivery_floor_no: string | null;
  delivery_apartment_no: string | null;
  delivery_landmark: string | null;
  delivery_phone: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_map_url: string | null;
  /** Message stored when seller sets status to cancelled (shown to buyer). */
  seller_cancellation_reason: string | null;
  platform_cancellation_reason: string | null;
  seller_response_deadline: string | null;
  cancellation_source: "seller" | "system" | "customer" | null;
  auto_cancelled_at: string | null;
};

export type RevenueByMonth = { month: string; revenue: number };

export type SellerOrderStatusAnalytics = {
  status: string;
  count: number;
  total: number;
};

export type SellerTopProductAnalytics = {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
};
