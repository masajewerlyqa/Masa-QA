import type { Metadata } from "next";
import {
  getAllMarketData,
  getMarketInsight,
  getSellerOpportunity,
} from "@/lib/market-prices";
import { MarketPricesClient } from "@/components/market-prices/MarketPricesClient";
import { getServerLanguage } from "@/lib/language-server";
import { getLocalizedSeo } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const localized = getLocalizedSeo(language, {
    title: "Gold & Diamond Prices in Qatar - MASA Market Insights",
    titleAr: "أسعار الذهب والألماس في قطر - تحليلات سوق ماسا",
    description:
      "Live gold, silver, and diamond prices in Qatar with investment insights and luxury jewelry market trends.",
    descriptionAr:
      "أسعار الذهب والفضة والألماس المباشرة في قطر مع رؤى استثمارية وتحليلات محدثة لسوق المجوهرات الفاخرة.",
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
  const insight = getMarketInsight(gold, silver, diamond);
  const seller = getSellerOpportunity(gold, silver, diamond);

  return (
    <MarketPricesClient
      gold={gold}
      silver={silver}
      diamond={diamond}
      insightText={insight.text}
      insightIndicators={insight.indicators}
      sellerBestMetal={seller.bestMetalToSell}
      sellerMarginPercent={seller.marginEstimatePercent}
      sellerTrendingCategory={seller.trendingCategory}
    />
  );
}
