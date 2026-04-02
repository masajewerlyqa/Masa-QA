"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { AdminOrderRow } from "@/lib/admin";
import { FormattedPrice } from "@/components/FormattedPrice";
import { useI18n } from "@/components/useI18n";
import { formatOrderDisplayRef } from "@/lib/order-display";
import { formatShortDate } from "@/lib/date-format";
import { useMemo } from "react";

type Props = { orders: AdminOrderRow[] };

export function AdminOrdersTable({ orders }: Props) {
  const { t, language } = useI18n();

  const columns: Column<AdminOrderRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: t("admin.orders.orderId"),
        render: (row) => (
          <Link href={`/admin/orders/${row.id}`} className="font-mono text-sm text-primary hover:underline">
            {formatOrderDisplayRef(row)}
          </Link>
        ),
      },
      {
        key: "customer_name",
        header: t("admin.orders.customer"),
        render: (row) => row.customer_name ?? row.customer_email ?? "—",
      },
      {
        key: "total",
        header: t("admin.orders.amount"),
        render: (row) => <FormattedPrice usd={Number(row.total)} />,
      },
      {
        key: "status",
        header: t("admin.orders.status"),
        render: (row) => (
          <Badge variant="secondary">{t(`order.statuses.${row.status}`, row.status)}</Badge>
        ),
      },
      {
        key: "created_at",
        header: t("admin.orders.date"),
        render: (row) => formatShortDate(row.created_at, language),
      },
    ],
    [t, language]
  );

  return <DataTable columns={columns} data={orders} keyExtractor={(row) => row.id} />;
}
