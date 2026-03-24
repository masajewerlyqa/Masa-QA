import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminSellers, type AdminSellerRow } from "@/lib/admin";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function SellersListPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") redirect("/login");

  const sellers = await getAdminSellers();

  const columns: Column<AdminSellerRow>[] = [
    { key: "name", header: t(language, "admin.sellers.seller") },
    { key: "email", header: t(language, "admin.sellers.email") },
    { key: "stores", header: t(language, "admin.sellers.stores") },
    { key: "products", header: t(language, "admin.sellers.products") },
    {
      key: "status",
      header: t(language, "admin.sellers.status"),
      render: (row) => (
        <Badge variant={row.status === "Active" ? "default" : "secondary"}>{t(language, `order.statuses.${row.status.toLowerCase()}`, row.status)}</Badge>
      ),
    },
  ];

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
          <DataTable
            columns={columns}
            data={sellers}
            keyExtractor={(row) => row.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
