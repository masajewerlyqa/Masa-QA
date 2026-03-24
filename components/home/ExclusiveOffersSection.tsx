"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageProvider";
import type { Product } from "@/lib/data";

interface ExclusiveOffersSectionProps {
  products: Product[];
  wishlistIds: string[];
}

export function ExclusiveOffersSection({
  products,
  wishlistIds,
}: ExclusiveOffersSectionProps) {
  const { isArabic } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || products.length <= 1) return;
    const el = scrollRef.current;
    let interval: ReturnType<typeof setInterval>;
    const step = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = el.scrollLeft + 280;
      el.scrollTo({ left: next > max ? 0 : next, behavior: "smooth" });
    };
    interval = setInterval(step, 4500);
    return () => clearInterval(interval);
  }, [products.length]);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const delta = direction === "left" ? -280 : 280;
    scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (products.length === 0) return null;

  const wishlistSet = new Set(wishlistIds);

  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      aria-labelledby="exclusive-offers-heading"
      style={{
        background:
          "linear-gradient(180deg, #faf8f5 0%, rgba(247, 243, 238, 0.98) 50%, #f7f3ee 100%)",
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--masa-gold)]/40 to-transparent" />
      <div className="max-w-content mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2
              id="exclusive-offers-heading"
              className="text-3xl md:text-4xl mb-2 text-primary font-luxury"
            >
              {isArabic ? "عروض حصرية" : "Exclusive Offers"}
            </h2>
            <p className="text-masa-gray font-sans">
              {isArabic ? "عروض محدودة الوقت من بائعينا الموثقين" : "Limited-time offers from our verified sellers"}
            </p>
          </div>
          <Link href="/discover?onSale=1">
            <Button variant="outline" className="border-primary text-primary font-sans">
              {isArabic ? "عرض كل العروض" : "View all offers"}
              <ArrowRight className={`w-4 h-4 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`} aria-hidden />
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide pb-2 -mx-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, i) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[180px] sm:w-[280px]"
              >
                <ProductCard
                  product={product}
                  isInWishlist={wishlistSet.has(product.id)}
                  priority={i < 3}
                />
              </div>
            ))}
          </div>
          {products.length > 2 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white/95 border-primary/20 shadow-md rounded-full h-10 w-10 hidden md:flex"
                onClick={() => scroll("left")}
                aria-label={isArabic ? "السابق" : "Previous"}
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white/95 border-primary/20 shadow-md rounded-full h-10 w-10 hidden md:flex"
                onClick={() => scroll("right")}
                aria-label={isArabic ? "التالي" : "Next"}
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--masa-gold)]/40 to-transparent" />
    </section>
  );
}
