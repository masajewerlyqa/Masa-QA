"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/useI18n";
import { savePendingSellerPlanAction } from "@/app/(site)/apply/actions";
import { SELLER_PLAN_LIMITS, type SellerPlanId } from "@/lib/seller-plans";
import { SellerApplySignInCard } from "@/components/seller/SellerApplySignInCard";

const COMMISSION_BASIC = `${SELLER_PLAN_LIMITS.basic.commissionPercent}%`;
const COMMISSION_PREMIUM = `${SELLER_PLAN_LIMITS.premium.commissionPercent}%`;

function PlanCard({
  planId,
  highlighted,
  name,
  badge,
  description,
  features,
  feeLabel,
  commissionLabel,
  productLabel,
  ctaLabel,
  selectingLabel,
  loading,
  onSelect,
  recommended,
  recommendedRibbon,
}: {
  planId: SellerPlanId;
  highlighted: boolean;
  name: string;
  badge: string;
  description: string;
  features: readonly string[];
  feeLabel: string;
  commissionLabel: string;
  productLabel: string;
  ctaLabel: string;
  selectingLabel: string;
  loading: boolean;
  onSelect: (id: SellerPlanId) => void;
  recommended?: boolean;
  /** Shown next to sparkles under the top badge (e.g. "Recommended"). */
  recommendedRibbon?: string;
}) {
  const limits = SELLER_PLAN_LIMITS[planId];

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8 shadow-sm transition-shadow",
        highlighted
          ? "border-primary/40 shadow-lg ring-2 ring-primary/15 md:scale-[1.02] z-[1]"
          : "border-primary/10 hover:border-primary/25"
      )}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <Badge className="bg-primary text-masa-light font-sans px-3 py-1 shadow-md">{badge}</Badge>
          {recommendedRibbon && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary font-sans">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              {recommendedRibbon}
            </span>
          )}
        </div>
      )}
      {!recommended && (
        <div className="mb-3">
          <Badge variant="outline" className="border-primary/30 text-primary font-sans">
            {badge}
          </Badge>
        </div>
      )}
      {recommended && <div className="h-8 sm:h-9" />}
      <h3 className="text-2xl font-luxury text-primary mb-2">{name}</h3>
      <p className="text-sm text-masa-gray font-sans leading-relaxed mb-6 min-h-[3rem]">{description}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-masa-dark font-sans">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-masa-light/80 border border-primary/10 px-4 py-3 mb-6 space-y-2 font-sans text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-masa-gray">{productLabel}</span>
          <span className="font-medium text-masa-dark">{limits.maxProducts === null ? "∞" : limits.maxProducts}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-masa-gray">{feeLabel}</span>
          <span className="font-medium text-masa-dark">{limits.registrationFeeQar.toLocaleString()} QAR</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-masa-gray">{commissionLabel}</span>
          <span className="font-medium text-masa-dark">{limits.commissionPercent}%</span>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className={cn("w-full font-sans", highlighted ? "bg-primary hover:bg-primary/90" : "")}
        variant={highlighted ? "default" : "outline"}
        disabled={loading}
        onClick={() => onSelect(planId)}
      >
        {loading ? selectingLabel : ctaLabel}
      </Button>
    </div>
  );
}

type Props = { signedIn: boolean };

export function SellerPlanSelection({ signedIn }: Props) {
  const { t, dict, isArabic } = useI18n();
  const router = useRouter();
  const [pendingId, setPendingId] = useState<SellerPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSelect(planId: SellerPlanId) {
    setError(null);
    setPendingId(planId);
    startTransition(async () => {
      const res = await savePendingSellerPlanAction(planId);
      if (!res.ok) {
        if (res.error === "Not signed in") {
          setError(isArabic ? "يرجى تسجيل الدخول لاختيار خطة." : "Please sign in to select a plan.");
        } else {
          setError(res.error);
        }
        setPendingId(null);
        return;
      }
      router.push("/apply/form");
    });
  }

  if (!signedIn) {
    return (
      <div className="w-full flex justify-center px-4 py-12">
        <SellerApplySignInCard />
      </div>
    );
  }

  const basicList = dict.sellerOnboarding.basicFeatures;
  const premiumList = dict.sellerOnboarding.premiumFeatures;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 md:py-14">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 font-sans mb-3">
          {t("sellerOnboarding.choosePlanEyebrow")}
        </p>
        <h1 className="text-3xl md:text-4xl font-luxury text-primary mb-4">{t("sellerOnboarding.choosePlanTitle")}</h1>
        <p className="text-masa-gray font-sans text-base leading-relaxed">{t("sellerOnboarding.choosePlanSubtitle")}</p>
        <p className="mt-4 text-sm text-masa-gray/90 font-sans">{t("sellerOnboarding.trustNote")}</p>
      </div>

      {error && (
        <div
          role="alert"
          className="max-w-xl mx-auto mb-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-sans text-center"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch mb-16 md:mb-20">
        <PlanCard
          planId="basic"
          highlighted={false}
          name={t("sellerOnboarding.basicName")}
          badge={t("sellerOnboarding.basicBadge")}
          description={t("sellerOnboarding.basicDesc")}
          features={basicList}
          feeLabel={t("sellerOnboarding.registrationFee")}
          commissionLabel={t("sellerOnboarding.commission")}
          productLabel={t("sellerOnboarding.productLimit")}
          ctaLabel={t("sellerOnboarding.selectPlan")}
          selectingLabel={t("sellerOnboarding.selectingPlan")}
          loading={isPending && pendingId === "basic"}
          onSelect={handleSelect}
        />
        <PlanCard
          planId="premium"
          highlighted
          recommended
          name={t("sellerOnboarding.premiumName")}
          badge={t("sellerOnboarding.premiumBadge")}
          recommendedRibbon={t("sellerOnboarding.recommended")}
          description={t("sellerOnboarding.premiumDesc")}
          features={premiumList}
          feeLabel={t("sellerOnboarding.registrationFee")}
          commissionLabel={t("sellerOnboarding.commission")}
          productLabel={t("sellerOnboarding.productLimit")}
          ctaLabel={t("sellerOnboarding.selectPlan")}
          selectingLabel={t("sellerOnboarding.selectingPlan")}
          loading={isPending && pendingId === "premium"}
          onSelect={handleSelect}
        />
      </div>

      <div className="rounded-2xl border border-primary/10 bg-masa-light/50 overflow-hidden shadow-sm">
        <div className="px-4 py-4 md:px-6 border-b border-primary/10 bg-white/60">
          <h2 className="text-lg font-luxury text-primary">{t("sellerOnboarding.compareTitle")}</h2>
          <p className="text-xs text-masa-gray font-sans mt-1">{t("sellerOnboarding.changePlanHint")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[520px]">
            <thead>
              <tr className="bg-masa-light/80 text-left">
                <th className="p-3 md:p-4 font-medium text-masa-dark w-[28%]">{t("sellerOnboarding.compareFeature")}</th>
                <th className="p-3 md:p-4 font-medium text-primary">{t("sellerOnboarding.compareBasic")}</th>
                <th className="p-3 md:p-4 font-medium text-primary bg-primary/[0.06]">{t("sellerOnboarding.comparePremium")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              <ComparisonRow
                label={t("sellerOnboarding.productLimit")}
                basic={t("sellerOnboarding.productsCount")}
                premium={t("sellerOnboarding.unlimited")}
              />
              <ComparisonRow
                label={t("sellerOnboarding.registrationFee")}
                basic={t("sellerOnboarding.feeAmount")}
                premium={t("sellerOnboarding.feeAmount")}
              />
              <ComparisonRow
                label={t("sellerOnboarding.commission")}
                basic={COMMISSION_BASIC}
                premium={COMMISSION_PREMIUM}
              />
              <ComparisonRow
                label={t("sellerOnboarding.featuredPlacement")}
                basic="—"
                premium={isArabic ? "نعم" : "Yes"}
                premiumHighlight
              />
              <ComparisonRow
                label={t("sellerOnboarding.compareHomepage")}
                basic="—"
                premium={isArabic ? "نعم" : "Yes"}
                premiumHighlight
              />
              <ComparisonRow
                label={t("sellerOnboarding.searchPriority")}
                basic="—"
                premium={isArabic ? "نعم" : "Yes"}
                premiumHighlight
              />
              <ComparisonRow
                label={t("sellerOnboarding.supportLevel")}
                basic={t("sellerOnboarding.basicSupport")}
                premium={t("sellerOnboarding.premiumSupport")}
                premiumHighlight
              />
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center mt-10 text-sm text-masa-gray font-sans">
        {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {isArabic ? "تسجيل الدخول" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}

function ComparisonRow({
  label,
  basic,
  premium,
  premiumHighlight,
}: {
  label: string;
  basic: string;
  premium: string;
  premiumHighlight?: boolean;
}) {
  return (
    <tr>
      <td className="p-3 md:p-4 text-masa-gray align-top">{label}</td>
      <td className="p-3 md:p-4 text-masa-dark">{basic}</td>
      <td className={cn("p-3 md:p-4 text-masa-dark", premiumHighlight && "bg-primary/[0.04] font-medium")}>{premium}</td>
    </tr>
  );
}
