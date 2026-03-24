"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { DiamondPattern } from "@/components/DiamondPattern";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { useI18n } from "@/components/useI18n";

export function Footer() {
  const { t, isArabic } = useI18n();
  const shopLinks = [
    { label: t("footer.shopLinks.allJewelry"), href: "/discover" },
    { label: t("footer.shopLinks.rings"), href: "/discover?category=rings" },
    { label: t("footer.shopLinks.necklaces"), href: "/discover?category=necklaces" },
    { label: t("footer.shopLinks.earrings"), href: "/discover?category=earrings" },
    { label: t("footer.shopLinks.bracelets"), href: "/discover?category=bracelets" },
  ];
  const supportLinks = [
    { label: t("footer.supportLinks.sizeGuide"), href: "/size-guide" },
    { label: t("footer.supportLinks.delivery"), href: "/shipping" },
    { label: t("footer.supportLinks.returns"), href: "/returns" },
    { label: t("footer.supportLinks.faq"), href: "/contact#faq" },
    { label: t("footer.supportLinks.becomeSeller"), href: "/apply" },
    { label: t("footer.supportLinks.contactUs"), href: "/contact" },
  ];
  return (
    <footer className="relative bg-primary text-white mt-16 md:mt-24 pb-20 md:pb-0">
      <DiamondPattern className="opacity-10" />

      <div className="relative max-w-content mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link href="/" aria-label={isArabic ? "MASA الصفحة الرئيسية" : "MASA Home"}>
                <Image
                  src="/image/logo-footer.png"
                  alt={isArabic ? "شعار MASA" : "MASA logo"}
                  width={200}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-secondary leading-relaxed mb-6 font-sans text-sm max-w-md">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label={isArabic ? "إنستغرام" : "Instagram"}>
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label={isArabic ? "فيسبوك" : "Facebook"}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label={isArabic ? "إكس" : "Twitter"}>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors" aria-label={isArabic ? "يوتيوب" : "YouTube"}>
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-6 font-sans">
              <h3 className="text-lg font-luxury mb-2">{t("footer.newsletter")}</h3>
              <p className="text-secondary text-sm mb-2">{t("footer.newsletterHint")}</p>
              <FooterNewsletter />
            </div>
          </div>

          <div className="font-sans">
            <h3 className="text-lg font-luxury mb-4">{t("footer.shop")}</h3>
            <ul className="space-y-3 text-secondary text-sm">
              {shopLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="font-sans">
            <h3 className="text-lg font-luxury mb-4">{t("footer.support")}</h3>
            <ul className="space-y-3 text-secondary text-sm">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-secondary font-sans">
          <p>© {new Date().getFullYear()} MASA. {t("footer.allRightsReserved")}</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacyPolicy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              {t("footer.cookiePolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
