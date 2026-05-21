import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";

export type PaymentVerificationResult = { ok: true } | { ok: false; error: string; permanent?: boolean };

/** Server-side checks before creating a paid order (never trust the client or success page). */
export function verifyCheckoutSessionPaid(session: Stripe.Checkout.Session): PaymentVerificationResult {
  if (session.mode !== "payment") {
    return { ok: false, error: "Invalid checkout mode.", permanent: true };
  }

  if (session.status !== "complete") {
    return {
      ok: false,
      error: `Checkout session not complete (status: ${session.status ?? "unknown"}).`,
      permanent: session.status === "expired",
    };
  }

  if (session.payment_status !== "paid") {
    return {
      ok: false,
      error: `Payment not completed (payment_status: ${session.payment_status ?? "unknown"}).`,
      permanent: session.payment_status === "unpaid",
    };
  }

  const currency = (session.currency ?? "").toLowerCase();
  if (currency && currency !== "usd") {
    return { ok: false, error: `Unexpected currency: ${session.currency}.`, permanent: true };
  }

  if (session.amount_total == null || session.amount_total <= 0) {
    return { ok: false, error: "Missing or invalid payment amount.", permanent: true };
  }

  return { ok: true };
}

/** Confirms PaymentIntent succeeded when present on the session. */
export async function verifyPaymentIntentSucceeded(
  session: Stripe.Checkout.Session
): Promise<PaymentVerificationResult> {
  const pi = session.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? null;
  if (!paymentIntentId) {
    return { ok: true };
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== "succeeded") {
    return {
      ok: false,
      error: `PaymentIntent not succeeded (status: ${intent.status}).`,
      permanent: ["canceled", "requires_payment_method"].includes(intent.status),
    };
  }

  if (intent.amount_received < intent.amount) {
    return { ok: false, error: "PaymentIntent amount not fully received.", permanent: false };
  }

  return { ok: true };
}
