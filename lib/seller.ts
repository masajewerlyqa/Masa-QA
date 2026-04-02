import "server-only";
/**
 * Server-only helpers for seller dashboard.
 * All functions require an authenticated user with role seller and a store (owner or member).
 * For types only in Client Components, import from @/lib/seller-types instead.
 */
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { loadProductEngagementStats, zeroEngagementStats } from "@/lib/product-engagement-stats";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getPricingMarketSnapshot } from "@/lib/pricing";
import { computeDynamicMarketPriceUsd } from "@/lib/pricing-engine";
import { QAR_TO_USD } from "@/lib/market-prices";
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

function normalizeStoreRow(raw: Record<string, unknown>): StoreRow {
  const base = raw as unknown as StoreRow;
  const sp = raw.seller_plan;
  const sellerPlan = sp === "basic" || sp === "premium" ? sp : null;
  return {
    ...base,
    business_timezone: typeof raw.business_timezone === "string" ? raw.business_timezone : "Asia/Qatar",
    working_days: Array.isArray(raw.working_days) ? (raw.working_days as number[]) : [],
    opening_time_local: raw.opening_time_local != null ? String(raw.opening_time_local) : null,
    closing_time_local: raw.closing_time_local != null ? String(raw.closing_time_local) : null,
    seller_plan: sellerPlan,
  };
}

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
  const storeSelect =
    "id, owner_id, name, slug, description, logo_url, banner_url, status, location, contact_email, contact_phone, social_links, latitude, longitude, " +
    "business_timezone, working_days, opening_time_local, closing_time_local, seller_plan";
  const { data: owned } = await supabase
    .from("stores")
    .select(storeSelect)
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (owned) return normalizeStoreRow(owned as unknown as Record<string, unknown>);

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

  return store ? normalizeStoreRow(store as unknown as Record<string, unknown>) : null;
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
  const marketSnapshot = await getPricingMarketSnapshot();
  let query = supabase
    .from("products")
    .select("id, store_id, name, slug, description, category, price, metal_type, gold_karat, weight, craftsmanship_margin, stock_quantity, status, deleted_at, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, created_at")
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

  const service = createServiceClient();
  const engagement = service
    ? await loadProductEngagementStats(service, productIds)
    : zeroEngagementStats(productIds);

  return products.map((p) => {
    const dynamic = computeDynamicMarketPriceUsd(
      {
        metalType: p.metal_type,
        goldKarat: p.gold_karat,
        weight: p.weight,
        craftsmanshipMargin: p.craftsmanship_margin,
        storedPrice: p.price,
      },
      marketSnapshot ?? {},
      QAR_TO_USD
    );
    return {
      ...p,
      price: dynamic.finalPriceUsd,
      image_urls: imagesByProduct.get(p.id) ?? [],
      units_sold: engagement.unitsSold[p.id] ?? 0,
      wishlist_count: engagement.wishlistCount[p.id] ?? 0,
      revenue_usd: engagement.revenueUsd[p.id] ?? 0,
      units_cancelled: engagement.unitsCancelled[p.id] ?? 0,
    };
  }) as ProductRow[];
}

/** Get a single product by id for edit; must belong to seller's store. */
export async function getSellerProductById(
  productId: string,
  storeId: string
): Promise<import("@/lib/seller-types").SellerProductDetail | null> {
  const supabase = await createClient();
  const marketSnapshot = await getPricingMarketSnapshot();
  const { data: product } = await supabase
    .from("products")
    .select("id, store_id, name, slug, description, category, price, metal_type, gold_karat, weight, craftsmanship_margin, stock_quantity, status, deleted_at, discount_type, discount_value, discount_start_at, discount_end_at, discount_active, created_at")
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
  const dynamic = computeDynamicMarketPriceUsd(
    {
      metalType: product.metal_type,
      goldKarat: product.gold_karat,
      weight: product.weight,
      craftsmanshipMargin: product.craftsmanship_margin,
      storedPrice: product.price,
    },
    marketSnapshot ?? {},
    QAR_TO_USD
  );
  const service = createServiceClient();
  const engagement = service
    ? await loadProductEngagementStats(service, [productId])
    : zeroEngagementStats([productId]);
  return {
    ...product,
    price: dynamic.finalPriceUsd,
    image_urls: (productImages ?? []).map((i) => i.url),
    product_images: (productImages ?? []).map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      sort_order: i.sort_order,
    })),
    units_sold: engagement.unitsSold[productId] ?? 0,
    wishlist_count: engagement.wishlistCount[productId] ?? 0,
    revenue_usd: engagement.revenueUsd[productId] ?? 0,
    units_cancelled: engagement.unitsCancelled[productId] ?? 0,
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
    .select("id, order_number, status, total, subtotal, discount_amount, seller_earnings, created_at, customer_id")
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
      order_number: o.order_number ?? null,
      status: o.status,
      total: Number(o.total),
      created_at: o.created_at,
      customer_name: profileMap.get(o.customer_id) ?? null,
      store_earnings: storeEarnings,
      item_summary: itemSummary,
      seller_response_deadline: (o as { seller_response_deadline?: string | null }).seller_response_deadline ?? null,
    };
  });

  return result;
}

/** Get a single order by id for the seller's store. Returns null if order not found or has no items from this store. */
export async function getSellerOrderById(orderId: string, storeId: string): Promise<SellerOrderDetail | null> {
  const supabase = await createClient();
  const orderIds = await getOrderIdsForStore(supabase, storeId);
  if (!orderIds.includes(orderId)) return null;

  // Use * so missing optional columns (e.g. before migration) do not break the query.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return null;

  const orderRow = order as Record<string, unknown> & {
    id: string;
    order_number?: string | null;
    status: string;
    subtotal: unknown;
    shipping_cost: unknown;
    tax: unknown;
    total: unknown;
    discount_amount: unknown;
    seller_earnings: unknown;
    shipping_address: unknown;
    notes: unknown;
    payment_method: unknown;
    tracking_number: unknown;
    shipping_company: unknown;
    estimated_delivery: unknown;
    created_at: string;
    updated_at: string;
    customer_id: string;
    delivery_country: unknown;
    delivery_city_area: unknown;
    delivery_building_type: unknown;
    delivery_zone_no: unknown;
    delivery_street_no: unknown;
    delivery_building_no: unknown;
    delivery_floor_no: unknown;
    delivery_apartment_no: unknown;
    delivery_landmark: unknown;
    delivery_phone: unknown;
    delivery_lat: unknown;
    delivery_lng: unknown;
    delivery_map_url: unknown;
    seller_cancellation_reason?: unknown;
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", orderRow.customer_id)
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

  const subtotalAfterDiscount = Math.max(0, Number(orderRow.subtotal ?? 0) - Number(orderRow.discount_amount ?? 0));
  const storeItemsTotal = orderItems.reduce((sum, i) => sum + i.total_price, 0);
  const sellerEarningsTotal = Number(orderRow.seller_earnings ?? 0);
  const storeEarnings =
    subtotalAfterDiscount > 0 && sellerEarningsTotal >= 0
      ? Math.round((storeItemsTotal / subtotalAfterDiscount) * sellerEarningsTotal * 100) / 100
      : undefined;

  const cancelReason = orderRow.seller_cancellation_reason;
  const sellerCancellationReason =
    typeof cancelReason === "string" ? cancelReason : cancelReason == null ? null : String(cancelReason);
  const platformReason = orderRow.platform_cancellation_reason;
  const platformCancellationReason =
    typeof platformReason === "string" ? platformReason : platformReason == null ? null : String(platformReason);
  const rawDeadline = orderRow.seller_response_deadline;
  const sellerResponseDeadline =
    typeof rawDeadline === "string" ? rawDeadline : rawDeadline == null ? null : String(rawDeadline);

  return {
    id: orderRow.id,
    order_number: orderRow.order_number ?? null,
    status: orderRow.status,
    subtotal: Number(orderRow.subtotal),
    shipping_cost: Number(orderRow.shipping_cost),
    tax: Number(orderRow.tax),
    total: Number(orderRow.total),
    shipping_address: orderRow.shipping_address as Record<string, unknown> | null,
    notes: orderRow.notes as string | null,
    payment_method: orderRow.payment_method as string | null,
    tracking_number: orderRow.tracking_number as string | null,
    shipping_company: orderRow.shipping_company as string | null,
    estimated_delivery: orderRow.estimated_delivery as string | null,
    created_at: orderRow.created_at,
    updated_at: orderRow.updated_at,
    customer_id: orderRow.customer_id,
    customer_name: profile?.full_name ?? null,
    customer_email: profile?.email ?? null,
    customer_phone: profile?.phone ?? null,
    items: orderItems,
    store_earnings: storeEarnings,
    delivery_country: orderRow.delivery_country as string | null,
    delivery_city_area: orderRow.delivery_city_area as string | null,
    delivery_building_type: orderRow.delivery_building_type as string | null,
    delivery_zone_no: orderRow.delivery_zone_no as string | null,
    delivery_street_no: orderRow.delivery_street_no as string | null,
    delivery_building_no: orderRow.delivery_building_no as string | null,
    delivery_floor_no: orderRow.delivery_floor_no as string | null,
    delivery_apartment_no: orderRow.delivery_apartment_no as string | null,
    delivery_landmark: orderRow.delivery_landmark as string | null,
    delivery_phone: orderRow.delivery_phone as string | null,
    delivery_lat: orderRow.delivery_lat != null ? Number(orderRow.delivery_lat) : null,
    delivery_lng: orderRow.delivery_lng != null ? Number(orderRow.delivery_lng) : null,
    delivery_map_url: orderRow.delivery_map_url as string | null,
    seller_cancellation_reason: sellerCancellationReason,
    platform_cancellation_reason: platformCancellationReason,
    seller_response_deadline: sellerResponseDeadline,
    cancellation_source:
      orderRow.cancellation_source === "seller" || orderRow.cancellation_source === "system" || orderRow.cancellation_source === "customer"
        ? orderRow.cancellation_source
        : null,
    auto_cancelled_at:
      orderRow.auto_cancelled_at != null && typeof orderRow.auto_cancelled_at === "string"
        ? orderRow.auto_cancelled_at
        : null,
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
