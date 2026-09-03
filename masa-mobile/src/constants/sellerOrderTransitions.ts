/**
 * Mirrors web `lib/orders/order-transitions.ts` exactly, for showing the
 * correct status buttons only. This is a UI affordance, not the authorization
 * boundary: `/api/seller/orders` (`updateOrderStatus`) re-validates every
 * transition server-side regardless of what this returns, so a stale copy
 * here could show a wrong button but could never let an invalid transition
 * through. There is no package shared between the Next.js and Expo projects
 * to import the real module from, which is why this exists as a copy at all --
 * keep it in sync if the web table changes.
 */
const SELLER_ALLOWED_NEXT: Record<string, string[]> = {
  paid: ['accepted', 'processing', 'cancelled'],
  awaiting_seller: ['accepted', 'cancelled'],
  pending: ['accepted', 'processing', 'cancelled', 'refunded'],
  accepted: ['processing', 'shipped', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['out_for_delivery', 'delivered', 'cancelled', 'refunded'],
  out_for_delivery: ['delivered', 'cancelled', 'refunded'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
  confirmed: ['accepted', 'processing', 'shipped', 'cancelled', 'refunded'],
};

export function getSellerNextStatusOptions(currentStatus: string): string[] {
  return SELLER_ALLOWED_NEXT[currentStatus] ?? [];
}
