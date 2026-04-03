import type { Metadata } from "next";
import { getAllMarketData } from "@/lib/market-prices";
import { MarketPricesClient } from "@/components/market-prices/MarketPricesClient";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";
import { getLocalizedSeo } from "@/lib/seo";

/** Re-fetch live gold/silver on the server at most every 60s (avoids stale static prices). */
export const revalidate = 60;

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const localized = getLocalizedSeo(language, {
    title: `Gold & Diamond Prices in Qatar - ${brandName("en")} Market Insights`,
    titleAr: `أسعار السوق المباشرة — ${brandName("ar")}`,
    description:
      "Live gold, silver, and diamond prices in Qatar with investment insights and luxury jewelry market trends.",
    descriptionAr: "أسعار لحظية لسوق الذهب والفضة والألماس",
  });
  return {
    title: localized.title,
    description: localized.description,
    alternates: {
      canonical: "/market-prices",
      languages: { en: "/market-prices", ar: "/market-prices" },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
    },
  };
}

export default async function MarketPricesPage() {
  const { gold, silver, diamond } = await getAllMarketData();

  return <MarketPricesClient gold={gold} silver={silver} diamond={diamond} />;
}
