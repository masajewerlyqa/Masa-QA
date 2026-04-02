"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormattedPrice } from "@/components/FormattedPrice";
import { useI18n } from "@/components/useI18n";
import { applyPromoCode } from "@/app/(site)/checkout/actions";
import { CHECKOUT_PROMO_CODE_STORAGE_KEY } from "@/lib/checkout-promo-storage";
import type { AppliedPromo } from "@/app/(site)/checkout/CheckoutForm";

type CartOrderSummaryProps = {
  subtotalUsd: number;
  hasItems: boolean;
  checkoutBlocked?: boolean;
  checkoutBlockReason?: "not_configured" | "closed" | null;
};

export function CartOrderSummary({
  subtotalUsd,
  hasItems,
  checkoutBlocked = false,
  checkoutBlockReason = null,
}: CartOrderSummaryProps) {
  const { t, isArabic } = useI18n();
  const shippingUsd = 0;
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyPending, setApplyPending] = useState(false);

  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const totalUsd = Math.max(0, subtotalUsd - discountAmount + shippingUsd);

  async function handleApply() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoError(null);
    setApplyPending(true);
    try {
      const result = await applyPromoCode(code);
      if (result.ok) {
        const next = { code: result.code, discountAmount: result.discountAmount };
        setAppliedPromo(next);
        try {
          sessionStorage.setItem(CHECKOUT_PROMO_CODE_STORAGE_KEY, result.code);
        } catch {
          /* ignore */
        }
      } else {
        setPromoError(result.error);
        setAppliedPromo(null);
        try {
          sessionStorage.removeItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
    } catch {
      setPromoError(t("checkout.applyPromoFailed"));
      setAppliedPromo(null);
      try {
        sessionStorage.removeItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    } finally {
      setApplyPending(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError(null);
    setPromoInput("");
    try {
      sessionStorage.removeItem(CHECKOUT_PROMO_CODE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  return (
    <Card className="border-primary/10 shadow-lg sticky top-24">
      <CardContent className="p-6">
        <h3 className="text-xl mb-6 text-primary font-luxury">{t("checkout.orderSummary")}</h3>
        <div className="space-y-4 mb-6 font-sans text-sm">
          <div className="flex justify-between">
            <span className="text-masa-gray">{t("checkout.subtotal")}</span>
            <span>
              <FormattedPrice usd={subtotalUsd} />
            </span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-green-700">
              <span>
                {t("checkout.discount")} ({appliedPromo.code})
              </span>
              <span>
                -<FormattedPrice usd={discountAmount} />
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-masa-gray">{t("checkout.shipping")}</span>
            <span className="text-green-600">{t("checkout.free")}</span>
          </div>
          <div className="pt-4 border-t border-primary/10">
            <div className="flex justify-between">
              <span className="text-lg">{t("checkout.total")}</span>
              <span className="text-2xl text-primary font-luxury">
                <FormattedPrice usd={totalUsd} />
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <Label htmlFor="cart-promo-code" className="font-sans text-masa-gray">
            {t("checkout.promoCode")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="cart-promo-code"
              placeholder={t("checkout.promoExample")}
              className="font-sans border-primary/20"
              autoComplete="off"
              value={appliedPromo ? appliedPromo.code : promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value);
                setPromoError(null);
              }}
              readOnly={!!appliedPromo}
            />
            {appliedPromo ? (
              <Button type="button" variant="outline" size="default" className="shrink-0 font-sans" onClick={handleRemovePromo}>
                {t("checkout.remove")}
              </Button>
            ) : (
              <Button
                type="button"
                size="default"
                className="shrink-0 bg-primary hover:bg-primary/90 font-sans"
                disabled={applyPending || !promoInput.trim()}
                onClick={() => void handleApply()}
              >
                {applyPending ? t("checkout.applying") : t("checkout.apply")}
              </Button>
            )}
          </div>
          {appliedPromo && (
            <p className="flex items-center gap-2 text-sm text-green-600 font-sans" role="status">
              <Check className="w-4 h-4 shrink-0" aria-hidden />
              <span>
                {t("checkout.promoApplied")} {appliedPromo.code} — <FormattedPrice usd={appliedPromo.discountAmount} />
              </span>
            </p>
          )}
          {promoError && (
            <p role="alert" className="text-sm text-red-600 font-sans">
              {promoError}
            </p>
          )}
        </div>

        {checkoutBlocked && hasItems && (
          <div
            role="alert"
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 font-sans mb-3"
          >
            {checkoutBlockReason === "not_configured" ? t("storefront.storeHoursNotSet") : t("storefront.storeClosed")}
          </div>
        )}

        <div className="space-y-3">
          {hasItems && !checkoutBlocked ? (
            <Button asChild className="w-full h-12 px-5 text-base font-semibold shadow-sm">
              <Link href="/checkout">
                <span>{t("cart.proceedToCheckout")}</span>
                <ArrowRight className={`size-5 shrink-0 ${isArabic ? "rotate-180" : ""}`} aria-hidden />
              </Link>
            </Button>
          ) : hasItems && checkoutBlocked ? (
            <Button type="button" className="w-full h-12 px-5 text-base font-semibold shadow-sm" disabled>
              <span>{t("cart.proceedToCheckout")}</span>
              <ArrowRight className={`size-5 shrink-0 opacity-50 ${isArabic ? "rotate-180" : ""}`} aria-hidden />
            </Button>
          ) : (
            <Button type="button" className="w-full h-12 px-5 text-base font-semibold" disabled>
              <span>{t("cart.proceedToCheckout")}</span>
              <ArrowRight className={`size-5 shrink-0 opacity-50 ${isArabic ? "rotate-180" : ""}`} aria-hidden />
            </Button>
          )}
          <Button variant="outline" asChild className="w-full h-11">
            <Link href="/discover">{t("cart.continueShopping")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
