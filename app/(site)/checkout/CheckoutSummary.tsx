"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";

export type CartSummaryItem = {
  productId: string;
  quantity: number;
  product: { title: string; price: number };
};

type AppliedPromo = { code: string; discountAmount: number };

type CheckoutSummaryProps = {
  cartItems: CartSummaryItem[];
  subtotal: number;
  appliedPromo: AppliedPromo | null;
};

export function CheckoutSummary({ cartItems, subtotal, appliedPromo }: CheckoutSummaryProps) {
  const { formatPrice } = useCurrency();
  const { t } = useI18n();
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shipping = 0;
  const total = Math.round((subtotalAfterDiscount + shipping) * 100) / 100;

  return (
    <Card className="border-primary/10 shadow-lg sticky top-24">
      <CardHeader>
        <CardTitle className="font-luxury text-primary">{t("checkout.orderSummary", "Order Summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 font-sans">
        <ul className="space-y-2 text-sm text-masa-dark max-h-48 overflow-y-auto">
          {cartItems.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="truncate">{item.product.title} × {item.quantity}</span>
              <span className="shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 pt-2 border-t border-primary/10 text-sm">
          <div className="flex justify-between">
            <span className="text-masa-gray">{t("checkout.subtotal", "Subtotal")}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-green-600">
              <span>{t("checkout.discount", "Discount")} ({appliedPromo.code})</span>
              <span>-{formatPrice(appliedPromo.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-masa-gray">{t("checkout.shipping", "Shipping")}</span>
            <span className="text-green-600">{t("checkout.free", "Free")}</span>
          </div>
          <div className="pt-4 border-t border-primary/10">
            <div className="flex justify-between text-xl">
              <span>{t("checkout.total", "Total")}</span>
              <span className="text-primary font-luxury">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
        <Link href="/cart">
          <Button variant="outline" className="w-full mt-2">{t("checkout.editCart", "Edit cart")}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
