import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getAdminOrderById } from "@/lib/admin";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { DeliveryAddressCard } from "@/components/order/DeliveryAddressCard";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const language = getServerLanguage();
  const { profile } = await getCurrentUserWithProfile();
  if (!profile || profile.role !== "admin") redirect("/login");

  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div className="p-6 md:p-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-masa-gray" asChild>
        <Link href="/admin/orders">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t(language, "admin.orders.backToOrders")}
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-luxury text-primary">{`${t(language, "admin.orders.orderId")} #${order.id.slice(0, 8).toUpperCase()}`}</h1>
          <p className="text-masa-gray font-sans mt-1">
            {t(language, "admin.orders.placed").replace("{date}", formatDate(order.created_at))}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="font-luxury text-primary text-lg">{t(language, "admin.orders.items")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[450px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sans">{t(language, "admin.orders.product")}</TableHead>
                    <TableHead className="font-sans text-right">{t(language, "admin.orders.qty")}</TableHead>
                    <TableHead className="font-sans text-right">{t(language, "admin.orders.unitPrice")}</TableHead>
                    <TableHead className="font-sans text-right">{t(language, "admin.orders.total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.product_id}>
                      <TableCell className="font-sans">{item.product_name}</TableCell>
                      <TableCell className="font-sans text-right">{item.quantity}</TableCell>
                      <TableCell className="font-sans text-right"><FormattedPrice usd={item.unit_price} /></TableCell>
                      <TableCell className="font-sans text-right"><FormattedPrice usd={item.total_price} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="font-luxury text-primary text-lg">{t(language, "admin.orders.customerCard")}</CardTitle>
            </CardHeader>
            <CardContent className="font-sans text-sm space-y-2">
              <p className="font-medium">{order.customer_name ?? "—"}</p>
              {order.customer_email && <p className="text-masa-gray">{order.customer_email}</p>}
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="font-luxury text-primary text-lg">{t(language, "admin.orders.summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "admin.orders.subtotal")}</span>
                <span><FormattedPrice usd={order.subtotal} /></span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t(language, "admin.orders.discount")}{order.promo_code ? ` (${order.promo_code})` : ""}</span>
                  <span>-<FormattedPrice usd={order.discount_amount} /></span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "admin.orders.shipping")}</span>
                <span><FormattedPrice usd={order.shipping_cost} /></span>
              </div>
              {order.payment_method && (
                <div className="flex justify-between">
                  <span className="text-masa-gray">{t(language, "admin.orders.payment")}</span>
                          <Badge variant="outline" className="text-xs capitalize">{t(language, `checkout.paymentLabels.${order.payment_method === "bank_transfer" ? "bankTransfer" : order.payment_method}`, order.payment_method.replace("_", " "))}</Badge>
                </div>
              )}
              <div className="flex justify-between font-medium pt-2 border-t border-primary/10">
                <span>{t(language, "admin.orders.total")}</span>
                <span className="text-primary font-luxury"><FormattedPrice usd={order.total} /></span>
              </div>
            </CardContent>
          </Card>

          <DeliveryAddressCard order={order} showMap customerName={order.customer_name} />

          {order.notes && (
            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="font-luxury text-primary text-lg">{t(language, "admin.orders.notes")}</CardTitle>
              </CardHeader>
              <CardContent className="font-sans text-sm text-masa-dark">
                {order.notes}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
