import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { parseSellerPlanId } from "@/lib/seller-plans";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function SellerApplySuccessPage({ searchParams }: PageProps) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const rawPlan = searchParams?.plan;
  const planStr = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
  const plan = parseSellerPlanId(planStr);
  if (!plan) {
    redirect("/apply");
  }

  const planLabel =
    plan === "premium" ? t(language, "sellerOnboarding.premiumName") : t(language, "sellerOnboarding.basicName");

  return (
    <div className="min-h-[60vh] px-4 py-12 md:py-16 flex flex-col items-center">
      <Card className="w-full max-w-lg border-primary/15 shadow-md">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-luxury text-primary">
            {t(language, "sellerOnboarding.successPageTitle")}
          </CardTitle>
          <CardDescription className="text-base font-sans text-masa-gray leading-relaxed">
            {t(language, "sellerOnboarding.successPageSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 font-sans">
          <div className="rounded-xl border border-primary/10 bg-masa-light/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm text-masa-gray">{t(language, "sellerOnboarding.successPlanLabel")}</span>
            <Badge variant="outline" className="border-primary/40 text-primary w-fit">
              {planLabel}
            </Badge>
          </div>
          <p className="text-sm text-masa-dark leading-relaxed">{t(language, "sellerOnboarding.successReviewNote")}</p>
          <div className={`flex flex-col sm:flex-row gap-3 ${isArabic ? "sm:flex-row-reverse" : ""}`}>
            <Button asChild className="bg-primary hover:bg-primary/90 flex-1">
              <Link href="/">{t(language, "sellerOnboarding.successBackHome")}</Link>
            </Button>
            <Button asChild variant="outline" className="border-primary/25 flex-1">
              <Link href="/account">{t(language, "sellerOnboarding.successGoAccount")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
