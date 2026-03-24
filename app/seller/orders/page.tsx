import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { getSellerStore, getSellerOrders } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import type { SellerOrderRow } from "@/lib/seller-types";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function SellerOrdersPage() {
  const language = getServerLanguage();
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") {
    redirect("/login");
  }

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.orders.noStoreYet")}</p>
      </div>
    );
  }

  const orders = await getSellerOrders(store.id);

  const columns: Column<SellerOrderRow>[] = [
    {
      key: "id",
      header: t(language, "seller.orders.orderId"),
      render: (row) => (
        <Link href={`/seller/orders/${row.id}`} className="font-mono text-sm text-primary hover:underline">
          {row.id.slice(0, 8)}…
        </Link>
      ),
    },
    { key: "customer_name", header: t(language, "seller.orders.customer"), render: (row) => row.customer_name ?? "—" },
    { key: "item_summary", header: t(language, "seller.orders.items"), render: (row) => <span className="max-w-[200px] truncate block">{row.item_summary}</span> },
    { key: "total", header: t(language, "seller.orders.amount"), render: (row) => <FormattedPrice usd={row.total} /> },
    {
      key: "store_earnings",
      header: t(language, "seller.orders.yourEarnings"),
      render: (row) => (row.store_earnings != null ? <FormattedPrice usd={row.store_earnings} /> : "—"),
    },
    {
      key: "status",
      header: t(language, "seller.orders.status"),
      render: (row) => (
        <Badge
          variant={
            row.status === "delivered"
              ? "default"
              : row.status === "shipped"
                ? "secondary"
                : "outline"
          }
        >
          {t(language, `order.statuses.${row.status}`, row.status)}
        </Badge>
      ),
    },
    { key: "created_at", header: t(language, "seller.orders.date"), render: (row) => formatDate(row.created_at) },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.orders.manageOrders")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "seller.orders.allOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={orders} keyExtractor={(row) => row.id} />
        </CardContent>
      </Card>
    </div>
  );
}
