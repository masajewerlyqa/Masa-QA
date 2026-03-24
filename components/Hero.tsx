"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Lock, BadgeCheck, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";

const HERO_BG = "/image/bg-photo.jpeg";

interface HeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

const trustBadgesEn = [
  { label: "Secure payments", icon: Lock },
  { label: "Verified sellers", icon: BadgeCheck },
  { label: "Authentic products", icon: Gem },
];

export function Hero({
  badge,
  title,
  subtitle,
  description,
  primaryCta = { label: "Explore Marketplace", href: "/discover" },
  secondaryCta = { label: "AI Jewelry Advisor", href: "/advisor" },
}: HeroProps) {
  const { isArabic } = useLanguage();
  const trustBadges = isArabic
    ? [
        { label: "مدفوعات آمنة", icon: Lock },
        { label: "بائعون موثّقون", icon: BadgeCheck },
        { label: "منتجات أصلية", icon: Gem },
      ]
    : trustBadgesEn;
  return (
    <section
      className="relative min-h-[500px] md:min-h-[600px] lg:h-[700px] bg-masa-light overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0" aria-hidden>
        <Image
          src={HERO_BG}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-masa-light/95 via-masa-light/80 to-masa-light/25 md:to-transparent pointer-events-none"
        aria-hidden
      />

      <div className="relative max-w-content mx-auto px-4 md:px-6 flex flex-col justify-center min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
        <div className="w-full max-w-2xl z-10 py-12 lg:py-16 lg:pr-8">
          {badge && (
            <span className="inline-block mb-4 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded font-sans">
              {badge}
            </span>
          )}
          <h1
            id="hero-heading"
            className="text-3xl md:text-5xl lg:text-6xl mb-3 lg:mb-6 text-primary leading-tight font-luxury"
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`text-lg md:text-xl text-masa-dark mb-2 ${isArabic ? "font-arabic" : "font-sans"}`}>{subtitle}</p>
          )}
          <p className="text-sm md:text-lg text-masa-gray mb-5 lg:mb-8 leading-relaxed max-w-lg font-sans">
            {description}
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4 mb-6 md:mb-8">
            <Link href={primaryCta.href}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-6 md:px-8"
              >
                {primaryCta.label}
                <ArrowRight className={`w-5 h-5 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`} aria-hidden />
              </Button>
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-masa-light"
                >
                  <Sparkles className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} aria-hidden />
                  {secondaryCta.label}
                </Button>
              </Link>
            )}
          </div>
          {/* Trust micro-badges */}
          <ul className="flex flex-wrap gap-6 font-sans text-sm text-masa-gray" role="list">
            {trustBadges.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
