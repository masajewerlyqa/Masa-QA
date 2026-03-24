import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminOrders, type AdminOrderRow } from "@/lib/admin";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function AdminOrdersPage() {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const orders = await getAdminOrders(200);
  const columns: Column<AdminOrderRow>[] = [
    {
      key: "id",
      header: t(language, "admin.orders.orderId"),
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="font-mono text-sm text-primary hover:underline">
          {String(row.id).slice(0, 8)}…
        </Link>
      ),
    },
    {
      key: "customer_name",
      header: t(language, "admin.orders.customer"),
      render: (row) => row.customer_name ?? row.customer_email ?? "—",
    },
    {
      key: "total",
      header: t(language, "admin.orders.amount"),
      render: (row) => <FormattedPrice usd={Number(row.total)} />,
    },
    {
      key: "status",
      header: t(language, "admin.orders.status"),
      render: (row) => <Badge variant="secondary">{t(language, `order.statuses.${row.status}`, row.status)}</Badge>,
    },
    {
      key: "created_at",
      header: t(language, "admin.orders.date"),
      render: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "admin.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "admin.orders.subtitle")}</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle>{t(language, "admin.orders.recentOrders").replace("{count}", String(orders.length))}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={orders} keyExtractor={(row) => row.id} />
        </CardContent>
      </Card>
    </div>
  );
}
