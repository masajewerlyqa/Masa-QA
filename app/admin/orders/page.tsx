import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminOrders } from "@/lib/admin";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const orders = await getAdminOrders(200);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.orders.subtitle")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "admin.orders.recentOrders").replace("{count}", String(orders.length))}</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminOrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
