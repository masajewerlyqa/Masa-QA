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
import { cn } from "@/lib/utils";

export type ProductCardLayout = "default" | "compact" | "list";

interface ProductCardProps {
  product: Product;
  isInWishlist?: boolean;
  priority?: boolean;
  /** Marketplace-style smaller grid row or horizontal list row */
  layout?: ProductCardLayout;
}

function ProductCardInner({
  product,
  isInWishlist = false,
  priority = false,
  layout = "default",
}: ProductCardProps) {
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

  const isCompact = layout === "compact";
  const isList = layout === "list";

  if (isList) {
    return (
      <article className="group flex flex-row bg-white rounded-lg overflow-hidden border border-primary/10 hover:shadow-md transition-shadow duration-200">
        <Link
          href={`/product/${id}`}
          className="relative w-[5.25rem] h-[5.25rem] sm:w-28 sm:h-28 shrink-0 overflow-hidden bg-masa-light"
        >
          <ImageWithFallback
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 640px) 120px, 160px"
          />
          <div className="absolute top-1 left-1 flex flex-col gap-0.5 max-w-[calc(100%-2rem)]">
            {hasDiscount && (
              <Badge
                className="discount-badge-pulse border-0 bg-primary/95 text-white text-[8px] uppercase tracking-wide font-sans shadow-sm px-1 py-0"
                aria-label={
                  isArabic ? `خصم ${discountPercent}%` : `${discountPercent}${t("product.percentOffSuffix")}`
                }
              >
                {discountPercent > 0 ? `-${discountPercent}%` : t("product.sale")}
              </Badge>
            )}
            {!inStock && (
              <Badge variant="secondary" className="bg-masa-gray text-white border-0 text-[8px] px-1 py-0">
                {t("product.outOfStock")}
              </Badge>
            )}
          </div>
          <WishlistHeartButton
            productId={id}
            isInWishlist={isInWishlist}
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 bg-white/90 hover:bg-white h-7 w-7 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 sm:px-3 sm:py-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-[10px] text-masa-gray uppercase tracking-wide truncate">{brand}</p>
              {isVerifiedStore && <VerifiedBadge variant="inline" size="sm" showText={false} />}
            </div>
            <Link href={`/product/${id}`}>
              <h3 className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>
            {rating != null && reviewCount != null && reviewCount > 0 && (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-masa-gray">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-2.5 h-2.5",
                        i < Math.round(rating) ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30",
                      )}
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="hidden sm:inline">
                  {rating.toFixed(1)} ({reviewCount})
                </span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 mt-1 text-[10px] text-masa-gray">
              <span className="truncate">{category}</span>
              {metal && (
                <>
                  <span>•</span>
                  <span className="truncate">{metal}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-end sm:items-end justify-between gap-2 shrink-0 sm:min-w-[5rem]">
            <div className="text-right font-sans">
              {hasDiscount ? (
                <>
                  <span className="block text-[10px] text-masa-gray line-through">
                    <FormattedPrice usd={originalPrice!} />
                  </span>
                  <span className="text-sm font-bold text-primary font-luxury">
                    <FormattedPrice usd={price} />
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-primary font-luxury">
                  <FormattedPrice usd={price} />
                </span>
              )}
            </div>
            <AddToCartButton
              productId={id}
              stockQuantity={stockQuantity}
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 border-primary/30 text-primary"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </AddToCartButton>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative bg-white overflow-hidden border border-primary/10 transition-all duration-300",
        isCompact ? "rounded-md hover:shadow-lg" : "rounded-lg hover:shadow-xl",
      )}
    >
      <Link
        href={`/product/${id}`}
        className="block relative aspect-square overflow-hidden bg-masa-light"
      >
        <ImageWithFallback
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={priority}
          sizes={
            isCompact
              ? "(max-width: 640px) 50vw, (max-width: 1024px) 30vw, (max-width: 1280px) 24vw, 22vw"
              : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 28vw, 26vw"
          }
        />

        <div
          className={cn(
            "absolute flex flex-col",
            isCompact ? "top-1.5 left-1.5 gap-1" : "top-2 left-2 md:top-3 md:left-3 gap-1.5 md:gap-2",
          )}
        >
          {hasDiscount && (
            <Badge
              className={cn(
                "discount-badge-pulse border-0 bg-primary/95 text-white uppercase tracking-wider font-sans shadow-sm",
                isCompact
                  ? "text-[8px] px-1 py-0"
                  : "text-[9px] md:text-[10px] px-1.5 md:px-2",
              )}
              aria-label={isArabic ? `خصم ${discountPercent}%` : `${discountPercent}${t("product.percentOffSuffix")}`}
            >
              {discountPercent > 0 ? `-${discountPercent}%` : t("product.sale")}
            </Badge>
          )}
          {!inStock && (
            <Badge
              variant="secondary"
              className={cn(
                "bg-masa-gray text-white border-0",
                isCompact ? "text-[8px] px-1 py-0" : "text-[9px] md:text-[10px]",
              )}
            >
              {t("product.outOfStock")}
            </Badge>
          )}
          {inStock && isNew && !hasDiscount && (
            <Badge className={cn("bg-primary text-white border-0", isCompact ? "text-[8px] px-1" : "text-[9px] md:text-[10px]")}>
              {t("product.new")}
            </Badge>
          )}
          {inStock && isFeatured && !hasDiscount && (
            <Badge className={cn("bg-masa-gold text-white border-0", isCompact ? "text-[8px] px-1" : "text-[9px] md:text-[10px]")}>
              {t("product.featured")}
            </Badge>
          )}
        </div>

        <WishlistHeartButton
          productId={id}
          isInWishlist={isInWishlist}
          size="icon"
          variant="ghost"
          className={cn(
            "absolute bg-white/90 hover:bg-white transition-opacity",
            isCompact
              ? "top-1.5 right-1.5 h-7 w-7 md:opacity-0 md:group-hover:opacity-100"
              : "top-2 right-2 md:top-3 md:right-3 h-8 w-8 md:h-10 md:w-10 md:opacity-0 md:group-hover:opacity-100",
          )}
        />

        {!isCompact && (
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
            <AddToCartButton productId={id} stockQuantity={stockQuantity} variant="default" size="sm" className="w-full bg-white text-primary hover:bg-secondary">
              <ShoppingCart className={`w-4 h-4 ${isArabic ? "ml-2" : "mr-2"}`} />
              {t("product.quickAdd")}
            </AddToCartButton>
          </div>
        )}
      </Link>

      <div className={cn("font-sans", isCompact ? "p-2" : "p-3 md:p-4")}>
        <div className={cn("flex items-center gap-1", isCompact ? "mb-0" : "mb-0.5 md:mb-1")}>
          <p
            className={cn(
              "text-masa-gray uppercase tracking-wide truncate",
              isCompact ? "text-[9px]" : "text-[10px] md:text-xs",
            )}
          >
            {brand}
          </p>
          {isVerifiedStore && <VerifiedBadge variant="inline" size="sm" showText={false} />}
        </div>
        <Link href={`/product/${id}`}>
          <h3
            className={cn(
              "line-clamp-2 hover:text-primary transition-colors font-medium leading-snug",
              isCompact ? "text-[11px] sm:text-xs mb-1" : "text-xs md:text-sm mb-1.5 md:mb-2",
            )}
          >
            {title}
          </h3>
        </Link>
        {rating != null && reviewCount != null && reviewCount > 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-masa-gray",
              isCompact ? "mb-1 text-[9px]" : "mb-1.5 md:mb-2 text-[10px] md:text-xs",
            )}
          >
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    isCompact ? "w-2 h-2" : "w-2.5 h-2.5 md:w-3 md:h-3",
                    i < Math.round(rating) ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30",
                  )}
                  aria-hidden
                />
              ))}
            </span>
            <span className="hidden sm:inline">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}
        <div
          className={cn(
            "items-center gap-2 text-masa-gray",
            isCompact ? "hidden" : "hidden sm:flex mb-2 md:mb-3 text-xs",
          )}
        >
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
              <span
                className={cn(
                  "text-masa-gray line-through font-sans",
                  isCompact ? "text-[9px]" : "text-[10px] md:text-xs",
                )}
              >
                <FormattedPrice usd={originalPrice!} />
              </span>
              <span
                className={cn(
                  "font-bold text-primary font-luxury",
                  isCompact ? "text-xs" : "text-sm md:text-lg",
                )}
              >
                <FormattedPrice usd={price} />
              </span>
            </>
          ) : (
            <span className={cn("text-primary font-luxury", isCompact ? "text-xs font-semibold" : "text-sm md:text-lg")}>
              <FormattedPrice usd={price} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export const ProductCard = React.memo(ProductCardInner);
