"use client";

import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { AdminSellerRow } from "@/lib/admin";
import { useI18n } from "@/components/useI18n";
import { useMemo } from "react";

type Props = { sellers: AdminSellerRow[] };

export function AdminSellersTable({ sellers }: Props) {
  const { t } = useI18n();

  const columns: Column<AdminSellerRow>[] = useMemo(
    () => [
      { key: "name", header: t("admin.sellers.seller") },
      { key: "email", header: t("admin.sellers.email") },
      { key: "stores", header: t("admin.sellers.stores") },
      { key: "products", header: t("admin.sellers.products") },
      {
        key: "status",
        header: t("admin.sellers.status"),
        render: (row) => (
          <Badge variant={row.status === "Active" ? "default" : "secondary"}>
            {t(`order.statuses.${row.status.toLowerCase()}`, row.status)}
          </Badge>
        ),
      },
    ],
    [t]
  );

  return <DataTable columns={columns} data={sellers} keyExtractor={(row) => row.id} />;
}
