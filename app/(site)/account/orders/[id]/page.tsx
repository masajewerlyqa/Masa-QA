import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCustomerOrder, getOrderStatusTimeline } from "@/lib/customer";
import { getOrderExperienceRating } from "@/lib/order-experience-ratings";
import { OrderExperienceRatingCard } from "@/components/account/OrderExperienceRatingCard";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { TrackingInfoCard } from "@/components/order/TrackingInfoCard";
import { DeliveryAddressCard } from "@/components/order/DeliveryAddressCard";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { formatOrderDisplayRef } from "@/lib/order-display";

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user } = await getCurrentUserWithProfile();
  if (!user) notFound();

  const { id } = await params;
  const order = await getCustomerOrder(id, user.id);
  if (!order) notFound();

  const [statusTimeline, experienceRating] = await Promise.all([
    getOrderStatusTimeline(id, user.id),
    getOrderExperienceRating(id),
  ]);

  const address = order.shipping_address as Record<string, string> | null;
  const buyerName = address
    ? [address.firstName, address.lastName].filter(Boolean).join(" ") || null
    : null;

  const hasDeliveryFields =
    order.delivery_city_area ||
    order.delivery_zone_no ||
    order.delivery_lat != null;

  const legacyAddressLines =
    !hasDeliveryFields && address
      ? [
          [address.firstName, address.lastName].filter(Boolean).join(" "),
          address.address,
          [address.city, address.state, address.zip].filter(Boolean).join(", "),
          address.country,
        ].filter(Boolean)
      : [];

  return (
    <div className="min-h-[60vh] px-4 py-8 md:py-12">
      <div className="max-w-content mx-auto">
        <Button variant="ghost" size="sm" className="mb-4 md:mb-6 -ml-2" asChild>
          <Link href="/account/orders">
            <ArrowLeft className={`w-4 h-4 ${isArabic ? "ml-2 rotate-180" : "mr-2"}`} />
            {t(language, "account.orders.backToOrderHistory")}
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-luxury text-primary">{t(language, "account.orders.order")} {formatOrderDisplayRef(order)}</h1>
            <p className="text-masa-gray font-sans mt-1">{t(language, "account.orders.placed")} {formatDate(order.created_at, isArabic ? "ar-QA" : "en-US")}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {order.status === "cancelled" &&
          order.cancellation_source === "system" &&
          order.platform_cancellation_reason?.trim() && (
            <Card className="mb-8 border-amber-200/90 bg-amber-50/40 border-primary/10">
              <CardHeader>
                <CardTitle className="font-luxury text-primary text-lg">
                  {t(language, "account.orders.platformCancellationHeading")}
                </CardTitle>
                <p className="text-sm text-masa-gray font-sans">{t(language, "account.orders.platformCancellationIntro")}</p>
              </CardHeader>
              <CardContent className="font-sans text-sm text-masa-dark whitespace-pre-wrap">
                {order.platform_cancellation_reason.trim()}
              </CardContent>
            </Card>
          )}

        {order.status === "cancelled" &&
          order.cancellation_source !== "system" &&
          order.seller_cancellation_reason?.trim() && (
            <Card className="mb-8 border-red-200/80 bg-red-50/50 border-primary/10">
              <CardHeader>
                <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.sellerCancellationHeading")}</CardTitle>
                <p className="text-sm text-masa-gray font-sans">{t(language, "account.orders.sellerCancellationIntro")}</p>
              </CardHeader>
              <CardContent className="font-sans text-sm text-masa-dark whitespace-pre-wrap">{order.seller_cancellation_reason.trim()}</CardContent>
            </Card>
          )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.items")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                <Table className="min-w-[420px] md:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-sans">{t(language, "account.orders.product")}</TableHead>
                      <TableHead className={`font-sans ${isArabic ? "text-left" : "text-right"}`}>{t(language, "account.orders.qty")}</TableHead>
                      <TableHead className={`font-sans ${isArabic ? "text-left" : "text-right"}`}>{t(language, "account.orders.unitPrice")}</TableHead>
                      <TableHead className={`font-sans ${isArabic ? "text-left" : "text-right"}`}>{t(language, "account.orders.total")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-sans">{item.product_name}</TableCell>
                        <TableCell className={`font-sans ${isArabic ? "text-left" : "text-right"}`}>{item.quantity}</TableCell>
                        <TableCell className={`font-sans ${isArabic ? "text-left" : "text-right"}`}><FormattedPrice usd={item.unit_price} /></TableCell>
                        <TableCell className={`font-sans ${isArabic ? "text-left" : "text-right"}`}><FormattedPrice usd={item.total_price} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

            <OrderExperienceRatingCard orderId={order.id} orderStatus={order.status} existing={experienceRating} />
          </div>

          <div className="space-y-6">
            <TrackingInfoCard
              trackingNumber={order.tracking_number}
              shippingCompany={order.shipping_company}
              estimatedDelivery={order.estimated_delivery}
              orderStatus={order.status}
            />

            {statusTimeline.length > 0 && (
              <Card className="border-primary/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.orderUpdates")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 font-sans text-sm">
                  {statusTimeline.map((ev) => (
                    <div key={ev.id} className={`border-primary/20 ${isArabic ? "border-r-2 pr-3" : "border-l-2 pl-3"}`}>
                      <p className="text-masa-dark capitalize">
                        {ev.to_status.replace(/_/g, " ")}
                        {ev.source === "checkout" && ` · ${t(language, "account.orders.placedSource")}`}
                        {ev.source === "seller" && ` · ${t(language, "account.orders.sellerSource")}`}
                        {ev.source === "admin" && ` · ${t(language, "account.orders.adminSource")}`}
                        {ev.source === "system" && ` · ${t(language, "account.orders.systemSource")}`}
                      </p>
                      <p className="text-xs text-masa-gray">{formatDate(ev.created_at, isArabic ? "ar-QA" : "en-US")}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 font-sans text-sm">
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
                <div className="flex justify-between font-medium pt-2 border-t border-primary/10">
                  <span>{t(language, "checkout.total")}</span>
                  <span className="text-primary font-luxury"><FormattedPrice usd={order.total} /></span>
                </div>
              </CardContent>
            </Card>

            {hasDeliveryFields ? (
              <DeliveryAddressCard order={order} showMap customerName={buyerName} />
            ) : (
              <Card className="border-primary/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.shippingAddress")}</CardTitle>
                </CardHeader>
                <CardContent className="font-sans text-sm text-masa-dark">
                  {legacyAddressLines.length > 0 ? (
                    <address className="not-italic">
                      {legacyAddressLines.map((line, i) => (
                        <span key={i}>{line}{i < legacyAddressLines.length - 1 ? <br /> : null}</span>
                      ))}
                    </address>
                  ) : (
                    <span className="text-masa-gray">—</span>
                  )}
                </CardContent>
              </Card>
            )}

            {order.notes && !hasDeliveryFields && (
              <Card className="border-primary/10 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-luxury text-primary text-lg">{t(language, "account.orders.notes")}</CardTitle>
                </CardHeader>
                <CardContent className="font-sans text-sm text-masa-dark">
                  {order.notes}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/account/orders">
            <Button variant="outline">{t(language, "account.orders.backToOrderHistory")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
