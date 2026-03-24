import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApplicationActions } from "./ApplicationActions";
import { Eye } from "lucide-react";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

type Row = {
  id: string;
  user_id: string;
  status: string;
  business_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_full_name: string | null;
  store_location: string | null;
  created_at: string;
  license_path: string | null;
  logo_path: string | null;
  /** Applicant profile (joined via user_id). */
  profiles: { full_name: string | null; email: string | null } | null;
  /** Reviewer profile (joined via reviewed_by), if any. */
  reviewer?: { full_name: string | null; email: string | null } | null;
};

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

export default async function SellerApplicationsPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    redirect("/login");
  }

  const supabase = await createClient();
  // Disambiguate profiles: seller_applications has two FKs to profiles (user_id = applicant, reviewed_by = reviewer).
  // Use FK hint so PostgREST knows which relationship to embed. Keep applicant under "profiles" for existing UI.
  const { data: rows, error } = await supabase
    .from("seller_applications")
    .select(
      "id, user_id, status, business_name, contact_email, contact_phone, contact_full_name, store_location, " +
        "created_at, license_path, logo_path, " +
        "profiles:profiles!seller_applications_user_id_fkey(full_name, email), " +
        "reviewer:profiles!seller_applications_reviewed_by_fkey(full_name, email)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-red-600 font-sans">{t(language, "admin.applications.failedLoad").replace("{error}", error.message)}</p>
      </div>
    );
  }

  const data = (rows ?? []) as unknown as Row[];

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: t(language, "admin.applications.applicant"),
      render: (row) => row.contact_full_name ?? row.profiles?.full_name ?? row.contact_email ?? "—",
    },
    { key: "contact_email", header: t(language, "admin.applications.email") },
    { key: "business_name", header: t(language, "admin.applications.storeBrand") },
    {
      key: "store_location",
      header: t(language, "admin.applications.location"),
      render: (row) => row.store_location ?? "—",
    },
    {
      key: "status",
      header: t(language, "admin.applications.status"),
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
          {t(language, `order.statuses.${row.status}`, row.status)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: t(language, "admin.applications.date"),
      render: (row) => formatDate(row.created_at),
    },
    {
      key: "id",
      header: t(language, "admin.applications.actions"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/seller-applications/${row.id}`} aria-label={t(language, "admin.applications.viewDetails")}>
              <Eye className="w-4 h-4 mr-1" />
              {t(language, "admin.applications.view")}
            </Link>
          </Button>
          {row.status === "pending" && <ApplicationActions applicationId={row.id} />}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.applications.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.applications.subtitle")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "admin.applications.applications")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            keyExtractor={(row) => row.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
