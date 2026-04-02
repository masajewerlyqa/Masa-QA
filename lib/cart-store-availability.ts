import "server-only";

import { getCartWithProducts } from "@/lib/customer";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreOrderBlockReason,
  type StoreAvailabilityReason,
  type StoreHoursRow,
} from "@/lib/store-availability";

export type CartCheckoutBlock = {
  blocked: true;
  reason: StoreAvailabilityReason;
} | { blocked: false };

/**
 * Checkout is allowed only if every store represented in the cart is configured and open now.
 */
export async function validateCartStoresForCheckout(userId: string): Promise<CartCheckoutBlock> {
  const cart = await getCartWithProducts(userId);
  const storeIds = [...new Set(cart.map((i) => i.product.storeId))];
  if (storeIds.length === 0) return { blocked: false };

  const supabase = await createClient();
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, business_timezone, working_days, opening_time_local, closing_time_local")
    .in("id", storeIds);

  if (error || !stores?.length) {
    return { blocked: true, reason: "not_configured" };
  }

  const now = new Date();
  for (const s of stores) {
    const row = s as StoreHoursRow;
    const block = getStoreOrderBlockReason(row, now);
    if (block) {
      return { blocked: true, reason: block };
    }
  }

  return { blocked: false };
}

/**
 * Single-store check for add-to-cart (product belongs to one store).
 */
export async function validateStoreAcceptsOrdersForProduct(productStoreId: string): Promise<CartCheckoutBlock> {
  const supabase = await createClient();
  const { data: store, error } = await supabase
    .from("stores")
    .select("id, business_timezone, working_days, opening_time_local, closing_time_local")
    .eq("id", productStoreId)
    .maybeSingle();

  if (error || !store) return { blocked: true, reason: "not_configured" };

  const block = getStoreOrderBlockReason(store as StoreHoursRow, new Date());
  if (block) return { blocked: true, reason: block };
  return { blocked: false };
}
