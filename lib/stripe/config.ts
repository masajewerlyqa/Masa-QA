import { env } from "@/lib/config/env";

/** Canonical production storefront (Stripe success/cancel + webhook docs). */
export const STRIPE_PRODUCTION_ORIGIN = "https://masajewlery.com";

/** Production Stripe webhook endpoint (configure in Stripe Dashboard). */
export const STRIPE_PRODUCTION_WEBHOOK_URL = `${STRIPE_PRODUCTION_ORIGIN}/api/webhooks/stripe`;

export function stripeCheckoutRedirectUrls(): { successUrl: string; cancelUrl: string } {
  const origin = env.isProduction ? STRIPE_PRODUCTION_ORIGIN : env.siteUrl.replace(/\/$/, "");
  return {
    successUrl: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/cancel`,
  };
}
