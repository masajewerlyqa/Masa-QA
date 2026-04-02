"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";
import { DollarSign, ShoppingBag, Store, Layers3 } from "lucide-react";
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
  AdminPlatformSnapshotRow,
  AdminOrderStatusRow,
  AdminCategoryRevenueRow,
  AdminTopSellerAnalyticsRow,
} from "@/lib/admin";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import { localizeEnglishMonthAbbrev } from "@/lib/date-format";
import { translateProductCategory } from "@/lib/product-category-i18n";

type Props = {
  platformSnapshot: AdminPlatformSnapshotRow[];
  orderStatus: AdminOrderStatusRow[];
  categoryRevenue: AdminCategoryRevenueRow[];
  topSellers: AdminTopSellerAnalyticsRow[];
};

export function AdminAnalyticsClient({
  platformSnapshot,
  orderStatus,
  categoryRevenue,
  topSellers,
}: Props) {
  const { formatPrice } = useCurrency();
  const { t, language } = useI18n();

  const platformChartData = useMemo(
    () =>
      platformSnapshot.map((r) => ({
        ...r,
        month: localizeEnglishMonthAbbrev(r.month, language),
      })),
    [platformSnapshot, language]
  );

  const categoryRevenueChart = useMemo(
    () =>
      categoryRevenue.map((r) => ({
        ...r,
        category: translateProductCategory(r.category, t),
      })),
    [categoryRevenue, t]
  );

  const totalRevenue = platformSnapshot.reduce((sum, row) => sum + row.revenue, 0);
  const totalOrders = platformSnapshot.reduce((sum, row) => sum + row.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeSellers = topSellers.length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t("admin.analytics.title")}</h1>
        <p className="text-masa-gray font-sans">{t("admin.analytics.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatsCard label={t("admin.analytics.revenueYtd")} value={formatPrice(totalRevenue)} icon={DollarSign} />
        <StatsCard label={t("admin.analytics.ordersYtd")} value={String(totalOrders)} icon={ShoppingBag} />
        <StatsCard label={t("admin.analytics.avgOrderValue")} value={formatPrice(avgOrderValue)} icon={Layers3} />
        <StatsCard label={t("admin.analytics.activeSellers")} value={String(activeSellers)} icon={Store} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("admin.analytics.revenueTrendCurrentYear")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatPrice(Number(value)), t("admin.overview.revenue")]} />
                <Area type="monotone" dataKey="revenue" stroke="#531C24" fill="#E7D8C3" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("admin.analytics.ordersByMonthCurrentYear")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [Number(value), t("admin.overview.orders")]} />
                <Bar dataKey="orders" fill="#531C24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("admin.analytics.revenueByCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryRevenueChart.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => [formatPrice(Number(value)), t("admin.overview.revenue")]} />
                <Bar dataKey="revenue" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("admin.analytics.orderStatusDistribution")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderStatus.length === 0 ? (
              <p className="text-sm text-masa-gray font-sans">{t("admin.analytics.noOrderData")}</p>
            ) : (
              orderStatus.map((row) => (
                <div key={row.status} className="flex items-center justify-between border-b border-primary/10 pb-2 last:border-b-0">
                  <span className="text-sm font-sans capitalize">{t(`order.statuses.${row.status}`, row.status.replace(/_/g, " "))}</span>
                  <span className="text-sm font-sans text-masa-gray">
                    {t("admin.analytics.ordersSummary").replace("{count}", String(row.count))} - {formatPrice(row.total)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t("admin.analytics.topSellersRevenue")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topSellers.length === 0 ? (
            <p className="text-sm text-masa-gray font-sans">{t("admin.analytics.noSellerData")}</p>
          ) : (
            topSellers.map((seller) => (
              <div key={seller.store_id} className="flex items-center justify-between border-b border-primary/10 pb-2 last:border-b-0">
                <span className="text-sm font-sans">{seller.store_name}</span>
                <span className="text-sm font-sans text-masa-gray">
                  {formatPrice(seller.revenue)} - {t("admin.analytics.ordersSummary").replace("{count}", String(seller.orders))}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

