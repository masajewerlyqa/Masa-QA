import type { Metadata } from "next";
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
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

const HERO_IMAGE = "/image/bg-photo.jpeg";

const HOME_PRODUCTS_LIMIT = 8;

export const metadata: Metadata = {
  title: "MASA | Discover Luxury Jewelry with Confidence",
  description:
    "MASA is a trusted, AI-powered luxury jewelry marketplace. Buy and sell authentic jewelry in Qatar. Explore the best online jewelry marketplace, gold zakat calculator and AI jewelry advisor.",
  openGraph: {
    title: "MASA | Discover Luxury Jewelry with Confidence",
    description:
      "Trusted AI-powered jewelry marketplace in Qatar. Verified sellers, secure payments, luxury jewelry in Doha. Buy gold online Qatar.",
    type: "website",
    images: [{ url: HERO_IMAGE, width: 1200, height: 630, alt: "MASA Luxury Jewelry Marketplace" }],
  },
};

export default async function HomePage() {
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
