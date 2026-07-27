import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { parseCartItemsFromMetadata } from "@/lib/stripe/checkout-metadata";
import {
  parseShippingFromMetadata,
  shippingToOrderFields,
} from "@/lib/stripe/checkout-shipping";
import { verifyCheckoutSessionForPaidOrder } from "@/lib/stripe/verify-payment";
import {
  verifyStripeAmountMatchesCart,
  type ResolvedCheckoutLine,
} from "@/lib/stripe/validate-checkout-items";
import { computeCommission } from "@/lib/commission";
import { sendOrderConfirmationEmail } from "@/lib/email/transactional";
import { resolveEmailLanguage } from "@/lib/email/email-language";
import { appendOrderStatusEvent } from "@/lib/orders/lifecycle";
import { notifySellersNewOrder } from "@/lib/notifications";
import { sellerResponseDeadlineIso } from "@/lib/orders/seller-sla";
import { requireServiceClient } from "@/lib/supabase/service";
import { buildPolicySnapshot } from "@/lib/store-policy";

export type FulfillCheckoutResult =
  | { ok: true; orderId: string; duplicate?: boolean }
  | { ok: false; error: string; permanent?: boolean };

async function loadLineProductsFromMetadata(
  service: ReturnType<typeof requireServiceClient>,
  cartItems: Array<{ product_id: string; quantity: number }>
): Promise<{ ok: true; lines: ResolvedCheckoutLine[] } | { ok: false; error: string; permanent?: boolean }> {
  const lines: ResolvedCheckoutLine[] = [];

  for (const line of cartItems) {
    const { data: row, error: productError } = await service
      .from("products")
      .select("id, store_id, name, price, stock_quantity, status, stores!inner(status)")
      .eq("id", line.product_id)
      .eq("stores.status", "approved")
      .maybeSingle();

    if (productError || !row) {
      return { ok: false, error: `Product not found: ${line.product_id}`, permanent: true };
    }

    const r = row as {
      id: string;
      store_id: string;
      name: string;
      price: number;
      stock_quantity: number;
      status: string;
    };

    if (r.status === "draft" || r.status === "archived") {
      return { ok: false, error: `Product is not available: ${r.name}`, permanent: true };
    }

    const available = r.stock_quantity ?? 0;
    if (line.quantity > available) {
      return {
        ok: false,
        error: `Insufficient stock for ${r.name} (available: ${available}).`,
        permanent: false,
      };
    }

    lines.push({
      productId: r.id,
      name: r.name,
      quantity: line.quantity,
      unitPriceUsd: Math.round(Number(r.price) * 100) / 100,
      storeId: String(r.store_id),
    });
  }

  return { ok: true, lines };
}

function verifyLineItemCounts(
  session: Stripe.Checkout.Session,
  expectedCount: number
): FulfillCheckoutResult | null {
  const stripeLines = session.line_items?.data ?? [];
  if (stripeLines.length > 0 && stripeLines.length !== expectedCount) {
    return {
      ok: false,
      error: "Stripe line items do not match cart metadata.",
      permanent: true,
    };
  }
  return null;
}

/**
 * Idempotent: creates order + items from a completed Checkout Session (status paid).
 * Only callable from the verified Stripe webhook after payment checks pass.
 */
export async function fulfillCheckoutSession(sessionId: string): Promise<FulfillCheckoutResult> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent"],
  });

  const paymentCheck = await verifyCheckoutSessionForPaidOrder(session);
  if (!paymentCheck.ok) {
    return { ok: false, error: paymentCheck.error, permanent: paymentCheck.permanent };
  }

  const service = requireServiceClient();

  const { data: existing } = await service
    .from("orders")
    .select("id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existing?.id) {
    if (existing.status !== "paid") {
      return {
        ok: false,
        error: "Existing order for session is not paid.",
        permanent: true,
      };
    }
    return { ok: true, orderId: String(existing.id), duplicate: true };
  }

  const customerId =
    session.metadata?.customer_id?.trim() ||
    session.client_reference_id?.trim() ||
    null;

  if (!customerId) {
    return {
      ok: false,
      error: "Checkout session missing customer_id metadata.",
      permanent: true,
    };
  }

  const { data: profile } = await service.from("profiles").select("id").eq("id", customerId).maybeSingle();
  if (!profile?.id) {
    return { ok: false, error: "Customer profile not found.", permanent: true };
  }

  const cartItems = parseCartItemsFromMetadata(session.metadata?.cart_items);
  if (!cartItems) {
    return {
      ok: false,
      error: "Checkout session missing valid cart_items metadata.",
      permanent: true,
    };
  }

  const countMismatch = verifyLineItemCounts(session, cartItems.length);
  if (countMismatch) return countMismatch;

  const loaded = await loadLineProductsFromMetadata(service, cartItems);
  if (!loaded.ok) {
    return { ok: false, error: loaded.error, permanent: loaded.permanent };
  }

  const discountCents = Math.max(0, parseInt(session.metadata?.discount_cents ?? "0", 10) || 0);
  const amountCheck = verifyStripeAmountMatchesCart(session, loaded.lines, discountCents);
  if (!amountCheck.ok) {
    return { ok: false, error: amountCheck.error, permanent: amountCheck.permanent };
  }

  const shippingSnapshot = parseShippingFromMetadata(session.metadata?.shipping);
  if (!shippingSnapshot) {
    return {
      ok: false,
      error: "Checkout session missing delivery address metadata.",
      permanent: true,
    };
  }

  const lineProducts = loaded.lines;

  const stockPayload = lineProducts.map((i) => ({
    product_id: i.productId,
    quantity: i.quantity,
  }));
  const { error: stockError } = await service.rpc("decrement_order_stock", { items: stockPayload });
  if (stockError) {
    return { ok: false, error: stockError.message, permanent: false };
  }

  const subtotalRounded =
    Math.round(
      lineProducts.reduce((sum, i) => sum + i.unitPriceUsd * i.quantity, 0) * 100
    ) / 100;
  const discountAmount = Math.round(discountCents) / 100;
  const subtotalAfterDiscount = Math.max(0, Math.round((subtotalRounded - discountAmount) * 100) / 100);
  const appliedPromoCode = session.metadata?.promo_code?.trim() || null;
  const appliedPromoId = session.metadata?.promo_id?.trim() || null;
  const shipping_cost =
    session.total_details?.amount_shipping != null
      ? Math.round(session.total_details.amount_shipping) / 100
      : 0;
  const tax = session.total_details?.amount_tax != null ? Math.round(session.total_details.amount_tax) / 100 : 0;
  const total =
    session.amount_total != null
      ? Math.round(session.amount_total) / 100
      : Math.max(0, Math.round((subtotalRounded + shipping_cost + tax) * 100) / 100);

  const { commissionAmount, sellerEarnings } = computeCommission(subtotalAfterDiscount);
  const createdAt = new Date();
  const sellerDeadline = sellerResponseDeadlineIso(createdAt);
  const deliveryFields = shippingToOrderFields(shippingSnapshot);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const cartStoreIds = Array.from(new Set(lineProducts.map((i) => i.storeId)));
  let policySnapshots: Record<string, ReturnType<typeof buildPolicySnapshot>> = {};
  if (cartStoreIds.length > 0) {
    const { data: policyRows } = await service
      .from("stores")
      .select(
        "id, returns_enabled, exchanges_enabled, return_period_days, exchange_period_days, policy_custom_conditions, same_day_delivery_enabled, same_day_cutoff_local"
      )
      .in("id", cartStoreIds);
    for (const row of policyRows ?? []) {
      const r = row as Record<string, unknown>;
      const id = String(r.id ?? "");
      if (!id) continue;
      policySnapshots[id] = buildPolicySnapshot(
        {
          returns_enabled: r.returns_enabled !== false,
          exchanges_enabled: r.exchanges_enabled !== false,
          return_period_days: r.return_period_days as number | null,
          exchange_period_days: r.exchange_period_days as number | null,
          policy_custom_conditions: r.policy_custom_conditions as string | null,
          same_day_delivery_enabled: r.same_day_delivery_enabled === true,
          same_day_cutoff_local:
            r.same_day_cutoff_local != null ? String(r.same_day_cutoff_local) : null,
        },
        createdAt
      );
    }
  }

  const { data: order, error: orderError } = await service
    .from("orders")
    .insert({
      customer_id: customerId,
      status: "paid",
      seller_response_deadline: sellerDeadline,
      subtotal: subtotalRounded,
      shipping_cost,
      tax,
      total,
      payment_method: "card",
      promo_code: appliedPromoCode,
      discount_amount: discountAmount,
      commission_amount: commissionAmount,
      seller_earnings: sellerEarnings,
      policy_snapshots: policySnapshots,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
      ...deliveryFields,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "Failed to create order", permanent: false };
  }

  const placed = order as { id: string; order_number: string | null };

  for (const item of lineProducts) {
    const unit_price = item.unitPriceUsd;
    const total_price = Math.round(unit_price * item.quantity * 100) / 100;
    const { error: itemError } = await service.from("order_items").insert({
      order_id: placed.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price,
      total_price,
    });
    if (itemError) {
      return { ok: false, error: itemError.message, permanent: false };
    }
  }

  await appendOrderStatusEvent({
    orderId: placed.id,
    previousStatus: null,
    newStatus: "paid",
    actorId: null,
    source: "checkout",
    metadata: { stripe_session_id: session.id, payment_intent_id: paymentIntentId },
  });

  if (appliedPromoId) {
    await service.rpc("increment_promo_used_count", { promo_id: appliedPromoId });
  }

  const storeIds = Array.from(new Set(lineProducts.map((i) => i.storeId)));
  await notifySellersNewOrder(placed.id, storeIds);

  const { data: profileRow } = await service
    .from("profiles")
    .select("email, preferred_language")
    .eq("id", customerId)
    .maybeSingle();

  const buyerEmail = session.customer_details?.email ?? (profileRow as { email?: string } | null)?.email ?? null;
  if (buyerEmail) {
    const mailResult = await sendOrderConfirmationEmail(
      buyerEmail,
      placed.id,
      placed.order_number,
      total,
      resolveEmailLanguage((profileRow as { preferred_language?: string } | null)?.preferred_language)
    );
    if (!mailResult.ok) {
      console.warn("[stripe/fulfill] order confirmation email failed:", mailResult.error, {
        orderId: placed.id,
      });
    }
  }

  const { data: cartRow } = await service.from("carts").select("id").eq("user_id", customerId).maybeSingle();
  if (cartRow?.id) {
    await service.from("cart_items").delete().eq("cart_id", cartRow.id);
  }

  return { ok: true, orderId: placed.id };
}
