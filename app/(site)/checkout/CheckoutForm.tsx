"use client";

import { useState, useCallback } from "react";
import { useFormStatus } from "react-dom";
import { CreditCard, Lock, Banknote, Building2, Check, MapPin } from "lucide-react";
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
import { FormattedPrice } from "@/components/FormattedPrice";
import { CheckoutMapPicker } from "@/components/checkout/CheckoutMapPicker";
import { useI18n } from "@/components/useI18n";
import { createOrder } from "./actions";

const PAYMENT_METHODS = [
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "cod", label: "Cash on Delivery", icon: Banknote },
  { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

const VALID_PAYMENT_METHODS = new Set<string>(PAYMENT_METHODS.map((m) => m.value));

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
  appliedPromo: AppliedPromo | null;
  setAppliedPromo: (p: AppliedPromo | null) => void;
  promoError: string | null;
  setPromoError: (e: string | null) => void;
  onApplyPromo: (code: string) => Promise<void>;
  applyPending: boolean;
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const { isArabic, t } = useI18n();
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12" disabled={disabled ?? pending}>
      <Lock className={`w-5 h-5 ${isArabic ? "ml-2" : "mr-2"}`} />
      {pending ? t("checkout.placingOrder") : t("checkout.placeSecureOrder")}
    </Button>
  );
}

export function CheckoutForm({
  appliedPromo,
  setAppliedPromo,
  promoError,
  setPromoError,
  onApplyPromo,
  applyPending,
}: CheckoutFormProps) {
  const { isArabic, t } = useI18n();
  const paymentLabels: Record<PaymentMethod, string> = {
    card: t("checkout.paymentLabels.card"),
    cod: t("checkout.paymentLabels.cod"),
    bank_transfer: t("checkout.paymentLabels.bankTransfer"),
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
  const [promoInput, setPromoInput] = useState("");
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

    if (deliveryLat == null || deliveryLng == null) {
      setMapError(t("checkout.mapPinRequired"));
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("payment_method", VALID_PAYMENT_METHODS.has(paymentMethod) ? paymentMethod : "cod");
    formData.set("delivery_building_type", buildingType);
    formData.set("delivery_lat", String(deliveryLat));
    formData.set("delivery_lng", String(deliveryLng));
    formData.set("delivery_map_url", mapUrl);

    try {
      const result = await createOrder(formData);
      if (result?.ok === false) {
        setSubmitError(result.error ?? t("checkout.placeOrderFailed"));
      }
    } catch (err) {
      const digest = err && typeof err === "object" && "digest" in err ? String((err as { digest?: string }).digest) : "";
      if (digest.includes("NEXT_REDIRECT")) throw err;
      setSubmitError(err instanceof Error ? err.message : t("checkout.placeOrderFailed"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input type="hidden" name="payment_method" value={paymentMethod} aria-hidden />

      {/* Shipping / Delivery Address */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-luxury text-primary">{t("checkout.deliveryAddress")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Select value={buildingType} onValueChange={setBuildingType}>
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

      {/* Map Location Picker */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-luxury text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("checkout.exactDeliveryLocation")}
          </CardTitle>
          <p className="text-sm text-masa-gray font-sans mt-1">
            {t("checkout.pinLocationHint")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <CheckoutMapPicker
            onSelect={handleMapSelect}
            initialLat={deliveryLat}
            initialLng={deliveryLng}
          />
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

      {/* Payment Method */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="font-luxury text-primary">{t("checkout.paymentMethod")}</CardTitle>
          <p className="text-sm text-masa-gray font-sans" role="status">
            {t("checkout.paymentHint")}
          </p>
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

          {paymentMethod === "card" && (
            <div className="rounded-lg border border-primary/10 bg-masa-light/30 p-4 space-y-4" role="group" aria-labelledby="card-fields-label">
              <p id="card-fields-label" className="text-sm font-medium text-masa-dark font-sans">
                {t("checkout.cardDetailsPlaceholder")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="cardholderName" className="font-sans">{t("checkout.cardholderName")}</Label>
                  <Input id="cardholderName" name="cardholder_name" placeholder={t("checkout.cardholderNamePlaceholder")} className="font-sans border-primary/20" autoComplete="cc-name" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="cardNumber" className="font-sans">{t("checkout.cardNumber")}</Label>
                  <Input id="cardNumber" name="card_number" placeholder="4242 4242 4242 4242" className="font-sans border-primary/20 font-mono tracking-wider" autoComplete="cc-number" maxLength={19} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="font-sans">{t("checkout.expiryDate")}</Label>
                  <Input id="expiry" name="card_expiry" placeholder="MM/YY" className="font-sans border-primary/20 font-mono" autoComplete="cc-exp" maxLength={5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="font-sans">{isArabic ? "رمز الأمان (CVV)" : "CVV"}</Label>
                  <Input id="cvv" name="card_cvv" placeholder="123" type="password" className="font-sans border-primary/20 font-mono" autoComplete="cc-csc" maxLength={4} />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "cod" && (
            <p className="text-sm text-masa-gray font-sans">
              {t("checkout.payOnDeliveryHint")}
            </p>
          )}

          {paymentMethod === "bank_transfer" && (
            <p className="text-sm text-masa-gray font-sans">
              {t("checkout.bankTransferHint")}
            </p>
          )}

          <div className="pt-2 space-y-2">
            <Label htmlFor="promo_code" className="font-sans">{t("checkout.promoCode")}</Label>
            <div className="flex gap-2">
              <Input
                id="promo_code"
                placeholder={t("checkout.promoExample")}
                className="font-sans border-primary/20"
                autoComplete="off"
                value={appliedPromo ? appliedPromo.code : promoInput}
                onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                readOnly={!!appliedPromo}
              />
              {appliedPromo ? (
                <Button type="button" variant="outline" size="default" className="shrink-0 font-sans" onClick={() => { setAppliedPromo(null); setPromoError(null); setPromoInput(""); }}>
                  {t("checkout.remove")}
                </Button>
              ) : (
                <Button type="button" size="default" className="shrink-0 bg-primary hover:bg-primary/90 font-sans" disabled={applyPending || !promoInput.trim()} onClick={async () => { setPromoError(null); await onApplyPromo(promoInput.trim()); }}>
                  {applyPending ? t("checkout.applying") : t("checkout.apply")}
                </Button>
              )}
            </div>
            <input type="hidden" name="promo_code" value={appliedPromo?.code ?? ""} aria-hidden />
            {appliedPromo && (
              <p className="flex items-center gap-2 text-sm text-green-600 font-sans" role="status">
                <Check className="w-4 h-4 shrink-0" aria-hidden />
                <span>{t("checkout.promoApplied")} {appliedPromo.code} -<FormattedPrice usd={appliedPromo.discountAmount} /></span>
              </p>
            )}
            {promoError && (
              <p role="alert" className="text-sm text-red-600 font-sans">{promoError}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-sans">
          {submitError}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
