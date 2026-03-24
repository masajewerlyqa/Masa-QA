/**
 * Product discount helpers.
 * - Validity: discount_active and optional start/end window.
 * - Price: discounted_price = base - (percentage or fixed); never below 0.
 */

export type DiscountType = "percentage" | "fixed";

export function isDiscountValid(
  active: boolean,
  startAt: string | null,
  endAt: string | null
): boolean {
  if (!active) return false;
  const now = Date.now();
  if (startAt != null && new Date(startAt).getTime() > now) return false;
  if (endAt != null && new Date(endAt).getTime() < now) return false;
  return true;
}

/**
 * Compute discounted price. Does not check validity (call isDiscountValid separately).
 * - percentage: discounted = base - (base * value / 100)
 * - fixed: discounted = base - value
 * Returns Math.max(0, result) rounded to 2 decimals.
 */
export function computeDiscountedPrice(
  basePrice: number,
  type: DiscountType,
  value: number
): number {
  let result: number;
  if (type === "percentage") {
    result = basePrice - (basePrice * value / 100);
  } else {
    result = basePrice - value;
  }
  return Math.max(0, Math.round(result * 100) / 100);
}

/** Product row shape with discount fields (subset). */
export type ProductRowDiscount = {
  price: number;
  discount_type?: string | null;
  discount_value?: number | null;
  discount_start_at?: string | null;
  discount_end_at?: string | null;
  discount_active?: boolean | null;
};

/**
 * Get effective discounted price for a product row (server-side).
 * If discount is active and within date window, returns discounted price; otherwise base price.
 * Never returns negative.
 */
export function getDiscountedPrice(row: ProductRowDiscount): number {
  const basePrice = Number(row.price);
  const active = row.discount_active === true;
  if (
    !active ||
    row.discount_type == null ||
    row.discount_value == null ||
    !isDiscountValid(active, row.discount_start_at ?? null, row.discount_end_at ?? null)
  ) {
    return basePrice;
  }
  return computeDiscountedPrice(
    basePrice,
    row.discount_type as DiscountType,
    Number(row.discount_value)
  );
}
