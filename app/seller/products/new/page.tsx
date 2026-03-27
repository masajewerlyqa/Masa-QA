import { redirect } from "next/navigation";
import { getSellerStore } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { ProductForm } from "@/components/seller/ProductForm";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { getPricingMarketSnapshot } from "@/lib/pricing";

export default async function AddProductPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  const marketSnapshot = await getPricingMarketSnapshot();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.products.addProductTitle")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.products.noStoreYet")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.products.addProductTitle")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.products.addProductSubtitle")}</p>
      </div>
      <ProductForm storeId={store.id} mode="create" marketSnapshot={marketSnapshot} />
    </div>
  );
}
