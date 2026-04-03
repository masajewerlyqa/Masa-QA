"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  ChevronDown,
  Sparkles,
  Calculator,
  Coins,
  X,
  TrendingUp,
  Phone,
  HelpCircle,
  Ruler,
  Truck,
  RotateCcw,
  User,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavbarAuth } from "@/components/auth/NavbarAuth";
import { CurrencyDropdown } from "@/components/CurrencyDropdown";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { NavbarTopBarPromo } from "@/components/NavbarTopBarPromo";
import { NavbarGlobalSearch } from "@/components/NavbarGlobalSearch";
import type { Profile, SessionUser } from "@/lib/auth-client";
import { useI18n } from "@/components/useI18n";

type NavbarProps = {
  user: SessionUser | null;
  profile: Profile | null;
  wishlistCount?: number;
  cartCount?: number;
  notificationCount?: number;
};

export function Navbar({ user, profile, wishlistCount = 0, cartCount = 0, notificationCount = 0 }: NavbarProps) {
  const { isArabic, t } = useI18n();
  const brand = t("common.brand");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-primary/10" aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md"
        >
          {t("navbar.skipToMain")}
        </a>

        {/* Top bar: promo + search (desktop) — hidden on mobile */}
        <div className="hidden md:block bg-primary text-white py-2 px-4 md:px-6">
          <div className="max-w-content mx-auto flex flex-nowrap items-center gap-3 md:gap-4 text-sm font-sans">
            <NavbarTopBarPromo />
            <NavbarGlobalSearch
              variant="desktop"
              formClassName="relative mx-2 min-w-0 flex-1 max-w-xl"
            />
            <div className="relative z-20 flex shrink-0 items-center gap-1 md:gap-2 ms-auto">
              <LanguageDropdown triggerClassName="text-white hover:text-secondary" />
              <CurrencyDropdown triggerClassName="text-white hover:text-secondary" />
            </div>
          </div>
        </div>

        {/* ─── Mobile Header ─── */}
        <div className="md:hidden px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-masa-dark"
              aria-label={t("navbar.openMenu")}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="shrink-0" aria-label={isArabic ? `${brand} الصفحة الرئيسية` : `${brand} Home`}>
              <Image
                src="/image/logo-nav.png"
                alt={isArabic ? `شعار ${brand}` : `${brand} logo`}
                width={200}
                height={72}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 text-masa-dark"
                aria-label={t("navbar.search")}
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/cart" className="relative p-2" aria-label={t("navbar.cart")}>
                <ShoppingCart className="w-5 h-5 text-masa-dark" />
                {cartCount > 0 && (
                  <Badge className="absolute top-0.5 right-0 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-white border-0">
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search bar — expandable */}
          {mobileSearchOpen && (
            <div className="mt-3 pb-1">
              <NavbarGlobalSearch
                variant="mobile"
                formClassName="relative w-full"
                autoFocus
                onAfterNavigate={() => setMobileSearchOpen(false)}
              />
            </div>
          )}
        </div>

        {/* ─── Desktop Header ─── */}
        <div className="hidden md:block px-4 md:px-6 py-4">
          <div className="max-w-content mx-auto flex flex-wrap items-center justify-between gap-4 md:gap-8">
            <Link href="/" className="shrink-0" aria-label={isArabic ? `${brand} الصفحة الرئيسية` : `${brand} Home`}>
              <Image
                src="/image/logo-nav.png"
                alt={isArabic ? `شعار ${brand}` : `${brand} logo`}
                width={250}
                height={90}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-3 md:gap-6 font-sans text-sm">
            <Link href="/about" className="text-masa-dark hover:text-primary transition-colors">
                {t("navbar.about")}
              </Link>
              <Link href="/discover" className="text-masa-dark hover:text-primary transition-colors">
                {t("navbar.marketplace")}
              </Link>
              <Link href="/market-prices" className="text-masa-dark hover:text-primary transition-colors">
                {t("navbar.marketPrices")}
              </Link>
              
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-masa-dark hover:text-primary transition-colors focus:outline-none">
                  {t("navbar.tools")}
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px] font-sans">
                  <DropdownMenuItem asChild>
                    <Link href="/advisor" className="flex items-center gap-3 cursor-pointer">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <div>
                        <span className="block font-medium">{t("navbar.aiAdvisor")}</span>
                        <span className="text-xs text-masa-gray">{t("navbar.aiAdvisorHint")}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tools/zakat" className="flex items-center gap-3 cursor-pointer">
                      <Calculator className="w-4 h-4 text-primary" />
                      <div>
                        <span className="block font-medium">{t("navbar.zakat")}</span>
                        <span className="text-xs text-masa-gray">{t("navbar.zakatHint")}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tools/sell" className="flex items-center gap-3 cursor-pointer">
                      <Coins className="w-4 h-4 text-primary" />
                      <div>
                        <span className="block font-medium">{t("navbar.sellGold")}</span>
                        <span className="text-xs text-masa-gray">{t("navbar.sellGoldHint")}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/wishlist" className="relative inline-flex" aria-label={t("navbar.wishlist")}>
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-0">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/cart" className="relative inline-flex" aria-label={t("navbar.cart")}>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-0">
                      {cartCount > 99 ? "99+" : cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <NavbarAuth user={user} profile={profile} notificationCount={notificationCount} />
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Drawer Menu ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label={t("navbar.openMenu")}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className={`absolute inset-y-0 ${isArabic ? "right-0" : "left-0"} w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300`}>
            <div className="flex items-center justify-between p-4 border-b border-primary/10">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} aria-label={isArabic ? `${brand} الصفحة الرئيسية` : `${brand} Home`}>
                <Image
                  src="/image/logo-nav.png"
                  alt={isArabic ? `شعار ${brand}` : `${brand} logo`}
                  width={160}
                  height={56}
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-masa-dark"
                aria-label={t("navbar.closeMenu")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 font-sans">
              <p className="text-xs text-masa-gray uppercase tracking-wider mb-2 px-3">{t("navbar.account")}</p>
              {!user || !profile ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-masa-dark hover:bg-masa-light transition-colors mb-4 border border-primary/10"
                >
                  <User className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{t("auth.register.signIn")}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-masa-light/80 border border-primary/10 mb-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-masa-gray">{t("mobileNav.profile")}</p>
                    <p className="text-sm font-medium text-masa-dark truncate">
                      {profile.full_name?.trim() || profile.email || "—"}
                    </p>
                  </div>
                  <NavbarAuth
                    user={user}
                    profile={profile}
                    notificationCount={notificationCount}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <MobileMenuLink href="/discover" icon={Search} label={t("navbar.marketplace")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/market-prices" icon={TrendingUp} label={t("navbar.marketPrices")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/about" icon={Building2} label={t("navbar.about")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/wishlist" icon={Heart} label={t("navbar.wishlist")} count={wishlistCount} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/cart" icon={ShoppingCart} label={t("navbar.cart")} count={cartCount} onClick={() => setMobileMenuOpen(false)} />
              </div>

              <div className="my-4 border-t border-primary/10" />

              <p className="text-xs text-masa-gray uppercase tracking-wider mb-2 px-3">{t("navbar.tools")}</p>
              <div className="space-y-1">
                <MobileMenuLink href="/advisor" icon={Sparkles} label={t("navbar.aiAdvisor")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/tools/zakat" icon={Calculator} label={t("navbar.zakat")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/tools/sell" icon={Coins} label={t("navbar.sellGold")} onClick={() => setMobileMenuOpen(false)} />
              </div>

              <div className="my-4 border-t border-primary/10" />

              <p className="text-xs text-masa-gray uppercase tracking-wider mb-2 px-3">{t("navbar.support")}</p>
              <div className="space-y-1">
                <MobileMenuLink href="/size-guide" icon={Ruler} label={t("navbar.sizeGuide")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/delivery" icon={Truck} label={t("navbar.shipping")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/returns" icon={RotateCcw} label={t("navbar.returns")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/contact" icon={Phone} label={t("navbar.contact")} onClick={() => setMobileMenuOpen(false)} />
                <MobileMenuLink href="/contact#faq" icon={HelpCircle} label={t("navbar.faq")} onClick={() => setMobileMenuOpen(false)} />
              </div>

              <div className="my-4 border-t border-primary/10" />

              <div className="px-3 flex flex-wrap items-center gap-4">
                <LanguageDropdown onLanguageSelected={() => setMobileMenuOpen(false)} />
                <CurrencyDropdown onCurrencySelected={() => setMobileMenuOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileMenuLink({
  href,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-masa-dark hover:bg-masa-light transition-colors"
    >
      <Icon className="w-5 h-5 text-primary shrink-0" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {count != null && count > 0 && (
        <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] bg-primary text-white border-0 rounded-full">
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Link>
  );
}
