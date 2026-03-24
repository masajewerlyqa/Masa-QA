"use client";

import dynamic from "next/dynamic";
import { MapPin, ExternalLink, Phone, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/useI18n";

const StoreLocationMap = dynamic(
  () => import("@/components/map/StoreLocationMap").then((m) => m.StoreLocationMap),
  { ssr: false, loading: () => <div className="h-[200px] rounded-lg bg-masa-light animate-pulse border border-primary/20" /> }
);

const BUILDING_TYPE_LABELS: Record<string, string> = {
  house_villa: "House / Villa",
  apartment: "Apartment",
  office: "Office",
  shop: "Shop",
  public_place: "Public Place",
  other: "Other",
};

type DeliveryFields = {
  delivery_country?: string | null;
  delivery_city_area?: string | null;
  delivery_building_type?: string | null;
  delivery_zone_no?: string | null;
  delivery_street_no?: string | null;
  delivery_building_no?: string | null;
  delivery_floor_no?: string | null;
  delivery_apartment_no?: string | null;
  delivery_landmark?: string | null;
  delivery_phone?: string | null;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  delivery_map_url?: string | null;
};

type Props = {
  order: DeliveryFields;
  showMap?: boolean;
  customerName?: string | null;
};

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-masa-gray shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function DeliveryAddressCard({ order, showMap = true, customerName }: Props) {
  const { t } = useI18n();
  const hasDelivery =
    order.delivery_city_area ||
    order.delivery_zone_no ||
    order.delivery_lat != null;

  if (!hasDelivery) return null;

  const hasCoords = order.delivery_lat != null && order.delivery_lng != null;
  const mapUrl =
    order.delivery_map_url ??
    (hasCoords ? `https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}` : null);

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader className="bg-masa-light/50">
        <CardTitle className="font-luxury text-primary flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          {t("account.orders.shippingAddress")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 font-sans">
        {customerName && (
          <p className="font-semibold text-masa-dark">{customerName}</p>
        )}
        {order.delivery_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-primary shrink-0" />
            <a href={`tel:${order.delivery_phone}`} className="text-masa-gray hover:text-primary transition-colors">
              {order.delivery_phone}
            </a>
          </div>
        )}
        {order.delivery_building_type && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-primary shrink-0" />
            <span>{BUILDING_TYPE_LABELS[order.delivery_building_type] ?? order.delivery_building_type}</span>
          </div>
        )}

        <div className="space-y-1 pt-1 border-t border-primary/10">
          <Row label={t("checkout.country")} value={order.delivery_country} />
          <Row label={t("checkout.cityAreaRequired").replace(" *", "")} value={order.delivery_city_area} />
          <Row label={t("checkout.zoneNo")} value={order.delivery_zone_no} />
          <Row label={t("checkout.streetNo")} value={order.delivery_street_no} />
          <Row label={t("checkout.buildingNo")} value={order.delivery_building_no} />
          <Row label={t("checkout.floorNo")} value={order.delivery_floor_no} />
          <Row label={t("checkout.apartmentUnitNo")} value={order.delivery_apartment_no} />
        </div>

        {order.delivery_landmark && (
          <div className="text-sm pt-1 border-t border-primary/10">
            <span className="text-masa-gray">{t("checkout.landmarkInstructions")}:</span>{" "}
            <span>{order.delivery_landmark}</span>
          </div>
        )}

        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="w-full mt-2 font-sans">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("common.openMap", "Open in Google Maps")}
            </Button>
          </a>
        )}

        {showMap && hasCoords && (
          <div className="mt-2">
            <StoreLocationMap
              latitude={order.delivery_lat!}
              longitude={order.delivery_lng!}
              storeName={t("common.deliveryLocation", "Delivery Location")}
              height="200px"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
