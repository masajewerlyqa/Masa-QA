"use client";

import Link from "next/link";
import { Package, ShoppingCart, DollarSign, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react";
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
import { useCurrency } from "@/components/CurrencyProvider";
import { useI18n } from "@/components/useI18n";

type Props = {
  storeName: string;
  stats: SellerStats;
  revenueData: RevenueByMonth[];
  products: ProductRow[];
  orders: SellerOrderRow[];
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export function SellerOverviewClient({ storeName, stats, revenueData, products, orders }: Props) {
  const { formatPrice } = useCurrency();
  const { t } = useI18n();
  const sellerStats = [
    { label: t("seller.overview.totalRevenue"), value: formatPrice(stats.totalRevenue), change: undefined, icon: DollarSign },
    { label: t("seller.overview.totalOrders"), value: String(stats.orderCount), change: undefined, icon: ShoppingCart },
    { label: t("seller.overview.productsListed"), value: String(stats.productCount), change: undefined, icon: Package },
    { label: t("seller.overview.avgOrderValue"), value: formatPrice(stats.avgOrderValue), change: undefined, icon: TrendingUp },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl mb-1 md:mb-2 text-primary font-luxury">{t("seller.overview.dashboardOverview")}</h1>
        <p className="text-sm md:text-base text-masa-gray font-sans">
          {t("seller.overview.welcomeBack", `Welcome back, ${storeName}`).replace("{storeName}", storeName)}
        </p>
      </div>

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
              <AreaChart data={revenueData}>
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
              <BarChart data={revenueData}>
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
                            {order.id.slice(0, 8)}…
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
                          >
                            {t("order.statuses." + order.status, order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
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
