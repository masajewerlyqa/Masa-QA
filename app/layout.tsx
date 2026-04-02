import type { Metadata } from "next";
import { Cinzel, Inter, IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "@/components/ui/toaster";
import { languageDirection } from "@/lib/language";
import { getServerLanguage } from "@/lib/language-server";
import { getBaseUrl, getLocalizedSeo } from "@/lib/seo";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-noto-naskh-arabic",
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
      template: `%s | ${language === "ar" ? "ماسا" : "MASA"}`,
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
      siteName: "MASA",
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
      className={`${cinzel.variable} ${inter.variable} ${ibmPlexSansArabic.variable} ${notoNaskhArabic.variable}`}
      suppressHydrationWarning
    >
      <body className={`min-h-screen bg-white text-masa-dark antialiased ${language === "ar" ? "font-arabic" : "font-sans"}`}>
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
