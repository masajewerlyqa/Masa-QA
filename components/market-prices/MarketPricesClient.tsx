"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Gem, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import { QAR_TO_USD } from "@/lib/market-prices";
import type { GoldMarketData, SilverMarketData, DiamondMarketData } from "@/lib/market-prices";

const TIME_RANGES = ["1D", "7D", "1M", "6M", "1Y"] as const;

function formatMarketPrice(qar: number, currency: "USD" | "QAR"): string {
  const amount = currency === "QAR" ? qar : qar * QAR_TO_USD;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === "QAR" ? `ر.ق ${formatted}` : `$ ${formatted}`;
}

function formatTime(iso: string | undefined): string {
  if (iso == null) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function changePercentValue(value: number | undefined | null): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : 0;
}

type MarketPricesClientProps = {
  gold: GoldMarketData;
  silver: SilverMarketData;
  diamond: DiamondMarketData;
  insightText: string;
  insightIndicators: ("Safe Investment" | "High Volatility" | "Luxury Demand Rising")[];
  sellerBestMetal: string;
  sellerMarginPercent: number;
  sellerTrendingCategory: string;
};

export function MarketPricesClient({
  gold,
  silver,
  diamond,
  insightText,
  insightIndicators,
  sellerBestMetal,
  sellerMarginPercent,
  sellerTrendingCategory,
}: MarketPricesClientProps) {
  const { t, isArabic } = useI18n();
  const { currency } = useCurrency();
  const displayCurrency = currency;
  const format = (qar: number) => formatMarketPrice(qar, displayCurrency);

  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>("7D");
  const [activeTab, setActiveTab] = useState<"gold" | "silver" | "diamond">("gold");

  const formatLabel = useCallback((time: string) => {
    const d = new Date(time);
    if (timeRange === "1D") {
      return d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
    }
    if (timeRange === "7D" || timeRange === "1M") {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }, [timeRange]);

  const goldChartData = useMemo(() => {
    const series = gold.historyByRange[timeRange] ?? gold.historyByRange["7D"];
    return series.map((p) => ({ ...p, label: formatLabel(p.time) }));
  }, [timeRange, gold.historyByRange, formatLabel]);

  const silverChartData = useMemo(() => {
    const series = silver.historyByRange[timeRange] ?? silver.historyByRange["7D"];
    return series.map((p) => ({ ...p, label: formatLabel(p.time) }));
  }, [timeRange, silver.historyByRange, formatLabel]);

  const diamondChartData = useMemo(() => {
    const series = diamond.historyByRange[timeRange] ?? diamond.historyByRange["7D"];
    return series.map((p) => ({ ...p, label: formatLabel(p.time) }));
  }, [timeRange, diamond.historyByRange, formatLabel]);

  const activeData = activeTab === "gold" ? gold : activeTab === "silver" ? silver : diamond;
  const translatedIndicators = insightIndicators.map((ind) => {
    if (!isArabic) return ind;
    if (ind === "Safe Investment") return "استثمار آمن";
    if (ind === "High Volatility") return "تقلبات مرتفعة";
    if (ind === "Luxury Demand Rising") return "الطلب على الفخامة في ارتفاع";
    return ind;
  });

  const translatedInsightText = isArabic
    ? insightText
        .replace("Gold appears stable", "يبدو الذهب مستقراً")
        .replace("Silver shows increased volatility", "تُظهر الفضة تقلباً أعلى")
        .replace("diamond demand in luxury segment is rising", "الطلب على الألماس في فئة الفخامة في ارتفاع")
    : insightText;

  const translatedSellerBestMetal = isArabic
    ? sellerBestMetal === "gold"
      ? "الذهب"
      : sellerBestMetal === "silver"
        ? "الفضة"
        : sellerBestMetal === "diamond"
          ? "الألماس"
          : sellerBestMetal
    : sellerBestMetal;

  const translatedTrendingCategory = isArabic
    ? sellerTrendingCategory === "bridal"
      ? "الزفاف"
      : sellerTrendingCategory === "investment"
        ? "استثماري"
        : sellerTrendingCategory === "daily-wear"
          ? "يومي"
          : sellerTrendingCategory
    : sellerTrendingCategory;

  const chartData =
    activeTab === "gold" ? goldChartData : activeTab === "silver" ? silverChartData : diamondChartData;

  return (
    <>
      {/* Hero */}
      <section
        className="relative market-prices-hero py-16 md:py-20 overflow-hidden"
        aria-labelledby="market-prices-heading"
      >
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="sparkle"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${15 + (i * 11) % 70}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <h1
            id="market-prices-heading"
            className="text-4xl md:text-5xl lg:text-6xl text-primary font-luxury mb-4"
          >
            {t("tools.market.heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-masa-gray font-sans max-w-2xl mx-auto">
            {t("tools.market.heroSubtitle")}
          </p>
        </div>

        {/* Highlight cards */}
        <div className="relative max-w-content mx-auto px-4 md:px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans text-masa-gray flex items-center gap-2">
                <Coins className="w-4 h-4 text-masa-gold" />
                {t("tools.market.gold24k")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-luxury text-primary">
                {format(gold.priceQAR)}
                <span className="text-sm font-sans text-masa-gray ml-1">{t("tools.market.perGram")}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm font-sans">
                {(changePercentValue(gold.changePercent)) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" aria-hidden />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" aria-hidden />
                )}
                <span className={(changePercentValue(gold.changePercent)) >= 0 ? "text-green-600" : "text-red-600"}>
                  {(changePercentValue(gold.changePercent)) >= 0 ? "+" : ""}
                  {(changePercentValue(gold.changePercent)).toFixed(2)}%
                </span>
                <span className="text-masa-gray">{t("tools.market.today")}</span>
              </div>
              <p className="text-xs text-masa-gray mt-2">{t("tools.market.updated")} {formatTime(gold.updatedAt)}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans text-masa-gray flex items-center gap-2">
                <Coins className="w-4 h-4 text-masa-gray" />
                {t("tools.market.silver")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-luxury text-primary">
                {format(silver.priceQAR)}
                <span className="text-sm font-sans text-masa-gray ml-1">{t("tools.market.perGram")}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm font-sans">
                {(changePercentValue(silver.changePercent)) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" aria-hidden />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" aria-hidden />
                )}
                <span className={(changePercentValue(silver.changePercent)) >= 0 ? "text-green-600" : "text-red-600"}>
                  {(changePercentValue(silver.changePercent)) >= 0 ? "+" : ""}
                  {(changePercentValue(silver.changePercent)).toFixed(2)}%
                </span>
                <span className="text-masa-gray">{t("tools.market.today")}</span>
              </div>
              <p className="text-xs text-masa-gray mt-2">{t("tools.market.updated")} {formatTime(silver.updatedAt)}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans text-masa-gray flex items-center gap-2">
                <Gem className="w-4 h-4 text-primary" />
                {t("tools.market.diamondIndex")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl md:text-3xl font-luxury text-primary">
                {format(diamond.priceQAR)}
                <span className="text-sm font-sans text-masa-gray ml-1">{t("tools.market.oneCaratAvg")}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm font-sans">
                {(changePercentValue(diamond.changePercent)) >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" aria-hidden />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" aria-hidden />
                )}
                <span className={(changePercentValue(diamond.changePercent)) >= 0 ? "text-green-600" : "text-red-600"}>
                  {(changePercentValue(diamond.changePercent)) >= 0 ? "+" : ""}
                  {(changePercentValue(diamond.changePercent)).toFixed(2)}%
                </span>
                <span className="text-masa-gray">{t("tools.market.today")}</span>
              </div>
              <p className="text-xs text-masa-gray mt-2">{t("tools.market.updated")} {formatTime(diamond.updatedAt)}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chart section */}
      <section className="py-12 md:py-16 bg-white border-t border-primary/10" aria-labelledby="chart-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <h2 id="chart-heading" className="text-2xl md:text-3xl text-primary font-luxury mb-6">
            {t("tools.market.priceTrend")}
          </h2>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "gold" | "silver" | "diamond")}>
            <TabsList className="mb-4">
              <TabsTrigger value="gold">{t("tools.market.gold")}</TabsTrigger>
              <TabsTrigger value="silver">{t("tools.market.silver")}</TabsTrigger>
              <TabsTrigger value="diamond">{t("tools.market.diamond")}</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap gap-2 mb-6">
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-md text-sm font-sans transition-colors ${
                    timeRange === r
                      ? "bg-primary text-white"
                      : "bg-masa-light text-masa-dark hover:bg-primary/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <TabsContent value={activeTab} className="mt-0">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(83, 28, 36, 0.08)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--masa-gray)" }}
                      stroke="var(--masa-gray)"
                    />
                    <YAxis
                      tickFormatter={(v) => format(v)}
                      tick={{ fontSize: 11, fill: "var(--masa-gray)" }}
                      stroke="var(--masa-gray)"
                      width={displayCurrency === "QAR" ? 72 : 56}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid rgba(83, 28, 36, 0.15)",
                        borderRadius: "8px",
                        fontFamily: "var(--font-sans)",
                      }}
                      formatter={(value: number) => [format(Number(value)), t("tools.market.priceTooltip")]}
                      labelFormatter={(label) => label}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Market Details */}
      <section className="py-12 md:py-16 bg-masa-light/50 border-t border-primary/10" aria-labelledby="details-heading">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <h2 id="details-heading" className="text-2xl md:text-3xl text-primary font-luxury mb-6">
            {t("tools.market.marketDetails")}
          </h2>
          {activeTab === "gold" && (
            <Card className="border-primary/10">
              <CardContent className="p-6 font-sans">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.gold24PerGram")}</dt>
                    <dd className="font-medium text-primary">{format(gold.price24KPerGramQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.gold22PerGram")}</dt>
                    <dd className="font-medium">{format(gold.price22KPerGramQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.gold18PerGram")}</dt>
                    <dd className="font-medium">{format(gold.price18KPerGramQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.perOunce")}</dt>
                    <dd className="font-medium">{format(gold.pricePerOunceQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.weeklyChange")}</dt>
                    <dd className={gold.weeklyChangePercent >= 0 ? "text-green-600" : "text-red-600"}>
                      {gold.weeklyChangePercent >= 0 ? "+" : ""}
                      {gold.weeklyChangePercent}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.monthlyTrend")}</dt>
                    <dd className="capitalize">{gold.monthlyTrend}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.qatarPremium")}</dt>
                    <dd>{gold.qatarPremiumEstimatePercent}%</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
          {activeTab === "silver" && (
            <Card className="border-primary/10">
              <CardContent className="p-6 font-sans">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.silverPerGram")}</dt>
                    <dd className="font-medium text-primary">{format(silver.pricePerGramQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.silverPerKg")}</dt>
                    <dd className="font-medium">{format(silver.pricePerKgQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.industrialDemand")}</dt>
                    <dd className="capitalize">{silver.industrialDemandTrend}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
          {activeTab === "diamond" && (
            <Card className="border-primary/10">
              <CardContent className="p-6 font-sans">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.avgDiamond1ct")}</dt>
                    <dd className="font-medium text-primary">{format(diamond.avg1CtPriceQAR)}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.investmentIndex")}</dt>
                    <dd>{diamond.investmentIndex}/100</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.luxuryTrend")}</dt>
                    <dd className="capitalize">{diamond.luxuryRetailTrend}</dd>
                  </div>
                  <div>
                    <dt className="text-masa-gray">{t("tools.market.labels.demandIndicator")}</dt>
                    <dd>{diamond.demandIndicator}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* AI Market Insight */}
      <section className="py-12 md:py-16 bg-white border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-luxury text-primary">{t("tools.market.aiInsight")}</CardTitle>
            </CardHeader>
            <CardContent className="font-sans">
              <p className="text-masa-dark leading-relaxed mb-4">{translatedInsightText}</p>
              <div className="flex flex-wrap gap-2">
                {translatedIndicators.map((ind) => (
                  <span
                    key={ind}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-masa-light text-primary border border-primary/20"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Seller Opportunity */}
      <section className="py-12 md:py-16 bg-masa-light/50 border-t border-primary/10">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <Card className="border-primary/10 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-luxury text-primary">
                {t("tools.market.sellerOpportunity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="font-sans space-y-3 text-sm text-masa-dark">
              <p>
                <span className="font-medium text-primary">{t("tools.market.bestMetal")}</span> {translatedSellerBestMetal}
              </p>
              <p>
                <span className="font-medium text-primary">{t("tools.market.estimatedMargin")}</span> ~{sellerMarginPercent}%
              </p>
              <p>
                <span className="font-medium text-primary">{t("tools.market.trendingCategory")}</span> {translatedTrendingCategory}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
