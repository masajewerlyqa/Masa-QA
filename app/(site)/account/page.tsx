import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MapPin, Package, Settings } from "lucide-react";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getLastCustomerAddress } from "@/lib/customer";
import { ResendVerificationEmail } from "@/components/account/ResendVerificationEmail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerLanguage } from "@/lib/language-server";
import type { Profile } from "@/lib/auth-client";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/language";

function accountRoleLabel(language: Language, role: Profile["role"]): string {
  switch (role) {
    case "admin":
      return t(language, "account.accountPage.roleLabels.admin");
    case "seller":
      return t(language, "account.accountPage.roleLabels.seller");
    case "pending_seller":
      return t(language, "account.accountPage.roleLabels.pending_seller");
    case "customer":
    default:
      return t(language, "account.accountPage.roleLabels.customer");
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user, profile } = await getCurrentUserWithProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  const lastAddress = await getLastCustomerAddress(user.id);
  const passwordUpdated =
    typeof searchParams?.password === "string" ? searchParams.password === "updated" : false;
  const sellerApplied = searchParams?.applied === "1";
  const appliedPlan =
    typeof searchParams?.plan === "string" && (searchParams.plan === "basic" || searchParams.plan === "premium")
      ? searchParams.plan
      : null;
  const verified = searchParams?.verified === "1";
  const emailVerified = Boolean(user.emailConfirmedAt);
  const profileComplete = Boolean(profile.full_name?.trim() && profile.phone?.trim());
  const accountEmail = user.email ?? profile.email ?? "";

  return (
    <div className="min-h-[60vh] px-4 py-8 md:py-12">
      <div className="max-w-content mx-auto grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {verified && (
          <div className="lg:col-span-2 rounded-md border border-primary/15 bg-masa-light px-4 py-3 text-sm text-masa-dark font-sans">
            {t(language, "account.accountPage.emailVerifiedBanner")}
          </div>
        )}
        {passwordUpdated && (
          <div className="lg:col-span-2 rounded-md border border-primary/20 bg-masa-light px-4 py-3 text-sm text-masa-dark font-sans">
            {t(language, "account.accountPage.passwordUpdatedBanner")}
          </div>
        )}
        {sellerApplied && (
          <div className="lg:col-span-2 rounded-md border border-primary/25 bg-white px-4 py-4 text-sm text-masa-dark font-sans shadow-sm">
            <p className="font-medium text-primary font-luxury text-base">{t(language, "sellerOnboarding.appliedSuccessTitle")}</p>
            <p className="mt-2 leading-relaxed">{t(language, "sellerOnboarding.appliedSuccessBody")}</p>
            {appliedPlan && (
              <p className="mt-3 text-masa-gray">
                {t(language, "sellerOnboarding.formPlanSummary")}:{" "}
                <span className="font-medium text-masa-dark">
                  {appliedPlan === "premium"
                    ? t(language, "sellerOnboarding.premiumName")
                    : t(language, "sellerOnboarding.basicName")}
                </span>
              </p>
            )}
          </div>
        )}
        {!emailVerified && accountEmail && (
          <div className="lg:col-span-2 rounded-md border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-masa-dark font-sans space-y-2">
            <p>
              <span className="font-medium text-primary">{t(language, "account.accountPage.emailVerificationPending")}</span>{" "}
              {t(language, "account.accountPage.confirmEmailHint")}
            </p>
            <ResendVerificationEmail email={accountEmail} />
          </div>
        )}
        {!profileComplete && (
          <div className="lg:col-span-2 rounded-md border border-primary/10 bg-white px-4 py-3 text-sm text-masa-dark font-sans flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{t(language, "account.accountPage.completeProfileHint")}</span>
            <Button variant="outline" size="sm" className="border-primary/20 w-fit shrink-0" asChild>
              <Link href="/account/settings">{t(language, "account.accountPage.completeProfile")}</Link>
            </Button>
          </div>
        )}
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-2xl font-luxury text-primary">{t(language, "account.accountPage.myAccount")}</CardTitle>
              <CardDescription className="font-sans">
                {t(language, "account.accountPage.manageProfile")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 border-primary/20" asChild>
              <Link href="/account/settings">
                <Settings className={`w-4 h-4 ${isArabic ? "ml-2" : "mr-2"}`} />
                {t(language, "account.accountPage.settings")}
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 font-sans">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-masa-gray">{t(language, "account.accountPage.name")}</p>
                <p className="text-masa-dark">{profile.full_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-masa-gray">{t(language, "common.email")}</p>
                <p className="text-masa-dark">{profile.email ?? user.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-masa-gray">{t(language, "account.accountPage.emailStatus")}</p>
                <p className="text-masa-dark">{emailVerified ? t(language, "common.verified") : t(language, "account.accountPage.pending")}</p>
              </div>
              <div>
                <p className="text-sm text-masa-gray">{t(language, "account.accountPage.updates")}</p>
                <p className="text-masa-dark">{profile.newsletter_opt_in ? t(language, "account.accountPage.subscribed") : t(language, "account.accountPage.notSubscribed")}</p>
              </div>
              <div>
                <p className="text-sm text-masa-gray">{t(language, "common.phone")}</p>
                <p className="text-masa-dark">{profile.phone?.trim() ? profile.phone : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-masa-gray">{t(language, "account.accountPage.role")}</p>
                <p className="text-masa-dark">{accountRoleLabel(language, profile.role)}</p>
              </div>
              <div>
                <p className="text-sm text-masa-gray">{t(language, "account.accountPage.accountId")}</p>
                <p className="text-masa-dark text-xs sm:text-sm break-all">{user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 md:space-y-4">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base font-luxury text-primary flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t(language, "account.accountPage.orders")}
              </CardTitle>
              <CardDescription className="font-sans">
                {t(language, "account.accountPage.ordersDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="font-sans">
              <Link href="/account/orders">
                <Button variant="outline" className="w-full sm:w-auto">
                  {t(language, "account.accountPage.viewOrderHistory")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base font-luxury text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {t(language, "mobileNav.wishlist")}
              </CardTitle>
              <CardDescription className="font-sans">
                {t(language, "account.accountPage.wishlistDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="font-sans">
              <Link href="/wishlist">
                <Button variant="outline" className="w-full sm:w-auto">
                  {t(language, "account.accountPage.goToWishlist")}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-base font-luxury text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t(language, "account.accountPage.savedAddresses")}
              </CardTitle>
              <CardDescription className="font-sans">
                {t(language, "account.accountPage.savedAddressDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="font-sans text-sm text-masa-dark">
              {lastAddress ? (
                <div className="space-y-1">
                  {lastAddress.fullName && <p className="font-medium">{lastAddress.fullName}</p>}
                  {lastAddress.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p className="text-xs text-masa-gray mt-2">
                    {t(language, "account.accountPage.updateAddressHint")}
                  </p>
                </div>
              ) : (
                <p className="text-masa-gray">
                  {t(language, "account.accountPage.noAddressYet")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
