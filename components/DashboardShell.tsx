"use client";

import { useState } from "react";
import { DashboardSidebar, type DashboardType } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import type { Profile } from "@/lib/auth-client";

type DashboardShellProps = {
  type: DashboardType;
  user: import("@/lib/auth-client").SessionUser | null;
  profile: Profile | null;
  notificationCount?: number;
  children: React.ReactNode;
};

export function DashboardShell({
  type,
  user,
  profile,
  notificationCount = 0,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        type={type}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardHeader
          type={type}
          user={user}
          profile={profile}
          notificationCount={notificationCount}
          onMobileMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 bg-masa-light">{children}</main>
      </div>
    </div>
  );
}
