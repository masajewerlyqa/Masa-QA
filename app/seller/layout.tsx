import { DashboardShell } from "@/components/DashboardShell";
import { Toaster } from "@/components/ui/toaster";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentUserWithProfile();
  const notificationCount = user ? await getUnreadNotificationCount(user.id) : 0;

  return (
    <>
      <DashboardShell
        type="seller"
        user={user}
        profile={profile}
        notificationCount={notificationCount}
      >
        {children}
      </DashboardShell>
      <Toaster />
    </>
  );
}
