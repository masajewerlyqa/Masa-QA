import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/config/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = env.stripeSecretKey;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}
