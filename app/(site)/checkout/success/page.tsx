import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCustomerOrder } from "@/lib/customer";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user } = await getCurrentUserWithProfile();
  if (!user) notFound();

  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const order = await getCustomerOrder(orderId, user.id);
  if (!order) notFound();

  const address = order.shipping_address as Record<string, string> | null;
  const addressLines = address
    ? [
        [address.firstName, address.lastName].filter(Boolean).join(" "),
        address.address,
        [address.city, address.state, address.zip].filter(Boolean).join(", "),
        address.country,
      ].filter(Boolean)
    : [];

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl md:text-4xl mb-2 text-primary font-luxury">
          {t(language, "checkout.success.thankYou")}
        </h1>
        <p className="text-masa-gray font-sans">
          {t(language, "checkout.success.orderPlacedOn")}{" "}
          {formatDate(order.created_at, isArabic ? "ar-QA" : "en-US")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-lg">{t(language, "checkout.success.orderNumber")}</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-sm text-masa-dark break-all">
            {order.id}
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-lg">{t(language, "checkout.success.shippingAddress")}</CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-sm text-masa-dark">
            {addressLines.length > 0 ? (
              <address className="not-italic">
                {addressLines.map((line, i) => (
                  <span key={i}>{line}{i < addressLines.length - 1 ? <br /> : null}</span>
                ))}
              </address>
            ) : (
              <span className="text-masa-gray">—</span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm mt-8 max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t(language, "checkout.orderSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="font-sans">
          <ul className="space-y-3 mb-6">
            {order.items.map((item) => (
              <li key={item.product_id} className="flex justify-between text-sm">
                <span className="text-masa-dark">{item.product_name} × {item.quantity}</span>
                <span><FormattedPrice usd={item.total_price} /></span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 pt-4 border-t border-primary/10 text-sm">
            <div className="flex justify-between">
              <span className="text-masa-gray">{t(language, "checkout.subtotal")}</span>
              <span><FormattedPrice usd={order.subtotal} /></span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t(language, "checkout.discount")}{order.promo_code ? ` (${order.promo_code})` : ""}</span>
                <span>-<FormattedPrice usd={order.discount_amount} /></span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-masa-gray">{t(language, "checkout.shipping")}</span>
              <span><FormattedPrice usd={order.shipping_cost} /></span>
            </div>
            <div className="flex justify-between font-medium pt-2 text-base">
              <span>{t(language, "checkout.total")}</span>
              <span className="text-primary font-luxury"><FormattedPrice usd={order.total} /></span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-4 mt-12">
        <Link href="/discover">
          <Button variant="outline">{t(language, "checkout.success.continueShopping")}</Button>
        </Link>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">{t(language, "checkout.success.backHome")}</Button>
        </Link>
      </div>
    </div>
  );
}
