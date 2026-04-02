import { DashboardShell } from "@/components/DashboardShell";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: Awaited<ReturnType<typeof getCurrentUserWithProfile>>["user"] = null;
  let profile: Awaited<ReturnType<typeof getCurrentUserWithProfile>>["profile"] = null;
  let notificationCount = 0;

  try {
    const session = await getCurrentUserWithProfile();
    user = session.user;
    profile = session.profile;
    if (user) {
      notificationCount = await getUnreadNotificationCount(user.id);
    }
  } catch (e) {
    console.error("[seller/layout] bootstrap failed:", e);
  }

  return (
    <DashboardShell type="seller" user={user} profile={profile} notificationCount={notificationCount}>
      {children}
    </DashboardShell>
  );
}
