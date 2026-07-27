import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { stripeCheckoutRedirectUrls } from "@/lib/stripe/config";
import { serializeCartItemsForMetadata } from "@/lib/stripe/checkout-metadata";
import { serializeShippingForMetadata } from "@/lib/stripe/checkout-shipping";
import { resolveCheckoutItemsFromDatabase } from "@/lib/stripe/validate-checkout-items";
import { validatePromoCode } from "@/lib/promo";
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

  const subtotal = resolved.lines.reduce((sum, line) => sum + line.unitPriceUsd * line.quantity, 0);
  const cartStoreIds = Array.from(new Set(resolved.lines.map((l) => l.storeId)));

  let discountAmount = 0;
  let appliedPromoCode: string | null = null;
  let appliedPromoId: string | null = null;

  if (body.promoCode?.trim()) {
    const promoResult = await validatePromoCode(body.promoCode.trim(), subtotal, cartStoreIds);
    if (!promoResult.valid) {
      return NextResponse.json({ ok: false, error: promoResult.error }, { status: 400 });
    }
    discountAmount = promoResult.discountAmount;
    appliedPromoCode = promoResult.code;
    appliedPromoId = promoResult.promoId;
  }

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const priceRatio = subtotal > 0 ? subtotalAfterDiscount / subtotal : 1;

  const lineItems = resolved.lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "usd",
      unit_amount: Math.max(1, Math.round(line.unitPriceUsd * priceRatio * 100)),
      product_data: {
        name: line.name,
      },
    },
  }));

  const metaItems = resolved.lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
  }));

  const shippingJson = serializeShippingForMetadata(body.shipping);
  if (shippingJson.length > 500) {
    return NextResponse.json(
      { ok: false, error: "Delivery details are too long. Please shorten your address." },
      { status: 400 }
    );
  }

  const sessionMetadata: Record<string, string> = {
    customer_id: body.customerId,
    cart_items: serializeCartItemsForMetadata(metaItems),
    shipping: shippingJson,
    checkout_version: "2",
    discount_cents: String(Math.round(discountAmount * 100)),
  };

  if (appliedPromoCode) {
    sessionMetadata.promo_code = appliedPromoCode;
  }
  if (appliedPromoId) {
    sessionMetadata.promo_id = appliedPromoId;
  }

  const { successUrl, cancelUrl } = stripeCheckoutRedirectUrls({
    clientPlatform: body.clientPlatform,
  });

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
