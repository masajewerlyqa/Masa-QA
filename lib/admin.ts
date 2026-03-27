"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getPricingMarketSnapshot } from "@/lib/pricing";
import { computeDynamicMarketPriceUsd } from "@/lib/pricing-engine";
import { QAR_TO_USD } from "@/lib/market-prices";

export type AdminMetrics = {
  totalUsers: number;
  totalSellers: number;
  pendingSellerApplications: number;
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommissions: number;
  totalSellerEarnings: number;
};

export type RecentApplicationRow = {
  id: string;
  status: string;
  business_name: string;
  contact_email: string;
  contact_full_name: string | null;
  created_at: string;
  applicant_name: string;
};

export type RecentOrderRow = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
};

export type AdminReviewRow = {
  id: string;
  product_id: string;
  product_name: string;
  store_name: string | null;
  customer_name: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

/** Fetch platform metrics for admin dashboard. Caller must be admin. */
export async function getAdminMetrics(): Promise<AdminMetrics | null> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return null;

  const supabase = await createClient();

  const [
    usersRes,
    sellersRes,
    pendingAppsRes,
    storesRes,
    productsRes,
    ordersRes,
    revenueRes,
    commissionRes,
    sellerEarningsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "seller"),
    supabase
      .from("seller_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase.from("orders").select("commission_amount").neq("status", "cancelled"),
    supabase.from("orders").select("seller_earnings").neq("status", "cancelled"),
  ]);

  let totalRevenue = 0;
  if (revenueRes.data) {
    totalRevenue = (revenueRes.data as { total: number }[]).reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  }
  let totalCommissions = 0;
  if (commissionRes.data) {
    totalCommissions = (commissionRes.data as { commission_amount: number }[]).reduce(
      (sum, row) => sum + Number(row.commission_amount ?? 0),
      0
    );
  }
  let totalSellerEarnings = 0;
  if (sellerEarningsRes.data) {
    totalSellerEarnings = (sellerEarningsRes.data as { seller_earnings: number }[]).reduce(
      (sum, row) => sum + Number(row.seller_earnings ?? 0),
      0
    );
  }

  return {
    totalUsers: usersRes.count ?? 0,
    totalSellers: sellersRes.count ?? 0,
    pendingSellerApplications: pendingAppsRes.count ?? 0,
    totalStores: storesRes.count ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCommissions: Math.round(totalCommissions * 100) / 100,
    totalSellerEarnings: Math.round(totalSellerEarnings * 100) / 100,
  };
}

export type CommissionBySellerRow = {
  store_id: string;
  store_name: string;
  commission: number;
  seller_earnings: number;
};

/** Commission and seller earnings per store (admin). */
export async function getAdminCommissionBySeller(): Promise<CommissionBySellerRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orders } = await service
    .from("orders")
    .select("id, subtotal, discount_amount, commission_amount, seller_earnings")
    .neq("status", "cancelled");

  if (!orders?.length) return [];

  const orderIds = (orders as { id: string }[]).map((o) => o.id);
  const { data: items } = await service
    .from("order_items")
    .select("order_id, product_id, total_price")
    .in("order_id", orderIds);

  const { data: products } = await service
    .from("products")
    .select("id, store_id")
    .in("id", [...new Set((items ?? []).map((i: { product_id: string }) => i.product_id))]);

  const productToStore = new Map((products ?? []).map((p: { id: string; store_id: string }) => [p.id, p.store_id]));
  const orderMap = new Map(
    (orders as any[]).map((o) => [
      o.id,
      {
        subtotalAfterDiscount: Math.max(0, Number(o.subtotal ?? 0) - Number(o.discount_amount ?? 0)),
        commission_amount: Number(o.commission_amount ?? 0),
        seller_earnings: Number(o.seller_earnings ?? 0),
      },
    ])
  );

  const storeSums = new Map<string, { commission: number; seller_earnings: number }>();
  for (const item of items ?? []) {
    const storeId = productToStore.get(item.product_id);
    if (!storeId) continue;
    const order = orderMap.get(item.order_id);
    if (!order || order.subtotalAfterDiscount <= 0) continue;
    const itemTotal = Number(item.total_price ?? 0);
    const share = itemTotal / order.subtotalAfterDiscount;
    const commission = share * order.commission_amount;
    const earnings = share * order.seller_earnings;
    const cur = storeSums.get(storeId) ?? { commission: 0, seller_earnings: 0 };
    storeSums.set(storeId, {
      commission: cur.commission + commission,
      seller_earnings: cur.seller_earnings + earnings,
    });
  }

  const storeIds = [...storeSums.keys()];
  const { data: stores } = await service.from("stores").select("id, name").in("id", storeIds);
  const storeNames = new Map((stores ?? []).map((s: { id: string; name: string }) => [s.id, s.name ?? ""]));

  return storeIds.map((store_id) => {
    const sums = storeSums.get(store_id)!;
    return {
      store_id,
      store_name: storeNames.get(store_id) ?? "—",
      commission: Math.round(sums.commission * 100) / 100,
      seller_earnings: Math.round(sums.seller_earnings * 100) / 100,
    };
  });
}

export type CommissionMonthlyRow = {
  month: string;
  commission: number;
  seller_earnings: number;
};

export type AdminPlatformSnapshotRow = {
  month: string;
  revenue: number;
  orders: number;
};

/** Monthly platform revenue and order volume for current year (admin). */
export async function getAdminPlatformSnapshotMonthly(): Promise<AdminPlatformSnapshotRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orders } = await service
    .from("orders")
    .select("created_at, total")
    .neq("status", "cancelled");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const byMonth = new Map<string, { revenue: number; orders: number }>();
  months.forEach((m) => byMonth.set(m, { revenue: 0, orders: 0 }));

  if (!orders?.length) {
    return months.map((month) => ({ month, revenue: 0, orders: 0 }));
  }

  const currentYear = new Date().getFullYear();
  for (const row of orders as { created_at: string; total: number | null }[]) {
    const d = new Date(row.created_at);
    if (d.getFullYear() !== currentYear) continue;
    const key = months[d.getMonth()];
    const cur = byMonth.get(key);
    if (!cur) continue;
    cur.revenue += Number(row.total ?? 0);
    cur.orders += 1;
  }

  return months.map((month) => {
    const v = byMonth.get(month)!;
    return {
      month,
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders,
    };
  });
}

export type AdminOrderStatusRow = {
  status: string;
  count: number;
  total: number;
};

/** Order status breakdown for admin analytics. */
export async function getAdminOrderStatusBreakdown(): Promise<AdminOrderStatusRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orders } = await service.from("orders").select("status, total");
  if (!orders?.length) return [];

  const byStatus = new Map<string, { count: number; total: number }>();
  for (const o of orders as { status: string | null; total: number | null }[]) {
    const key = o.status ?? "unknown";
    const cur = byStatus.get(key) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(o.total ?? 0);
    byStatus.set(key, cur);
  }

  return [...byStatus.entries()]
    .map(([status, v]) => ({
      status,
      count: v.count,
      total: Math.round(v.total * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);
}

export type AdminCategoryRevenueRow = {
  category: string;
  revenue: number;
};

/** Revenue by product category from sold order items. */
export async function getAdminCategoryRevenue(): Promise<AdminCategoryRevenueRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orderItems } = await service.from("order_items").select("product_id, total_price");
  if (!orderItems?.length) return [];

  const productIds = [...new Set((orderItems as { product_id: string }[]).map((i) => i.product_id))];
  const { data: products } = await service.from("products").select("id, category").in("id", productIds);
  const categoryByProduct = new Map((products ?? []).map((p: { id: string; category: string | null }) => [p.id, p.category ?? "Other"]));

  const byCategory = new Map<string, number>();
  for (const item of orderItems as { product_id: string; total_price: number | null }[]) {
    const category = categoryByProduct.get(item.product_id) ?? "Other";
    byCategory.set(category, (byCategory.get(category) ?? 0) + Number(item.total_price ?? 0));
  }

  return [...byCategory.entries()]
    .map(([category, revenue]) => ({
      category,
      revenue: Math.round(revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export type AdminTopSellerAnalyticsRow = {
  store_id: string;
  store_name: string;
  revenue: number;
  orders: number;
};

/** Top stores by revenue from sold order items. */
export async function getAdminTopSellersAnalytics(limit: number = 10): Promise<AdminTopSellerAnalyticsRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orderItems } = await service.from("order_items").select("order_id, product_id, total_price");
  if (!orderItems?.length) return [];

  const productIds = [...new Set((orderItems as { product_id: string }[]).map((i) => i.product_id))];
  const { data: products } = await service.from("products").select("id, store_id").in("id", productIds);
  const storeByProduct = new Map((products ?? []).map((p: { id: string; store_id: string | null }) => [p.id, p.store_id]));

  const byStore = new Map<string, { revenue: number; orderIds: Set<string> }>();
  for (const item of orderItems as { order_id: string; product_id: string; total_price: number | null }[]) {
    const storeId = storeByProduct.get(item.product_id);
    if (!storeId) continue;
    const cur = byStore.get(storeId) ?? { revenue: 0, orderIds: new Set<string>() };
    cur.revenue += Number(item.total_price ?? 0);
    cur.orderIds.add(item.order_id);
    byStore.set(storeId, cur);
  }

  const storeIds = [...byStore.keys()];
  const { data: stores } = await service.from("stores").select("id, name").in("id", storeIds);
  const storeNames = new Map((stores ?? []).map((s: { id: string; name: string }) => [s.id, s.name ?? "—"]));

  return storeIds
    .map((store_id) => {
      const v = byStore.get(store_id)!;
      return {
        store_id,
        store_name: storeNames.get(store_id) ?? "—",
        revenue: Math.round(v.revenue * 100) / 100,
        orders: v.orderIds.size,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** Monthly commission and seller earnings for current year (admin). */
export async function getAdminCommissionMonthly(): Promise<CommissionMonthlyRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orders } = await service
    .from("orders")
    .select("id, created_at, commission_amount, seller_earnings")
    .neq("status", "cancelled");

  if (!orders?.length) return [];

  const currentYear = new Date().getFullYear();
  const byMonth = new Map<string, { commission: number; seller_earnings: number }>();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  months.forEach((m) => byMonth.set(m, { commission: 0, seller_earnings: 0 }));

  for (const o of orders as any[]) {
    const d = new Date(o.created_at);
    if (d.getFullYear() !== currentYear) continue;
    const key = months[d.getMonth()];
    const cur = byMonth.get(key)!;
    cur.commission += Number(o.commission_amount ?? 0);
    cur.seller_earnings += Number(o.seller_earnings ?? 0);
  }

  return months.map((month) => {
    const v = byMonth.get(month)!;
    return {
      month,
      commission: Math.round(v.commission * 100) / 100,
      seller_earnings: Math.round(v.seller_earnings * 100) / 100,
    };
  });
}

/** Recent seller applications for admin dashboard. Caller must be admin. */
export async function getRecentSellerApplications(limit: number = 10): Promise<RecentApplicationRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seller_applications")
    .select(
      "id, status, business_name, contact_email, contact_full_name, created_at, " +
        "profiles:profiles!seller_applications_user_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    business_name: row.business_name ?? "",
    contact_email: row.contact_email ?? "",
    contact_full_name: row.contact_full_name ?? null,
    created_at: row.created_at,
    applicant_name:
      row.contact_full_name ?? row.profiles?.full_name ?? row.contact_email ?? "—",
  }));
}

/** Recent orders for admin dashboard. Caller must be admin. */
export async function getRecentOrders(limit: number = 10): Promise<RecentOrderRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    total: Number(row.total ?? 0),
    created_at: row.created_at,
    customer_name: row.profiles?.full_name ?? null,
    customer_email: row.profiles?.email ?? null,
  }));
}

/** All product reviews for admin moderation. Uses service client for reliable reads; caller must be admin. */
export async function getAdminReviews(limit: number = 100): Promise<AdminReviewRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();

  // 1) Fetch only from reviews table (no joins – avoids PostgREST relation naming issues)
  const { data: reviewRows, error: reviewsError } = await service
    .from("reviews")
    .select("id, product_id, customer_id, rating, title, body, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reviewsError) {
    console.error("[getAdminReviews] reviews query error:", reviewsError.message, reviewsError.code);
    return [];
  }
  if (!reviewRows || reviewRows.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.log("[getAdminReviews] count: 0 (no rows in reviews table)");
    }
    return [];
  }

  const productIds = [...new Set((reviewRows as { product_id: string }[]).map((r) => r.product_id))];
  const customerIds = [...new Set((reviewRows as { customer_id: string }[]).map((r) => r.customer_id))];

  // 2) Fetch product names and store_ids
  const { data: productsData } = await service
    .from("products")
    .select("id, name, store_id")
    .in("id", productIds);
  const products = (productsData ?? []) as { id: string; name: string | null; store_id: string | null }[];
  const productMap = new Map(products.map((p) => [p.id, p]));
  const storeIds = [...new Set(products.map((p) => p.store_id).filter(Boolean))] as string[];

  // 3) Fetch store names (map store id -> name string for rendering)
  let storeMap = new Map<string, string>();
  if (storeIds.length > 0) {
    const { data: storesData } = await service.from("stores").select("id, name").in("id", storeIds);
    const stores = (storesData ?? []) as { id: string; name: string }[];
    storeMap = new Map(stores.map((s) => [s.id, s.name ?? ""]));
  }

  // 4) Fetch customer names (profiles)
  const { data: profilesData } = await service
    .from("profiles")
    .select("id, full_name")
    .in("id", customerIds);
  const profiles = (profilesData ?? []) as { id: string; full_name: string | null }[];
  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name ?? null]));

  const out: AdminReviewRow[] = (reviewRows as any[]).map((row) => {
    const product = productMap.get(row.product_id);
    const storeId = product?.store_id ?? null;
    const storeName = storeId ? storeMap.get(storeId) ?? null : null;
    return {
      id: row.id,
      product_id: row.product_id,
      product_name: product?.name ?? "—",
      store_name: storeName ?? null,
      customer_name: profileMap.get(row.customer_id) ?? null,
      rating: Number(row.rating) ?? 0,
      title: row.title ?? null,
      body: row.body ?? null,
      status: (row.status ?? "pending") as "pending" | "approved" | "rejected",
      created_at: row.created_at,
    };
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[getAdminReviews] rows from DB:",
      out.length,
      "| pending:",
      out.filter((r) => r.status === "pending").length,
      "| approved:",
      out.filter((r) => r.status === "approved").length,
      "| rejected:",
      out.filter((r) => r.status === "rejected").length
    );
  }
  return out;
}

const CHART_COLORS = ["#531C24", "#E7D8C3", "#D4AF37", "#8F8F8F", "#F7F3EE", "#C4A77D"];

export type CategorySlice = { name: string; value: number; color: string };

/** Product count by category for dashboard pie chart. Caller must be admin. */
export async function getAdminCategoryDistribution(): Promise<CategorySlice[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error || !data) return [];

  const countByCategory: Record<string, number> = {};
  for (const row of data as { category: string }[]) {
    const cat = String(row.category ?? "").trim() || "Other";
    countByCategory[cat] = (countByCategory[cat] ?? 0) + 1;
  }

  return Object.entries(countByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name], i) => ({
      name,
      value: countByCategory[name],
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
}

export type AdminProductRow = {
  id: string;
  name: string;
  store_name: string;
  price: number;
  craftsmanship_margin: number;
  market_linked: boolean;
  category: string | null;
  status: string;
};

export type AdminOrderRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  total: number;
  status: string;
  created_at: string;
};

/** All products for admin (all statuses). Caller must be admin. */
export async function getAdminProducts(limit: number = 500): Promise<AdminProductRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const marketSnapshot = await getPricingMarketSnapshot();
  const { data: productRows, error } = await service
    .from("products")
    .select("id, name, store_id, price, status, category, metal_type, gold_karat, weight, craftsmanship_margin")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !productRows?.length) return [];

  const storeIds = [...new Set((productRows as { store_id: string }[]).map((p) => p.store_id))];
  const { data: storesData } = await service.from("stores").select("id, name").in("id", storeIds);
  const stores = (storesData ?? []) as { id: string; name: string }[];
  const storeMap = new Map(stores.map((s) => [s.id, s.name ?? ""]));

  return (productRows as any[]).map((row) => {
    const dynamic = computeDynamicMarketPriceUsd(
      {
        metalType: row.metal_type,
        goldKarat: row.gold_karat,
        weight: row.weight,
        craftsmanshipMargin: row.craftsmanship_margin,
        storedPrice: row.price,
      },
      marketSnapshot ?? {},
      QAR_TO_USD
    );
    return {
      id: row.id,
      name: row.name ?? "—",
      store_name: storeMap.get(row.store_id) ?? "—",
      price: Number(dynamic.finalPriceUsd) ?? 0,
      craftsmanship_margin: Number(row.craftsmanship_margin ?? 0),
      market_linked: dynamic.marketLinked,
      category: row.category ?? null,
      status: row.status ?? "draft",
    };
  });
}

/** All orders for admin. Caller must be admin. */
export async function getAdminOrders(limit: number = 200): Promise<AdminOrderRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: orderRows, error } = await service
    .from("orders")
    .select("id, customer_id, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !orderRows?.length) {
    return [];
  }

  const customerIds = [...new Set((orderRows as { customer_id: string }[]).map((o) => o.customer_id))];
  const { data: profilesData } = await service.from("profiles").select("id, full_name, email").in("id", customerIds);
  const profiles = (profilesData ?? []) as { id: string; full_name: string | null; email: string | null }[];
  const profileMap = new Map(profiles.map((p) => [p.id, { name: p.full_name ?? null, email: p.email ?? null }]));

  return (orderRows as any[]).map((row) => {
    const profile = profileMap.get(row.customer_id);
    return {
      id: row.id,
      customer_name: profile?.name ?? null,
      customer_email: profile?.email ?? null,
      total: Number(row.total) ?? 0,
      status: row.status ?? "pending",
      created_at: row.created_at,
    };
  });
}

export type AdminStoreRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  location: string | null;
  product_count: number;
  created_at: string;
};

/** All stores for admin store management. Caller must be admin. */
export async function getAdminStores(): Promise<AdminStoreRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const supabase = await createClient();
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, slug, status, location, created_at")
    .order("created_at", { ascending: false });

  if (error || !stores) return [];

  const productCounts = await Promise.all(
    (stores as { id: string }[]).map(async (s) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("store_id", s.id);
      return { id: s.id, count: count ?? 0 };
    })
  );
  const countMap = new Map(productCounts.map((c) => [c.id, c.count]));

  return (stores as any[]).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    status: s.status ?? "pending",
    location: s.location ?? null,
    product_count: countMap.get(s.id) ?? 0,
    created_at: s.created_at,
  }));
}

export type AdminSellerRow = {
  id: string;
  name: string;
  email: string;
  stores: number;
  products: number;
  status: "Active" | "Pending";
};

/** All sellers for admin seller management. Caller must be admin. */
export async function getAdminSellers(): Promise<AdminSellerRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();

  const { data: sellerProfiles, error: sellerError } = await service
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "seller")
    .order("created_at", { ascending: false });

  if (sellerError || !sellerProfiles) return [];

  const sellerIds = (sellerProfiles as { id: string }[]).map((s) => s.id);
  if (sellerIds.length === 0) return [];

  const { data: storesData } = await service
    .from("stores")
    .select("id, owner_id, status")
    .in("owner_id", sellerIds);

  const storeRows = (storesData ?? []) as { id: string; owner_id: string; status: string | null }[];
  const storesByOwner = new Map<string, { count: number; hasActive: boolean }>();
  for (const store of storeRows) {
    const cur = storesByOwner.get(store.owner_id) ?? { count: 0, hasActive: false };
    cur.count += 1;
    if (store.status === "approved" || store.status === "active") {
      cur.hasActive = true;
    }
    storesByOwner.set(store.owner_id, cur);
  }

  const storeIds = storeRows.map((s) => s.id);
  const productsByOwner = new Map<string, number>();

  if (storeIds.length > 0) {
    const { data: productsData } = await service
      .from("products")
      .select("id, store_id")
      .in("store_id", storeIds);

    const storeOwnerMap = new Map(storeRows.map((s) => [s.id, s.owner_id]));
    for (const p of (productsData ?? []) as { id: string; store_id: string }[]) {
      const ownerId = storeOwnerMap.get(p.store_id);
      if (!ownerId) continue;
      productsByOwner.set(ownerId, (productsByOwner.get(ownerId) ?? 0) + 1);
    }
  }

  return (sellerProfiles as { id: string; full_name: string | null; email: string | null }[]).map((seller) => {
    const storeMeta = storesByOwner.get(seller.id) ?? { count: 0, hasActive: false };
    return {
      id: seller.id,
      name: seller.full_name?.trim() || seller.email || "—",
      email: seller.email ?? "—",
      stores: storeMeta.count,
      products: productsByOwner.get(seller.id) ?? 0,
      status: storeMeta.hasActive ? "Active" : "Pending",
    };
  });
}

/** Admin approve or reject a store. Caller must be admin. */
export async function updateStoreStatusAction(
  storeId: string,
  status: "approved" | "rejected"
): Promise<{ ok: boolean; error?: string }> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return { ok: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("stores").update({ status }).eq("id", storeId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/stores");
  revalidatePath("/admin");
  revalidatePath("/discover");
  return { ok: true };
}

export type AdminPromoRow = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  store_id: string | null;
  store_name: string | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

/** All promo codes for admin. Caller must be admin. */
export async function getAdminPromoCodes(limit: number = 200): Promise<AdminPromoRow[]> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return [];

  const service = createServiceClient();
  const { data: rows, error } = await service
    .from("promo_codes")
    .select("id, code, type, value, store_id, min_order_amount, usage_limit, used_count, active, starts_at, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !rows?.length) return [];

  const storeIds = [...new Set((rows as { store_id: string | null }[]).map((r) => r.store_id).filter(Boolean))] as string[];
  let storeMap = new Map<string, string>();
  if (storeIds.length > 0) {
    const { data: storesData } = await service.from("stores").select("id, name").in("id", storeIds);
    const stores = (storesData ?? []) as { id: string; name: string }[];
    storeMap = new Map(stores.map((s) => [s.id, s.name ?? ""]));
  }

  return (rows as any[]).map((row) => ({
    id: row.id,
    code: row.code ?? "",
    type: row.type ?? "percentage",
    value: Number(row.value) ?? 0,
    store_id: row.store_id ?? null,
    store_name: row.store_id ? (storeMap.get(row.store_id) ?? null) : null,
    min_order_amount: Number(row.min_order_amount) ?? 0,
    usage_limit: row.usage_limit != null ? Number(row.usage_limit) : null,
    used_count: Number(row.used_count) ?? 0,
    active: Boolean(row.active),
    starts_at: row.starts_at ?? null,
    expires_at: row.expires_at ?? null,
    created_at: row.created_at,
  }));
}

export type AdminOrderDetail = {
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
  payment_method: string | null;
  tracking_number: string | null;
  shipping_company: string | null;
  estimated_delivery: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
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
  items: { product_id: string; product_name: string; quantity: number; unit_price: number; total_price: number }[];
};

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetail | null> {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") return null;

  const service = createServiceClient();
  const { data: order, error } = await service
    .from("orders")
    .select("id, status, subtotal, shipping_cost, tax, total, discount_amount, promo_code, shipping_address, notes, payment_method, tracking_number, shipping_company, estimated_delivery, created_at, customer_id, delivery_country, delivery_city_area, delivery_building_type, delivery_zone_no, delivery_street_no, delivery_building_no, delivery_floor_no, delivery_apartment_no, delivery_landmark, delivery_phone, delivery_lat, delivery_lng, delivery_map_url")
    .eq("id", orderId)
    .single();

  if (error || !order) return null;

  const { data: profileData } = await service
    .from("profiles")
    .select("full_name, email")
    .eq("id", order.customer_id)
    .single();

  const { data: items } = await service
    .from("order_items")
    .select("product_id, quantity, unit_price, total_price")
    .eq("order_id", orderId);

  const productIds = [...new Set((items ?? []).map((i: any) => i.product_id))];
  const { data: products } = await service.from("products").select("id, name").in("id", productIds);
  const nameMap = new Map((products ?? []).map((p: any) => [p.id, p.name]));

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
    notes: order.notes ?? null,
    payment_method: order.payment_method ?? null,
    tracking_number: order.tracking_number ?? null,
    shipping_company: order.shipping_company ?? null,
    estimated_delivery: order.estimated_delivery ?? null,
    created_at: order.created_at,
    customer_name: profileData?.full_name ?? null,
    customer_email: profileData?.email ?? null,
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
    items: (items ?? []).map((i: any) => ({
      product_id: i.product_id,
      product_name: nameMap.get(i.product_id) ?? "Product",
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      total_price: Number(i.total_price),
    })),
  };
}
