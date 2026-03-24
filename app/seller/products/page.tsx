import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSellerStore, getSellerProducts } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { SellerProductsTable } from "@/components/seller/SellerProductsTable";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function SellerProductsPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.products.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.products.noStoreYet")}</p>
      </div>
    );
  }

  const products = await getSellerProducts(store.id);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.products.title")}</h1>
          <p className="text-masa-gray font-sans">{t(language, "seller.products.manageListings")}</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shrink-0" asChild>
          <Link href="/seller/products/new">
            <Plus className="w-4 h-4 mr-2" />
            {t(language, "seller.products.addProduct")}
          </Link>
        </Button>
      </div>
      <SellerProductsTable products={products} />
    </div>
  );
}
