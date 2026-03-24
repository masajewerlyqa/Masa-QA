import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSellerStore, getSellerProductById } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { ProductForm } from "@/components/seller/ProductForm";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const language = getServerLanguage();
  const { id } = await params;
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.products.editProductTitle")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.products.noStoreYet")}</p>
      </div>
    );
  }

  const product = await getSellerProductById(id, store.id);
  if (!product) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.products.editProductTitle")}</h1>
        <p className="text-masa-gray font-sans">
          {t(language, "seller.products.editProductSubtitle").replace("{name}", product.name)}
        </p>
      </div>
      <ProductForm storeId={store.id} mode="edit" product={product} />
    </div>
  );
}
