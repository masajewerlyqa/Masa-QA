"use server";

import { createClient } from "@/lib/supabase/server";
import { getPublicProductById } from "@/lib/data/public";
import type { Product } from "@/lib/types";
import { getServerLanguage } from "@/lib/language-server";
import { localizeProductText } from "@/lib/i18n/product-localization";

/** Get or create wishlist for user; return wishlist id. */
export async function getOrCreateWishlist(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("wishlists").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;
  const { data: inserted, error } = await supabase.from("wishlists").insert({ user_id: userId }).select("id").single();
  if (error || !inserted) return null;
  return inserted.id;
}

/** Get product ids in user's wishlist. */
export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const wishlistId = await getOrCreateWishlist(userId);
  if (!wishlistId) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("wishlist_items").select("product_id").eq("wishlist_id", wishlistId);
  return (data ?? []).map((r) => r.product_id);
}

/** Get wishlist as full products for the wishlist page. */
export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const ids = await getWishlistProductIds(userId);
  const products: Product[] = [];
  for (const id of ids) {
    const p = await getPublicProductById(id);
    if (p) products.push(p);
  }
  return products;
}

/** Get wishlist item count for navbar. */
export async function getWishlistCount(userId: string): Promise<number> {
  const wishlistId = await getOrCreateWishlist(userId);
  if (!wishlistId) return 0;
  const supabase = await createClient();
  const { count } = await supabase
    .from("wishlist_items")
    .select("id", { count: "exact", head: true })
    .eq("wishlist_id", wishlistId);
  return count ?? 0;
}

/** Get or create cart for user; return cart id. */
export async function getOrCreateCart(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing) return existing.id;
  const { data: inserted, error } = await supabase.from("carts").insert({ user_id: userId }).select("id").single();
  if (error || !inserted) return null;
  return inserted.id;
}

export type CartItemRow = { productId: string; quantity: number };

/** Get cart items for user. */
export async function getCartItems(userId: string): Promise<CartItemRow[]> {
  const cartId = await getOrCreateCart(userId);
  if (!cartId) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("cart_items").select("product_id, quantity").eq("cart_id", cartId);
  return (data ?? []).map((r) => ({ productId: r.product_id, quantity: r.quantity }));
}

/** Get cart item count for navbar. */
export async function getCartCount(userId: string): Promise<number> {
  const cartId = await getOrCreateCart(userId);
  if (!cartId) return 0;
  const supabase = await createClient();
  const { data } = await supabase.from("cart_items").select("quantity").eq("cart_id", cartId);
  const total = (data ?? []).reduce((s, r) => s + r.quantity, 0);
  return total;
}

export type CartItemWithProduct = { productId: string; quantity: number; product: Product };

/** Get cart with product details (only public products). */
export async function getCartWithProducts(userId: string): Promise<CartItemWithProduct[]> {
  const items = await getCartItems(userId);
  const result: CartItemWithProduct[] = [];
  for (const item of items) {
    const product = await getPublicProductById(item.productId);
    if (product) result.push({ ...item, product });
  }
  return result;
}

/** Clear all items from user's cart (after order placement). */
export async function clearCart(userId: string): Promise<void> {
  const cartId = await getOrCreateCart(userId);
  if (!cartId) return;
  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
}

export type CustomerOrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

/** Summary row for order history list. */
export type CustomerOrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
};

/** List of orders for the current customer (order history). */
export async function getCustomerOrders(userId: string): Promise<CustomerOrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    created_at: o.created_at,
  }));
}

export type OrderDeliveryFields = {
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
};

export type CustomerOrder = {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  discount_amount: number;
  promo_code: string | null;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
  created_at: string;
  items: CustomerOrderItem[];
} & OrderDeliveryFields;

export type CustomerAddressSummary = {
  fullName: string;
  addressLines: string[];
};

/** Get a single order for the current customer (for confirmation page). */
export async function getCustomerOrder(orderId: string, userId: string): Promise<CustomerOrder | null> {
  const language = getServerLanguage();
  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, subtotal, shipping_cost, tax, total, discount_amount, promo_code, shipping_address, notes, tracking_number, shipping_company, estimated_delivery, created_at, delivery_country, delivery_city_area, delivery_building_type, delivery_zone_no, delivery_street_no, delivery_building_no, delivery_floor_no, delivery_apartment_no, delivery_landmark, delivery_phone, delivery_lat, delivery_lng, delivery_map_url")
    .eq("id", orderId)
    .eq("customer_id", userId)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, unit_price, total_price")
    .eq("order_id", orderId);

  const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
  const { data: products } = await supabase.from("products").select("id, name").in("id", productIds);
  const nameMap = new Map((products ?? []).map((p) => [p.id, p.name]));

  const orderItems: CustomerOrderItem[] = (items ?? []).map((i) => ({
    product_id: i.product_id,
    product_name: localizeProductText(
      nameMap.get(i.product_id) ?? (language === "ar" ? "منتج" : "Product"),
      language
    ),
    quantity: i.quantity,
    unit_price: Number(i.unit_price),
    total_price: Number(i.total_price),
  }));

  return {
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    shipping_cost: Number(order.shipping_cost),
    tax: Number(order.tax),
    total: Number(order.total),
    discount_amount: Number(order.discount_amount ?? 0),
    promo_code: order.promo_code ?? null,
    shipping_address: order.shipping_address as Record<string, unknown> | null,
    notes: order.notes,
    tracking_number: order.tracking_number ?? null,
    shipping_company: order.shipping_company ?? null,
    estimated_delivery: order.estimated_delivery ?? null,
    created_at: order.created_at,
    items: orderItems,
    delivery_country: order.delivery_country ?? null,
    delivery_city_area: order.delivery_city_area ?? null,
    delivery_building_type: order.delivery_building_type ?? null,
    delivery_zone_no: order.delivery_zone_no ?? null,
    delivery_street_no: order.delivery_street_no ?? null,
    delivery_building_no: order.delivery_building_no ?? null,
    delivery_floor_no: order.delivery_floor_no ?? null,
    delivery_apartment_no: order.delivery_apartment_no ?? null,
    delivery_landmark: order.delivery_landmark ?? null,
    delivery_phone: order.delivery_phone ?? null,
    delivery_lat: order.delivery_lat != null ? Number(order.delivery_lat) : null,
    delivery_lng: order.delivery_lng != null ? Number(order.delivery_lng) : null,
    delivery_map_url: order.delivery_map_url ?? null,
  };
}

export type OrderStatusEventRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  source: string;
  created_at: string;
};

/** Status timeline for an order (RLS: own orders only). */
export async function getOrderStatusTimeline(
  orderId: string,
  customerId: string
): Promise<OrderStatusEventRow[]> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("customer_id", customerId)
    .maybeSingle();
  if (!order) return [];

  const { data, error } = await supabase
    .from("order_status_events")
    .select("id, from_status, to_status, source, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) return [];

  return (data ?? []).map((r) => ({
    id: r.id,
    from_status: r.from_status,
    to_status: r.to_status,
    source: r.source,
    created_at: r.created_at,
  }));
}

/** Get the most recent shipping address for the current customer, if any. */
export async function getLastCustomerAddress(userId: string): Promise<CustomerAddressSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("shipping_address, created_at")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.shipping_address) return null;

  const address = data.shipping_address as Record<string, string>;
  const fullName = [address.firstName, address.lastName].filter(Boolean).join(" ");
  const addressLines = [
    address.address,
    [address.city, address.state, address.zip].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean);

  if (!fullName && addressLines.length === 0) return null;

  return {
    fullName: fullName || "",
    addressLines,
  };
}
