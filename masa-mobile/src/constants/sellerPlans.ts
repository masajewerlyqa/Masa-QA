export const SELLER_PLAN_IDS = ['basic', 'premium'] as const;
export type SellerPlanId = (typeof SELLER_PLAN_IDS)[number];

export function isSellerPlanId(value: unknown): value is SellerPlanId {
  return typeof value === 'string' && (SELLER_PLAN_IDS as readonly string[]).includes(value);
}

export function parseSellerPlanId(value: unknown): SellerPlanId | null {
  return isSellerPlanId(value) ? value : null;
}

export const SELLER_PLAN_LIMITS: Record<
  SellerPlanId,
  {
    maxProducts: number | null;
    commissionPercent: number;
    registrationFeeQar: number;
  }
> = {
  basic: {
    maxProducts: 100,
    commissionPercent: 15,
    registrationFeeQar: 1000,
  },
  premium: {
    maxProducts: null,
    commissionPercent: 20,
    registrationFeeQar: 1000,
  },
};
