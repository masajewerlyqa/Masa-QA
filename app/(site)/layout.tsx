import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsappFloatingButton } from "@/components/support/WhatsappFloatingButton";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistCount, getCartCount } from "@/lib/customer";
import { getUnreadNotificationCount } from "@/lib/notifications";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentUserWithProfile();
  const [wishlistCount, cartCount, notificationCount] = user
    ? await Promise.all([
        getWishlistCount(user.id),
        getCartCount(user.id),
        getUnreadNotificationCount(user.id),
      ])
    : [0, 0, 0];
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} profile={profile} wishlistCount={wishlistCount} cartCount={cartCount} notificationCount={notificationCount} />
      <main id="main-content" className="flex-1 pb-20 md:pb-0" tabIndex={-1}>
        {children ?? null}
      </main>
      <Footer />
      <MobileBottomNav wishlistCount={wishlistCount} cartCount={cartCount} />
      <WhatsappFloatingButton />
    </div>
  );
}
