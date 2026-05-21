import "server-only";

import { getStripe } from "@/lib/stripe/client";
import { verifyCheckoutSessionPaid, verifyPaymentIntentSucceeded } from "@/lib/stripe/verify-payment";
import { requireServiceClient } from "@/lib/supabase/service";

export type SessionVerificationStatus =
  | "confirmed"
  | "processing"
  | "payment_failed"
  | "invalid"
  | "not_found";

export type SessionVerification = {
  status: SessionVerificationStatus;
  orderId?: string;
  orderNumber?: string | null;
};

/**
 * Read-only check for the success page — never creates orders.
 * Orders are created only by the verified Stripe webhook.
 */
export async function verifyCheckoutSessionForClient(
  sessionId: string,
  customerId?: string | null
): Promise<SessionVerification> {
  if (!sessionId.startsWith("cs_")) {
    return { status: "invalid" };
  }

  const service = requireServiceClient();

  const { data: order } = await service
    .from("orders")
    .select("id, order_number, customer_id, status")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (order?.id) {
    if (customerId && order.customer_id !== customerId) {
      return { status: "invalid" };
    }
    return {
      status: "confirmed",
      orderId: String(order.id),
      orderNumber: (order as { order_number?: string | null }).order_number ?? null,
    };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (customerId) {
      const metaCustomer = session.metadata?.customer_id ?? session.client_reference_id;
      if (metaCustomer && metaCustomer !== customerId) {
        return { status: "invalid" };
      }
    }

    if (session.payment_status === "unpaid" || session.status === "expired") {
      return { status: "payment_failed" };
    }

    const paidCheck = verifyCheckoutSessionPaid(session);
    if (!paidCheck.ok) {
      return { status: "processing" };
    }

    const piCheck = await verifyPaymentIntentSucceeded(session);
    if (!piCheck.ok) {
      return { status: "payment_failed" };
    }

    return { status: "processing" };
  } catch {
    return { status: "not_found" };
  }
}
