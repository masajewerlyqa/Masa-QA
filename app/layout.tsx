import type { Metadata } from "next";
import { Cinzel_Decorative, IBM_Plex_Sans_Arabic } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "@/components/ui/toaster";
import { languageDirection } from "@/lib/language";
import { getServerLanguage } from "@/lib/language-server";
import { brandName } from "@/lib/brand";
import { getBaseUrl, getLocalizedSeo } from "@/lib/seo";

const cinzelDecorative = Cinzel_Decorative({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const alilato = localFont({
  src: "./fonts/Alilato-Regular.woff2",
  variable: "--font-alilato",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  const localized = getLocalizedSeo(language, {
    title: "Masa Jewelry Marketplace - Buy & Sell Gold in Qatar",
    titleAr: "منصة ماسا للمجوهرات - بيع وشراء الذهب في قطر",
    description:
      "A premium digital marketplace connecting luxury jewelry brands, boutique stores, and discerning customers in Qatar.",
    descriptionAr:
      "منصة رقمية فاخرة تربط علامات المجوهرات الراقية والمتاجر المتخصصة والعملاء الباحثين عن التميز في قطر.",
  });

  return {
    metadataBase: new URL(getBaseUrl()),
    title: {
      default: localized.title,
      template: `%s | ${brandName(language)}`,
    },
    description: localized.description,
    alternates: {
      canonical: "/",
      languages: {
        en: "/",
        ar: "/",
        "x-default": "/",
      },
    },
    openGraph: {
      title: localized.title,
      description: localized.description,
      type: "website",
      locale: language === "ar" ? "ar_QA" : "en_QA",
      siteName: brandName(language),
    },
    icons: {
      icon: "/image/logo-browser.png",
      apple: "/image/logo-browser.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = getServerLanguage();
  const direction = languageDirection(language);
  return (
    <html
      lang={language}
      dir={direction}
      className={`${cinzelDecorative.variable} ${ibmPlexSansArabic.variable} ${alilato.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen bg-white text-masa-dark antialiased ${language === "ar" ? "font-arabic" : "font-sans"}`}
      >
        <LanguageProvider initialLanguage={language}>
          <CurrencyProvider>
            {children}
            <Toaster />
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
