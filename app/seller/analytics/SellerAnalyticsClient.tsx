"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  SellerStats,
  RevenueByMonth,
  SellerOrderStatusAnalytics,
  SellerTopProductAnalytics,
} from "@/lib/seller-types";
import { useMemo } from "react";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import { localizeEnglishMonthAbbrev } from "@/lib/date-format";

type Props = {
  stats: SellerStats;
  revenueData: RevenueByMonth[];
  orderStatus: SellerOrderStatusAnalytics[];
  topProducts: SellerTopProductAnalytics[];
};

export function SellerAnalyticsClient({ stats, revenueData, orderStatus, topProducts }: Props) {
  const { formatPrice } = useCurrency();
  const { t, language } = useI18n();

  const revenueChartData = useMemo(
    () =>
      revenueData.map((r) => ({
        ...r,
        month: localizeEnglishMonthAbbrev(r.month, language),
      })),
    [revenueData, language]
  );
  const statCards = [
    { label: t("seller.overview.totalRevenue"), value: formatPrice(stats.totalRevenue), icon: DollarSign },
    { label: t("seller.overview.totalOrders"), value: String(stats.orderCount), icon: ShoppingCart },
    { label: t("seller.overview.productsListed"), value: String(stats.productCount), icon: Package },
    { label: t("seller.overview.avgOrderValue"), value: formatPrice(stats.avgOrderValue), icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t("seller.analytics.title")}</h1>
        <p className="text-masa-gray font-sans">{t("seller.analytics.performance")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatsCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("seller.analytics.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#531C24" fill="#E7D8C3" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("seller.analytics.topProductsRevenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="product_name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatPrice(Number(value)), t("admin.overview.revenue")]} />
                <Bar dataKey="revenue" fill="#531C24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm mt-6">
        <CardHeader>
          <CardTitle>{t("seller.analytics.orderStatusBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderStatus.length === 0 ? (
            <p className="text-sm text-masa-gray font-sans">{t("seller.analytics.noOrderData")}</p>
          ) : (
            orderStatus.map((row) => (
              <div key={row.status} className="flex items-center justify-between border-b border-primary/10 pb-2 last:border-b-0">
                <span className="text-sm font-sans capitalize">{t(`order.statuses.${row.status}`, row.status.replace(/_/g, " "))}</span>
                <span className="text-sm font-sans text-masa-gray">
                  {t("seller.analytics.ordersSummary").replace("{count}", String(row.count)).replace("{total}", formatPrice(row.total))}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
