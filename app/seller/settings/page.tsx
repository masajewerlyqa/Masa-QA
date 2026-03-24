import { redirect } from "next/navigation";
import { getSellerStore } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { SellerSettingsForm } from "./SellerSettingsForm";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function SellerSettingsPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.settings.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.settings.noStoreYet")}</p>
      </div>
    );
  }

  return <SellerSettingsForm store={store} />;
}
