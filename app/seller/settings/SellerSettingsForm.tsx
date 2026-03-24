"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStoreSettings, type StoreSettingsPayload } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { StoreRow } from "@/lib/seller-types";
import { useI18n } from "@/components/useI18n";

const QatarLocationPicker = dynamic(
  () => import("@/components/map/QatarLocationPicker").then((m) => m.QatarLocationPicker),
  { ssr: false, loading: () => <div className="h-[320px] rounded-lg bg-masa-light animate-pulse border border-primary/20" /> }
);

const BUCKET_LOGOS = "store-logos";
const LOGO_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_LOGO_MB = 2;

function getSocial(links: Record<string, string> | null, key: string): string {
  if (!links || typeof links !== "object") return "";
  const v = links[key];
  return typeof v === "string" ? v : "";
}

type Props = { store: StoreRow };

export function SellerSettingsForm({ store }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(store.name ?? "");
  const [slug, setSlug] = useState(store.slug ?? "");
  const [description, setDescription] = useState(store.description ?? "");
  const [logoUrl, setLogoUrl] = useState(store.logo_url ?? "");
  const [bannerUrl, setBannerUrl] = useState(store.banner_url ?? "");
  const [location, setLocation] = useState(store.location ?? "");
  const [latitude, setLatitude] = useState<number | null>(store.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(store.longitude ?? null);
  const [contactEmail, setContactEmail] = useState(store.contact_email ?? "");
  const [contactPhone, setContactPhone] = useState(store.contact_phone ?? "");
  const [website, setWebsite] = useState(getSocial(store.social_links ?? null, "website"));
  const [facebook, setFacebook] = useState(getSocial(store.social_links ?? null, "facebook"));
  const [instagram, setInstagram] = useState(getSocial(store.social_links ?? null, "instagram"));
  const [linkedin, setLinkedin] = useState(getSocial(store.social_links ?? null, "linkedin"));

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      setError(t("seller.settings.logoUnderLimit", `Logo must be under ${MAX_LOGO_MB}MB.`).replace("{size}", String(MAX_LOGO_MB)));
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError(null);
    e.target.value = "";
  }

  function clearLogoUpload() {
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoUrl(store.logo_url ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    let finalLogoUrl = logoUrl;
    if (logoFile) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(t("seller.settings.sessionExpired"));
        setLoading(false);
        return;
      }
      const ext = logoFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-logo.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_LOGOS)
        .upload(path, logoFile, { upsert: false });
      if (uploadError) {
        setError(t("seller.settings.logoUploadFailed").replace("{message}", uploadError.message));
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from(BUCKET_LOGOS).getPublicUrl(path);
      finalLogoUrl = data.publicUrl;
    }

    const payload: StoreSettingsPayload = {
      name,
      slug,
      description,
      logo_url: finalLogoUrl || null,
      banner_url: bannerUrl || null,
      location,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      website,
      facebook,
      instagram,
      linkedin,
      latitude,
      longitude,
    };

    const result = await updateStoreSettings(payload);
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
      setLogoFile(null);
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
      if (finalLogoUrl) setLogoUrl(finalLogoUrl);
      router.refresh();
    } else {
      setError(result.error ?? t("seller.settings.failedToSave"));
    }
  }

  const inputClass = "font-sans border-primary/20 bg-masa-light focus-visible:ring-primary";
  const labelClass = "font-sans text-masa-dark";

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-primary font-luxury">{t("seller.settings.title")}</h1>
        <p className="text-masa-gray font-sans">{t("seller.settings.description")}</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-sans">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 font-sans">
            {t("seller.settings.saved")}
          </div>
        )}

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-luxury text-primary">{t("seller.settings.storeProfile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName" className={labelClass}>{t("seller.settings.storeName")}</Label>
              <Input
                id="storeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeSlug" className={labelClass}>{t("seller.settings.urlSlug")}</Label>
              <Input
                id="storeSlug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={t("seller.settings.urlSlugPlaceholder")}
                disabled={loading}
                className={inputClass}
              />
              <p className="text-xs text-masa-gray font-sans">
                {t("seller.settings.urlSlugHint").replace("{slug}", slug || t("seller.settings.urlSlugPlaceholder"))}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription" className={labelClass}>{t("seller.settings.descriptionLabel")}</Label>
              <textarea
                id="storeDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className={`flex w-full rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm placeholder:text-masa-gray outline-none focus-visible:ring-2 focus-visible:ring-primary font-sans ${inputClass}`}
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>{t("seller.settings.logo")}</Label>
              <div className="flex items-start gap-4">
                {(logoPreview || logoUrl) && (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden border border-primary/20 bg-masa-light shrink-0">
                    <Image
                      src={logoPreview || logoUrl}
                      alt={t("seller.settings.logoAlt")}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    type="file"
                    accept={LOGO_ACCEPT}
                    onChange={handleLogoChange}
                    disabled={loading}
                    className={inputClass}
                  />
                  {logoFile && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearLogoUpload}>
                      {t("seller.settings.cancelNewLogo")}
                    </Button>
                  )}
                  <p className="text-xs text-masa-gray font-sans">{t("seller.settings.logoHint").replace("{size}", String(MAX_LOGO_MB))}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bannerUrl" className={labelClass}>{t("seller.settings.bannerUrl")}</Label>
              <Input
                id="bannerUrl"
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
                disabled={loading}
                className={inputClass}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-luxury text-primary">{t("seller.settings.contactLocation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className={labelClass}>{t("seller.settings.mapLocation")}</Label>
              <p className="text-xs text-masa-gray font-sans mb-2">
                {t("seller.settings.mapHint")}
              </p>
              <QatarLocationPicker
                initialLat={latitude}
                initialLng={longitude}
                onSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height="320px"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className={labelClass}>{t("seller.settings.locationText")}</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("seller.settings.locationPlaceholder")}
                disabled={loading}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className={labelClass}>{t("seller.settings.contactEmail")}</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="store@example.com"
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className={labelClass}>{t("seller.settings.contactPhone")}</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-luxury text-primary">{t("seller.settings.socialLinks")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className={labelClass}>{t("seller.settings.website")}</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className={labelClass}>{t("seller.settings.instagram")}</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/..."
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className={labelClass}>{t("seller.settings.facebook")}</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className={labelClass}>{t("seller.settings.linkedin")}</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? t("common.saving") : t("common.saveChanges")}
        </Button>
      </form>
    </div>
  );
}
