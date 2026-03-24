/**
 * Valid seller-driven order status moves. Prevents impossible jumps in UI and server actions.
 * Admin/system flows can extend with separate maps later.
 */

export const SELLER_STATUS_ORDER = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

const SELLER_ALLOWED_NEXT: Record<string, string[]> = {
  pending: ["accepted", "processing", "cancelled", "refunded"],
  accepted: ["processing", "shipped", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "cancelled", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
  /** legacy DB value */
  confirmed: ["accepted", "processing", "shipped", "cancelled", "refunded"],
};

export function isAllowedSellerStatusTransition(fromStatus: string, toStatus: string): boolean {
  if (fromStatus === toStatus) return true;
  const next = SELLER_ALLOWED_NEXT[fromStatus];
  return next?.includes(toStatus) ?? false;
}

/** Next statuses a seller may select from the current one (empty if terminal). */
export function getSellerNextStatusOptions(currentStatus: string): string[] {
  return SELLER_ALLOWED_NEXT[currentStatus] ?? [];
}
