"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ApplicationActions } from "@/app/admin/seller-applications/ApplicationActions";
import { useI18n } from "@/components/useI18n";
import { formatShortDate } from "@/lib/date-format";
import { useMemo } from "react";

export type SellerApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  business_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_full_name: string | null;
  store_location: string | null;
  seller_plan: string | null;
  created_at: string;
  license_path: string | null;
  logo_path: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
  reviewer?: { full_name: string | null; email: string | null } | null;
};

type Props = { rows: SellerApplicationRow[] };

export function SellerApplicationsTable({ rows }: Props) {
  const { t, language } = useI18n();

  const columns: Column<SellerApplicationRow>[] = useMemo(
    () => [
      {
        key: "name",
        header: t("admin.applications.applicant"),
        render: (row) => row.contact_full_name ?? row.profiles?.full_name ?? row.contact_email ?? "—",
      },
      { key: "contact_email", header: t("admin.applications.email") },
      { key: "business_name", header: t("admin.applications.storeBrand") },
      {
        key: "seller_plan",
        header: t("admin.applications.sellerPlan"),
        render: (row) =>
          row.seller_plan === "premium"
            ? t("sellerOnboarding.premiumName")
            : row.seller_plan === "basic"
              ? t("sellerOnboarding.basicName")
              : "—",
      },
      {
        key: "store_location",
        header: t("admin.applications.location"),
        render: (row) => row.store_location ?? "—",
      },
      {
        key: "status",
        header: t("admin.applications.status"),
        render: (row) => (
          <Badge
            variant="outline"
            className={
              row.status === "approved"
                ? "text-green-600 border-green-600"
                : row.status === "rejected"
                  ? "text-red-600 border-red-600"
                  : "text-orange-600 border-orange-600"
            }
          >
            {t(`order.statuses.${row.status}`, row.status)}
          </Badge>
        ),
      },
      {
        key: "created_at",
        header: t("admin.applications.date"),
        render: (row) => formatShortDate(row.created_at, language),
      },
      {
        key: "id",
        header: t("admin.applications.actions"),
        render: (row) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/seller-applications/${row.id}`} aria-label={t("admin.applications.viewDetails")}>
                <Eye className="w-4 h-4 mr-1" />
                {t("admin.applications.view")}
              </Link>
            </Button>
            {row.status === "pending" && <ApplicationActions applicationId={row.id} />}
          </div>
        ),
      },
    ],
    [t, language]
  );

  return <DataTable columns={columns} data={rows} keyExtractor={(row) => row.id} />;
}
