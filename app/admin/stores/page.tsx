import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminStores } from "@/lib/admin";
import { StoreActions } from "./StoreActions";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function AdminStoresPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (profile?.role !== "admin") redirect("/login");

  const stores = await getAdminStores();
  const pending = stores.filter((s) => s.status === "pending");
  const approved = stores.filter((s) => s.status === "approved" || s.status === "active");
  const rejected = stores.filter((s) => s.status === "rejected");

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.stores.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.stores.subtitle")}</p>
      </div>

      {pending.length > 0 && (
        <Card className="border-primary/10 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t(language, "admin.stores.pending")} ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.store")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.location")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.products")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.created")}</th>
                    <th className="text-right py-3">{t(language, "admin.stores.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((store) => (
                    <tr key={store.id} className="border-b border-primary/10 last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/brand/${store.slug}`} className="text-primary hover:underline font-medium">
                          {store.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-masa-gray">{store.location ?? "—"}</td>
                      <td className="py-3 pr-4">{store.product_count}</td>
                      <td className="py-3 pr-4 text-masa-gray">{formatDate(store.created_at)}</td>
                      <td className="py-3 text-right">
                        <StoreActions store={store} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t(language, "admin.stores.approved")} ({approved.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left py-3 pr-4">{t(language, "admin.stores.store")}</th>
                  <th className="text-left py-3 pr-4">{t(language, "admin.stores.location")}</th>
                  <th className="text-left py-3 pr-4">{t(language, "admin.stores.products")}</th>
                  <th className="text-left py-3 pr-4">{t(language, "admin.stores.created")}</th>
                  <th className="text-right py-3">{t(language, "admin.stores.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {approved.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-masa-gray">
                      {t(language, "admin.stores.noApprovedStores")}
                    </td>
                  </tr>
                ) : (
                  approved.map((store) => (
                    <tr key={store.id} className="border-b border-primary/10 last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/brand/${store.slug}`} className="text-primary hover:underline font-medium">
                          {store.name}
                        </Link>
                        <Badge variant="default" className="ml-2 text-xs">{t(language, "admin.stores.approved")}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-masa-gray">{store.location ?? "—"}</td>
                      <td className="py-3 pr-4">{store.product_count}</td>
                      <td className="py-3 pr-4 text-masa-gray">{formatDate(store.created_at)}</td>
                      <td className="py-3 text-right">
                        <StoreActions store={store} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {rejected.length > 0 && (
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary">{t(language, "admin.stores.rejected")} ({rejected.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.store")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.location")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.products")}</th>
                    <th className="text-left py-3 pr-4">{t(language, "admin.stores.created")}</th>
                    <th className="text-right py-3">{t(language, "admin.stores.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rejected.map((store) => (
                    <tr key={store.id} className="border-b border-primary/10 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-masa-dark">{store.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">{t(language, "admin.stores.rejected")}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-masa-gray">{store.location ?? "—"}</td>
                      <td className="py-3 pr-4">{store.product_count}</td>
                      <td className="py-3 pr-4 text-masa-gray">{formatDate(store.created_at)}</td>
                      <td className="py-3 text-right">
                        <StoreActions store={store} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
