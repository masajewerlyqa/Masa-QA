import { getSupabase } from '../api/client';

/**
 * Customer order history, mirroring the web queries in lib/customer.ts
 * (getCustomerOrders / getCustomerOrder). RLS on `orders` restricts rows to
 * `customer_id = auth.uid()`; the `.eq('customer_id', ...)` filters below are
 * for correctness, not the security boundary.
 */

export type OrderListItem = {
  id: string;
  orderNumber: string | null;
  status: string;
  total: number;
  createdAt: string;
};

export type OrderDetailItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderDetail = {
  id: string;
  orderNumber: string | null;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  deliveryCityArea: string | null;
  deliveryBuildingType: string | null;
  deliveryZoneNo: string | null;
  deliveryStreetNo: string | null;
  deliveryBuildingNo: string | null;
  deliveryFloorNo: string | null;
  deliveryApartmentNo: string | null;
  deliveryLandmark: string | null;
  deliveryPhone: string | null;
  items: OrderDetailItem[];
};

/** Mirrors web `formatOrderDisplayRef` (lib/order-display.ts). */
export function formatOrderDisplayRef(order: { id: string; orderNumber: string | null }): string {
  const n = order.orderNumber?.trim();
  if (n) return n;
  return `#${order.id.replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

export async function getMyOrders(): Promise<OrderListItem[]> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[orders] load failed:', error.message);
    return [];
  }

  return (data ?? []).map((o) => ({
    id: o.id as string,
    orderNumber: (o.order_number as string | null) ?? null,
    status: o.status as string,
    total: Number(o.total),
    createdAt: o.created_at as string,
  }));
}

export async function getMyOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // select("*") like the web query: keeps this resilient to columns added later.
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('customer_id', user.id)
    .maybeSingle();

  if (error || !order) return null;
  const o = order as Record<string, unknown>;

  const { data: items } = await supabase
    .from('order_items')
    .select('product_id, quantity, unit_price, total_price')
    .eq('order_id', orderId);

  const productIds = [...new Set((items ?? []).map((i) => i.product_id as string))];
  const { data: products } = productIds.length
    ? await supabase.from('products').select('id, name').in('id', productIds)
    : { data: [] as { id: string; name: string }[] };
  const nameMap = new Map((products ?? []).map((p) => [p.id as string, p.name as string]));

  return {
    id: o.id as string,
    orderNumber: (o.order_number as string | null) ?? null,
    status: o.status as string,
    subtotal: Number(o.subtotal ?? o.total),
    shippingCost: Number(o.shipping_cost ?? 0),
    tax: Number(o.tax ?? 0),
    discountAmount: Number(o.discount_amount ?? 0),
    total: Number(o.total),
    createdAt: o.created_at as string,
    deliveryCityArea: (o.delivery_city_area as string | null) ?? null,
    deliveryBuildingType: (o.delivery_building_type as string | null) ?? null,
    deliveryZoneNo: (o.delivery_zone_no as string | null) ?? null,
    deliveryStreetNo: (o.delivery_street_no as string | null) ?? null,
    deliveryBuildingNo: (o.delivery_building_no as string | null) ?? null,
    deliveryFloorNo: (o.delivery_floor_no as string | null) ?? null,
    deliveryApartmentNo: (o.delivery_apartment_no as string | null) ?? null,
    deliveryLandmark: (o.delivery_landmark as string | null) ?? null,
    deliveryPhone: (o.delivery_phone as string | null) ?? null,
    items: (items ?? []).map((i) => ({
      productId: i.product_id as string,
      productName: nameMap.get(i.product_id as string) ?? '—',
      quantity: Number(i.quantity),
      unitPrice: Number(i.unit_price),
      totalPrice: Number(i.total_price),
    })),
  };
}
