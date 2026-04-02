"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/(site)/cart/actions";
import { useI18n } from "@/components/useI18n";

export function AddToCartButton({
  productId,
  quantity = 1,
  stockQuantity,
  variant = "default",
  size = "default",
  className,
  children,
}: {
  productId: string;
  quantity?: number;
  /** If 0 or undefined and product is out of stock, button shows "Out of stock" and is disabled. */
  stockQuantity?: number;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const { isArabic, t } = useI18n();
  const inStock = stockQuantity === undefined ? true : stockQuantity > 0;

  function handleClick() {
    if (!inStock) return;
    setErr(null);
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result.ok) router.refresh();
      else if (result.error === "STORE_HOURS_NOT_SET") setErr(t("storefront.storeHoursNotSet"));
      else if (result.error === "STORE_CLOSED") setErr(t("storefront.storeClosed"));
      else if (result.error) setErr(result.error);
    });
  }

  const content = !inStock ? (
    t("product.outOfStock")
  ) : (
    children ?? (
      <>
        <ShoppingCart className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} />
        {t("product.addToCart")}
      </>
    )
  );

  return (
    <div className="space-y-2 w-full">
      <Button
        className={className}
        variant={variant}
        size={size}
        disabled={isPending || !inStock}
        onClick={handleClick}
      >
        {content}
      </Button>
      {err && (
        <p role="alert" className="text-sm text-red-700 font-sans max-w-md">
          {err}
        </p>
      )}
    </div>
  );
}
