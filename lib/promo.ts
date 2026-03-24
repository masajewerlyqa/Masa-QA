"use server";

import { createClient } from "@/lib/supabase/server";

export type PromoValidationResult =
  | { valid: true; discountAmount: number; promoId: string; code: string }
  | { valid: false; error: string };

/**
 * Validate a promo code for checkout and return the discount amount if valid.
 * - Code is matched case-insensitively (stored as entered for order display).
 * - Checks: exists, active, within starts_at/expires_at, usage_limit, min_order_amount,
 *   and if store-scoped that the cart contains at least one product from that store.
 * - Discount: percentage => subtotal * value/100; fixed => value; capped so total never goes below 0.
 */
export async function validatePromoCode(
  codeRaw: string,
  subtotal: number,
  cartStoreIds: string[]
): Promise<PromoValidationResult> {
  const code = String(codeRaw ?? "").trim();
  if (!code) return { valid: false, error: "Promo code is required" };

  const supabase = await createClient();
  const { data: promo, error } = await supabase
    .from("promo_codes")
    .select("id, code, type, value, store_id, min_order_amount, usage_limit, used_count, starts_at, expires_at, active")
    .ilike("code", code)
    .maybeSingle();

  if (error) return { valid: false, error: "Could not validate promo code" };
  if (!promo) return { valid: false, error: "Invalid or expired promo code" };
  if (!promo.active) return { valid: false, error: "This promo code is no longer active" };

  const now = Date.now();
  const startsAt = promo.starts_at ? new Date(promo.starts_at) : null;
  const expiresAt = promo.expires_at ? new Date(promo.expires_at) : null;
  if (startsAt && !Number.isNaN(startsAt.getTime()) && startsAt.getTime() > now)
    return { valid: false, error: "This promo code is not yet valid" };
  if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= now)
    return { valid: false, error: "This promo code has expired" };

  const limit = promo.usage_limit ?? null;
  const used = Number(promo.used_count) ?? 0;
  if (limit != null && used >= limit)
    return { valid: false, error: "This promo code has reached its usage limit" };

  const minOrder = Number(promo.min_order_amount) ?? 0;
  if (subtotal < minOrder)
    return { valid: false, error: `Minimum order amount for this code is $${minOrder.toLocaleString()}` };

  const storeId = promo.store_id ?? null;
  if (storeId != null) {
    const storeIdsSet = new Set(cartStoreIds);
    if (!storeIdsSet.has(storeId))
      return { valid: false, error: "This promo code does not apply to any product in your cart" };
  }

  const value = Number(promo.value) ?? 0;
  let discountAmount: number;
  if (promo.type === "percentage") {
    discountAmount = (subtotal * value) / 100;
  } else {
    discountAmount = value;
  }
  discountAmount = Math.round(discountAmount * 100) / 100;
  if (discountAmount <= 0) return { valid: false, error: "Invalid promo value" };
  if (discountAmount > subtotal) discountAmount = subtotal;

  return {
    valid: true,
    discountAmount,
    promoId: promo.id,
    code: promo.code,
  };
}
