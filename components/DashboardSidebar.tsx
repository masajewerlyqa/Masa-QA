"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  DollarSign,
  FileCheck,
  BarChart3,
  Settings,
  Star,
  Tag,
  X,
  CalendarClock,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/useI18n";

export type DashboardType = "admin" | "seller";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/seller-applications", label: "Seller Applications", icon: FileCheck },
  { href: "/admin/sellers", label: "Sellers", icon: Users },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: DollarSign },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/promo", label: "Promo codes", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const sellerNav: NavItem[] = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/orders", label: "Orders", icon: DollarSign },
  { href: "/seller/availability", label: "Store Availability", icon: CalendarClock },
  { href: "/seller/reviews", label: "Reviews", icon: Star },
  { href: "/seller/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/seller/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  type: DashboardType;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({ type, mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isArabic, t } = useI18n();
  const nav = (type === "admin" ? adminNav : sellerNav).map((item) => {
    const labelMap: Record<string, string> = {
      Overview: t("dashboard.nav.overview"),
      "Seller Applications": t("dashboard.nav.sellerApplications"),
      Sellers: t("dashboard.nav.sellers"),
      Stores: t("dashboard.nav.stores"),
      Products: t("dashboard.nav.products"),
      Orders: t("dashboard.nav.orders"),
      Reviews: t("dashboard.nav.reviews"),
      "Promo codes": t("dashboard.nav.promoCodes"),
      Analytics: t("dashboard.nav.analytics"),
      Settings: t("dashboard.nav.settings"),
      "Store Availability": t("dashboard.nav.storeAvailability"),
    };
    return { ...item, label: labelMap[item.label] ?? item.label };
  });
  const subtitle = type === "admin" ? t("dashboard.adminPanel") : t("dashboard.sellerDashboard");

  const sidebarContent = (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="block" aria-label={isArabic ? "ماسا الصفحة الرئيسية" : `${t("common.brand")} Home`}>
            <Image
              src="/image/logo-footer.png"
              alt={isArabic ? "شعار ماسا" : `${t("common.brand")} logo`}
              width={140}
              height={56}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
          <span className="text-xs text-secondary block mt-1">{subtitle}</span>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-2 -mr-2 text-white/70 hover:text-white"
            aria-label={t("dashboard.closeSidebar")}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="space-y-1 font-sans text-sm" aria-label={t("dashboard.navigation")}>
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== `/${type}` && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-primary text-white flex-shrink-0 min-h-screen" aria-label={t("dashboard.navigation")}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={t("dashboard.navigation")}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className={`absolute inset-y-0 ${isArabic ? "right-0 animate-in slide-in-from-right" : "left-0 animate-in slide-in-from-left"} w-72 bg-primary text-white shadow-2xl overflow-y-auto duration-300`}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
