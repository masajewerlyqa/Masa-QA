/**
 * Single source of truth for seller subscription tiers (fees, limits, feature flags).
 * - Marketing UI copy: `lib/i18n/en.ts` & `ar.ts` → `sellerOnboarding`.
 * - Numbers and flags: edit `SELLER_PLAN_LIMITS` below (fees, % commission, product caps).
 */

import type { Language } from "@/lib/language";

export const SELLER_PLAN_IDS = ["basic", "premium"] as const;
export type SellerPlanId = (typeof SELLER_PLAN_IDS)[number];

export function isSellerPlanId(value: unknown): value is SellerPlanId {
  return typeof value === "string" && (SELLER_PLAN_IDS as readonly string[]).includes(value);
}

export function parseSellerPlanId(value: unknown): SellerPlanId | null {
  return isSellerPlanId(value) ? value : null;
}

/** Numeric limits and fees — used in emails, DB display, and future enforcement. */
export const SELLER_PLAN_LIMITS: Record<
  SellerPlanId,
  {
    maxProducts: number | null;
    commissionPercent: number;
    registrationFeeQar: number;
    featuredPlacement: boolean;
    searchPriority: boolean;
    homepageHighlighting: boolean;
  }
> = {
  basic: {
    maxProducts: 100,
    commissionPercent: 15,
    registrationFeeQar: 1000,
    featuredPlacement: false,
    searchPriority: false,
    homepageHighlighting: false,
  },
  premium: {
    maxProducts: null,
    commissionPercent: 20,
    registrationFeeQar: 1000,
    featuredPlacement: true,
    searchPriority: true,
    homepageHighlighting: true,
  },
};

export function getSellerPlanLimits(planId: SellerPlanId) {
  return SELLER_PLAN_LIMITS[planId];
}

/** Lines for transactional email (localized). */
export function getSellerPlanEmailSummaryLines(planId: SellerPlanId, language: Language = "en"): string[] {
  const L = SELLER_PLAN_LIMITS[planId];
  if (language === "ar") {
    const productLine =
      L.maxProducts === null
        ? "كتالوج المنتجات: عدد غير محدود من المنتجات النشطة"
        : `كتالوج المنتجات: حتى ${L.maxProducts} منتج نشط`;
    return [
      `الخطة المختارة: ${planId === "basic" ? "الأساسية" : "بريميوم"}`,
      productLine,
      `رسوم التسجيل لمرة واحدة: ${L.registrationFeeQar} ريال قطري`,
      `العمولة: ${L.commissionPercent}% لكل طلب مكتمل`,
      planId === "premium"
        ? "تشمل ظهوراً مميزاً في الأقسام المختارة، أولوية في نتائج البحث، وإبرازاً في الصفحة الرئيسية (حسب سياسات MASA)."
        : "ظهور قياسي في السوق (بدون أقسام مميزة أو أولوية بحث).",
    ];
  }
  const productLine =
    L.maxProducts === null
      ? "Product catalog: unlimited active products"
      : `Product catalog: up to ${L.maxProducts} active products`;
  return [
    `Selected plan: ${planId === "basic" ? "Basic" : "Premium"}`,
    productLine,
    `One-time registration fee: ${L.registrationFeeQar} QAR`,
    `Commission: ${L.commissionPercent}% per completed order`,
    planId === "premium"
      ? "Includes featured placement, priority in search, and homepage brand highlighting (subject to MASA guidelines)."
      : "Standard marketplace visibility — no featured placement or search priority.",
  ];
}
