"use client";

import { useState, useEffect } from "react";
import { CheckoutForm, type AppliedPromo } from "./CheckoutForm";
import { CheckoutSummary, type CartSummaryItem } from "./CheckoutSummary";
import { applyPromoCode } from "./actions";
import { CHECKOUT_PROMO_CODE_STORAGE_KEY } from "@/lib/checkout-promo-storage";

type CheckoutWithSummaryProps = {
  cartItems: CartSummaryItem[];
  subtotal: number;
  checkoutBlocked?: boolean;
  checkoutBlockReason?: "not_configured" | "closed" | null;
};

export function CheckoutWithSummary({
  cartItems,
  subtotal,
  checkoutBlocked = false,
  checkoutBlockReason = null,
}: CheckoutWithSummaryProps) {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let code: string | null = null;
      try {
        code = sessionStorage.getItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (!code?.trim()) return;
      try {
        const result = await applyPromoCode(code.trim());
        if (cancelled) return;
        if (result.ok) {
          setAppliedPromo({ code: result.code, discountAmount: result.discountAmount });
        } else {
          setAppliedPromo(null);
          try {
            sessionStorage.removeItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!cancelled) {
          setAppliedPromo(null);
          try {
            sessionStorage.removeItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <CheckoutForm appliedPromo={appliedPromo} checkoutBlocked={checkoutBlocked} checkoutBlockReason={checkoutBlockReason} />
      </div>
      <div>
        <CheckoutSummary
          cartItems={cartItems}
          subtotal={subtotal}
          appliedPromo={appliedPromo}
        />
      </div>
    </div>
  );
}
