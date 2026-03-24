import Link from "next/link";
import { redirect } from "next/navigation";
import { getSellerStore, getSellerStats, getSellerProducts, getSellerOrders, getSellerRevenueByMonth } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { SellerOverviewClient } from "./SellerOverviewClient";
import { Button } from "@/components/ui/button";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function SellerOverviewPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.overview.dashboard")}</h1>
        <p className="text-masa-gray font-sans mb-6">{t(language, "seller.overview.noStoreYet")}</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">{t(language, "seller.overview.backHome")}</Link>
        </Button>
      </div>
    );
  }

  const OVERVIEW_PRODUCTS_LIMIT = 10;
  const [stats, products, orders, revenueData] = await Promise.all([
    getSellerStats(store.id),
    getSellerProducts(store.id, OVERVIEW_PRODUCTS_LIMIT),
    getSellerOrders(store.id, 10),
    getSellerRevenueByMonth(store.id),
  ]);

  return (
    <SellerOverviewClient
      storeName={store.name}
      stats={stats}
      revenueData={revenueData}
      products={products}
      orders={orders}
    />
  );
}
