"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageProvider";
import {
  OCCASIONS,
  BUDGET_RANGES,
  METALS,
  CATEGORIES,
  STYLES,
  RECIPIENTS,
  type AdvisorPreferences,
} from "@/lib/advisor-types";

type AdvisorFormProps = {
  onSubmit: (preferences: AdvisorPreferences) => Promise<void>;
  isLoading: boolean;
};

export function AdvisorForm({ onSubmit, isLoading }: AdvisorFormProps) {
  const { isArabic } = useLanguage();
  const [preferences, setPreferences] = useState<AdvisorPreferences>({
    occasion: "gift",
    budget: "1000to2500",
    metal: "any",
    category: "any",
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
    metal: isArabic ? "المعدن المفضل؟" : "Preferred metal?",
    category: isArabic ? "ما نوع المجوهرات؟" : "What type of jewelry?",
    style: isArabic ? "نمطك المفضل؟" : "Style preference?",
    recipient: isArabic ? "لمن القطعة؟" : "Who is it for?",
  };

  const placeholderMap = {
    occasion: isArabic ? "اختر المناسبة" : "Select occasion",
    budget: isArabic ? "اختر نطاق الميزانية" : "Select budget range",
    metal: isArabic ? "اختر المعدن" : "Select metal",
    category: isArabic ? "اختر الفئة" : "Select category",
    style: isArabic ? "اختر النمط" : "Select style",
    recipient: isArabic ? "اختر المستلم" : "Select recipient",
  };

  function localizeOption(value: string, label: string): string {
    if (!isArabic) return label;
    const map: Record<string, string> = {
      gift: "هدية",
      wedding: "زفاف",
      engagement: "خطوبة",
      anniversary: "ذكرى سنوية",
      birthday: "هدية عيد ميلاد",
      daily: "يومي",
      investment: "استثمار",
      celebration: "احتفال",
      self: "لنفسك",
      any: "أي خيار",
      gold: "ذهب",
      white_gold: "ذهب أبيض",
      rose_gold: "ذهب وردي",
      platinum: "بلاتين",
      silver: "فضة",
      diamond: "ألماس",
      rings: "خواتم",
      ring: "خاتم",
      necklaces: "قلائد",
      necklace: "قلادة",
      earrings: "أقراط",
      earring: "قرط",
      bracelets: "أساور",
      bracelet: "سوار",
      pendant: "قلادة",
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
      under500: "أقل من 500 دولار",
      "500to1000": "500 - 1,000 دولار",
      "1000to2500": "1,000 - 2,500 دولار",
      "2500to5000": "2,500 - 5,000 دولار",
      "5000to10000": "5,000 - 10,000 دولار",
      over10000: "أكثر من 10,000 دولار",
    };
    return map[value] ?? label;
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
                      {localizeOption(occ.value, occ.label)}
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
                      {localizeOption(range.value, range.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metal */}
            <div className="space-y-2">
              <Label htmlFor="metal">{labelMap.metal}</Label>
              <Select
                value={preferences.metal}
                onValueChange={(value) => updatePreference("metal", value as typeof preferences.metal)}
              >
                <SelectTrigger id="metal" className="bg-masa-light">
                  <SelectValue placeholder={placeholderMap.metal} />
                </SelectTrigger>
                <SelectContent>
                  {METALS.map((metal) => (
                    <SelectItem key={metal.value} value={metal.value}>
                      {localizeOption(metal.value, metal.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">{labelMap.category}</Label>
              <Select
                value={preferences.category}
                onValueChange={(value) => updatePreference("category", value as typeof preferences.category)}
              >
                <SelectTrigger id="category" className="bg-masa-light">
                  <SelectValue placeholder={placeholderMap.category} />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {localizeOption(cat.value, cat.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      <span>{localizeOption(style.value, style.label)}</span>
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
                      {localizeOption(rec.value, rec.label)}
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
