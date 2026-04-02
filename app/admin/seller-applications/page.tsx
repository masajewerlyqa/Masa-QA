import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { SellerApplicationsTable, type SellerApplicationRow } from "@/components/admin/SellerApplicationsTable";

export default async function SellerApplicationsPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("seller_applications")
    .select(
      "id, user_id, status, business_name, contact_email, contact_phone, contact_full_name, store_location, " +
        "seller_plan, created_at, license_path, logo_path, " +
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

  const data = (rows ?? []) as unknown as SellerApplicationRow[];

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
          <SellerApplicationsTable rows={data} />
        </CardContent>
      </Card>
    </div>
  );
}
