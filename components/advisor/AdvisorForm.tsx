"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import { useCurrency } from "@/components/CurrencyProvider";
import { formatPrice, type Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  OCCASIONS,
  BUDGET_RANGES,
  METALS,
  JEWELRY_CATEGORY_OPTIONS,
  STYLES,
  RECIPIENTS,
  type AdvisorPreferences,
  type JewelryCategoryValue,
} from "@/lib/advisor-types";

type LocalizeContext = "occasion" | "metal" | "style" | "recipient";

function budgetRangeLabel(
  range: (typeof BUDGET_RANGES)[number],
  currency: Currency,
  language: "en" | "ar"
): string {
  const isAr = language === "ar";
  if (range.value === "any") {
    return isAr ? "غير محدد" : "No preference";
  }

  if (currency === "USD") {
    if (!isAr) return range.label;
    const arUsd: Record<string, string> = {
      under500: "أقل من 500 دولار",
      "500to1000": "500 - 1,000 دولار",
      "1000to2500": "1,000 - 2,500 دولار",
      "2500to5000": "2,500 - 5,000 دولار",
      "5000to10000": "5,000 - 10,000 دولار",
      over10000: "أكثر من 10,000 دولار",
    };
    return arUsd[range.value] ?? range.label;
  }

  const fp = (usd: number) => formatPrice(usd, "QAR", { language: isAr ? "ar" : "en" });
  const v = range.value;
  if (v === "under500") {
    return isAr ? `أقل من ${fp(500)}` : `Under ${fp(500)}`;
  }
  if (v === "over10000") {
    return isAr ? `أكثر من ${fp(10000)}` : `Over ${fp(10000)}`;
  }
  const pair: Record<string, [number, number]> = {
    "500to1000": [500, 1000],
    "1000to2500": [1000, 2500],
    "2500to5000": [2500, 5000],
    "5000to10000": [5000, 10000],
  };
  const [a, b] = pair[v] ?? [0, 0];
  return `${fp(a)} – ${fp(b)}`;
}

type AdvisorFormProps = {
  onSubmit: (preferences: AdvisorPreferences) => Promise<void>;
  isLoading: boolean;
};

export function AdvisorForm({ onSubmit, isLoading }: AdvisorFormProps) {
  const { isArabic, language } = useLanguage();
  const { currency } = useCurrency();
  const [preferences, setPreferences] = useState<AdvisorPreferences>({
    occasion: "any",
    budget: "any",
    metal: "any",
    categories: [],
    style: "any",
    recipient: "any",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(preferences);
  };

  const updatePreference = <K extends keyof AdvisorPreferences>(
    key: K,
    value: AdvisorPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const labelMap = {
    occasion: isArabic ? "ما المناسبة؟" : "What's the occasion?",
    budget: isArabic ? "ما ميزانيتك؟" : "What's your budget?",
    metal: isArabic ? "ما نوع المجوهرات؟" : "What type of jewelry?",
    category: isArabic ? "ما نوع القطعة؟" : "What type of piece?",
    categoryHint: isArabic
      ? "يمكنك اختيار أكثر من نوع، أو ترك الكل بدون تحديد."
      : "Select one or more piece types, or leave all unchecked for no preference.",
    style: isArabic ? "ما نمطك المفضل؟" : "What's your preferred style?",
    recipient: isArabic ? "لمن القطعة؟" : "Who is it for?",
  };

  const placeholderMap = {
    occasion: isArabic ? "اختر المناسبة" : "Select occasion",
    budget: isArabic ? "اختر نطاق الميزانية" : "Select budget range",
    metal: isArabic ? "اختر المعدن" : "Select metal",
    style: isArabic ? "اختر النمط" : "Select style",
    recipient: isArabic ? "اختر المستلم" : "Select recipient",
  };

  function localizeOption(value: string, label: string, context: LocalizeContext): string {
    if (isArabic) {
      if (value === "any") {
        if (context === "metal") return "أي خيار";
        if (context === "style") return "أي نمط";
        return "غير محدد";
      }
      const optionMap: Record<string, string> = {
        gift: "هدية",
        wedding: "زفاف",
        engagement: "خطوبة",
        anniversary: "ذكرى سنوية",
        birthday: "هدية عيد ميلاد",
        daily: "يومي",
        investment: "استثمار",
        celebration: "احتفال",
        self: "لنفسك",
      gold: "ذهب",
      white_gold: "ذهب أبيض",
      rose_gold: "ذهب وردي",
      platinum: "بلاتين",
      silver: "فضة",
      diamond: "ألماس",
      rings: "خواتم",
      ring: "خاتم",
      necklace: "قلادة",
      necklaces: "قلائد",
      earrings: "أقراط",
      earring: "قرط",
      bracelets: "أساور",
      bracelet: "سوار",
      pendant: "تعليقة",
      anklet: "خلخال",
      classic: "كلاسيكي",
      modern: "عصري",
      minimal: "ناعم",
      luxury: "فاخر",
      bold: "جريء",
      women: "نساء",
      men: "رجال",
      woman: "امرأة",
      man: "رجل",
      partner: "الشريك/الشريكة",
      mother: "الأم",
      family: "العائلة",
    };
      const key = value.toLowerCase().replace(/\s+/g, "_");
      return optionMap[key] ?? optionMap[value] ?? label;
    }
    return label;
  }

  function localizeJewelryTypeLabel(value: string, label: string): string {
    if (!isArabic) return label;
    const optionMap: Record<string, string> = {
      ring: "خاتم",
      necklace: "قلادة",
      bracelet: "سوار",
      earrings: "أقراط",
      pendant: "تعليقة",
      anklet: "خلخال",
    };
    const key = value.toLowerCase();
    return optionMap[key] ?? label;
  }

  function toggleCategory(cat: JewelryCategoryValue, checked: boolean) {
    setPreferences((prev) => {
      const next = new Set(prev.categories);
      if (checked) next.add(cat);
      else next.delete(cat);
      return { ...prev, categories: Array.from(next) as JewelryCategoryValue[] };
    });
  }

  return (
    <Card className="border-primary/10">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="font-luxury text-2xl">{isArabic ? "أخبرنا بتفضيلاتك" : "Tell Us Your Preferences"}</CardTitle>
        <CardDescription className="text-masa-gray">
          {isArabic ? "أجب عن بعض الأسئلة وسنقترح لك المجوهرات الأنسب" : "Answer a few questions and we&apos;ll find the perfect jewelry for you"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Occasion */}
            <div className="space-y-2">
              <Label htmlFor="occasion">{labelMap.occasion}</Label>
              <Select
                value={preferences.occasion}
                onValueChange={(value) => updatePreference("occasion", value as typeof preferences.occasion)}
              >
                <SelectTrigger id="occasion" className="bg-masa-light">
                  <SelectValue placeholder={placeholderMap.occasion} />
                </SelectTrigger>
                <SelectContent>
                  {OCCASIONS.map((occ) => (
                    <SelectItem key={occ.value} value={occ.value}>
                      {localizeOption(occ.value, occ.label, "occasion")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">{labelMap.budget}</Label>
              <Select
                value={preferences.budget}
                onValueChange={(value) => updatePreference("budget", value as typeof preferences.budget)}
              >
                <SelectTrigger id="budget" className="bg-masa-light">
                  <SelectValue placeholder={placeholderMap.budget} />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {budgetRangeLabel(range, currency, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metal — full row width so long labels (e.g. Any / No Preference) fit */}
            <div className="space-y-2 w-full md:col-span-2">
              <Label htmlFor="metal">{labelMap.metal}</Label>
              <Select
                value={preferences.metal}
                onValueChange={(value) => updatePreference("metal", value as typeof preferences.metal)}
              >
                <SelectTrigger
                  id="metal"
                  className="bg-masa-light w-full max-w-none [&>span]:line-clamp-none [&>span]:break-words"
                >
                  <SelectValue placeholder={placeholderMap.metal} />
                </SelectTrigger>
                <SelectContent>
                  {METALS.map((metal) => (
                    <SelectItem key={metal.value} value={metal.value}>
                      {localizeOption(metal.value, metal.label, "metal")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jewelry types — multi-select */}
            <div className="space-y-3 md:col-span-2">
              <div>
                <Label id="jewelry-types-label">{labelMap.category}</Label>
                <p className="text-xs text-masa-gray mt-1 font-sans">{labelMap.categoryHint}</p>
              </div>
              <div
                className="w-full rounded-xl border border-primary/10 bg-masa-light/50 p-5 sm:p-6 md:px-10 md:py-7 lg:px-14 lg:py-8"
                role="group"
                aria-labelledby="jewelry-types-label"
              >
                <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-5 sm:gap-x-8 lg:gap-x-10 lg:gap-y-4 min-w-0">
                {JEWELRY_CATEGORY_OPTIONS.map((cat) => (
                  <label
                    key={cat.value}
                    htmlFor={`jewelry-${cat.value}`}
                    className={cn(
                      "flex w-full min-w-0 items-center gap-2.5 cursor-pointer text-sm font-sans",
                      isArabic ? "font-arabic flex-row-reverse text-right" : ""
                    )}
                  >
                    <Checkbox
                      id={`jewelry-${cat.value}`}
                      checked={preferences.categories.includes(cat.value)}
                      onCheckedChange={(c) => toggleCategory(cat.value, c === true)}
                      aria-label={localizeJewelryTypeLabel(cat.value, cat.label)}
                    />
                    <span className="text-masa-dark leading-snug">{localizeJewelryTypeLabel(cat.value, cat.label)}</span>
                  </label>
                ))}
                </div>
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label htmlFor="style">{labelMap.style}</Label>
              <Select
                value={preferences.style}
                onValueChange={(value) => updatePreference("style", value as typeof preferences.style)}
              >
                <SelectTrigger id="style" className="bg-masa-light">
                  <SelectValue placeholder={placeholderMap.style} />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <span>{localizeOption(style.value, style.label, "style")}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">{labelMap.recipient}</Label>
              <Select
                value={preferences.recipient}
                onValueChange={(value) => updatePreference("recipient", value as typeof preferences.recipient)}
              >
                <SelectTrigger id="recipient" className="bg-masa-light">
                  <SelectValue placeholder={placeholderMap.recipient} />
                </SelectTrigger>
                <SelectContent>
                  {RECIPIENTS.map((rec) => (
                    <SelectItem key={rec.value} value={rec.value}>
                      {localizeOption(rec.value, rec.label, "recipient")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className={`w-5 h-5 animate-spin ${isArabic ? "ml-2" : "mr-2"}`} />
                {isArabic ? "جارٍ العثور على أفضل التطابقات..." : "Finding Perfect Matches..."}
              </>
            ) : (
              <>
                <Sparkles className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} />
                {isArabic ? "احصل على التوصيات" : "Get Recommendations"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
