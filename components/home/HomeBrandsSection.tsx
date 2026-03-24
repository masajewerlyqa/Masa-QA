"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import type { MarketplaceBrand } from "@/lib/data";

interface HomeBrandsSectionProps {
  brands: MarketplaceBrand[];
}

export function HomeBrandsSection({ brands }: HomeBrandsSectionProps) {
  const { isArabic } = useLanguage();
  if (brands.length === 0) return null;

  return (
    <section
      className="py-16 md:py-20 bg-white"
      aria-labelledby="featured-brands-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <h2
          id="featured-brands-heading"
          className="text-3xl md:text-4xl mb-12 text-center text-primary font-luxury"
        >
          {isArabic ? "العلامات المميزة" : "Featured Brands"}
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 items-center">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="relative aspect-square border border-primary/10 rounded-lg flex items-center justify-center hover:border-primary/30 hover:shadow-md transition-all duration-300 p-4"
            >
              <span className="text-base md:text-lg text-masa-dark font-luxury text-center">
                {brand.name}
              </span>
              {brand.discountedCount != null && brand.discountedCount >= 5 && (
                <span
                  className="absolute top-2 right-2 text-[10px] uppercase tracking-wider font-sans text-masa-gold border border-masa-gold/50 rounded px-1.5 py-0.5 bg-white/90"
                  aria-label={isArabic ? "عروض خاصة متاحة" : "Special offers available"}
                >
                  {isArabic ? "عروض خاصة" : "Special Offers"}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
