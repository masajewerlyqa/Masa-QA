"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LayoutDashboard, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getDashboardPathForRole, type Profile, type SessionUser } from "@/lib/auth-client";
import { useI18n } from "@/components/useI18n";

type NavbarAuthProps = {
  user: SessionUser | null;
  profile: Profile | null;
  notificationCount?: number;
};

export function NavbarAuth({ user, profile, notificationCount = 0 }: NavbarAuthProps) {
  const { t } = useI18n();
  const router = useRouter();

  if (!user || !profile) {
    return (
      <Link href="/login" aria-label={t("auth.register.signIn")}>
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5" />
        </Button>
      </Link>
    );
  }

  const dashboardHref = getDashboardPathForRole(profile.role);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("account.accountPage.myAccount")}>
          <User className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem] font-sans">
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2 cursor-pointer">
            <User className="w-4 h-4" />
            <span className="flex flex-col">
              <span>{t("mobileNav.profile")}</span>
              {profile.email && (
                <span className="text-xs text-masa-gray truncate max-w-[12rem]">{profile.email}</span>
              )}
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={dashboardHref} className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="w-4 h-4" />
            <span>{t("dashboard.nav.overview")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex items-center gap-2 cursor-pointer">
            <Bell className="w-4 h-4" />
            {t("account.notifications.title")}
            {notificationCount > 0 && (
              <span className="ml-auto h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          className="flex items-center gap-2 cursor-pointer text-masa-gray focus:text-masa-dark"
        >
          <LogOut className="w-4 h-4" />
          {t("common.signOut", "Sign out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
