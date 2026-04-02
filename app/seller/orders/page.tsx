import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSellerStore, getSellerOrders } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { SellerOrdersTable } from "@/components/seller/SellerOrdersTable";

export default async function SellerOrdersPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.orders.noStoreYet")}</p>
      </div>
    );
  }

  const orders = await getSellerOrders(store.id);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.orders.manageOrders")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "seller.orders.allOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SellerOrdersTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  );
}
