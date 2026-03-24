"use client";

import Link from "next/link";
import { Sparkles, Calculator, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

export function SmartFeaturesSection() {
  const { isArabic } = useLanguage();
  const features = [
    {
      id: "advisor",
      title: isArabic ? "المستشار الذكي للمجوهرات" : "AI Jewelry Advisor",
      description: isArabic
        ? "احصل على توصيات ذكية حسب الذوق والميزانية والمناسبة."
        : "Get intelligent recommendations based on style, budget and occasion.",
      icon: Sparkles,
      href: "/advisor",
      cta: isArabic ? "احصل على التوصيات" : "Get Recommendations",
    },
    {
      id: "zakat",
      title: isArabic ? "حاسبة زكاة الذهب" : "Gold Zakat Calculator",
      description: isArabic
        ? "احسب فوراً زكاة أصولك الذهبية."
        : "Instantly calculate zakat obligation on your gold assets.",
      icon: Calculator,
      href: "/tools/zakat",
      cta: isArabic ? "احسب الزكاة" : "Calculate Zakat",
    },
    {
      id: "sell",
      title: isArabic ? "مقدّر بيع الذهب" : "Sell Gold Estimator",
      description: isArabic
        ? "اعرف القيمة السوقية الفورية قبل البيع."
        : "Know the real-time market value before selling.",
      icon: Coins,
      href: "/tools/sell",
      cta: isArabic ? "قدّر القيمة" : "Estimate Value",
    },
  ];
  return (
    <section
      className="py-16 md:py-24 bg-white"
      aria-labelledby="smart-features-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <header className="text-center mb-12 md:mb-16">
          <h2
            id="smart-features-heading"
            className="font-luxury text-3xl md:text-4xl text-primary mb-4"
          >
            {isArabic ? "تجربة مجوهرات ذكية" : "Smart Jewelry Experience"}
          </h2>
          <p className="text-masa-gray max-w-2xl mx-auto font-sans">
            {isArabic
              ? "أدوات مدعومة بالذكاء الاصطناعي لاكتشاف مجوهراتك الفاخرة وتقييمها وإدارتها بثقة."
              : "AI-powered tools to discover, value and manage your luxury jewelry with confidence."}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.id}
                className="group relative bg-masa-light rounded-xl border border-primary/10 p-6 lg:p-8 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ease-out"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                  <Icon className="w-7 h-7 text-primary" aria-hidden />
                </div>
                <h3 className="font-luxury text-xl text-masa-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-masa-gray text-sm leading-relaxed mb-6 font-sans">
                  {feature.description}
                </p>
                <Link href={feature.href}>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white group-hover:border-primary transition-colors"
                  >
                    {feature.cta}
                    <ArrowRight className={`w-4 h-4 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`} aria-hidden />
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
