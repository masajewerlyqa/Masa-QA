import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/config/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = env.stripeSecretKey;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (env.isProduction && key.startsWith("sk_test_")) {
    throw new Error(
      "STRIPE_SECRET_KEY is a test key (sk_test_...). Set sk_live_... in Vercel production env for real payments."
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
