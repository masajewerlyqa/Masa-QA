import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getSellerStore } from "@/lib/seller";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { StoreAvailabilityForm } from "@/components/seller/StoreAvailabilityForm";
import { getStoreLiveStatus } from "@/lib/store-availability";
import type { StoreHoursRow } from "@/lib/store-availability";

export default async function SellerAvailabilityPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-luxury text-primary">{t(language, "seller.availability.title")}</h1>
        <p className="text-masa-gray font-sans mt-2">{t(language, "seller.overview.noStoreYet")}</p>
      </div>
    );
  }

  const row: StoreHoursRow = {
    business_timezone: store.business_timezone,
    working_days: store.working_days,
    opening_time_local: store.opening_time_local,
    closing_time_local: store.closing_time_local,
  };
  const live = getStoreLiveStatus(row);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <ButtonLinkBack isArabic={isArabic} label={t(language, "seller.availability.backToDashboard")} />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-luxury text-primary">{t(language, "seller.availability.title")}</h1>
        <p className="text-masa-gray font-sans mt-2">{t(language, "seller.availability.subtitle")}</p>
      </div>

      <StoreAvailabilityForm
        initial={{
          working_days: store.working_days ?? [],
          opening_time: formatTimeForInput(store.opening_time_local),
          closing_time: formatTimeForInput(store.closing_time_local),
          business_timezone: store.business_timezone || "Asia/Qatar",
        }}
        liveStatus={live}
      />
    </div>
  );
}

function formatTimeForInput(v: string | null): string {
  if (!v) return "";
  const s = v.trim();
  if (s.length >= 5) return s.slice(0, 5);
  return s;
}

function ButtonLinkBack({ isArabic, label }: { isArabic: boolean; label: string }) {
  return (
    <Link
      href="/seller"
      className={`inline-flex items-center gap-2 text-sm text-masa-gray hover:text-primary font-sans mb-6 ${isArabic ? "flex-row-reverse" : ""}`}
    >
      <ArrowLeft className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} aria-hidden />
      {label}
    </Link>
  );
}
