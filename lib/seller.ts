import "server-only";
/**
 * Server-only helpers for seller dashboard.
 * All functions require an authenticated user with role seller and a store (owner or member).
 * For types only in Client Components, import from @/lib/seller-types instead.
 */
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import type {
  StoreRow,
  ProductRow,
  SellerStats,
  SellerOrderRow,
  SellerOrderDetail,
  RevenueByMonth,
  SellerOrderStatusAnalytics,
  SellerTopProductAnalytics,
} from "@/lib/seller-types";

export type {
  StoreRow,
  ProductRow,
  SellerStats,
  SellerOrderRow,
  SellerOrderDetail,
  RevenueByMonth,
  SellerOrderStatusAnalytics,
  SellerTopProductAnalytics,
} from "@/lib/seller-types";

/** Get the first store the current user owns or is a member of. Returns null if none. */
export async function getSellerStore(): Promise<StoreRow | null> {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") return null;

  const supabase = await createClient();
  const storeSelect = "id, owner_id, name, slug, description, logo_url, banner_url, status, location, contact_email, contact_phone, social_links, latitude, longitude";
  const { data: owned } = await supabase
    .from("stores")
    .select(storeSelect)
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (owned) return owned as StoreRow;

  const { data: memberRow } = await supabase
    .from("store_members")
    .select("store_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!memberRow) return null;

  const { data: store } = await supabase
    .from("stores")
    .select(storeSelect)
    .eq("id", memberRow.store_id)
    .single();

  return store as StoreRow | null;
}

/** Get stats for a store: product count, order count, total revenue, avg order value. */
export async function getSellerStats(storeId: string): Promise<SellerStats> {
  const supabase = await createClient();

  const { count: productCount } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId);

  const { data: productIds } = await supabase
    .from("products")
    .select("id")
    .eq("store_id", storeId);

  const ids = (productIds ?? []).map((p) => p.id);
  if (ids.length === 0) {
    return {
      productCount: 0,
      orderCount: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
    };
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("order_id, total_price")
    .in("product_id", ids);

  const orderIdSet = new Set<string>();
  let totalRevenue = 0;
  for (const row of orderItems ?? []) {
    orderIdSet.add(row.order_id);
    totalRevenue += Number(row.total_price);
  }

  const orderCount = orderIdSet.size;
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return {
    productCount: productCount ?? 0,
    orderCount,
    totalRevenue,
    avgOrderValue,
  };
}

/** Get products for a store (excludes soft-deleted). Optional limit for overview/dashboard. */
export async function getSellerProducts(storeId: string, limit?: number): Promise<ProductRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("id, store_id, name, slug, description, category, price, metal_type, gold_karat, weight, stock_quantity, status, deleted_at, discount_type, discount_value, discount_start_at, discount_end_at, discount_active")
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (limit != null && limit > 0) query = query.limit(limit);
  const { data: products } = await query;
  if (!products?.length) return [];
  const productIds = products.map((p) => p.id);
  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, url")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });
  const imagesByProduct = new Map<string, string[]>();
  for (const img of images ?? []) {
    const list = imagesByProduct.get(img.product_id) ?? [];
    list.push(img.url);
    imagesByProduct.set(img.product_id, list);
  }
  return products.map((p) => ({
    ...p,
    image_urls: imagesByProduct.get(p.id) ?? [],
  })) as ProductRow[];
}

/** Get a single product by id for edit; must belong to seller's store. */
export async function getSellerProductById(
  productId: string,
  storeId: string
): Promise<import("@/lib/seller-types").SellerProductDetail | null> {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, store_id, name, slug, description, category, price, metal_type, gold_karat, weight, stock_quantity, status, deleted_at, discount_type, discount_value, discount_start_at, discount_end_at, discount_active")
    .eq("id", productId)
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!product) return null;
  const { data: productImages } = await supabase
    .from("product_images")
    .select("id, url, alt, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  return {
    ...product,
    image_urls: (productImages ?? []).map((i) => i.url),
    product_images: (productImages ?? []).map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      sort_order: i.sort_order,
    })),
  } as import("@/lib/seller-types").SellerProductDetail;
}

/** Get order IDs that have at least one item from this store. */
async function getOrderIdsForStore(supabase: Awaited<ReturnType<typeof createClient>>, storeId: string): Promise<string[]> {
  const { data: productIds } = await supabase.from("products").select("id").eq("store_id", storeId);
  const ids = (productIds ?? []).map((p) => p.id);
  if (ids.length === 0) return [];

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id")
    .in("product_id", ids);
  const orderIds = [...new Set((items ?? []).map((i) => i.order_id))];
  return orderIds;
}

/** Get orders that include items from this store, with customer name and item summary. */
export async function getSellerOrders(storeId: string, limit = 50): Promise<SellerOrderRow[]> {
  const supabase = await createClient();
  const orderIds = await getOrderIdsForStore(supabase, storeId);
  if (orderIds.length === 0) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, subtotal, discount_amount, seller_earnings, created_at, customer_id")
    .in("id", orderIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!orders?.length) return [];

  const customerIds = [...new Set(orders.map((o) => o.customer_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", customerIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const { data: allItems } = await supabase
    .from("order_items")
    .select("order_id, product_id, quantity, total_price")
    .in("order_id", orderIds);

  const { data: products } = await supabase
    .from("products")
    .select("id, name")
    .eq("store_id", storeId);

  const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

  const orderItemsByOrder = new Map<string, { product_id: string; quantity: number; total_price: number }[]>();
  for (const item of allItems ?? []) {
    if (!productMap.has(item.product_id)) continue;
    const list = orderItemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    orderItemsByOrder.set(item.order_id, list);
  }

  const result: SellerOrderRow[] = orders.map((o) => {
    const items = orderItemsByOrder.get(o.id) ?? [];
    const itemSummary = items
      .map((i) => `${productMap.get(i.product_id) ?? "Product"} × ${i.quantity}`)
      .join(", ") || "—";
    const storeItemsTotal = items.reduce((s, i) => s + Number(i.total_price ?? 0), 0);
    const subtotalAfterDiscount = Math.max(0, Number(o.subtotal ?? 0) - Number(o.discount_amount ?? 0));
    const sellerEarnings = Number(o.seller_earnings ?? 0);
    const storeEarnings =
      subtotalAfterDiscount > 0 && sellerEarnings >= 0
        ? Math.round((storeItemsTotal / subtotalAfterDiscount) * sellerEarnings * 100) / 100
        : undefined;
    return {
      id: o.id,
      status: o.status,
      total: Number(o.total),
      created_at: o.created_at,
      customer_name: profileMap.get(o.customer_id) ?? null,
      store_earnings: storeEarnings,
      item_summary: itemSummary,
    };
  });

  return result;
}

/** Get a single order by id for the seller's store. Returns null if order not found or has no items from this store. */
export async function getSellerOrderById(orderId: string, storeId: string): Promise<SellerOrderDetail | null> {
  const supabase = await createClient();
  const orderIds = await getOrderIdsForStore(supabase, storeId);
  if (!orderIds.includes(orderId)) return null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, subtotal, shipping_cost, tax, total, discount_amount, seller_earnings, shipping_address, notes, payment_method, tracking_number, shipping_company, estimated_delivery, created_at, updated_at, customer_id, delivery_country, delivery_city_area, delivery_building_type, delivery_zone_no, delivery_street_no, delivery_building_no, delivery_floor_no, delivery_apartment_no, delivery_landmark, delivery_phone, delivery_lat, delivery_lng, delivery_map_url")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", order.customer_id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category")
    .eq("store_id", storeId);

  const productMap = new Map((products ?? []).map((p) => [p.id, { name: p.name, category: p.category }]));
  const pids = [...productMap.keys()];
  if (pids.length === 0) return null;

  const { data: productImages } = await supabase
    .from("product_images")
    .select("product_id, url")
    .in("product_id", pids)
    .order("sort_order", { ascending: true });

  const imageMap = new Map<string, string>();
  for (const img of productImages ?? []) {
    if (!imageMap.has(img.product_id)) {
      imageMap.set(img.product_id, img.url);
    }
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_id, quantity, unit_price, total_price")
    .eq("order_id", orderId)
    .in("product_id", pids);

  const orderItems = (items ?? []).map((i) => {
    const productInfo = productMap.get(i.product_id);
    return {
      id: i.id,
      product_id: i.product_id,
      product_name: productInfo?.name ?? "Product",
      product_image: imageMap.get(i.product_id) ?? null,
      product_category: productInfo?.category ?? null,
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      total_price: Number(i.total_price),
    };
  });

  const subtotalAfterDiscount = Math.max(0, Number(order.subtotal ?? 0) - Number(order.discount_amount ?? 0));
  const storeItemsTotal = orderItems.reduce((sum, i) => sum + i.total_price, 0);
  const sellerEarningsTotal = Number(order.seller_earnings ?? 0);
  const storeEarnings =
    subtotalAfterDiscount > 0 && sellerEarningsTotal >= 0
      ? Math.round((storeItemsTotal / subtotalAfterDiscount) * sellerEarningsTotal * 100) / 100
      : undefined;

  return {
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    shipping_cost: Number(order.shipping_cost),
    tax: Number(order.tax),
    total: Number(order.total),
    shipping_address: order.shipping_address as Record<string, unknown> | null,
    notes: order.notes,
    payment_method: order.payment_method ?? null,
    tracking_number: order.tracking_number ?? null,
    shipping_company: order.shipping_company ?? null,
    estimated_delivery: order.estimated_delivery ?? null,
    created_at: order.created_at,
    updated_at: order.updated_at,
    customer_id: order.customer_id,
    customer_name: profile?.full_name ?? null,
    customer_email: profile?.email ?? null,
    customer_phone: profile?.phone ?? null,
    items: orderItems,
    store_earnings: storeEarnings,
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

export type SellerReviewRow = {
  id: string;
  product_id: string;
  product_name: string;
  customer_id: string;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  created_at: string;
};

/** Get reviews for products in this store (for seller moderation). */
export async function getSellerReviews(storeId: string, limit = 100): Promise<SellerReviewRow[]> {
  const supabase = await createClient();
  const { data: productIds } = await supabase.from("products").select("id, name").eq("store_id", storeId);
  if (!productIds?.length) return [];

  const productMap = new Map(productIds.map((p) => [p.id, p.name]));
  const pids = [...productMap.keys()];

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, product_id, customer_id, rating, title, body, status, created_at")
    .in("product_id", pids)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !reviews?.length) return [];

  const customerIds = [...new Set(reviews.map((r) => r.customer_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", customerIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return reviews.map((r) => ({
    id: r.id,
    product_id: r.product_id,
    product_name: productMap.get(r.product_id) ?? "Product",
    customer_id: r.customer_id,
    customer_name: profileMap.get(r.customer_id) ?? null,
    rating: r.rating,
    title: r.title ?? null,
    body: r.body ?? null,
    status: r.status,
    created_at: r.created_at,
  }));
}

/** Revenue by month for chart (current year). */
export async function getSellerRevenueByMonth(storeId: string): Promise<RevenueByMonth[]> {
  const supabase = await createClient();
  const orderIds = await getOrderIdsForStore(supabase, storeId);
  if (orderIds.length === 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      revenue: 0,
    }));
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at")
    .in("id", orderIds);

  const orderIdsThisYear = (orders ?? []).filter((o) => new Date(o.created_at).getFullYear() === new Date().getFullYear()).map((o) => o.id);
  if (orderIdsThisYear.length === 0) {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      revenue: 0,
    }));
  }

  const { data: productIds } = await supabase.from("products").select("id").eq("store_id", storeId);
  const pids = (productIds ?? []).map((p) => p.id);

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, total_price")
    .in("order_id", orderIdsThisYear)
    .in("product_id", pids);

  const orderMonth = new Map<string, number>();
  for (const o of orders ?? []) {
    if (!orderIdsThisYear.includes(o.id)) continue;
    const m = new Date(o.created_at).getMonth();
    orderMonth.set(o.id, m);
  }

  const monthly: number[] = new Array(12).fill(0);
  for (const item of items ?? []) {
    const month = orderMonth.get(item.order_id);
    if (month !== undefined) monthly[month] += Number(item.total_price);
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthly.map((revenue, i) => ({ month: months[i], revenue }));
}

/** Seller analytics: order status breakdown for this store. */
export async function getSellerOrderStatusBreakdown(storeId: string): Promise<SellerOrderStatusAnalytics[]> {
  const supabase = await createClient();
  const orderIds = await getOrderIdsForStore(supabase, storeId);
  if (orderIds.length === 0) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, subtotal, discount_amount")
    .in("id", orderIds);
  if (!orders?.length) return [];

  const { data: productIds } = await supabase.from("products").select("id").eq("store_id", storeId);
  const pids = (productIds ?? []).map((p) => p.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id, product_id, total_price")
    .in("order_id", orderIds)
    .in("product_id", pids);

  const storeTotalByOrder = new Map<string, number>();
  for (const item of items ?? []) {
    storeTotalByOrder.set(item.order_id, (storeTotalByOrder.get(item.order_id) ?? 0) + Number(item.total_price ?? 0));
  }

  const byStatus = new Map<string, { count: number; total: number }>();
  for (const order of orders as { id: string; status: string; subtotal: number; discount_amount: number; total: number }[]) {
    const status = order.status ?? "unknown";
    const subtotalAfterDiscount = Math.max(0, Number(order.subtotal ?? 0) - Number(order.discount_amount ?? 0));
    const storePart = Number(storeTotalByOrder.get(order.id) ?? 0);
    const proportionalTotal =
      subtotalAfterDiscount > 0 ? (storePart / subtotalAfterDiscount) * Number(order.total ?? 0) : 0;

    const cur = byStatus.get(status) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += proportionalTotal;
    byStatus.set(status, cur);
  }

  return [...byStatus.entries()]
    .map(([status, v]) => ({
      status,
      count: v.count,
      total: Math.round(v.total * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Seller analytics: top products by quantity/revenue. */
export async function getSellerTopProductsAnalytics(
  storeId: string,
  limit: number = 8
): Promise<SellerTopProductAnalytics[]> {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("id, name").eq("store_id", storeId);
  if (!products?.length) return [];

  const pids = products.map((p) => p.id);
  const nameMap = new Map(products.map((p) => [p.id, p.name ?? "Product"]));
  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity, total_price")
    .in("product_id", pids);
  if (!items?.length) return [];

  const byProduct = new Map<string, { quantity: number; revenue: number }>();
  for (const item of items as { product_id: string; quantity: number; total_price: number }[]) {
    const cur = byProduct.get(item.product_id) ?? { quantity: 0, revenue: 0 };
    cur.quantity += Number(item.quantity ?? 0);
    cur.revenue += Number(item.total_price ?? 0);
    byProduct.set(item.product_id, cur);
  }

  return [...byProduct.entries()]
    .map(([product_id, v]) => ({
      product_id,
      product_name: nameMap.get(product_id) ?? "Product",
      quantity_sold: v.quantity,
      revenue: Math.round(v.revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
