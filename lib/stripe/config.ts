import { env } from "@/lib/config/env";

/** Canonical production storefront (Stripe success/cancel + webhook docs). */
export const STRIPE_PRODUCTION_ORIGIN = "https://masajewelry.com";

/** Production Stripe webhook endpoint (configure in Stripe Dashboard). */
export const STRIPE_PRODUCTION_WEBHOOK_URL = `${STRIPE_PRODUCTION_ORIGIN}/api/webhooks/stripe`;

export function stripeCheckoutRedirectUrls(options?: {
  clientPlatform?: "web" | "mobile";
}): { successUrl: string; cancelUrl: string } {
  if (options?.clientPlatform === "mobile") {
    return {
      successUrl: "masa://checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "masa://checkout/cancel",
    };
  }

  const origin = env.siteUrl.replace(/\/$/, "") || STRIPE_PRODUCTION_ORIGIN;
  return {
    successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/cancel`,
  };
}
