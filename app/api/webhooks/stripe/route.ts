import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/config/env";
import { STRIPE_PRODUCTION_WEBHOOK_URL } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/client";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfill-checkout-session";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * Production URL: https://masajewlery.com/api/webhooks/stripe
 *
 * Creates paid orders only after signature verification + payment_status checks.
 * Events: checkout.session.completed, checkout.session.async_payment_failed, payment_intent.payment_failed
 */
export async function POST(req: Request) {
  const webhookSecret = env.stripeWebhookSecret;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  if (!env.stripeSecretKey) {
    console.error("[stripe-webhook] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (e) {
    console.error("[stripe-webhook] signature verification failed", {
      message: e instanceof Error ? e.message : String(e),
      expectedUrl: STRIPE_PRODUCTION_WEBHOOK_URL,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await fulfillCheckoutSession(session.id);
      if (!result.ok) {
        console.error("[stripe-webhook] fulfill failed", {
          sessionId: session.id,
          error: result.error,
          permanent: result.permanent ?? false,
        });
        if (result.permanent) {
          return NextResponse.json({ received: true, skipped: result.error });
        }
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      console.info("[stripe-webhook] order fulfilled", {
        sessionId: session.id,
        orderId: result.orderId,
        duplicate: result.duplicate ?? false,
      });
      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.warn("[stripe-webhook] async payment failed", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        customerId: session.metadata?.customer_id ?? session.client_reference_id,
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn("[stripe-webhook] payment_intent.payment_failed", {
        paymentIntentId: intent.id,
        lastError: intent.last_payment_error?.message,
        customerId: intent.metadata?.customer_id,
      });
      break;
    }

    default:
      console.info("[stripe-webhook] ignored event", { type: event.type });
  }

  return NextResponse.json({ received: true });
}
