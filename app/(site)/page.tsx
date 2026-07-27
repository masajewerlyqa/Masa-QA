import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Hero } from "@/components/Hero";
import { SmartFeaturesSection } from "@/components/home/SmartFeaturesSection";
import { TrustSection } from "@/components/home/TrustSection";
import { HomeFeaturesSection } from "@/components/home/HomeFeaturesSection";
import { ExclusiveOffersSection } from "@/components/home/ExclusiveOffersSection";
import { HomeFeaturedProductsSection } from "@/components/home/HomeFeaturedProductsSection";
import { HomeBrandsSection } from "@/components/home/HomeBrandsSection";
import { SellerCTASection } from "@/components/home/SellerCTASection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { getPublicProducts, getMarketplaceFilters, getDiscountedProducts } from "@/lib/data";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProductIds } from "@/lib/customer";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

const HERO_IMAGE = "/image/bg-photo.jpeg";

const HOME_PRODUCTS_LIMIT = 8;

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  const titleEn = `${brandName("en")} | Discover Luxury Jewelry with Confidence`;
  const titleAr = `${brandName("ar")} | اكتشف المجوهرات الفاخرة بثقة`;
  const descEn = `${brandName("en")} is a trusted, AI-powered luxury jewelry marketplace. Buy and sell authentic jewelry in Qatar. Explore the best online jewelry marketplace, gold zakat calculator and AI jewelry advisor.`;
  const descAr = `${brandName("ar")} منصة مجوهرات فاخرة موثوقة ومدعومة بالذكاء الاصطناعي. اشترِ وبِعْ مجوهرات أصلية في قطر.`;
  const ogDescEn = `Trusted AI-powered jewelry marketplace in Qatar. Verified sellers, secure payments, luxury jewelry in Doha. Buy gold online Qatar.`;
  const ogDescAr = `سوق مجوهرات موثوق في قطر. بائعون موثّقون، دفع آمن، مجوهرات فاخرة في الدوحة.`;
  return {
    title: language === "ar" ? titleAr : titleEn,
    description: language === "ar" ? descAr : descEn,
    openGraph: {
      title: language === "ar" ? titleAr : titleEn,
      description: language === "ar" ? ogDescAr : ogDescEn,
      type: "website",
      images: [
        {
          url: HERO_IMAGE,
          width: 1200,
          height: 630,
          alt: language === "ar" ? `${b} سوق المجوهرات الفاخرة` : `${b} Luxury Jewelry Marketplace`,
        },
      ],
    },
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // Safety net: if Supabase's Site URL fallback drops the OAuth redirect at "/"
  // (redirect URL not allow-listed in Supabase → Auth → URL Configuration),
  // the `code` lands here unconsumed. Forward it to the real handler instead
  // of leaving the user stuck on a signed-out home page.
  const code = searchParams?.code;
  if (typeof code === "string" && code) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (typeof value === "string") qs.set(key, value);
    }
    redirect(`/auth/callback?${qs.toString()}`);
  }

  const language = getServerLanguage();
  const { user } = await getCurrentUserWithProfile();
  const [products, filters, discountedProducts, wishlistIds] = await Promise.all([
    getPublicProducts({ limit: HOME_PRODUCTS_LIMIT }),
    getMarketplaceFilters(),
    getDiscountedProducts(10),
    user ? getWishlistProductIds(user.id) : Promise.resolve([]),
  ]);

  return (
    <>
      <Hero
        title={t(language, "home.heroTitle")}
        description={t(language, "home.heroDescription")}
        primaryCta={{
          label: t(language, "home.heroPrimaryCta"),
          href: "/discover",
        }}
        secondaryCta={{
          label: t(language, "home.heroSecondaryCta"),
          href: "/register",
        }}
      />

      <ExclusiveOffersSection products={discountedProducts} wishlistIds={wishlistIds} />

      <SmartFeaturesSection />

      <TrustSection />

      <HomeFeaturesSection />

      <HomeFeaturedProductsSection
        products={products}
        wishlistIds={wishlistIds}
        title={t(language, "home.latestTitle")}
        subtitle={t(language, "home.latestSubtitle")}
        viewAllLabel={t(language, "home.viewAll")}
      />

      <HomeBrandsSection brands={filters.brands} />

      <SellerCTASection />

      <ReviewsSection />
    </>
  );
}
