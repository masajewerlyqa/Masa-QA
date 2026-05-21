import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { stripeCheckoutRedirectUrls } from "@/lib/stripe/config";
import { serializeCartItemsForMetadata } from "@/lib/stripe/checkout-metadata";
import { resolveCheckoutItemsFromDatabase } from "@/lib/stripe/validate-checkout-items";
import { env } from "@/lib/config/env";
import type { StripeCheckoutBody } from "@/lib/validations/stripe-checkout";

export async function handleCreateCheckoutSession(body: StripeCheckoutBody) {
  if (!env.stripeSecretKey) {
    console.error("[create-checkout-session] STRIPE_SECRET_KEY missing");
    return NextResponse.json(
      { ok: false, error: "Payment is not configured. Please try again later." },
      { status: 503 }
    );
  }

  if (!body.customerId) {
    return NextResponse.json(
      { ok: false, error: "Sign in to checkout securely." },
      { status: 401 }
    );
  }

  const resolved = await resolveCheckoutItemsFromDatabase(body.items, body.customerId);
  if (!resolved.ok) {
    return NextResponse.json({ ok: false, error: resolved.error }, { status: 400 });
  }

  const lineItems = resolved.lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(line.unitPriceUsd * 100),
      product_data: {
        name: line.name,
      },
    },
  }));

  const metaItems = resolved.lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
  }));

  const sessionMetadata: Record<string, string> = {
    customer_id: body.customerId,
    cart_items: serializeCartItemsForMetadata(metaItems),
    checkout_version: "1",
  };

  const { successUrl, cancelUrl } = stripeCheckoutRedirectUrls();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: body.customerId,
      metadata: sessionMetadata,
      payment_intent_data: {
        metadata: {
          customer_id: body.customerId,
        },
      },
    });

    if (!session.url) {
      console.error("[create-checkout-session] session created without url", {
        sessionId: session.id,
      });
      return NextResponse.json(
        { ok: false, error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[create-checkout-session] session create failed", { message });
    return NextResponse.json(
      { ok: false, error: "Could not start checkout. Please try again." },
      { status: 502 }
    );
  }
}
