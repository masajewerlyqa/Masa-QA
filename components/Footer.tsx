"use client";

import Link from "next/link";
import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { DiamondPattern } from "@/components/DiamondPattern";
import { FooterNewsletter } from "@/components/FooterNewsletter";
import { useI18n } from "@/components/useI18n";

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

/** Apple logo (brand mark; Simple Icons geometry), monochrome via `currentColor`. */
function AppleLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

/** Google Play 2022 icon (four-color mark). Geometry: Wikimedia Commons / Google product icon. */
function GooglePlayBrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28.99 31.99"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <path fill="#ea4335" d="M13.54 15.28.12 29.34a3.66 3.66 0 0 0 5.33 2.16l15.1-8.6Z" />
      <path fill="#fbbc04" d="m27.11 12.89-6.53-3.74-7.35 6.45 7.38 7.28 6.48-3.7a3.54 3.54 0 0 0 1.5-4.79 3.62 3.62 0 0 0-1.5-1.5z" />
      <path fill="#4285f4" d="M.12 2.66a3.57 3.57 0 0 0-.12.92v24.84a3.57 3.57 0 0 0 .12.92L14 15.64Z" />
      <path fill="#34a853" d="m13.64 16 6.94-6.85L5.5.51A3.73 3.73 0 0 0 3.63 0 3.64 3.64 0 0 0 .12 2.65Z" />
    </svg>
  );
}

/** Official Snapchat ghost silhouette (Simple Icons / brand shape), tinted via `currentColor`. */
function SnapchatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
    </svg>
  );
}

const SOCIAL_LINKS: {
  href: string;
  Icon: ComponentType<{ className?: string }>;
  labelEn: string;
  labelAr: string;
}[] = [
  {
    href: "https://x.com/masajewelry_ar",
    Icon: Twitter,
    labelEn: "MASA on X",
    labelAr: "MASA على إكس",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61577488271138&mibextid=wwXIfr&rdid=ImptgqBRG5IRn98W&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AvjkUhwt1%2F%3Fmibextid%3DwwXIfr#",
    Icon: Facebook,
    labelEn: "MASA on Facebook",
    labelAr: "MASA على فيسبوك",
  },
  {
    href: "https://www.tiktok.com/@masajewelry.ar",
    Icon: TikTokIcon,
    labelEn: "MASA on TikTok",
    labelAr: "MASA على تيك توك",
  },
  {
    href: "https://www.instagram.com/masajewelry.ar",
    Icon: Instagram,
    labelEn: "MASA on Instagram",
    labelAr: "MASA على إنستغرام",
  },
  {
    href: "https://www.snapchat.com/@masajewelry.ar?sender_web_id=d5f28286-3644-4164-bd1a-262ea8ab1d1d&device_type=desktop&is_copy_url=true",
    Icon: SnapchatIcon,
    labelEn: "MASA on Snapchat",
    labelAr: "MASA على سناب شات",
  },
];

const iosAppStoreUrl = process.env.NEXT_PUBLIC_IOS_APP_STORE_URL?.trim() ?? "";
const androidPlayStoreUrl = process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL?.trim() ?? "";

export function Footer() {
  const { t, isArabic } = useI18n();
  /** Query values match `products.category` / seller `CATEGORIES` (Ring, Necklace, Bracelet, Earrings, …). */
  const shopLinks = [
    { label: t("footer.shopLinks.allJewelry"), href: "/discover" },
    { label: t("footer.shopLinks.rings"), href: "/discover?category=Ring" },
    { label: t("footer.shopLinks.necklaces"), href: "/discover?category=Necklace" },
    { label: t("footer.shopLinks.earrings"), href: "/discover?category=Earrings" },
    { label: t("footer.shopLinks.bracelets"), href: "/discover?category=Bracelet" },
  ];
  const supportLinks = [
    { label: t("footer.supportLinks.about"), href: "/about" },
    { label: t("footer.supportLinks.sizeGuide"), href: "/size-guide" },
    { label: t("footer.supportLinks.delivery"), href: "/delivery" },
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
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map(({ href, Icon, labelEn, labelAr }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label={isArabic ? labelAr : labelEn}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className={`text-secondary/90 text-xs uppercase tracking-wider mt-5 mb-2 font-sans ${isArabic ? "font-arabic normal-case tracking-normal" : ""}`}>
              {t("footer.getTheApp")}
            </p>
            <div className="flex flex-wrap gap-3">
              {iosAppStoreUrl ? (
                <a
                  href={iosAppStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label={t("footer.downloadOnAppStore")}
                >
                  <AppleLogoIcon className="w-[1.15rem] h-[1.15rem]" />
                </a>
              ) : (
                <span
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-45 cursor-default"
                  aria-label={`${t("footer.downloadOnAppStore")} — ${t("footer.appLinkComingSoon")}`}
                  title={t("footer.appLinkComingSoon")}
                >
                  <AppleLogoIcon className="w-[1.15rem] h-[1.15rem]" />
                </span>
              )}
              {androidPlayStoreUrl ? (
                <a
                  href={androidPlayStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label={t("footer.getItOnGooglePlay")}
                >
                  <GooglePlayBrandIcon className="w-[1.35rem] h-[1.5rem]" />
                </a>
              ) : (
                <span
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-45 cursor-default"
                  aria-label={`${t("footer.getItOnGooglePlay")} — ${t("footer.appLinkComingSoon")}`}
                  title={t("footer.appLinkComingSoon")}
                >
                  <GooglePlayBrandIcon className="w-[1.35rem] h-[1.5rem]" />
                </span>
              )}
            </div>
            <div className="mt-6 font-sans">
              <h3 className="text-lg font-luxury mb-2">{t("footer.newsletter")}</h3>
              <p className="text-secondary text-sm mb-2">{t("footer.newsletterHint")}</p>
              <FooterNewsletter />
            </div>
          </div>

          <div className="font-sans">
            <h3 className="text-lg font-luxury mb-4">
              <Link href="/discover" className="hover:text-white transition-colors">
                {t("footer.shop")}
              </Link>
            </h3>
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
