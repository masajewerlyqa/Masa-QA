"use client";

import { useCallback, useState } from "react";
import {
  createCheckoutSession,
  type CheckoutLineItem,
  type CheckoutShippingPayload,
} from "@/lib/stripe/checkout-client";

/**
 * Starts Stripe Checkout from cart line items in React state.
 * Redirects to Stripe when the session URL is returned.
 */
export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(
    async (
      items: CheckoutLineItem[],
      shipping: CheckoutShippingPayload,
      options?: { promoCode?: string }
    ) => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession(items, shipping, options);
      if (!result.ok) {
        setError(result.error ?? "Could not start checkout. Please try again.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  },
  []
);

  const clearError = useCallback(() => setError(null), []);

  return { startCheckout, loading, error, clearError };
}
