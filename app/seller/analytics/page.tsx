import { redirect } from "next/navigation";
import {
  getSellerStore,
  getSellerStats,
  getSellerRevenueByMonth,
  getSellerOrderStatusBreakdown,
  getSellerTopProductsAnalytics,
} from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { SellerAnalyticsClient } from "./SellerAnalyticsClient";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function SellerAnalyticsPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.analytics.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.analytics.noStoreYet")}</p>
      </div>
    );
  }

  const [stats, revenueData, orderStatus, topProducts] = await Promise.all([
    getSellerStats(store.id),
    getSellerRevenueByMonth(store.id),
    getSellerOrderStatusBreakdown(store.id),
    getSellerTopProductsAnalytics(store.id, 8),
  ]);

  return (
    <SellerAnalyticsClient
      stats={stats}
      revenueData={revenueData}
      orderStatus={orderStatus}
      topProducts={topProducts}
    />
  );
}
