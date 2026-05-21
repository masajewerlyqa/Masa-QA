import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentSuccessView } from "@/components/payment/PaymentSuccessView";
import { brandName } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/language-server";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  return {
    title: `${t(language, "payment.successTitle")} | ${brandName(language)}`,
    robots: { index: false, follow: false },
  };
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessView />
    </Suspense>
  );
}
