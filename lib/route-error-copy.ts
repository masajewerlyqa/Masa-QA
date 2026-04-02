import type { Language } from "@/lib/language";

/** Shared copy for `app/error.tsx` and `app/global-error.tsx`. */
export const ROUTE_ERROR_COPY: Record<
  Language,
  {
    title: string;
    description: string;
    tryAgain: string;
    home: string;
    sellerDashboard: string;
    adminDashboard: string;
  }
> = {
  en: {
    title: "Something went wrong",
    description:
      "This page could not be loaded. Try again, or go to your dashboard or home. If it keeps happening, contact support.",
    tryAgain: "Try again",
    home: "Home",
    sellerDashboard: "Seller dashboard",
    adminDashboard: "Admin dashboard",
  },
  ar: {
    title: "حدث خطأ غير متوقع",
    description:
      "تعذر تحميل هذه الصفحة. أعد المحاولة أو انتقل إلى لوحة التحكم أو الصفحة الرئيسية. إذا استمرت المشكلة، تواصل مع الدعم.",
    tryAgain: "أعد المحاولة",
    home: "الرئيسية",
    sellerDashboard: "لوحة البائع",
    adminDashboard: "لوحة الإدارة",
  },
};
