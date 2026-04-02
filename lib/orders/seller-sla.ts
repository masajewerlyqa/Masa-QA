/** Seller must confirm or reject within this window after order creation. */
export const SELLER_RESPONSE_HOURS = 2;

export function sellerResponseDeadlineIso(createdAt: Date): string {
  const d = new Date(createdAt.getTime() + SELLER_RESPONSE_HOURS * 60 * 60 * 1000);
  return d.toISOString();
}

export function msUntilSellerDeadline(deadlineIso: string | null | undefined, now: Date = new Date()): number | null {
  if (!deadlineIso) return null;
  const t = new Date(deadlineIso).getTime();
  if (Number.isNaN(t)) return null;
  return t - now.getTime();
}
