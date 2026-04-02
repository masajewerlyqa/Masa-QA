"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { updateCartQuantity, removeFromCart } from "./actions";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLanguage } from "@/components/LanguageProvider";
import type { Product } from "@/lib/types";

type CartItemWithProduct = { productId: string; quantity: number; product: Product };

export function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { isArabic } = useLanguage();
  const available = item.product.stockQuantity ?? 0;
  const exceedsStock = item.quantity > available;
  const hasOriginal =
    (item.product as any).originalPrice != null &&
    (item.product as any).originalPrice > item.product.price;

  function updateQty(newQty: number) {
    if (newQty < 1) return;
    startTransition(async () => {
      const result = await updateCartQuantity(item.productId, newQty);
      if (result.ok) router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeFromCart(item.productId);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-row gap-3 sm:gap-4">
          <Link href={`/product/${item.productId}`} className="relative w-24 h-24 sm:w-32 sm:h-32 bg-masa-light rounded-lg overflow-hidden shrink-0">
            <Image
              src={item.product.image}
              alt={item.product.title}
              fill
              className="object-cover"
              quality={90}
              sizes="(max-width: 640px) 120px, 160px"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2 mb-2">
              <div className="min-w-0">
                <Link href={`/product/${item.productId}`}>
                  <h3 className="text-sm sm:text-lg font-medium font-sans hover:text-primary line-clamp-2">{item.product.title}</h3>
                </Link>
                <p className="text-xs sm:text-sm text-masa-gray">{item.product.brand}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                aria-label={isArabic ? "إزالة" : "Remove"}
                onClick={remove}
                disabled={isPending}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            {exceedsStock && (
              <p className="text-sm text-amber-600 font-sans">
                {isArabic
                  ? `المتوفر فقط ${available} قطعة. يرجى تقليل الكمية أو إزالة المنتج.`
                  : `Only ${available} in stock. Please reduce quantity or remove.`}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 sm:mt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={isArabic ? "تقليل الكمية" : "Decrease"}
                  onClick={() => updateQty(item.quantity - 1)}
                  disabled={isPending || item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 sm:w-12 text-center font-sans text-sm sm:text-base">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={isArabic ? "زيادة الكمية" : "Increase"}
                  onClick={() => updateQty(item.quantity + 1)}
                  disabled={isPending || item.quantity >= available}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className={isArabic ? "text-left" : "text-right"}>
                <div className="text-xs sm:text-sm text-masa-gray">
                  {hasOriginal && (
                    <>
                      <span className="line-through mr-1">
                        {formatPrice((item.product as any).originalPrice)}
                      </span>
                    </>
                  )}
                  <span className="font-sans">
                    {formatPrice(item.product.price)}
                    {" × "}
                    {item.quantity}
                  </span>
                </div>
                <div className="text-base sm:text-xl text-primary font-luxury">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
