"use client";

import { useState, useCallback } from "react";
import { CreditCard, Lock, Wallet, Check, MapPin, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckoutMapPicker } from "@/components/checkout/CheckoutMapPicker";
import { useI18n } from "@/components/useI18n";
import {
  createCheckoutSession,
  toCheckoutLineItems,
  type CartProductLine,
} from "@/lib/stripe/checkout-client";
import type { CartSummaryItem } from "./CheckoutSummary";

const PAYMENT_METHODS = [
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "apple_pay", label: "Apple Pay", icon: Wallet },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

const BUILDING_TYPES = [
  { value: "house_villa", label: "House / Villa" },
  { value: "apartment", label: "Apartment" },
  { value: "office", label: "Office" },
  { value: "shop", label: "Shop" },
  { value: "public_place", label: "Public Place" },
  { value: "other", label: "Other" },
] as const;

export type AppliedPromo = { code: string; discountAmount: number };

type CheckoutFormProps = {
  cartItems: CartSummaryItem[];
  appliedPromo: AppliedPromo | null;
  checkoutBlocked?: boolean;
  checkoutBlockReason?: "not_configured" | "closed" | null;
};

export function CheckoutForm({
  cartItems,
  appliedPromo,
  checkoutBlocked = false,
  checkoutBlockReason = null,
}: CheckoutFormProps) {
  const { isArabic, t } = useI18n();
  const paymentLabels: Record<PaymentMethod, string> = {
    card: t("checkout.paymentLabels.card"),
    apple_pay: t("checkout.paymentLabels.applePay"),
  };
  const buildingLabels: Record<string, string> = {
    house_villa: t("checkout.buildingTypes.houseVilla"),
    apartment: t("checkout.buildingTypes.apartment"),
    office: t("checkout.buildingTypes.office"),
    shop: t("checkout.buildingTypes.shop"),
    public_place: t("checkout.buildingTypes.publicPlace"),
    other: t("checkout.buildingTypes.other"),
  };
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [buildingType, setBuildingType] = useState("");
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const handleMapSelect = useCallback((lat: number, lng: number) => {
    setDeliveryLat(lat);
    setDeliveryLng(lng);
    setMapError(null);
  }, []);

  const mapUrl =
    deliveryLat != null && deliveryLng != null
      ? `https://www.google.com/maps?q=${deliveryLat},${deliveryLng}`
      : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setMapError(null);

    if (checkoutBlocked) {
      setSubmitError(
        checkoutBlockReason === "not_configured" ? t("storefront.storeHoursNotSet") : t("storefront.storeClosed")
      );
      return;
    }

    if (deliveryLat == null || deliveryLng == null) {
      setMapError(t("checkout.mapPinRequired"));
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);

    const firstName = String(fd.get("firstName") ?? "").trim();
    const deliveryPhone = String(fd.get("delivery_phone") ?? "").trim();
    const deliveryCityArea = String(fd.get("delivery_city_area") ?? "").trim();

    if (!firstName) {
      setSubmitError(t("checkout.fullNameRequired"));
      return;
    }
    if (!deliveryPhone) {
      setSubmitError(t("checkout.phoneNumberRequired"));
      return;
    }
    if (!deliveryCityArea) {
      setSubmitError(t("checkout.cityAreaRequired"));
      return;
    }
    if (!buildingType) {
      setSubmitError(t("checkout.buildingTypeRequired"));
      return;
    }

    const lines = toCheckoutLineItems(cartItems as CartProductLine[]);
    if (lines.length === 0) {
      setSubmitError(t("cart.empty"));
      return;
    }

    const shipping = {
      firstName,
      deliveryPhone,
      country: String(fd.get("country") ?? "Qatar").trim(),
      deliveryCityArea,
      deliveryBuildingType: buildingType,
      deliveryZoneNo: String(fd.get("delivery_zone_no") ?? "").trim() || null,
      deliveryStreetNo: String(fd.get("delivery_street_no") ?? "").trim() || null,
      deliveryBuildingNo: String(fd.get("delivery_building_no") ?? "").trim() || null,
      deliveryFloorNo: String(fd.get("delivery_floor_no") ?? "").trim() || null,
      deliveryApartmentNo: String(fd.get("delivery_apartment_no") ?? "").trim() || null,
      deliveryLandmark: String(fd.get("delivery_landmark") ?? "").trim() || null,
      deliveryLat,
      deliveryLng,
      deliveryMapUrl: mapUrl || null,
    };

    setIsPaying(true);
    try {
      const result = await createCheckoutSession(lines, shipping, {
        promoCode: appliedPromo?.code,
      });
      if (!result.ok) {
        setSubmitError(result.error ?? t("checkout.placeOrderFailed"));
        return;
      }
      window.location.assign(result.url);
    } catch {
      setSubmitError(t("checkout.placeOrderFailed"));
    } finally {
      setIsPaying(false);
    }
  }

  const blockMessage =
    checkoutBlocked &&
    (checkoutBlockReason === "not_configured" ? t("storefront.storeHoursNotSet") : t("storefront.storeClosed"));

  const submitDisabled = checkoutBlocked || isPaying;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {checkoutBlocked && blockMessage && (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 font-sans"
        >
          {blockMessage}
        </div>
      )}

      {/* Delivery address */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t("checkout.deliveryAddress")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p
            className={`rounded-md border border-primary/15 bg-masa-light/90 px-3 py-2.5 text-sm text-masa-dark font-sans flex gap-2.5 leading-relaxed ${
              isArabic ? "flex-row-reverse text-right" : ""
            }`}
            role="note"
          >
            <Info className="w-4 h-4 shrink-0 text-primary mt-0.5" aria-hidden />
            <span>{t("checkout.realNameVerificationNote")}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-sans">{t("checkout.fullNameRequired")}</Label>
              <Input id="firstName" name="firstName" placeholder={t("checkout.yourFullName")} required className={`font-sans border-primary/20 ${isArabic ? "text-right" : ""}`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_phone" className="font-sans">{t("checkout.phoneNumberRequired")}</Label>
              <Input id="delivery_phone" name="delivery_phone" type="tel" placeholder="+974 XXXX XXXX" required className={`font-sans border-primary/20 ${isArabic ? "text-right" : ""}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="font-sans">{t("checkout.country")}</Label>
              <Input id="country" name="country" defaultValue={t("checkout.qatar")} readOnly className="font-sans border-primary/20 bg-masa-light/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_city_area" className="font-sans">{t("checkout.cityAreaRequired")}</Label>
              <Input id="delivery_city_area" name="delivery_city_area" placeholder={t("checkout.cityAreaPlaceholder")} required className={`font-sans border-primary/20 ${isArabic ? "text-right" : ""}`} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_building_type" className="font-sans">{t("checkout.buildingTypeRequired")}</Label>
            <Select value={buildingType} onValueChange={setBuildingType} required>
              <SelectTrigger className="font-sans border-primary/20">
                <SelectValue placeholder={t("checkout.selectBuildingType")} />
              </SelectTrigger>
              <SelectContent>
                {BUILDING_TYPES.map((bt) => (
                  <SelectItem key={bt.value} value={bt.value}>
                    {buildingLabels[bt.value] ?? bt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_zone_no" className="font-sans">{t("checkout.zoneNo")}</Label>
              <Input id="delivery_zone_no" name="delivery_zone_no" placeholder="e.g. 44" className="font-sans border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_street_no" className="font-sans">{t("checkout.streetNo")}</Label>
              <Input id="delivery_street_no" name="delivery_street_no" placeholder="e.g. 12" className="font-sans border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_building_no" className="font-sans">{t("checkout.buildingNo")}</Label>
              <Input id="delivery_building_no" name="delivery_building_no" placeholder="e.g. 7" className="font-sans border-primary/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_floor_no" className="font-sans">{t("checkout.floorNo")}</Label>
              <Input id="delivery_floor_no" name="delivery_floor_no" placeholder="e.g. 3" className="font-sans border-primary/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_apartment_no" className="font-sans">{t("checkout.apartmentUnitNo")}</Label>
              <Input id="delivery_apartment_no" name="delivery_apartment_no" placeholder="e.g. 301" className="font-sans border-primary/20" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_landmark" className="font-sans">{t("checkout.landmarkInstructions")}</Label>
            <textarea
              id="delivery_landmark"
              name="delivery_landmark"
              placeholder={t("checkout.landmarkInstructionsPlaceholder")}
              rows={3}
              className={`flex min-h-[80px] w-full rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm font-sans placeholder:text-masa-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none ${isArabic ? "text-right" : ""}`}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-luxury text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("checkout.exactDeliveryLocation")}
          </CardTitle>
          <p className="text-sm text-masa-gray font-sans mt-1">{t("checkout.pinLocationHint")}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <CheckoutMapPicker onSelect={handleMapSelect} initialLat={deliveryLat} initialLng={deliveryLng} />
          {deliveryLat != null && deliveryLng != null && (
            <p className="text-sm text-green-600 font-sans flex items-center gap-1">
              <Check className="w-4 h-4" />
              {t("checkout.locationSelected")} ({deliveryLat.toFixed(5)}, {deliveryLng.toFixed(5)})
            </p>
          )}
          {mapError && (
            <p role="alert" className="text-sm text-red-600 font-sans">
              {mapError}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="font-luxury text-primary">{t("checkout.paymentMethod")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer font-sans transition-colors ${
                  paymentMethod === value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-primary/10 hover:border-primary/20 hover:bg-masa-light/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                  className="rounded-full border-primary text-primary focus:ring-primary"
                />
                <Icon className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <span className="font-medium text-masa-dark">{paymentLabels[value] ?? label}</span>
              </label>
            ))}
          </div>

          <div
            className="rounded-lg border border-primary/15 bg-masa-light/50 p-4 space-y-2 font-sans"
            role="status"
          >
            <p className="flex items-start gap-2 text-sm text-masa-dark">
              <ShieldCheck className="w-5 h-5 shrink-0 text-primary mt-0.5" aria-hidden />
              <span>{t("checkout.stripeSecureHint")}</span>
            </p>
            <p className="text-xs text-masa-gray leading-relaxed">{t("checkout.stripeDeclinedHint")}</p>
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-sans">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 h-12"
        disabled={submitDisabled}
      >
        <Lock className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} />
        {isPaying ? t("checkout.redirectingToStripe") : t("checkout.continueToStripe")}
      </Button>
    </form>
  );
}
