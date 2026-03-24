/**
 * MASA marketplace commission configuration.
 * Default 10%. Override with env COMMISSION_RATE (e.g. 0.10 for 10%).
 */

const DEFAULT_COMMISSION_RATE = 0.1;

export function getCommissionRate(): number {
  const env = process.env.COMMISSION_RATE;
  if (env == null || env === "") return DEFAULT_COMMISSION_RATE;
  const rate = Number(env);
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) return DEFAULT_COMMISSION_RATE;
  return rate;
}

/** Commission and seller earnings from a subtotal (after discount). */
export function computeCommission(subtotalAfterDiscount: number): {
  commissionAmount: number;
  sellerEarnings: number;
} {
  const rate = getCommissionRate();
  const commissionAmount = Math.round(subtotalAfterDiscount * rate * 100) / 100;
  const sellerEarnings = Math.round((subtotalAfterDiscount - commissionAmount) * 100) / 100;
  return { commissionAmount, sellerEarnings };
}
