import "server-only";

import type { StripeCheckoutItem } from "@/lib/validations/stripe-checkout";
import type { PaymentVerificationResult } from "@/lib/stripe/verify-payment";
import { requireServiceClient } from "@/lib/supabase/service";

export type ResolvedCheckoutLine = {
  productId: string;
  name: string;
  quantity: number;
  /** Authoritative unit price from database (USD). */
  unitPriceUsd: number;
  storeId: string;
};

export type ResolveCheckoutItemsResult =
  | { ok: true; lines: ResolvedCheckoutLine[] }
  | { ok: false; error: string };

/**
 * Resolves cart lines from Supabase and rejects tampered client prices.
 * Stripe line_items are built from DB prices only.
 */
export async function resolveCheckoutItemsFromDatabase(
  items: StripeCheckoutItem[],
  customerId: string
): Promise<ResolveCheckoutItemsResult> {
  if (items.length === 0) {
    return { ok: false, error: "Cart is empty." };
  }

  const missingProductId = items.some((i) => !i.productId);
  if (missingProductId) {
    return { ok: false, error: "Each item must include a productId." };
  }

  const service = requireServiceClient();

  const { data: profile } = await service.from("profiles").select("id").eq("id", customerId).maybeSingle();
  if (!profile?.id) {
    return { ok: false, error: "Invalid customer." };
  }

  const lines: ResolvedCheckoutLine[] = [];

  for (const item of items) {
    const productId = item.productId!;
    const { data: row, error } = await service
      .from("products")
      .select("id, store_id, name, price, stock_quantity, status, stores!inner(status)")
      .eq("id", productId)
      .eq("stores.status", "approved")
      .maybeSingle();

    if (error || !row) {
      return { ok: false, error: `Product not available: ${item.name}` };
    }

    const r = row as {
      id: string;
      store_id: string;
      name: string;
      price: number;
      stock_quantity: number;
      status: string;
    };

    if (r.status === "draft" || r.status === "archived" || r.status === "out_of_stock") {
      return { ok: false, error: `${r.name} is not available for purchase.` };
    }

    const unitPriceUsd = Math.round(Number(r.price) * 100) / 100;
    const clientCents = Math.round(item.price * 100);
    const dbCents = Math.round(unitPriceUsd * 100);
    if (clientCents !== dbCents) {
      return { ok: false, error: "Cart prices are out of date. Refresh your cart and try again." };
    }

    if (item.quantity > (r.stock_quantity ?? 0)) {
      return {
        ok: false,
        error: `Insufficient stock for ${r.name} (available: ${r.stock_quantity ?? 0}).`,
      };
    }

    lines.push({
      productId: r.id,
      name: r.name,
      quantity: item.quantity,
      unitPriceUsd,
      storeId: String(r.store_id),
    });
  }

  return { ok: true, lines };
}

/** Compare Stripe charged subtotal (cents) to DB-backed cart subtotal. */
export function verifyStripeAmountMatchesCart(
  session: { amount_subtotal: number | null; amount_total: number | null },
  lines: ResolvedCheckoutLine[]
): PaymentVerificationResult {
  const expectedSubtotalCents = lines.reduce(
    (sum, line) => sum + Math.round(line.unitPriceUsd * 100) * line.quantity,
    0
  );

  if (session.amount_subtotal != null) {
    const diff = Math.abs(session.amount_subtotal - expectedSubtotalCents);
    if (diff > 1) {
      return {
        ok: false,
        error: "Paid amount does not match order subtotal.",
        permanent: true,
      };
    }
  }

  if (session.amount_total != null && session.amount_total < expectedSubtotalCents) {
    return {
      ok: false,
      error: "Paid total is less than order subtotal.",
      permanent: true,
    };
  }

  return { ok: true };
}
