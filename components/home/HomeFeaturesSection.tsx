"use client";

import { Shield, Award, Sparkles, TrendingUp } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function HomeFeaturesSection() {
  const { isArabic } = useLanguage();
  const features = [
    {
      title: isArabic ? "أصالة معتمدة" : "Certified Authentic",
      description: isArabic ? "كل قطعة موثقة ومعتمدة" : "Every piece certified and authenticated",
      icon: Shield,
    },
    {
      title: isArabic ? "علامات فاخرة" : "Premium Brands",
      description: isArabic ? "مختارة من أفضل صاغة العالم" : "Curated from world's finest jewelers",
      icon: Award,
    },
    {
      title: isArabic ? "مستشار ذكي" : "AI Advisor",
      description: isArabic ? "توصيات شخصية دقيقة" : "Personalized recommendations",
      icon: Sparkles,
    },
    {
      title: isArabic ? "قيمة استثمارية" : "Investment Value",
      description: isArabic ? "تابع ونمِّ مجموعتك" : "Track and grow your collection",
      icon: TrendingUp,
    },
  ];
  return (
    <section
      className="py-12 md:py-16 bg-white border-y border-primary/10"
      aria-labelledby="home-features-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <h2 id="home-features-heading" className="sr-only">
          {isArabic ? "لماذا تختار MASA" : "Why choose MASA"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 font-sans">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 bg-masa-light rounded-full flex items-center justify-center mb-4"
                  aria-hidden
                >
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg mb-2 font-luxury text-primary">
                  {item.title}
                </h3>
                <p className="text-sm text-masa-gray">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
