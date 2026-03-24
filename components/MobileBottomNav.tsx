"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/useI18n";

type MobileBottomNavProps = {
  wishlistCount?: number;
  cartCount?: number;
};

export function MobileBottomNav({ wishlistCount = 0, cartCount = 0 }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const navItems = [
    { href: "/", label: t("mobileNav.home"), icon: Home, matchExact: true },
    { href: "/discover", label: t("mobileNav.discover"), icon: Search },
    { href: "/wishlist", label: t("mobileNav.wishlist"), icon: Heart, countKey: "wishlist" as const },
    { href: "/cart", label: t("mobileNav.cart"), icon: ShoppingBag, countKey: "cart" as const },
    { href: "/account", label: t("mobileNav.profile"), icon: User },
  ];

  const counts = { wishlist: wishlistCount, cart: cartCount };

  function isActive(item: (typeof navItems)[number]) {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-primary/10 md:hidden"
      aria-label={t("common.mobileNavigation")}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const count = item.countKey ? counts[item.countKey] : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors relative",
                active ? "text-primary" : "text-masa-gray"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <Icon
                  className={cn("w-5 h-5", active && "stroke-[2.5px]")}
                  aria-hidden
                />
                {count > 0 && (
                  <Badge className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] p-0 px-1 flex items-center justify-center text-[9px] bg-primary text-white border-0 rounded-full">
                    {count > 99 ? "99+" : count}
                  </Badge>
                )}
              </span>
              <span className={cn("text-[10px] leading-tight", active ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
