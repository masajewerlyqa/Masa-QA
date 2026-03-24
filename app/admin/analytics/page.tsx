import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import {
  getAdminPlatformSnapshotMonthly,
  getAdminOrderStatusBreakdown,
  getAdminCategoryRevenue,
  getAdminTopSellersAnalytics,
} from "@/lib/admin";
import { AdminAnalyticsClient } from "./AdminAnalyticsClient";

export default async function AdminAnalyticsPage() {
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") redirect("/login");

  const [platformSnapshot, orderStatus, categoryRevenue, topSellers] = await Promise.all([
    getAdminPlatformSnapshotMonthly(),
    getAdminOrderStatusBreakdown(),
    getAdminCategoryRevenue(),
    getAdminTopSellersAnalytics(10),
  ]);

  return (
    <AdminAnalyticsClient
      platformSnapshot={platformSnapshot}
      orderStatus={orderStatus}
      categoryRevenue={categoryRevenue}
      topSellers={topSellers}
    />
  );
}
