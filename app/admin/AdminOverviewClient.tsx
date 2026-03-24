"use client";

import Link from "next/link";
import {
  Users,
  Store,
  Package,
  DollarSign,
  FileCheck,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/StatsCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type {
  AdminMetrics,
  RecentApplicationRow,
  RecentOrderRow,
  CategorySlice,
  CommissionBySellerRow,
  CommissionMonthlyRow,
  AdminPlatformSnapshotRow,
} from "@/lib/admin";
import { useI18n } from "@/components/useI18n";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

import { useCurrency } from "@/components/CurrencyProvider";

type Props = {
  metrics: AdminMetrics;
  recentApplications: RecentApplicationRow[];
  recentOrders: RecentOrderRow[];
  categoryDistribution: CategorySlice[];
  commissionBySeller: CommissionBySellerRow[];
  commissionMonthly: CommissionMonthlyRow[];
  platformSnapshotMonthly: AdminPlatformSnapshotRow[];
};

export function AdminOverviewClient({
  metrics,
  recentApplications,
  recentOrders,
  categoryDistribution,
  commissionBySeller,
  commissionMonthly,
  platformSnapshotMonthly,
}: Props) {
  const { formatPrice } = useCurrency();
  const { t } = useI18n();
  const pieData = categoryDistribution.length > 0 ? categoryDistribution : [{ name: t("admin.overview.noData"), value: 1, color: "#E7D8C3" }];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl mb-1 md:mb-2 text-primary font-luxury">{t("admin.overview.platformOverview")}</h1>
        <p className="text-sm md:text-base text-masa-gray font-sans">{t("admin.overview.dashboardSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatsCard label={t("admin.overview.totalUsers")} value={metrics.totalUsers.toLocaleString()} icon={Users} />
        <StatsCard label={t("admin.overview.totalSellers")} value={metrics.totalSellers.toLocaleString()} icon={Store} />
        <StatsCard
          label={t("admin.overview.pendingApplications")}
          value={metrics.pendingSellerApplications.toLocaleString()}
          change={
            metrics.pendingSellerApplications > 0
              ? t("admin.overview.pendingCount").replace("{count}", String(metrics.pendingSellerApplications))
              : undefined
          }
          changePositive={false}
          icon={FileCheck}
        />
        <StatsCard label={t("admin.overview.totalStores")} value={metrics.totalStores.toLocaleString()} icon={Store} />
        <StatsCard label={t("admin.overview.totalProducts")} value={metrics.totalProducts.toLocaleString()} icon={Package} />
        <StatsCard label={t("admin.overview.totalOrders")} value={metrics.totalOrders.toLocaleString()} icon={ShoppingBag} />
        <StatsCard
          label={t("admin.overview.totalRevenue")}
          value={formatPrice(metrics.totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          label={t("admin.overview.totalCommissions")}
          value={formatPrice(metrics.totalCommissions)}
          icon={TrendingUp}
        />
        <StatsCard
          label={t("admin.overview.totalSellerEarnings")}
          value={formatPrice(metrics.totalSellerEarnings)}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <Card className="xl:col-span-2 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t("admin.overview.platformSnapshot")}</CardTitle>
            <p className="text-sm text-masa-gray font-sans">{t("admin.overview.platformSnapshotHint")}</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={platformSnapshotMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7D8C3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#531C24" strokeWidth={2} name={t("admin.overview.revenue")} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#D4AF37" strokeWidth={2} name={t("admin.overview.orders")} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t("admin.overview.productCategories")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t("admin.overview.commissionAndEarnings")}</CardTitle>
          <p className="text-sm text-masa-gray font-sans">{t("admin.overview.commissionHint")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {commissionBySeller.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-masa-dark font-sans mb-2">{t("admin.overview.bySeller")}</p>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[400px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sans">{t("admin.overview.store")}</TableHead>
                    <TableHead className="font-sans text-right">{t("admin.overview.commission")}</TableHead>
                    <TableHead className="font-sans text-right">{t("admin.overview.sellerEarnings")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionBySeller.map((row) => (
                    <TableRow key={row.store_id}>
                      <TableCell className="font-sans">{row.store_name}</TableCell>
                      <TableCell className="font-sans text-right">{formatPrice(row.commission)}</TableCell>
                      <TableCell className="font-sans text-right">{formatPrice(row.seller_earnings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-masa-gray font-sans">{t("admin.overview.noCommissionData")}</p>
          )}
          {commissionMonthly.some((m) => m.commission > 0 || m.seller_earnings > 0) && (
            <div>
              <p className="text-sm font-medium text-masa-dark font-sans mb-2">{t("admin.overview.monthlySummary")}</p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">{t("admin.overview.month")}</TableHead>
                      <TableHead className="font-sans text-right">{t("admin.overview.commission")}</TableHead>
                      <TableHead className="font-sans text-right">{t("admin.overview.sellerEarnings")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionMonthly.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="font-sans">{row.month}</TableCell>
                        <TableCell className="font-sans text-right">{formatPrice(row.commission)}</TableCell>
                        <TableCell className="font-sans text-right">{formatPrice(row.seller_earnings)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sellers" className="mb-8">
        <TabsList className="font-sans">
          <TabsTrigger value="sellers">{t("admin.overview.recentSellerApplications")}</TabsTrigger>
          <TabsTrigger value="orders">{t("admin.overview.recentOrders")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sellers">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-luxury text-primary">{t("admin.overview.sellerApplications")}</CardTitle>
              <Button asChild variant="outline" size="sm" className="font-sans">
                <Link href="/admin/seller-applications">{t("admin.overview.viewAll")}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[700px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sans">{t("admin.overview.applicant")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.email")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.business")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.status")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.date")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-masa-gray font-sans text-center py-8">
                        {t("admin.overview.noApplicationsYet")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-sans">{app.applicant_name}</TableCell>
                        <TableCell className="text-masa-gray font-sans">{app.contact_email}</TableCell>
                        <TableCell className="font-sans">{app.business_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              app.status === "approved"
                                ? "text-green-600 border-green-600"
                                : app.status === "rejected"
                                  ? "text-red-600 border-red-600"
                                  : "text-orange-600 border-orange-600"
                            }
                          >
                            {t("order.statuses." + app.status, app.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-sans text-masa-gray">{formatDate(app.created_at)}</TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm" className="font-sans">
                            <Link href={`/admin/seller-applications/${app.id}`}>{t("admin.overview.view")}</Link>
                          </Button>
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
              <CardTitle className="font-luxury text-primary">{t("admin.overview.recentOrders")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[600px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sans">{t("admin.overview.order")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.customer")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.amount")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.status")}</TableHead>
                    <TableHead className="font-sans">{t("admin.overview.date")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-masa-gray font-sans text-center py-8">
                        {t("admin.overview.noOrdersYet")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}…</TableCell>
                        <TableCell className="font-sans">
                          {order.customer_name ?? order.customer_email ?? "—"}
                        </TableCell>
                        <TableCell className="font-sans">{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-sans capitalize">
                            {t("order.statuses." + order.status, order.status.replace(/_/g, " "))}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-sans text-masa-gray">{formatDate(order.created_at)}</TableCell>
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
