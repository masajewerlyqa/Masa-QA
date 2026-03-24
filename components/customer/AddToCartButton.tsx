"use client";

import { useTransition } from "react";
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
  const router = useRouter();
  const { isArabic, t } = useI18n();
  const inStock = stockQuantity === undefined ? true : stockQuantity > 0;

  function handleClick() {
    if (!inStock) return;
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result.ok) router.refresh();
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
    <Button
      className={className}
      variant={variant}
      size={size}
      disabled={isPending || !inStock}
      onClick={handleClick}
    >
      {content}
    </Button>
  );
}
