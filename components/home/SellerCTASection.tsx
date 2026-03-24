"use client";

import Link from "next/link";
import { Store, BarChart3, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiamondPattern } from "@/components/DiamondPattern";
import { useLanguage } from "@/components/LanguageProvider";

export function SellerCTASection() {
  const { isArabic } = useLanguage();
  const benefits = [
    { icon: Store, text: isArabic ? "واجهة متجر رقمية" : "Digital storefront" },
    { icon: BarChart3, text: isArabic ? "رؤى طلب بالذكاء الاصطناعي" : "AI demand insights" },
    { icon: Truck, text: isArabic ? "لوجستيات آمنة" : "Secure logistics" },
    { icon: Users, text: isArabic ? "شبكة مشترين مميزة" : "Premium buyers network" },
  ];
  return (
    <section
      className="relative py-24 md:py-32 bg-primary text-white overflow-hidden"
      aria-labelledby="seller-cta-heading"
    >
      <DiamondPattern className="opacity-10" />
      <div className="relative max-w-content mx-auto px-4 md:px-6">
        <header className="text-center mb-12 md:mb-16">
          <h2
            id="seller-cta-heading"
            className="font-luxury text-3xl md:text-4xl lg:text-5xl mb-6"
          >
            {isArabic ? "نمِّ أعمالك في المجوهرات مع MASA" : "Grow Your Jewelry Business with MASA"}
          </h2>
          <p className="text-secondary max-w-2xl mx-auto font-sans text-lg">
            {isArabic
              ? "انضم إلى سوق فاخر مصمم للمحترفين في مجال المجوهرات. احصل على متجرك الرقمي، ورؤى الطلب الذكية، والخدمات اللوجستية الآمنة، والوصول إلى مشترين مميزين."
              : "Join a premium marketplace built for jewelry professionals. Get your digital storefront, AI-powered demand insights, secure logistics and access to discerning buyers."}
          </p>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 font-sans">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-secondary">
              <Icon className="w-6 h-6 text-masa-gold shrink-0" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="text-center">
          <Link href="/apply">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-secondary hover:text-primary px-8 md:px-10"
            >
              {isArabic ? "كن بائعاً" : "Become a Seller"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
