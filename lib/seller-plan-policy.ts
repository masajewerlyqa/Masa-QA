import type { SellerPlanId } from "@/lib/seller-plans";
import { getSellerPlanLimits } from "@/lib/seller-plans";

/**
 * Future: enforce catalog size and feature flags from `stores.seller_plan` or application.
 */
export function getMaxProductsForSellerPlan(planId: SellerPlanId | null | undefined): number | null {
  if (!planId) return null;
  return getSellerPlanLimits(planId).maxProducts;
}

export function canSellerAddProduct(currentCount: number, planId: SellerPlanId | null | undefined): boolean {
  const max = getMaxProductsForSellerPlan(planId);
  if (max === null) return true;
  return currentCount < max;
}

export function sellerPlanHasPremiumPlacement(planId: SellerPlanId | null | undefined): boolean {
  if (!planId) return false;
  return getSellerPlanLimits(planId).featuredPlacement;
}
