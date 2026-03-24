import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicStoreBySlug, getPublicProductsByStore } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { getWishlistProductIds } from "@/lib/customer";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getServerLanguage } from "@/lib/language-server";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrandPage({ params }: PageProps) {
  const isArabic = getServerLanguage() === "ar";
  const { slug } = await params;
  const { user } = await getCurrentUserWithProfile();
  const [store, wishlistIds] = await Promise.all([
    getPublicStoreBySlug(slug),
    user ? getWishlistProductIds(user.id) : Promise.resolve([]),
  ]);
  if (!store) notFound();

  const products = await getPublicProductsByStore(store.id);
  const discountedProducts = products.filter(
    (p) => p.originalPrice != null && p.originalPrice > p.price
  );

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-masa-light border border-primary/10">
            <Image
              src={store.logo || store.coverImage || PLACEHOLDER_IMAGE}
              alt={store.name}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 font-sans">
          <h1 className="text-3xl md:text-4xl text-primary font-luxury mb-2">{store.name}</h1>
          {store.location && (
            <p className="flex items-center gap-2 text-masa-gray text-sm mb-3">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden />
              {store.location}
            </p>
          )}
          {(store.rating > 0 || store.reviewCount > 0) && (
            <p className="flex items-center gap-2 text-sm mb-4">
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(store.rating) ? "fill-masa-gold text-masa-gold" : "text-masa-gray/30"
                    }`}
                  />
                ))}
              </span>
              <span className="text-masa-gray">
                {store.rating.toFixed(1)} · {store.reviewCount} {isArabic ? "تقييم" : `review${store.reviewCount === 1 ? "" : "s"}`}
              </span>
            </p>
          )}
          {store.description && (
            <p className="text-masa-dark leading-relaxed mb-6">{store.description}</p>
          )}
          <Link href="/discover">
            <Button variant="outline" className="font-sans">
              {isArabic ? "عرض السوق" : "View marketplace"}
            </Button>
          </Link>
        </div>
      </div>

      {discountedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl text-primary font-luxury mb-2">{isArabic ? "عروض العلامة" : "Brand Offers"}</h2>
          <p className="text-masa-gray font-sans mb-6">{isArabic ? `عروض لفترة محدودة من ${store.name}` : `Limited-time offers from ${store.name}`}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {discountedProducts.map((p) => (
              <ProductCard key={p.id} product={p} isInWishlist={wishlistIds.includes(p.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl md:text-3xl text-primary font-luxury mb-6">
          {discountedProducts.length > 0
            ? (isArabic ? "كل المنتجات من " : "All products from ")
            : (isArabic ? "منتجات من " : "Products from ")}{store.name}
        </h2>
        {products.length === 0 ? (
          <p className="text-masa-gray font-sans">{isArabic ? "لا توجد منتجات بعد." : "No products listed yet."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} isInWishlist={wishlistIds.includes(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
