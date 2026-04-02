"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { SellerOrderRow } from "@/lib/seller-types";
import { FormattedPrice } from "@/components/FormattedPrice";
import { useI18n } from "@/components/useI18n";
import { formatOrderDisplayRef } from "@/lib/order-display";
import { formatShortDate } from "@/lib/date-format";
import { useMemo } from "react";
import { SellerOrderDeadlineCell } from "@/components/seller/SellerOrderDeadlineCell";

type Props = { orders: SellerOrderRow[] };

export function SellerOrdersTable({ orders }: Props) {
  const { t, language } = useI18n();

  const columns: Column<SellerOrderRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: t("seller.orders.orderId"),
        render: (row) => (
          <Link href={`/seller/orders/${row.id}`} className="font-mono text-sm text-primary hover:underline">
            {formatOrderDisplayRef(row)}
          </Link>
        ),
      },
      {
        key: "customer_name",
        header: t("seller.orders.customer"),
        render: (row) => row.customer_name ?? "—",
      },
      {
        key: "item_summary",
        header: t("seller.orders.items"),
        render: (row) => <span className="max-w-[200px] truncate block">{row.item_summary}</span>,
      },
      {
        key: "total",
        header: t("seller.orders.amount"),
        render: (row) => <FormattedPrice usd={row.total} />,
      },
      {
        key: "store_earnings",
        header: t("seller.orders.yourEarnings"),
        render: (row) => (row.store_earnings != null ? <FormattedPrice usd={row.store_earnings} /> : "—"),
      },
      {
        key: "sla",
        header: t("seller.orders.respondBy"),
        render: (row) => (
          <SellerOrderDeadlineCell status={row.status} deadlineIso={row.seller_response_deadline} />
        ),
      },
      {
        key: "status",
        header: t("seller.orders.status"),
        render: (row) => (
          <div className="flex flex-col gap-1 items-start">
            <Badge
              variant={
                row.status === "delivered" ? "default" : row.status === "shipped" ? "secondary" : "outline"
              }
              className={
                row.status === "awaiting_seller" ? "border-amber-400 text-amber-900 bg-amber-50" : ""
              }
            >
              {row.status === "awaiting_seller"
                ? t("seller.orders.pendingSellerBadge")
                : t(`order.statuses.${row.status}`, row.status)}
            </Badge>
          </div>
        ),
      },
      {
        key: "created_at",
        header: t("seller.orders.date"),
        render: (row) => formatShortDate(row.created_at, language),
      },
    ],
    [t, language]
  );

  return <DataTable columns={columns} data={orders} keyExtractor={(row) => row.id} />;
}
