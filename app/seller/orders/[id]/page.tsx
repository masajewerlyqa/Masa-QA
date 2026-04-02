import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, CreditCard, Banknote, Building2, Wallet, Package, Calendar, FileText, User, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSellerStore, getSellerOrderById } from "@/lib/seller";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { OrderStatusSelect } from "@/components/seller/OrderStatusSelect";
import { PrintOrderButton } from "@/components/seller/PrintOrderButton";
import { TrackingInfoForm } from "@/components/seller/TrackingInfoForm";
import { FormattedPrice } from "@/components/FormattedPrice";
import { DeliveryAddressCard } from "@/components/order/DeliveryAddressCard";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";
import { formatOrderDisplayRef } from "@/lib/order-display";
import { formatDateTime } from "@/lib/date-format";
import { translateProductCategory } from "@/lib/product-category-i18n";
import { getOrderExperienceRating } from "@/lib/order-experience-ratings";
import { OrderExperienceRatingSellerView } from "@/components/account/OrderExperienceRatingCard";
import { SellerOrderQuickActions } from "@/components/seller/SellerOrderQuickActions";

function formatPaymentMethod(method: string | null, language: "en" | "ar") {
  if (!method) return t(language, "common.notSpecified", "Not specified");
  switch (method) {
    case "card": return t(language, "checkout.paymentLabels.card");
    case "apple_pay": return t(language, "checkout.paymentLabels.applePay");
    case "cod": return t(language, "checkout.paymentLabels.cod");
    case "bank_transfer": return t(language, "checkout.paymentLabels.bankTransfer");
    default: return method;
  }
}

function getPaymentIcon(method: string | null) {
  switch (method) {
    case "card": return <CreditCard className="w-4 h-4" />;
    case "apple_pay": return <Wallet className="w-4 h-4" />;
    case "bank_transfer": return <Building2 className="w-4 h-4" />;
    case "cod": return <Banknote className="w-4 h-4" />;
    default: return <CreditCard className="w-4 h-4" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "awaiting_seller": return "bg-amber-50 text-amber-800 border-amber-300";
    case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "accepted": return "bg-blue-50 text-blue-700 border-blue-200";
    case "processing": return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "shipped": return "bg-purple-50 text-purple-700 border-purple-200";
    case "delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function formatAddress(addr: Record<string, unknown> | null) {
  if (!addr) return null;
  const parts = [];
  if (addr.firstName || addr.lastName) {
    parts.push(`${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim());
  }
  if (addr.address) parts.push(String(addr.address));
  const cityLine = [addr.city, addr.state, addr.zip].filter(Boolean).join(", ");
  if (cityLine) parts.push(cityLine);
  if (addr.country && addr.country !== "US") parts.push(String(addr.country));
  return parts.length > 0 ? parts : null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerOrderDetailPage({ params }: PageProps) {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "seller") redirect("/login");

  const store = await getSellerStore();
  if (!store) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t(language, "seller.orders.title")}</h1>
        <p className="text-masa-gray font-sans">{t(language, "seller.orders.noStoreYet")}</p>
      </div>
    );
  }

  const { id } = await params;
  const [order, experienceRating] = await Promise.all([
    getSellerOrderById(id, store.id),
    getOrderExperienceRating(id),
  ]);
  if (!order) notFound();

  const orderDisplayRef = formatOrderDisplayRef(order);

  const itemsSubtotal = order.items.reduce((s, i) => s + i.total_price, 0);
  const addressLines = formatAddress(order.shipping_address);

  const statusTimeline = ["awaiting_seller", "accepted", "processing", "shipped", "delivered"];
  const statusForTimeline =
    order.status === "pending" ? "awaiting_seller" : order.status === "confirmed" ? "accepted" : order.status;
  const rawIndex = statusTimeline.indexOf(statusForTimeline);
  const currentIndex = rawIndex < 0 ? 0 : rawIndex;
  const timelineMax = Math.max(1, statusTimeline.length - 1);
  const progressWidthPct =
    currentIndex <= 0 ? 0 : Math.min(100, (currentIndex / timelineMax) * 100);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="text-masa-gray mb-4 -ml-2" asChild>
          <Link href="/seller/orders">
            <ArrowLeft className={`w-4 h-4 ${isArabic ? "ml-2 rotate-180" : "mr-2"}`} />
            {t(language, "admin.orders.backToOrders")}
          </Link>
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl mb-2 text-primary font-luxury">{`${t(language, "admin.orders.orderId")} ${orderDisplayRef}`}</h1>
            <p className="text-masa-gray font-sans flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t(language, "admin.orders.placed").replace("{date}", formatDateTime(order.created_at, language))}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PrintOrderButton orderId={order.id} orderLabel={orderDisplayRef} />
            <div className="flex items-center gap-3">
              <span className="text-sm text-masa-gray font-sans">{t(language, "seller.orders.status")}</span>
              <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
            </div>
          </div>
        </div>
      </div>

      {order.status === "awaiting_seller" && order.seller_response_deadline && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm font-sans text-amber-950 space-y-3">
          <p className="font-medium text-masa-dark">{t(language, "seller.orders.slaBanner")}</p>
          <p className="text-masa-gray">
            {t(language, "seller.orders.respondBy")}: {formatDateTime(order.seller_response_deadline, language)}
          </p>
          <SellerOrderQuickActions orderId={order.id} />
        </div>
      )}

      {/* Status Timeline */}
      {order.status !== "cancelled" && (
        <div className="mb-14">
          <div className="max-w-2xl">
            {/* Timeline container */}
            <div className="relative">
              {/* Horizontal line container - inset by 16px (half circle) on each side */}
              <div className="absolute top-4 left-4 right-4 flex items-center">
                {/* Background line (full width, gray) */}
                <div className="w-full h-[2px] bg-gray-200" />
                {/* Progress line (colored, overlays background) */}
                <div
                  className="absolute left-0 top-0 h-[2px] bg-primary transition-all duration-300"
                  style={{ width: `${progressWidthPct}%` }}
                />
              </div>
              
              {/* Steps row */}
              <div className="relative flex justify-between">
                {statusTimeline.map((status, index) => {
                  const isActive = rawIndex >= 0 ? index <= rawIndex : false;
                  const isCurrent = rawIndex >= 0 && index === rawIndex;
                  return (
                    <div key={status} className="flex flex-col items-center">
                      {/* Circle */}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-primary border-primary text-white"
                            : "bg-white border-gray-200 text-masa-gray"
                        } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2" : ""}`}
                      >
                        {index + 1}
                      </div>
                      {/* Label */}
                      <span 
                        className={`mt-3 text-xs font-sans capitalize transition-colors ${
                          isActive ? "text-primary font-medium" : "text-masa-gray"
                        }`}
                      >
                        {t(language, `order.statuses.${status}`, status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mb-8 space-y-3">
          <Badge className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 text-sm">
            {t(language, "order.statuses.cancelled")}
          </Badge>
          {(order.seller_cancellation_reason?.trim() || order.platform_cancellation_reason?.trim()) && (
            <Card className="border-red-200/80 bg-red-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-luxury text-primary">
                  {order.cancellation_source === "system"
                    ? t(language, "order.cancellation.platformHeading")
                    : t(language, "seller.orders.cancellationNoteHeading")}
                </CardTitle>
              </CardHeader>
              <CardContent className="font-sans text-sm text-masa-dark whitespace-pre-wrap">
                {(order.platform_cancellation_reason ?? order.seller_cancellation_reason ?? "").trim()}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - Products */}
        <div className="xl:col-span-2 space-y-6">
          {/* Products Table */}
          <Card className="border-primary/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-masa-light/50">
              <CardTitle className="font-luxury text-primary flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t(language, "admin.orders.items")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table className="min-w-[550px] md:min-w-0">
                <TableHeader>
                  <TableRow className="bg-masa-light/30 hover:bg-masa-light/30">
                    <TableHead className="font-sans font-semibold text-primary">{t(language, "admin.orders.product")}</TableHead>
                    <TableHead className="font-sans font-semibold text-primary">{t(language, "marketplace.category")}</TableHead>
                    <TableHead className="font-sans font-semibold text-primary text-center">{t(language, "admin.orders.qty")}</TableHead>
                    <TableHead className="font-sans font-semibold text-primary text-right">{t(language, "admin.orders.unitPrice")}</TableHead>
                    <TableHead className="font-sans font-semibold text-primary text-right">{t(language, "admin.orders.total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-masa-light/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-masa-light rounded-lg overflow-hidden flex-shrink-0 border border-primary/10">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-masa-gray">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <span className="font-sans font-medium text-masa-dark">{item.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-sans text-masa-gray">
                          {translateProductCategory(item.product_category, (key, fb) => t(language, key, fb))}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-sans font-medium">{item.quantity}</span>
                      </TableCell>
                      <TableCell className="font-sans text-right"><FormattedPrice usd={item.unit_price} /></TableCell>
                      <TableCell className="font-sans text-right font-medium"><FormattedPrice usd={item.total_price} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="border-primary/10 shadow-sm">
              <CardHeader className="bg-masa-light/50">
                <CardTitle className="font-luxury text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t(language, "admin.orders.notes")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="font-sans text-sm text-masa-dark whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tracking Information - Show for shipped/processing orders */}
          {(order.status === "processing" || order.status === "shipped" || order.status === "accepted") && (
            <TrackingInfoForm
              orderId={order.id}
              initialData={{
                tracking_number: order.tracking_number,
                shipping_company: order.shipping_company,
                estimated_delivery: order.estimated_delivery,
              }}
            />
          )}

          {experienceRating && <OrderExperienceRatingSellerView rating={experienceRating} />}

          {/* Customer Information */}
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-masa-light/50">
              <CardTitle className="font-luxury text-primary flex items-center gap-2">
                <User className="w-5 h-5" />
                {t(language, "admin.orders.customerCard")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="font-sans font-semibold text-masa-dark text-lg">{order.customer_name ?? t(language, "common.guest", "Guest")}</p>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href={`mailto:${order.customer_email}`} className="font-sans text-masa-gray hover:text-primary transition-colors">
                    {order.customer_email}
                  </a>
                </div>
              )}
              {order.customer_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${order.customer_phone}`} className="font-sans text-masa-gray hover:text-primary transition-colors">
                    {order.customer_phone}
                  </a>
                </div>
              )}
              {addressLines && !order.delivery_city_area && (
                <div className="flex items-start gap-3 text-sm pt-2 border-t border-primary/10">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div className="font-sans text-masa-gray">
                    {addressLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address with Map */}
          <DeliveryAddressCard order={order} showMap customerName={order.customer_name} />

          {/* Payment Summary */}
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-masa-light/50">
              <CardTitle className="font-luxury text-primary flex items-center gap-2">
                {getPaymentIcon(order.payment_method)}
                {t(language, "admin.orders.summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 font-sans text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                <span className="text-masa-gray">{t(language, "admin.orders.payment")}</span>
                <Badge variant="outline" className="font-medium">
                  {formatPaymentMethod(order.payment_method, language)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "admin.orders.subtotal")}</span>
                <span className="font-medium"><FormattedPrice usd={itemsSubtotal} /></span>
              </div>
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "admin.orders.shipping")}</span>
                <span>{order.shipping_cost > 0 ? <FormattedPrice usd={order.shipping_cost} /> : t(language, "checkout.free")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "common.tax", "Tax")}</span>
                <span><FormattedPrice usd={order.tax} /></span>
              </div>
              {order.store_earnings != null && (
                <div className="flex justify-between text-sm pt-2 text-green-600 font-sans">
                  <span>{t(language, "seller.orders.yourEarnings")} ({t(language, "common.afterCommission", "after commission")})</span>
                  <span className="font-medium"><FormattedPrice usd={order.store_earnings} /></span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-primary/10">
                <span className="font-semibold text-primary">{t(language, "admin.orders.total")}</span>
                <span className="font-semibold text-primary text-lg"><FormattedPrice usd={order.total} /></span>
              </div>
            </CardContent>
          </Card>

          {/* Order Meta */}
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-masa-light/50">
              <CardTitle className="font-luxury text-primary">{t(language, "admin.orders.title")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "admin.orders.orderId")}</span>
                <span className="font-mono text-xs bg-masa-light px-2 py-1 rounded tracking-wide">{orderDisplayRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "common.created", "Created")}</span>
                <span>{formatDateTime(order.created_at, language)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-masa-gray">{t(language, "common.lastUpdated", "Last Updated")}</span>
                <span>{formatDateTime(order.updated_at, language)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-masa-gray">{t(language, "seller.orders.status")}</span>
                <Badge className={`capitalize border ${getStatusColor(order.status)}`}>
                  {t(language, `order.statuses.${order.status}`, order.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Print Layout */}
      <div id={`order-print-${order.id}`} className="hidden">
        <div className="print-header">
          <div>
            <div className="print-logo">MASA</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
              {language === "ar" ? "سوق المجوهرات الفاخرة" : "Luxury Jewelry Marketplace"}
            </div>
          </div>
          <div className="print-store-info">
            <div className="print-store-name">{store.name}</div>
            {store.location && <div>{store.location}</div>}
            {store.contact_email && <div>{store.contact_email}</div>}
            {store.contact_phone && <div>{store.contact_phone}</div>}
          </div>
        </div>

        <div className="print-title">{`${t(language, "admin.orders.orderId")} ${orderDisplayRef}`}</div>
        <div className="print-meta">
          <span>{t(language, "admin.orders.placed").replace("{date}", formatDateTime(order.created_at, language))}</span>
          <span style={{ margin: "0 12px" }}>•</span>
          <span className="print-status-badge">{order.status}</span>
        </div>

        <div className="print-grid">
          <div className="print-section">
            <div className="print-section-title">{t(language, "admin.orders.customerCard")}</div>
            <div className="print-info-row">
              <span className="print-info-label">{t(language, "account.accountPage.name")}</span>
              <span className="print-info-value">{order.customer_name ?? "—"}</span>
            </div>
            <div className="print-info-row">
              <span className="print-info-label">{t(language, "common.email")}</span>
              <span className="print-info-value">{order.customer_email ?? "—"}</span>
            </div>
            <div className="print-info-row">
              <span className="print-info-label">{t(language, "common.phone")}</span>
              <span className="print-info-value">{order.customer_phone ?? "—"}</span>
            </div>
          </div>

          <div className="print-section">
            <div className="print-section-title">{t(language, "admin.orders.shipping")}</div>
            {order.delivery_city_area ? (
              <>
                {order.delivery_country && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{order.delivery_country}</div>}
                <div style={{ fontSize: "13px", marginBottom: "4px" }}>{order.delivery_city_area}</div>
                {order.delivery_building_type && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.buildingTypeRequired")}: {order.delivery_building_type}</div>}
                {order.delivery_zone_no && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.zoneNo")}: {order.delivery_zone_no}</div>}
                {order.delivery_street_no && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.streetNo")}: {order.delivery_street_no}</div>}
                {order.delivery_building_no && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.buildingNo")}: {order.delivery_building_no}</div>}
                {order.delivery_floor_no && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.floorNo")}: {order.delivery_floor_no}</div>}
                {order.delivery_apartment_no && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.apartmentUnitNo")}: {order.delivery_apartment_no}</div>}
                {order.delivery_landmark && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "checkout.landmarkInstructions")}: {order.delivery_landmark}</div>}
                {order.delivery_phone && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t(language, "common.phone")}: {order.delivery_phone}</div>}
                {order.delivery_map_url && <div style={{ fontSize: "13px", marginBottom: "4px" }}>{language === "ar" ? "الخريطة" : "Map"}: {order.delivery_map_url}</div>}
              </>
            ) : addressLines ? (
              addressLines.map((line, i) => (
                <div key={i} style={{ fontSize: "13px", marginBottom: "4px" }}>{line}</div>
              ))
            ) : (
              <div style={{ fontSize: "13px", color: "#888" }}>{language === "ar" ? "لا يوجد عنوان" : "No address provided"}</div>
            )}
          </div>
        </div>

        <div className="print-section">
          <div className="print-section-title">{t(language, "admin.orders.items")}</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>{t(language, "admin.orders.product")}</th>
                <th>{t(language, "marketplace.category")}</th>
                <th style={{ textAlign: "center" }}>{t(language, "admin.orders.qty")}</th>
                <th>{t(language, "admin.orders.unitPrice")}</th>
                <th>{t(language, "admin.orders.total")}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="print-product-cell">
                      {item.product_image && (
                        <img src={item.product_image} alt="" width={56} height={56} className="print-product-img" />
                      )}
                      <div>
                        <div className="print-product-name">{item.product_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{translateProductCategory(item.product_category, (key, fb) => t(language, key, fb))}</td>
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td><FormattedPrice usd={item.unit_price} /></td>
                  <td><FormattedPrice usd={item.total_price} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="print-summary">
            <div className="print-summary-row">
              <span>{t(language, "admin.orders.payment")}</span>
              <span>{formatPaymentMethod(order.payment_method, language)}</span>
            </div>
            <div className="print-summary-row">
              <span>{t(language, "admin.orders.subtotal")}</span>
              <span><FormattedPrice usd={itemsSubtotal} /></span>
            </div>
            <div className="print-summary-row">
              <span>{t(language, "admin.orders.shipping")}</span>
              <span>{order.shipping_cost > 0 ? <FormattedPrice usd={order.shipping_cost} /> : t(language, "checkout.free")}</span>
            </div>
            <div className="print-summary-row">
              <span>{language === "ar" ? "الضريبة" : "Tax"}</span>
              <span><FormattedPrice usd={order.tax} /></span>
            </div>
            <div className="print-summary-row total">
              <span>{t(language, "admin.orders.total")}</span>
              <span><FormattedPrice usd={order.total} /></span>
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="print-section">
            <div className="print-section-title">{t(language, "admin.orders.notes")}</div>
            <div style={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>{order.notes}</div>
          </div>
        )}

        <div className="print-footer">
          <p>{language === "ar" ? "تم التحقق بواسطة سوق MASA" : "Verified by MASA Marketplace"}</p>
          <p style={{ marginTop: "4px" }}>{language === "ar" ? "شكراً لتعاملك معنا" : "Thank you for your business"}</p>
        </div>
      </div>
    </div>
  );
}
