"use client";

import Link from "next/link";
import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/useI18n";

export type DashboardHeaderType = "admin" | "seller";

type DashboardHeaderProps = {
  type: DashboardHeaderType;
  user: import("@/lib/auth-client").SessionUser | null;
  profile: import("@/lib/auth-client").Profile | null;
  notificationCount?: number;
  onMobileMenuToggle?: () => void;
};

export function DashboardHeader({
  notificationCount = 0,
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-primary/10 shadow-sm">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Mobile hamburger */}
            {onMobileMenuToggle && (
              <button
                type="button"
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 -ml-2 text-masa-dark"
                aria-label={t("dashboard.openSidebar")}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSwitcher className="hidden md:flex items-center gap-2" />
            <Link href="/notifications" className="relative" aria-label={t("dashboard.notifications")}>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] bg-primary text-white border-0">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/" aria-label={t("dashboard.goHome")}>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
