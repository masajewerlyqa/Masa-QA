"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { FormattedPrice } from "@/components/FormattedPrice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminProductRow } from "@/lib/admin";
import { sortProductsByEngagement, type ProductEngagementSortKey } from "@/lib/product-list-sort";
import { translateProductCategory } from "@/lib/product-category-i18n";
import { useI18n } from "@/components/useI18n";

type Props = { products: AdminProductRow[] };

export function AdminProductsTable({ products }: Props) {
  const { t } = useI18n();
  const [sort, setSort] = useState<ProductEngagementSortKey>("newest");

  const sorted = useMemo(() => sortProductsByEngagement(products, sort), [products, sort]);

  const columns: Column<AdminProductRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: t("admin.products.product"),
        render: (row) => (
          <Link href={`/product/${row.id}`} className="font-medium text-primary hover:underline">
            {row.name}
          </Link>
        ),
      },
      { key: "store_name", header: t("admin.products.brandStore") },
      {
        key: "price",
        header: t("admin.products.price"),
        render: (row) => <FormattedPrice usd={Number(row.price)} />,
      },
      {
        key: "units_sold",
        header: t("admin.products.unitsSold", "Sold"),
        render: (row) => <span className="font-sans tabular-nums">{row.units_sold}</span>,
      },
      {
        key: "wishlist_count",
        header: t("admin.products.wishlist", "Wishlist"),
        render: (row) => <span className="font-sans tabular-nums">{row.wishlist_count}</span>,
      },
      {
        key: "revenue_usd",
        header: t("admin.products.revenue", "Revenue"),
        render: (row) => <FormattedPrice usd={Number(row.revenue_usd)} />,
      },
      {
        key: "units_cancelled",
        header: t("admin.products.unitsCancelled", "Cancelled units"),
        render: (row) => <span className="font-sans tabular-nums">{row.units_cancelled}</span>,
      },
      {
        key: "market_linked",
        header: t("admin.products.marketLinked", "Market linked"),
        render: (row) =>
          row.market_linked ? (
            <Badge variant="secondary">{t("admin.products.marketLinkedYes", "Live market")}</Badge>
          ) : (
            <Badge variant="outline">{t("admin.products.marketLinkedNo", "Fallback")}</Badge>
          ),
      },
      {
        key: "craftsmanship_margin",
        header: t("admin.products.craftsmanshipMargin", "Craftsmanship margin"),
        render: (row) => <FormattedPrice usd={Number(row.craftsmanship_margin ?? 0)} />,
      },
      {
        key: "category",
        header: t("admin.products.category"),
        render: (row) => translateProductCategory(row.category, t),
      },
      {
        key: "status",
        header: t("admin.products.status"),
        render: (row) => (
          <Badge variant={row.status === "active" ? "default" : "secondary"}>
            {t(`order.statuses.${row.status}`, row.status)}
          </Badge>
        ),
      },
    ],
    [t]
  );

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <CardTitle>{t("admin.products.allProducts").replace("{count}", String(products.length))}</CardTitle>
          <div className="flex flex-col gap-1.5 sm:min-w-[220px]">
            <span className="text-xs text-masa-gray font-sans">{t("admin.products.sortBy", "Sort by")}</span>
            <Select value={sort} onValueChange={(v) => setSort(v as ProductEngagementSortKey)}>
              <SelectTrigger className="w-full sm:w-[260px] font-sans">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("admin.products.sortNewest", "Newest first")}</SelectItem>
                <SelectItem value="units_sold">{t("admin.products.sortBestSeller", "Best sellers (units sold)")}</SelectItem>
                <SelectItem value="revenue_usd">{t("admin.products.sortRevenue", "Highest revenue")}</SelectItem>
                <SelectItem value="wishlist_count">{t("admin.products.sortWishlist", "Most wishlisted")}</SelectItem>
                <SelectItem value="units_cancelled">{t("admin.products.sortMostCancelled", "Most cancelled units")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={sorted} keyExtractor={(row) => row.id} />
      </CardContent>
    </Card>
  );
}
