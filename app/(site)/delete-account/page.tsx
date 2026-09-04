import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { brandName } from "@/lib/brand";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

/**
 * Public account deletion page -- the URL given to Google Play as the
 * "Delete account URL".
 *
 * Deliberately readable without signing in, because a Play reviewer visits it
 * anonymously. It only explains the process and links to the authenticated
 * flow: nothing here can delete anything, and it never takes an email address,
 * so it cannot be used to probe whether an account exists.
 */
export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const b = brandName(language);
  return {
    title:
      language === "ar"
        ? `حذف الحساب والبيانات | ${b}`
        : `Account and Data Deletion | ${b} Luxury Jewelry`,
    description:
      language === "ar"
        ? `كيفية حذف حسابك في ${b} وما البيانات التي تُحذف أو يُحتفظ بها.`
        : `How to delete your ${b} account, what personal data is deleted, and what is retained.`,
  };
}

export default async function DeleteAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const brand = t(language, "common.brand");
  const { deleted } = await searchParams;

  // Anonymous visitors are expected here; this only decides which CTA to show.
  const { user } = await getCurrentUserWithProfile();
  const justDeleted = deleted === "1";

  const tr = (key: string) => t(language, `account.deleteAccount.${key}`);

  const deletedItems = [
    tr("deletedProfile"),
    tr("deletedAuth"),
    tr("deletedCart"),
    tr("deletedNotifications"),
    tr("deletedReviews"),
    tr("deletedSeller"),
    tr("deletedAddresses"),
  ];

  const retainedItems = [tr("retainedOrders"), tr("retainedStore"), tr("retainedPeriod")];

  return (
    <div>
      <section
        className="relative py-16 md:py-24 bg-white overflow-hidden"
        aria-labelledby="delete-account-heading"
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-masa-light/50 to-transparent"
          aria-hidden
        />
        <div className="relative max-w-content mx-auto px-4 md:px-6 text-center">
          <p className="font-sans text-masa-gray text-sm uppercase tracking-[0.2em] mb-4">
            {brand}
          </p>
          <h1
            id="delete-account-heading"
            className="text-3xl md:text-5xl text-primary font-luxury tracking-tight mb-6"
          >
            {tr("pageTitle")}
          </h1>
          <div className="w-12 h-px bg-primary/30 mx-auto mb-6" aria-hidden />
          <p className="font-sans text-masa-gray max-w-2xl mx-auto leading-relaxed">
            {tr("pageIntro")}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-16 md:pb-24 space-y-6">
        {justDeleted ? (
          <div
            role="status"
            className="rounded-md border border-primary/20 bg-masa-light px-4 py-3 font-sans text-masa-dark"
          >
            {tr("success")}
          </div>
        ) : null}

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-xl">{tr("howToTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-masa-dark space-y-4">
            <ol className="list-decimal ms-5 space-y-2 leading-relaxed">
              <li>{tr("howToStep1")}</li>
              <li>{tr("howToStep2")}</li>
              <li>{tr("howToStep3")}</li>
            </ol>
            <p className="text-sm text-masa-gray leading-relaxed">{tr("howToNote")}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {user ? (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/account/settings">{tr("goToSettings")}</Link>
                </Button>
              ) : (
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/login?next=/account/settings">{tr("signedOutCta")}</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-xl">{tr("deletedTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-masa-dark space-y-3">
            <p className="leading-relaxed">{tr("deletedIntro")}</p>
            <ul className="list-disc ms-5 space-y-2 leading-relaxed">
              {deletedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-xl">{tr("retainedTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-masa-dark space-y-3">
            <p className="leading-relaxed">{tr("retainedIntro")}</p>
            <ul className="list-disc ms-5 space-y-2 leading-relaxed">
              {retainedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-xl">{tr("afterTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-masa-dark">
            <p className="leading-relaxed">{tr("afterBody")}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-xl">{tr("contactTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-masa-dark space-y-3">
            <p className="leading-relaxed">{tr("contactBody")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="border-primary/20">
                <Link href="/contact">{isArabic ? "تواصل معنا" : "Contact us"}</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary/20">
                <Link href="/privacy">{isArabic ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
