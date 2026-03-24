"use client";

import { Shield, Globe, Star } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function TrustSection() {
  const { isArabic } = useLanguage();
  const trustItems = [
    {
      title: isArabic ? "علامات فاخرة موثّقة" : "Verified luxury brands",
      description: isArabic
        ? "تسوّق من علامات ومتاجر مجوهرات معتمدة وموثقة."
        : "Shop from authenticated jewelry brands and boutiques with verified credentials.",
      icon: Shield,
    },
    {
      title: isArabic ? "معاملات عالمية آمنة" : "Secure global transactions",
      description: isArabic
        ? "مدفوعات محمية وشحن آمن لتسوّق مطمئن."
        : "Protected payments and safe delivery so you buy with peace of mind.",
      icon: Globe,
    },
    {
      title: isArabic ? "نظام مراجعات شفاف" : "Transparent reviews system",
      description: isArabic
        ? "مراجعات وتقييمات حقيقية تساعدك على الاختيار بثقة."
        : "Real customer reviews and ratings to help you choose with confidence.",
      icon: Star,
    },
  ];
  return (
    <section
      className="py-16 md:py-24 bg-masa-light border-y border-primary/10"
      aria-labelledby="trust-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <header className="text-center mb-12 md:mb-16">
          <h2
            id="trust-heading"
            className="font-luxury text-3xl md:text-4xl text-primary mb-4"
          >
            {isArabic ? "لماذا يثق المشترون في MASA" : "Why Buyers Trust MASA"}
          </h2>
          <p className="text-masa-gray max-w-2xl mx-auto font-sans">
            {isArabic
              ? "نمزج بين الفخامة والثقة والشفافية في كل خطوة."
              : "We combine luxury curation with trust and transparency at every step."}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-primary/10 shadow-sm"
                  aria-hidden
                >
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-luxury text-lg text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-masa-gray text-sm font-sans max-w-xs">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
