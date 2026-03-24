import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/customer";
import type { CustomerOrderRow } from "@/lib/customer";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function AccountOrdersPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user } = await getCurrentUserWithProfile();
  if (!user) redirect("/login");

  const orders = await getCustomerOrders(user.id);

  return (
    <div className="min-h-[60vh] px-4 py-12">
      <div className="max-w-content mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-luxury text-primary">{t(language, "account.orders.history")}</h1>
          <p className="text-masa-gray font-sans mt-1">{t(language, "account.orders.trackOrders")}</p>
        </div>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.yourOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-masa-gray font-sans py-8 text-center">
                {t(language, "account.orders.noOrdersYet")}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <Table className="min-w-[500px] md:min-w-0">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-sans">{t(language, "account.orders.order")}</TableHead>
                    <TableHead className="font-sans">{t(language, "account.orders.date")}</TableHead>
                    <TableHead className="font-sans">{t(language, "account.orders.status")}</TableHead>
                    <TableHead className={`font-sans ${isArabic ? "text-left" : "text-right"}`}>{t(language, "account.orders.total")}</TableHead>
                    <TableHead className="font-sans w-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: CustomerOrderRow) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        <Link href={`/account/orders/${order.id}`} className="text-primary hover:underline">
                          {order.id.slice(0, 8)}…
                        </Link>
                      </TableCell>
                      <TableCell className="font-sans">{formatDate(order.created_at, isArabic ? "ar-QA" : "en-US")}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className={`font-sans ${isArabic ? "text-left" : "text-right"}`}><FormattedPrice usd={order.total} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/account/orders/${order.id}`}>
                            {t(language, "account.orders.view")}
                            <ArrowRight className={`w-4 h-4 ${isArabic ? "mr-1 rotate-180" : "ml-1"}`} />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Link href="/account">
            <Button variant="outline">{t(language, "account.orders.backToAccount")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
