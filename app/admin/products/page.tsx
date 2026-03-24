import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminProducts, type AdminProductRow } from "@/lib/admin";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const products = await getAdminProducts(500);

  const columns: Column<AdminProductRow>[] = [
    {
      key: "name",
      header: t(language, "admin.products.product"),
      render: (row) => (
        <Link href={`/product/${row.id}`} className="font-medium text-primary hover:underline">
          {row.name}
        </Link>
      ),
    },
    { key: "store_name", header: t(language, "admin.products.brandStore") },
    {
      key: "price",
      header: t(language, "admin.products.price"),
      render: (row) => <FormattedPrice usd={Number(row.price)} />,
    },
    {
      key: "category",
      header: t(language, "admin.products.category"),
      render: (row) => row.category ?? "—",
    },
    {
      key: "status",
      header: t(language, "admin.products.status"),
      render: (row) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>{t(language, `order.statuses.${row.status}`, row.status)}</Badge>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.products.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.products.subtitle")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "admin.products.allProducts").replace("{count}", String(products.length))}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={products} keyExtractor={(row) => row.id} />
        </CardContent>
      </Card>
    </div>
  );
}
