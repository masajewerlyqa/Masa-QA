/**
 * Payment methods offered at checkout.
 *
 * Both are collected physically at delivery, so neither ever settles during
 * checkout. An order is created with `payment_status: "pending"` and only
 * becomes `paid` once the courier reports collection. Nothing in the app may
 * mark an order paid earlier -- that would claim money we do not have.
 */

export const DELIVERY_PAYMENT_METHODS = ["cash_on_delivery", "card_on_delivery"] as const;
export type DeliveryPaymentMethod = (typeof DELIVERY_PAYMENT_METHODS)[number];

/**
 * Retired method kept only so historical orders still describe themselves
 * accurately. Never offered at checkout.
 */
export const LEGACY_ONLINE_CARD_METHOD = "card_online_legacy";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export function isDeliveryPaymentMethod(value: unknown): value is DeliveryPaymentMethod {
  return (
    typeof value === "string" &&
    (DELIVERY_PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

export function parseDeliveryPaymentMethod(value: unknown): DeliveryPaymentMethod | null {
  return isDeliveryPaymentMethod(value) ? value : null;
}

/**
 * i18n keys rather than literals so the checkout copy stays translatable and
 * consistent between web and mobile.
 */
export const DELIVERY_PAYMENT_METHOD_I18N: Record<
  DeliveryPaymentMethod,
  { labelKey: string; descriptionKey: string }
> = {
  cash_on_delivery: {
    labelKey: "checkout.paymentLabels.cashOnDelivery",
    descriptionKey: "checkout.paymentLabels.cashOnDeliveryHint",
  },
  card_on_delivery: {
    labelKey: "checkout.paymentLabels.cardOnDelivery",
    descriptionKey: "checkout.paymentLabels.cardOnDeliveryHint",
  },
};
