import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentFailedView } from "@/components/payment/PaymentFailedView";
import { brandName } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/language-server";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  return {
    title: `${t(language, "payment.failedTitle")} | ${brandName(language)}`,
    robots: { index: false, follow: false },
  };
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedView />
    </Suspense>
  );
}
