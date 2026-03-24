import { Truck, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/useI18n";

type TrackingInfoCardProps = {
  trackingNumber: string | null;
  shippingCompany: string | null;
  estimatedDelivery: string | null;
  orderStatus: string;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getTrackingUrl(company: string | null, trackingNumber: string): string | null {
  if (!company || !trackingNumber) return null;
  
  const urls: Record<string, string> = {
    DHL: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    FedEx: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    UPS: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    Aramex: `https://www.aramex.com/track/results?ShipmentNumber=${trackingNumber}`,
    USPS: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    TNT: `https://www.tnt.com/express/en_us/site/tracking.html?searchType=con&cons=${trackingNumber}`,
    EMS: `https://www.ems.post/en/global-network/tracking`,
  };
  
  return urls[company] ?? null;
}

export function TrackingInfoCard({
  trackingNumber,
  shippingCompany,
  estimatedDelivery,
  orderStatus,
}: TrackingInfoCardProps) {
  const { t } = useI18n();
  const hasTrackingInfo = trackingNumber || shippingCompany || estimatedDelivery;
  
  if (!hasTrackingInfo) {
    if (orderStatus === "shipped" || orderStatus === "processing") {
      return (
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="font-luxury text-primary text-lg flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {t("product.shippingInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="font-sans text-sm text-masa-gray">
            <p>{t("common.trackingPending", "Tracking information will be available once your order ships.")}</p>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const trackingUrl = getTrackingUrl(shippingCompany, trackingNumber ?? "");
  const formattedDelivery = formatDate(estimatedDelivery);

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle className="font-luxury text-primary text-lg flex items-center gap-2">
          <Truck className="w-5 h-5" />
          {t("product.shippingInformation")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 font-sans text-sm">
        {shippingCompany && (
          <div className="flex justify-between items-center">
            <span className="text-masa-gray">{t("common.carrier", "Carrier")}</span>
            <Badge variant="outline" className="font-medium">
              {shippingCompany}
            </Badge>
          </div>
        )}

        {trackingNumber && (
          <div className="flex justify-between items-start gap-4">
            <span className="text-masa-gray shrink-0">{t("common.trackingNumber", "Tracking #")}</span>
            <div className="text-right">
              <span className="font-mono text-masa-dark block">{trackingNumber}</span>
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 text-xs mt-1"
                >
                  {t("common.trackPackage", "Track Package")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {formattedDelivery && (
          <div className="flex justify-between items-center pt-3 border-t border-primary/10">
            <span className="text-masa-gray flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("common.estimatedDelivery", "Est. Delivery")}
            </span>
            <span className="font-medium text-masa-dark">{formattedDelivery}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
