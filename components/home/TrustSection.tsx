"use client";

import { Shield, Globe, Star, BadgeCheck, Store, Users } from "lucide-react";
import { useI18n } from "@/components/useI18n";

type TrustItem = { title: string; description: string; icon: typeof Shield };

export function TrustSection() {
  const { t, isArabic } = useI18n();

  const buyerItems: TrustItem[] = [
    {
      title: t("home.trust.buyer1Title"),
      description: t("home.trust.buyer1Desc"),
      icon: Shield,
    },
    {
      title: t("home.trust.buyer2Title"),
      description: t("home.trust.buyer2Desc"),
      icon: Globe,
    },
    {
      title: t("home.trust.buyer3Title"),
      description: t("home.trust.buyer3Desc"),
      icon: Star,
    },
  ];

  const sellerItems: TrustItem[] = [
    {
      title: t("home.trust.seller1Title"),
      description: t("home.trust.seller1Desc"),
      icon: BadgeCheck,
    },
    {
      title: t("home.trust.seller2Title"),
      description: t("home.trust.seller2Desc"),
      icon: Store,
    },
    {
      title: t("home.trust.seller3Title"),
      description: t("home.trust.seller3Desc"),
      icon: Users,
    },
  ];

  function column(items: TrustItem[], headingId: string, title: string, subtitle: string) {
    return (
      <div className="flex flex-col">
        <header className="text-center lg:text-start mb-8 lg:mb-10">
          <h2
            id={headingId}
            className={`text-2xl md:text-3xl text-primary mb-3 ${
              isArabic ? "font-arabic-luxury" : "font-luxury"
            }`}
          >
            {title}
          </h2>
          <p className={`text-masa-gray font-sans text-sm md:text-base max-w-md mx-auto lg:mx-0 ${isArabic ? "font-arabic" : ""}`}>
            {subtitle}
          </p>
        </header>
        <div className="space-y-8 lg:space-y-10">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex flex-col sm:flex-row sm:items-start gap-4 text-center sm:text-start ${
                  isArabic ? "sm:flex-row-reverse" : ""
                }`}
              >
                <div
                  className="w-14 h-14 shrink-0 bg-white rounded-full flex items-center justify-center mx-auto sm:mx-0 border border-primary/10 shadow-sm"
                  aria-hidden
                >
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`text-base md:text-lg text-primary mb-1.5 ${isArabic ? "font-arabic" : "font-luxury"}`}>
                    {item.title}
                  </h3>
                  <p className={`text-masa-gray text-sm font-sans leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section
      className="py-16 md:py-24 bg-masa-light border-y border-primary/10"
      aria-labelledby="trust-buyers-heading trust-sellers-heading"
    >
      <div className="max-w-content mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-0">
          <div className="lg:pe-10 xl:pe-16">
            {column(
              buyerItems,
              "trust-buyers-heading",
              t("home.trust.buyersTitle"),
              t("home.trust.buyersSubtitle")
            )}
          </div>
          <div className="lg:border-s lg:border-primary/10 lg:ps-10 xl:ps-16 pt-14 lg:pt-0 border-t lg:border-t-0 border-primary/10">
            {column(
              sellerItems,
              "trust-sellers-heading",
              t("home.trust.sellersTitle"),
              t("home.trust.sellersSubtitle")
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
