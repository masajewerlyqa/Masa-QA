import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { StoreLocationMapSection } from "@/components/store/StoreLocationMapSection";
import { getPublicStoreBySlug, getPublicProductsByStore } from "@/lib/data";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/customer";
import Image from "next/image";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePage({ params }: PageProps) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { slug } = await params;
  const store = await getPublicStoreBySlug(slug);
  if (!store) notFound();

  const { user } = await getCurrentUserWithProfile();
  const [products, wishlistIds] = await Promise.all([
    getPublicProductsByStore(store.id),
    user ? getWishlistProductIds(user.id) : Promise.resolve([]),
  ]);
  const wishlistSet = new Set(wishlistIds);
  const discountedProducts = products.filter(
    (p) => p.originalPrice != null && p.originalPrice > p.price
  );

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-primary/80 rounded-2xl mb-12 overflow-hidden">
        <Image
          src={store.coverImage}
          alt={store.name}
          fill
          className="object-cover opacity-30"
        />
        <div className="relative z-10 p-6 md:p-12 text-white">
          {store.verified && (
            <div className="mb-4">
              <VerifiedBadge variant="gold" size="lg" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl mb-2 font-luxury">{store.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-secondary font-sans">
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(store.rating) ? "fill-masa-gold text-masa-gold" : "text-white/50"}`}
                />
              ))}
              <span className="ml-2">{store.rating} ({store.reviewCount} {isArabic ? "تقييمات" : "reviews"})</span>
            </span>
            <span>•</span>
            <span>{store.productCount} {isArabic ? "منتج" : "Products"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
        <div className="lg:col-span-3">
          <h2 className="text-2xl mb-4 text-primary font-luxury">{isArabic ? `حول ${store.name}` : `About ${store.name}`}</h2>
          <p className="text-masa-dark leading-relaxed mb-6 font-sans">{store.description}</p>
        </div>
        <div className="bg-masa-light rounded-lg p-6 space-y-4 font-sans">
          <div>
            <div className="text-sm text-masa-gray mb-2">{isArabic ? "الموقع" : "Location"}</div>
            {store.location && (
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" aria-hidden />
                <div className="text-sm">{store.location}</div>
              </div>
            )}
            <StoreLocationMapSection store={store} />
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
            <div>
              <div className="text-sm text-masa-gray">{isArabic ? "الهاتف" : "Phone"}</div>
              <div className="text-sm">{store.phone}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
            <div>
              <div className="text-sm text-masa-gray">{isArabic ? "البريد الإلكتروني" : "Email"}</div>
              <div className="text-sm">{store.email}</div>
            </div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 mt-4">{isArabic ? "تواصل مع المتجر" : "Contact Store"}</Button>
        </div>
      </div>

      {store.policy && (
        <Card className="mb-12 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-xl">
              {t(language, "storefront.storePolicyTitle")}
            </CardTitle>
            <p className="text-sm text-masa-gray font-sans">{t(language, "storefront.storePolicyIntro")}</p>
          </CardHeader>
          <CardContent className="font-sans text-sm text-masa-dark space-y-3">
            <ul className="list-disc ms-5 space-y-2">
              <li>
                {store.policy.returnsEnabled
                  ? t(language, "account.orders.policyReturnsOn").replace(
                      /\{\{n\}\}/g,
                      String(store.policy.returnPeriodDays)
                    )
                  : t(language, "account.orders.policyReturnsOff")}
              </li>
              <li>
                {store.policy.exchangesEnabled
                  ? t(language, "account.orders.policyExchangesOn").replace(
                      /\{\{n\}\}/g,
                      String(store.policy.exchangePeriodDays)
                    )
                  : t(language, "account.orders.policyExchangesOff")}
              </li>
              {store.policy.sameDayDeliveryEnabled && store.policy.sameDayCutoffLocal && (
                <li>
                  {t(language, "account.orders.policySameDay").replace(
                    /\{\{t\}\}/g,
                    store.policy.sameDayCutoffLocal.slice(0, 5)
                  )}
                </li>
              )}
            </ul>
            {store.policy.customConditions?.trim() && (
              <div className="rounded-md bg-masa-light/80 p-4 whitespace-pre-wrap border border-primary/10">
                <p className="text-xs text-masa-gray mb-1">{t(language, "account.orders.policyConditions")}</p>
                {store.policy.customConditions.trim()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {discountedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl mb-6 text-primary font-luxury">{isArabic ? "عروض العلامة" : "Brand Offers"}</h2>
          <p className="text-masa-gray font-sans mb-6">{isArabic ? `عروض لفترة محدودة من ${store.name}` : `Limited-time offers from ${store.name}`}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} isInWishlist={wishlistSet.has(product.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl md:text-3xl mb-8 text-primary font-luxury">
          {discountedProducts.length > 0 ? (isArabic ? "كل المنتجات" : "All Products") : (isArabic ? "المنتجات" : "Products")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isInWishlist={wishlistSet.has(product.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
