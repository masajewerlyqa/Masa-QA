import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminProducts, getStoresWithMostCancelledOrders } from "@/lib/admin";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { AdminStoresCancelledOrders } from "@/components/admin/AdminStoresCancelledOrders";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const products = await getAdminProducts(500);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.products.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.products.subtitle")}</p>
      </div>
      <AdminProductsTable products={products} />
    </div>
  );
}
