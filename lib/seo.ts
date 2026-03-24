import type { Language } from "@/lib/language";

type LocalizedSeoInput = {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
};

export function getLocalizedSeo(language: Language, input: LocalizedSeoInput) {
  return {
    title: language === "ar" ? input.titleAr : input.title,
    description: language === "ar" ? input.descriptionAr : input.description,
  };
}

export function getBaseUrl() {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) return site;
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

