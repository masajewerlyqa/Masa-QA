"use client";

import React from "react";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { WishlistHeartButton } from "@/components/customer/WishlistHeartButton";
import { AddToCartButton } from "@/components/customer/AddToCartButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FormattedPrice } from "@/components/FormattedPrice";
import type { Product } from "@/lib/data";
import { useI18n } from "@/components/useI18n";

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  priority?: boolean;
}

function ProductCardInner({ product, isInWishlist = false, priority = false }: ProductCardProps) {
  const { isArabic, t } = useI18n();
  const {
    id,
    image,
    title,
    brand,
    price,
    originalPrice,
    category,
    metal,
    isNew,
    isFeatured,
    isVerifiedStore,
    rating,
    reviewCount,
    stockQuantity,
  } = product;
  const inStock = (stockQuantity ?? 0) > 0;
  const hasDiscount = originalPrice != null && originalPrice > price;
  const discountPercent =
    hasDiscount && originalPrice && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <article className="group relative bg-white rounded-lg overflow-hidden border border-primary/10 hover:shadow-xl transition-all duration-300">
      <Link href={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-masa-light">
        <ImageWithFallback
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2">
          {hasDiscount && (
            <Badge
              className="discount-badge-pulse border-0 bg-primary/95 text-white text-[9px] md:text-[10px] uppercase tracking-wider font-sans shadow-sm px-1.5 md:px-2"
              aria-label={isArabic ? `خصم ${discountPercent}%` : `${discountPercent}${t("product.percentOffSuffix")}`}
            >
              {discountPercent > 0 ? `-${discountPercent}%` : t("product.sale")}
            </Badge>
          )}
          {!inStock && (
            <Badge variant="secondary" className="bg-masa-gray text-white border-0 text-[9px] md:text-[10px]">{t("product.outOfStock")}</Badge>
          )}
          {inStock && isNew && !hasDiscount && (
            <Badge className="bg-primary text-white border-0 text-[9px] md:text-[10px]">{t("product.new")}</Badge>
          )}
          {inStock && isFeatured && !hasDiscount && (
            <Badge className="bg-masa-gold text-white border-0 text-[9px] md:text-[10px]">{t("product.featured")}</Badge>
          )}
        </div>

        <WishlistHeartButton
          productId={id}
          isInWishlist={isInWishlist}
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 hover:bg-white h-8 w-8 md:h-10 md:w-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        />

        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
          <AddToCartButton productId={id} stockQuantity={stockQuantity} variant="default" size="sm" className="w-full bg-white text-primary hover:bg-secondary">
            <ShoppingCart className={`w-4 h-4 ${isArabic ? "ml-2" : "mr-2"}`} />
            {t("product.quickAdd")}
          </AddToCartButton>
        </div>
      </Link>

      <div className="p-3 md:p-4 font-sans">
        <div className="flex items-center gap-1 mb-0.5 md:mb-1">
          <p className="text-[10px] md:text-xs text-masa-gray uppercase tracking-wide truncate">{brand}</p>
          {isVerifiedStore && <VerifiedBadge variant="inline" size="sm" showText={false} />}
        </div>
        <Link href={`/product/${id}`}>
          <h3 className="text-xs md:text-sm mb-1.5 md:mb-2 line-clamp-2 hover:text-primary transition-colors font-medium leading-snug">
            {title}
          </h3>
        </Link>
        {rating != null && reviewCount != null && reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1.5 md:mb-2 text-[10px] md:text-xs text-masa-gray">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                    i < Math.round(rating) ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30"
                  }`}
                  aria-hidden
                />
              ))}
            </span>
            <span className="hidden sm:inline">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-2 mb-2 md:mb-3 text-xs text-masa-gray">
          <span>{category}</span>
          {metal && (
            <>
              <span>•</span>
              <span>{metal}</span>
            </>
          )}
        </div>
        <div className="flex flex-col gap-0">
          {hasDiscount ? (
            <>
              <span className="text-[10px] md:text-xs text-masa-gray line-through font-sans">
                <FormattedPrice usd={originalPrice!} />
              </span>
              <span className="text-sm md:text-lg font-bold text-primary font-luxury">
                <FormattedPrice usd={price} />
              </span>
            </>
          ) : (
            <span className="text-sm md:text-lg text-primary font-luxury">
              <FormattedPrice usd={price} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export const ProductCard = React.memo(ProductCardInner);
