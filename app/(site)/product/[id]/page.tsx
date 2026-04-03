import { notFound } from "next/navigation";
import Link from "next/link";
import { Share2, Award, Shield, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { getPublicProductById, getRelatedProducts } from "@/lib/data";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/customer";
import { getProductReviews, getProductReviewStats, getCustomerReviewForProduct, hasCustomerPurchasedProduct } from "@/lib/reviews";
import { ProductReviewForm } from "@/components/customer/ProductReviewForm";
import { AddToCartButton } from "@/components/customer/AddToCartButton";
import { WishlistHeartButton } from "@/components/customer/WishlistHeartButton";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { isSupabaseStoragePublicUrl } from "@/lib/product-image-url";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { id } = await params;
  const { user } = await getCurrentUserWithProfile();
  const [product, wishlistIds, reviewStats, reviews, customerReview, canReview] = await Promise.all([
    getPublicProductById(id),
    user ? getWishlistProductIds(user.id) : Promise.resolve([]),
    getProductReviewStats(id),
    getProductReviews(id),
    user ? getCustomerReviewForProduct(user.id, id) : Promise.resolve(null),
    user ? hasCustomerPurchasedProduct(user.id, id) : Promise.resolve(false),
  ]);
  if (!product) notFound();
  const isInWishlist = wishlistIds.includes(product.id);

  const [related] = await Promise.all([
    getRelatedProducts(product.id, product.storeId, product.category, 4),
  ]);
  const images = product.images?.length ? product.images : [product.image];
  const mainOriginal = isSupabaseStoragePublicUrl(product.image);

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-6 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12 md:mb-20">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-masa-light rounded-lg overflow-hidden mb-3 md:mb-4">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1023px) min(100vw, 1440px), 680px"
              unoptimized={mainOriginal}
              quality={100}
            />
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {images.slice(0, 4).map((img, idx) => {
              const thumbOriginal = isSupabaseStoragePublicUrl(img);
              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20"
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1023px) 22vw, 180px"
                    unoptimized={thumbOriginal}
                    quality={100}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Info */}
        <div className="font-sans">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Badge className="bg-primary text-white border-0 text-xs">{t(language, "product.newArrival")}</Badge>
            <Badge variant="outline" className="text-xs">{t(language, "product.certifiedAuthentic")}</Badge>
          </div>
          <h1 className="text-2xl md:text-4xl mb-2 text-primary font-luxury leading-tight">{product.title}</h1>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              {product.storeSlug ? (
                <Link href={`/store/${product.storeSlug}`} className="text-base md:text-lg text-masa-gray hover:text-primary transition-colors">
                  {product.brand}
                </Link>
              ) : (
                <span className="text-base md:text-lg text-masa-gray">{product.brand}</span>
              )}
              {product.isVerifiedStore && <VerifiedBadge variant="inline" size="md" />}
            </div>
            {reviewStats.reviewCount > 0 && (
              <span className="flex items-center gap-1 text-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                      i < Math.round(reviewStats.averageRating)
                        ? "fill-masa-gold text-masa-gold"
                        : "text-masa-gray/30"
                    }`}
                  />
                ))}
                <span className="text-xs md:text-sm text-masa-gray ml-1 md:ml-2">
                  {reviewStats.averageRating.toFixed(1)} • {reviewStats.reviewCount} {reviewStats.reviewCount === 1 ? t(language, "product.reviewWord") : t(language, "product.reviewsWord")}
                </span>
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 md:gap-4 mb-6 md:mb-8 flex-wrap">
            <FormattedPrice usd={product.price} className="text-3xl md:text-5xl text-primary font-luxury" />
            {product.originalPrice != null && product.originalPrice > product.price && (
              <>
                <FormattedPrice usd={product.originalPrice} className="text-lg md:text-xl text-masa-gray line-through" />
                {product.originalPrice > 0 && (
                  <Badge variant="success" className="text-xs md:text-sm">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% {t(language, "product.offSuffix")}
                  </Badge>
                )}
              </>
            )}
          </div>

          <p className="text-sm md:text-base text-masa-dark leading-relaxed mb-6 md:mb-8">
            {product.description ??
              t(language, "product.defaultDescription")}
          </p>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-masa-light rounded-lg p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="text-base md:text-lg mb-3 md:mb-4 font-luxury text-primary">{t(language, "product.specifications")}</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-masa-gray mb-0.5 text-xs md:text-sm">{key}</div>
                    <div className="text-masa-dark text-sm">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons — larger tap targets on mobile */}
          <div className="flex gap-3 mb-6">
            <AddToCartButton productId={product.id} stockQuantity={product.stockQuantity} className="flex-1 h-12 md:h-12 text-sm md:text-base" />
            <WishlistHeartButton
              productId={product.id}
              isInWishlist={isInWishlist}
              size="icon"
              variant="outline"
              className="h-12 w-12 border-primary text-primary shrink-0"
            />
            <Button variant="outline" size="icon" className="h-12 w-12 border-primary text-primary shrink-0" aria-label={t(language, "product.share")}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 pt-5 md:pt-6 border-t border-primary/10">
            <div className="text-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-1.5 md:mb-2" aria-hidden />
              <span className="text-[10px] md:text-xs text-masa-gray leading-tight block">{t(language, "product.certifiedAuthentic")}</span>
            </div>
            <div className="text-center">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-1.5 md:mb-2" aria-hidden />
              <span className="text-[10px] md:text-xs text-masa-gray leading-tight block">{t(language, "product.lifetimeWarranty")}</span>
            </div>
            <div className="text-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-1.5 md:mb-2" aria-hidden />
              <span className="text-[10px] md:text-xs text-masa-gray leading-tight block">{t(language, "product.investmentValue")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="description" className="mb-12 md:mb-20 font-sans">
        <TabsList className="w-full justify-start border-b border-primary/10 rounded-none bg-transparent p-0 h-auto overflow-x-auto">
          <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs md:text-sm shrink-0 px-3 md:px-4">
            {t(language, "product.descriptionTab")}
          </TabsTrigger>
          <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs md:text-sm shrink-0 px-3 md:px-4">
            {t(language, "product.specificationsTab")}
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs md:text-sm shrink-0 px-3 md:px-4"
          >
            {t(language, "product.reviewsTab")} ({reviewStats.reviewCount})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="py-6 md:py-8">
          <p className="text-sm md:text-base text-masa-dark leading-relaxed max-w-none">
            {product.description ??
              t(language, "product.longDescriptionFallback")}
          </p>
        </TabsContent>
        <TabsContent value="specifications" className="py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="mb-3 md:mb-4 text-primary font-luxury text-sm md:text-base">{t(language, "product.metalDetails")}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-masa-gray">{t(language, "product.metalTypeLabel")}</span>
                  <span>{product.metal ?? "—"}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 md:mb-4 text-primary font-luxury text-sm md:text-base">{t(language, "product.otherDetails")}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-masa-gray">{t(language, "product.categoryLabel")}</span>
                  <span>{product.category}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="py-4 md:py-6">
          <div className="space-y-6">
            <div className="space-y-4">
              {(() => {
                const list =
                  customerReview && !reviews.some((r) => r.id === customerReview.id)
                    ? [customerReview, ...reviews]
                    : reviews;

                if (list.length === 0) {
                  return (
                    <p className="text-masa-gray font-sans text-sm">
                      {t(language, "product.noReviewsYet")}
                    </p>
                  );
                }

                const onlyPendingSelf =
                  !!customerReview &&
                  customerReview.status === "pending" &&
                  list.length === 1 &&
                  list[0].id === customerReview.id;

                return (
                  <>
                    {onlyPendingSelf && (
                      <p className="text-masa-gray font-sans text-xs">
                        {t(language, "product.pendingModeration")}
                      </p>
                    )}
                    {list.map((review) => (
                      <div key={review.id} className="border-b border-primary/10 pb-4 last:border-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                                  i < review.rating ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="flex items-center gap-2 text-xs text-masa-gray shrink-0">
                            {review.status === "pending" && (
                              <Badge variant="secondary" className="text-xs">{t(language, "product.pending")}</Badge>
                            )}
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {review.title && <h4 className="mb-1 font-medium text-masa-dark text-sm md:text-base">{review.title}</h4>}
                        {review.body && (
                          <p className="text-masa-gray text-sm leading-relaxed">{review.body}</p>
                        )}
                        <p className="mt-2 text-xs text-masa-gray">
                          {review.customer_name ? (
                            <>
                              <span className="text-masa-dark">{review.customer_name}</span>
                              <span> • {t(language, "product.verifiedPurchase")}</span>
                            </>
                          ) : (
                            <span>{t(language, "product.verifiedPurchase")}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>

            <div className="pt-2 space-y-4 border-t border-primary/10">
              <h3 className="text-base md:text-lg font-luxury text-primary">{t(language, "product.writeReview")}</h3>
              {user ? (
                canReview ? (
                  <ProductReviewForm productId={product.id} existingReview={customerReview} />
                ) : (
                  <p className="text-sm text-masa-gray font-sans">
                    {t(language, "product.purchasedOnlyReview")}
                  </p>
                )
              ) : (
                <p className="text-sm text-masa-gray font-sans">
                  <Link href="/login" className="text-primary underline">
                    {t(language, "product.signIn")}
                  </Link>{" "}
                  {t(language, "product.signInToReview")}
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <div>
          <h2 className="text-xl md:text-3xl mb-6 md:mb-8 text-primary font-luxury">{t(language, "product.youMayAlsoLike")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} isInWishlist={wishlistIds.includes(p.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
