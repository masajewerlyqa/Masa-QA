import "server-only";

import { getStripe } from "@/lib/stripe/client";
import {
  isCheckoutSessionPaid,
  verifyCheckoutSessionForPaidOrder,
} from "@/lib/stripe/verify-payment";
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
 * Read-only check for the success page — never creates or updates orders.
 * "confirmed" only when a paid order row exists (created by webhook).
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
    .select("id, order_number, customer_id, status, stripe_checkout_session_id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (order?.id) {
    if (customerId && order.customer_id !== customerId) {
      return { status: "invalid" };
    }
    if (order.status !== "paid") {
      return { status: "payment_failed" };
    }
    return {
      status: "confirmed",
      orderId: String(order.id),
      orderNumber: (order as { order_number?: string | null }).order_number ?? null,
    };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (customerId) {
      const metaCustomer = session.metadata?.customer_id ?? session.client_reference_id;
      if (metaCustomer && metaCustomer !== customerId) {
        return { status: "invalid" };
      }
    }

    if (session.status === "expired" || session.payment_status === "unpaid") {
      return { status: "payment_failed" };
    }

    if (!isCheckoutSessionPaid(session)) {
      return { status: "payment_failed" };
    }

    const paymentCheck = await verifyCheckoutSessionForPaidOrder(session);
    if (!paymentCheck.ok) {
      return { status: "payment_failed" };
    }

    return { status: "processing" };
  } catch {
    return { status: "not_found" };
  }
}
