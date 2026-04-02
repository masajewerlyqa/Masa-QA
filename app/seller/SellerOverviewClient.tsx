"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/StatsCard";
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
import type { SellerStats, SellerOrderRow, RevenueByMonth, ProductRow } from "@/lib/seller-types";
import { getStoreLiveStatus } from "@/lib/store-availability";
import type { StoreHoursRow } from "@/lib/store-availability";
import { msUntilSellerDeadline } from "@/lib/orders/seller-sla";
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";
import { formatOrderDisplayRef } from "@/lib/order-display";
import { formatShortDate, localizeEnglishMonthAbbrev } from "@/lib/date-format";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type Props = {
  storeName: string;
  storeAvailability: Pick<
    StoreHoursRow,
    "business_timezone" | "working_days" | "opening_time_local" | "closing_time_local"
  >;
  stats: SellerStats;
  revenueData: RevenueByMonth[];
  products: ProductRow[];
  orders: SellerOrderRow[];
};

export function SellerOverviewClient({
  storeName,
  storeAvailability,
  stats,
  revenueData,
  products,
  orders,
}: Props) {
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

  const liveStatus = useMemo(() => getStoreLiveStatus(storeAvailability), [storeAvailability]);

  const scheduleSummary = useMemo(() => {
    const days = [...(storeAvailability.working_days ?? [])].sort((a, b) => a - b);
    const dayPart = days.map((i) => t(`seller.availability.days.${DAY_KEYS[i]}`)).join(language === "ar" ? "، " : ", ");
    const fmt = (v: string | null) => (v && v.trim().length >= 5 ? v.trim().slice(0, 5) : v?.trim() || "—");
    return {
      dayPart: dayPart || "—",
      open: fmt(storeAvailability.opening_time_local),
      close: fmt(storeAvailability.closing_time_local),
    };
  }, [storeAvailability, t, language]);

  const urgentPendingCount = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (o.status !== "awaiting_seller" || !o.seller_response_deadline) return false;
      const ms = msUntilSellerDeadline(o.seller_response_deadline, now);
      return ms != null && ms > 0 && ms <= 30 * 60 * 1000;
    }).length;
  }, [orders]);

  const sellerStats = [
    { label: t("seller.overview.totalRevenue"), value: formatPrice(stats.totalRevenue), change: undefined, icon: DollarSign },
    { label: t("seller.overview.totalOrders"), value: String(stats.orderCount), change: undefined, icon: ShoppingCart },
    { label: t("seller.overview.productsListed"), value: String(stats.productCount), change: undefined, icon: Package },
    { label: t("seller.overview.avgOrderValue"), value: formatPrice(stats.avgOrderValue), change: undefined, icon: TrendingUp },
  ];

  const statusLabel =
    liveStatus === "open"
      ? t("seller.availability.statusOpenNow")
      : liveStatus === "closed"
        ? t("seller.availability.statusClosedNow")
        : t("seller.availability.statusNotConfigured");

  const statusHint =
    liveStatus === "not_configured"
      ? t("seller.availability.overviewNotConfigured")
      : liveStatus === "closed"
        ? t("seller.availability.overviewClosed")
        : t("seller.availability.overviewOpen");

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl mb-1 md:mb-2 text-primary font-luxury">{t("seller.overview.dashboardOverview")}</h1>
        <p className="text-sm md:text-base text-masa-gray font-sans">
          {t("seller.overview.welcomeBack", `Welcome back, ${storeName}`).replace("{storeName}", storeName)}
        </p>
      </div>

      <div className="space-y-3 mb-6 md:mb-8">
        {liveStatus === "not_configured" && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 font-sans flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{t("seller.availability.overviewNotConfigured")}</span>
            <Button variant="outline" size="sm" className="border-amber-300 shrink-0" asChild>
              <Link href="/seller/availability">{t("seller.overview.manageStoreHours")}</Link>
            </Button>
          </div>
        )}
        {liveStatus === "closed" && (
          <div
            role="status"
            className="rounded-xl border border-primary/20 bg-masa-light px-4 py-3 text-sm text-masa-dark font-sans flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span>{t("seller.availability.overviewClosed")}</span>
            <Button variant="outline" size="sm" className="shrink-0" asChild>
              <Link href="/seller/availability">{t("seller.overview.manageStoreHours")}</Link>
            </Button>
          </div>
        )}
        {urgentPendingCount > 0 && (
          <div
            role="status"
            className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-950 font-sans flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
          >
            <span className="flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
              <span>
                {t("seller.availability.bannerUrgentOrders")}{" "}
                <span className="font-semibold">({urgentPendingCount})</span>
              </span>
            </span>
            <Button variant="outline" size="sm" className="border-red-200 shrink-0" asChild>
              <Link href="/seller/orders">{t("seller.orders.allOrders")}</Link>
            </Button>
          </div>
        )}
      </div>

      <Card className="border-primary/10 shadow-sm mb-6 md:mb-8 overflow-hidden">
        <CardHeader className="pb-2 flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary shrink-0" aria-hidden />
            <CardTitle className="text-lg">{t("seller.availability.overviewCardTitle")}</CardTitle>
          </div>
          <Badge
            variant={liveStatus === "open" ? "default" : "secondary"}
            className={
              liveStatus === "not_configured"
                ? "bg-amber-100 text-amber-950 border-amber-200"
                : liveStatus === "closed"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : ""
            }
          >
            {statusLabel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 font-sans text-sm text-masa-dark">
          <p className="text-masa-gray leading-relaxed">{statusHint}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-masa-gray">{t("seller.availability.workingDays")}: </span>
              <span className="font-medium">{scheduleSummary.dayPart}</span>
            </div>
            <div>
              <span className="text-masa-gray">
                {t("seller.availability.openingTime")} / {t("seller.availability.closingTime")}:{" "}
              </span>
              <span className="font-medium tabular-nums">
                {scheduleSummary.open} – {scheduleSummary.close}
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/seller/availability">{t("seller.overview.manageStoreHours")}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {sellerStats.map((stat) => (
          <StatsCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>{t("seller.overview.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
            <CardTitle>{t("seller.overview.salesByMonth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#531C24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="mb-8">
        <TabsList>
          <TabsTrigger value="products">{t("seller.overview.productsTab")}</TabsTrigger>
          <TabsTrigger value="orders">{t("seller.overview.recentOrdersTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("seller.overview.productInventory")}</CardTitle>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/seller/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("seller.overview.addProduct")}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[500px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("seller.overview.product")}</TableHead>
                    <TableHead>{t("seller.overview.price")}</TableHead>
                    <TableHead>{t("seller.overview.stock")}</TableHead>
                    <TableHead>{t("seller.overview.status")}</TableHead>
                    <TableHead>{t("seller.overview.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-masa-gray py-8 font-sans">
                        {t("seller.overview.noProductsYet")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-sans">{product.name}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {t("order.statuses." + product.status, product.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/product/${product.id}`} aria-label={t("seller.overview.view")}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/seller/products/${product.id}/edit`} aria-label={t("seller.overview.edit")}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle>{t("seller.overview.recentOrdersTab")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[600px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("seller.overview.orderId")}</TableHead>
                    <TableHead>{t("seller.overview.customer")}</TableHead>
                    <TableHead>{t("seller.overview.items")}</TableHead>
                    <TableHead>{t("seller.overview.amount")}</TableHead>
                    <TableHead>{t("seller.overview.status")}</TableHead>
                    <TableHead>{t("seller.overview.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-masa-gray py-8 font-sans">
                        {t("seller.overview.noOrdersYet")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-sans font-mono text-sm">
                          <Link href={`/seller/orders/${order.id}`} className="text-primary hover:underline">
                            {formatOrderDisplayRef(order)}
                          </Link>
                        </TableCell>
                        <TableCell>{order.customer_name ?? "—"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{order.item_summary}</TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "shipped"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              order.status === "awaiting_seller"
                                ? "border-amber-400 text-amber-900 bg-amber-50"
                                : ""
                            }
                          >
                            {order.status === "awaiting_seller"
                              ? t("seller.orders.pendingSellerBadge")
                              : t("order.statuses." + order.status, order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatShortDate(order.created_at, language)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
