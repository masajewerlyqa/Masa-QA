/**
 * Human-readable order references are stored in `orders.order_number` (e.g. MASA-2026-000001).
 * UUID `id` remains the canonical key for URLs and APIs.
 */
export function formatOrderDisplayRef(order: { id: string; order_number?: string | null }): string {
  const n = order.order_number?.trim();
  if (n) return n;
  return `#${order.id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}
