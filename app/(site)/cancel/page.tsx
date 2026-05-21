import type { Metadata } from "next";
import { PaymentCancelView } from "@/components/payment/PaymentCancelView";
import { brandName } from "@/lib/brand";
import { t } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/language-server";

export function generateMetadata(): Metadata {
  const language = getServerLanguage();
  return {
    title: `${t(language, "payment.cancelTitle")} | ${brandName(language)}`,
    robots: { index: false, follow: false },
  };
}

export default function PaymentCancelPage() {
  return <PaymentCancelView />;
}
