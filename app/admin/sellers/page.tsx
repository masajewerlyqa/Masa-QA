import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminSellers } from "@/lib/admin";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { AdminSellersTable } from "@/components/admin/AdminSellersTable";

export default async function SellersListPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") redirect("/login");

  const sellers = await getAdminSellers();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.sellers.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.sellers.subtitle")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "admin.sellers.allSellers").replace("{count}", String(sellers.length))}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminSellersTable sellers={sellers} />
        </CardContent>
      </Card>
    </div>
  );
}
