"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageProvider";
import type { Product } from "@/lib/data";

interface HomeFeaturedProductsSectionProps {
  products: Product[];
  wishlistIds: string[];
  /** Section title */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Link label for "View all" */
  viewAllLabel?: string;
}

export function HomeFeaturedProductsSection({
  products,
  wishlistIds,
  title = "Latest from the Marketplace",
  subtitle = "Handpicked luxury pieces from verified sellers",
  viewAllLabel = "View All",
}: HomeFeaturedProductsSectionProps) {
  const { isArabic } = useLanguage();
  const wishlistSet = new Set(wishlistIds);

  return (
    <section
      className="py-16 md:py-20 bg-masa-light"
      aria-labelledby="featured-products-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div>
            <h2
              id="featured-products-heading"
              className="text-3xl md:text-4xl mb-2 text-primary font-luxury"
            >
              {title}
            </h2>
            <p className="text-masa-gray font-sans">{subtitle}</p>
          </div>
          <Link href="/discover">
            <Button variant="outline" className="border-primary text-primary">
              {viewAllLabel}
              <ArrowRight className={`w-4 h-4 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`} aria-hidden />
            </Button>
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                isInWishlist={wishlistSet.has(product.id)}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <p className="text-masa-gray font-sans text-center py-12">
            {isArabic
              ? "قطع جديدة قادمة قريباً. عد لاحقاً أو استكشف المتجر."
              : "New pieces are on the way. Check back soon or explore the marketplace."}
          </p>
        )}
      </div>
    </section>
  );
}
