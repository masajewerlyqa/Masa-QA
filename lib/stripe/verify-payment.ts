import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";

export type PaymentVerificationResult = { ok: true } | { ok: false; error: string; permanent?: boolean };

/**
 * True only when Stripe reports a completed card checkout with captured payment.
 * checkout.session.completed alone is NOT sufficient (can fire with payment_status unpaid).
 */
export function isCheckoutSessionPaid(session: Stripe.Checkout.Session): boolean {
  return (
    session.mode === "payment" &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    session.amount_total != null &&
    session.amount_total > 0
  );
}

/** Server-side checks before creating a paid order (never trust the client or success page). */
export function verifyCheckoutSessionPaid(session: Stripe.Checkout.Session): PaymentVerificationResult {
  if (session.mode !== "payment") {
    return { ok: false, error: "Invalid checkout mode.", permanent: true };
  }

  if (session.status !== "complete") {
    return {
      ok: false,
      error: `Checkout session not complete (status: ${session.status ?? "unknown"}).`,
      permanent: session.status === "expired" || session.status === "open",
    };
  }

  if (session.payment_status !== "paid") {
    return {
      ok: false,
      error: `Payment not completed (payment_status: ${session.payment_status ?? "unknown"}).`,
      permanent: true,
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

/** Confirms PaymentIntent succeeded — required for payment-mode Checkout. */
export async function verifyPaymentIntentSucceeded(
  session: Stripe.Checkout.Session
): Promise<PaymentVerificationResult> {
  const pi = session.payment_intent;
  const paymentIntentId = typeof pi === "string" ? pi : pi?.id ?? null;

  if (!paymentIntentId) {
    return {
      ok: false,
      error: "Missing PaymentIntent on checkout session.",
      permanent: true,
    };
  }

  const stripe = getStripe();
  const intent =
    typeof pi === "object" && pi !== null && "status" in pi
      ? (pi as Stripe.PaymentIntent)
      : await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== "succeeded") {
    return {
      ok: false,
      error: `PaymentIntent not succeeded (status: ${intent.status}).`,
      permanent: ["canceled", "requires_payment_method", "requires_action"].includes(intent.status),
    };
  }

  if (intent.amount_received < intent.amount) {
    return { ok: false, error: "PaymentIntent amount not fully received.", permanent: false };
  }

  return { ok: true };
}

/** All checks required before inserting a paid order (webhook-only path). */
export async function verifyCheckoutSessionForPaidOrder(
  session: Stripe.Checkout.Session
): Promise<PaymentVerificationResult> {
  const paidCheck = verifyCheckoutSessionPaid(session);
  if (!paidCheck.ok) return paidCheck;
  return verifyPaymentIntentSucceeded(session);
}
