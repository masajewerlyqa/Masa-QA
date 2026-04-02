"use client";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/useI18n";
import { SELLER_PLAN_LIMITS, type SellerPlanId } from "@/lib/seller-plans";

type Props = {
  onSelectPlan: (planId: SellerPlanId) => void;
  onBack: () => void;
};

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
  recommendedRibbon?: string;
}) {
  const limits = SELLER_PLAN_LIMITS[planId];

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition-shadow",
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
      <h3 className="text-xl font-luxury text-primary mb-2">{name}</h3>
      <p className="text-sm text-masa-gray font-sans leading-relaxed mb-4 min-h-[2.5rem]">{description}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-masa-dark font-sans">
            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="rounded-xl bg-masa-light/80 border border-primary/10 px-3 py-2.5 mb-4 space-y-1.5 font-sans text-xs sm:text-sm">
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

export function SellerRegistrationPlanStep({ onSelectPlan, onBack }: Props) {
  const { t, dict, isArabic } = useI18n();

  const basicList = dict.sellerOnboarding.basicFeatures;
  const premiumList = dict.sellerOnboarding.premiumFeatures;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Button type="button" variant="ghost" size="sm" className="text-masa-gray font-sans" onClick={onBack}>
        {`← ${t("auth.register.changeAccountType")}`}
      </Button>
      <div className="text-center max-w-xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-primary/80 font-sans mb-2">{t("sellerOnboarding.choosePlanEyebrow")}</p>
        <h1 className="text-2xl md:text-3xl font-luxury text-primary mb-2">{t("auth.register.sellerPickPlanTitle")}</h1>
        <p className="text-masa-gray font-sans text-sm leading-relaxed">{t("auth.register.sellerPickPlanSubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
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
          loading={false}
          onSelect={onSelectPlan}
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
          loading={false}
          onSelect={onSelectPlan}
        />
      </div>
      <p className="text-center text-xs text-masa-gray font-sans">{isArabic ? "بعدها ستُنشئ حسابك وتُكمِل طلب البائع." : "Next you will create your account and complete your seller application."}</p>
    </div>
  );
}
