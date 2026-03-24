import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import {
  getAdminMetrics,
  getRecentSellerApplications,
  getRecentOrders,
  getAdminCategoryDistribution,
  getAdminCommissionBySeller,
  getAdminCommissionMonthly,
  getAdminPlatformSnapshotMonthly,
} from "@/lib/admin";
import { AdminOverviewClient } from "./AdminOverviewClient";

export default async function AdminOverviewPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    redirect("/login");
  }

  const [
    metrics,
    recentApplications,
    recentOrders,
    categoryDistribution,
    commissionBySeller,
    commissionMonthly,
    platformSnapshotMonthly,
  ] = await Promise.all([
    getAdminMetrics(),
    getRecentSellerApplications(10),
    getRecentOrders(10),
    getAdminCategoryDistribution(),
    getAdminCommissionBySeller(),
    getAdminCommissionMonthly(),
    getAdminPlatformSnapshotMonthly(),
  ]);

  if (!metrics) {
    redirect("/login");
  }

  return (
    <AdminOverviewClient
      metrics={metrics}
      recentApplications={recentApplications}
      recentOrders={recentOrders}
      categoryDistribution={categoryDistribution}
      commissionBySeller={commissionBySeller}
      commissionMonthly={commissionMonthly}
      platformSnapshotMonthly={platformSnapshotMonthly}
    />
  );
}
