"use client";

import { useState } from "react";
import { CheckoutForm, type AppliedPromo } from "./CheckoutForm";
import { CheckoutSummary, type CartSummaryItem } from "./CheckoutSummary";
import { applyPromoCode } from "./actions";
import { useI18n } from "@/components/useI18n";

type CheckoutWithSummaryProps = {
  cartItems: CartSummaryItem[];
  subtotal: number;
};

export function CheckoutWithSummary({ cartItems, subtotal }: CheckoutWithSummaryProps) {
  const { t } = useI18n();
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyPending, setApplyPending] = useState(false);

  async function handleApplyPromo(code: string) {
    setPromoError(null);
    setApplyPending(true);
    try {
      const result = await applyPromoCode(code);
      if (result.ok) {
        setAppliedPromo({ code: result.code, discountAmount: result.discountAmount });
        setPromoError(null);
      } else {
        setPromoError(result.error);
        setAppliedPromo(null);
      }
    } catch {
      setPromoError(t("checkout.applyPromoFailed"));
      setAppliedPromo(null);
    } finally {
      setApplyPending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <CheckoutForm
          appliedPromo={appliedPromo}
          setAppliedPromo={setAppliedPromo}
          promoError={promoError}
          setPromoError={setPromoError}
          onApplyPromo={handleApplyPromo}
          applyPending={applyPending}
        />
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
