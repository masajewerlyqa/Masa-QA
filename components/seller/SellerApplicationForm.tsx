"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import {
  sellerApplicationFormSchema,
  socialLinksFromForm,
  type SellerApplicationFormValues,
} from "@/lib/validations/seller-application";
import { notifyAdminsNewSellerApplicationAction } from "@/app/(site)/apply/actions";
import { useI18n } from "@/components/useI18n";

const BUCKET_LICENSES = "store-licenses";
const BUCKET_LOGOS = "store-logos";
const LOGO_ACCEPT = "image/jpeg,image/png,image/webp";
const LICENSE_ACCEPT = ".pdf,image/*";
const MAX_LOGO_MB = 2;
const MAX_LICENSE_MB = 10;

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 100) || "file";
}

export function SellerApplicationForm() {
  const { isArabic } = useI18n();
  const router = useRouter();
  const [brandStoreName, setBrandStoreName] = useState("");
  const [contactFullName, setContactFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SellerApplicationFormValues, string>>>({});
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ status: string } | null>(null);

  useEffect(() => {
    async function check() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSignedIn(false);
        setCheckingAuth(false);
        return;
      }
      setSignedIn(true);
      if (user.user_metadata?.full_name) setContactFullName(user.user_metadata.full_name);
      if (user.email) setEmail(user.email);
      const { data: existing } = await supabase
        .from("seller_applications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      setExistingApplication(existing ?? null);
      setCheckingAuth(false);
    }
    check();
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formValues: SellerApplicationFormValues = {
      brand_store_name: brandStoreName.trim(),
      contact_full_name: contactFullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      store_location: storeLocation.trim(),
      store_description: storeDescription.trim(),
      website: website.trim() || undefined,
      facebook: facebook.trim() || undefined,
      instagram: instagram.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
    };

    const parsed = sellerApplicationFormSchema.safeParse(formValues);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors(flat as Partial<Record<keyof SellerApplicationFormValues, string>>);
      setError(parsed.error.issues.map((e) => e.message).join("; "));
      return;
    }

    if (!licenseFile) {
      setError(isArabic ? "يرجى رفع السجل التجاري أو الشهادة التجارية." : "Please upload your business certificate or commercial license.");
      return;
    }

    if (logoFile && logoFile.size > MAX_LOGO_MB * 1024 * 1024) {
      setError(isArabic ? `يجب أن يكون الشعار أقل من ${MAX_LOGO_MB}MB.` : `Logo must be under ${MAX_LOGO_MB}MB.`);
      return;
    }
    if (licenseFile.size > MAX_LICENSE_MB * 1024 * 1024) {
      setError(isArabic ? `يجب أن يكون ملف الشهادة/الرخصة أقل من ${MAX_LICENSE_MB}MB.` : `Certificate / license file must be under ${MAX_LICENSE_MB}MB.`);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(isArabic ? "يرجى تسجيل الدخول لإرسال الطلب." : "Please sign in to submit an application.");
        setLoading(false);
        return;
      }

      const licenseSafeName = sanitizeFileName(licenseFile.name);
      const licensePath = `${user.id}/${Date.now()}-${licenseSafeName}`;

      const { error: licenseUploadError } = await supabase.storage
        .from(BUCKET_LICENSES)
        .upload(licensePath, licenseFile, { upsert: false });

      if (licenseUploadError) {
        setError(`License upload failed: ${licenseUploadError.message}.`);
        setLoading(false);
        return;
      }

      let logoPath: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() || "jpg";
        const logoPathName = `${user.id}/${Date.now()}-logo.${ext}`;
        const { error: logoUploadError } = await supabase.storage
          .from(BUCKET_LOGOS)
          .upload(logoPathName, logoFile, { upsert: false });
        if (logoUploadError) {
          setError(`Logo upload failed: ${logoUploadError.message}.`);
          setLoading(false);
          return;
        }
        logoPath = logoPathName;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: parsed.data.contact_full_name })
        .eq("id", user.id);
      if (profileError) {
        setError(`Profile update failed: ${profileError.message}.`);
        setLoading(false);
        return;
      }

      const socialLinks = socialLinksFromForm(parsed.data);

      const { error: insertError } = await supabase.from("seller_applications").upsert(
        {
          user_id: user.id,
          status: "pending",
          business_name: parsed.data.brand_store_name,
          business_description: parsed.data.store_description || null,
          contact_email: parsed.data.email,
          contact_phone: parsed.data.phone || null,
          contact_full_name: parsed.data.contact_full_name,
          store_location: parsed.data.store_location,
          license_path: licensePath,
          logo_path: logoPath,
          social_links: socialLinks,
        },
        { onConflict: "user_id" }
      );

      if (insertError) {
        setError(`Application save failed: ${insertError.message}.`);
        setLoading(false);
        return;
      }

      await notifyAdminsNewSellerApplicationAction();

      router.refresh();
      router.push("/account?applied=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : (isArabic ? "حدث خطأ ما" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "font-sans border-primary/20 bg-masa-light focus-visible:ring-primary";
  const labelClass = "font-sans text-masa-dark";

  if (checkingAuth) {
    return (
      <Card className="w-full max-w-xl border-primary/10 shadow-sm">
        <CardContent className="py-12 text-center text-masa-gray font-sans">
          {isArabic ? "جارٍ التحميل…" : "Loading…"}
        </CardContent>
      </Card>
    );
  }

  if (!signedIn) {
    return (
      <Card className="w-full max-w-xl border-primary/10 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "انضم كبائع" : "Become a seller"}</CardTitle>
          <CardDescription className="font-sans">
            {isArabic ? "سجّل الدخول لإرسال طلب البائع." : "Sign in to submit your seller application."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-sans">
          <Button asChild className="w-full bg-primary hover:bg-primary/90" size="lg">
            <Link href="/login">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link>
          </Button>
          <p className="text-center text-sm text-masa-gray">
            {isArabic ? "ليس لديك حساب؟" : "Don&apos;t have an account?"}{" "}
            <Link href="/register" className="text-primary hover:underline">{isArabic ? "إنشاء حساب" : "Register"}</Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (existingApplication) {
    const isPending = existingApplication.status === "pending";
    return (
      <Card className="w-full max-w-xl border-primary/10 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "طلب البائع" : "Seller application"}</CardTitle>
          <CardDescription className="font-sans">
            {isArabic ? "لقد قمت بإرسال طلب سابقًا." : "You have already submitted an application."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-sans">
          <p className="text-masa-gray">
            {isArabic ? "الحالة:" : "Status:"} <span className="font-medium text-masa-dark capitalize">{existingApplication.status.replace(/_/g, " ")}</span>
          </p>
          <p className="text-sm text-masa-gray">
            {isPending
              ? (isArabic ? "سيقوم المشرف بمراجعة طلبك، وسيصلك إشعار عند اتخاذ القرار." : "An admin will review your application. You will be notified once a decision is made.")
              : (isArabic ? "إذا كانت لديك أسئلة، يرجى التواصل مع الدعم." : "If you have questions, please contact support.")}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">{isArabic ? "العودة للرئيسية" : "Back to home"}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl border-primary/10 shadow-sm">
      <CardHeader className="text-center border-b border-primary/10 pb-6">
        <CardTitle className="text-2xl font-luxury text-primary">{isArabic ? "طلب البائع" : "Seller application"}</CardTitle>
        <CardDescription className="font-sans text-masa-gray">
          {isArabic ? "أكمل النموذج أدناه وسنراجع طلبك ثم نعاود التواصل." : "Complete the form below. We will review your application and get back to you."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 font-sans"
            >
              {error}
            </div>
          )}

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-primary font-luxury uppercase tracking-wide">{isArabic ? "التواصل والعمل" : "Contact & business"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand_store_name" className={labelClass}>{isArabic ? "اسم العلامة / المتجر" : "Brand / store name"}</Label>
                <Input
                  id="brand_store_name"
                  placeholder={isArabic ? "مثال: Maison Luxe" : "e.g. Maison Luxe"}
                  value={brandStoreName}
                  onChange={(e) => setBrandStoreName(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  required
                />
                {fieldErrors.brand_store_name && (
                  <p className="text-sm text-red-600">{fieldErrors.brand_store_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_full_name" className={labelClass}>{isArabic ? "اسم المسؤول (كامل)" : "Contact person (full name)"}</Label>
                <Input
                  id="contact_full_name"
                  placeholder={isArabic ? "الاسم الكامل" : "Jane Doe"}
                  value={contactFullName}
                  onChange={(e) => setContactFullName(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  autoComplete="name"
                  required
                />
                {fieldErrors.contact_full_name && (
                  <p className="text-sm text-red-600">{fieldErrors.contact_full_name}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={labelClass}>{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isArabic ? "you@example.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  required
                  autoComplete="email"
                />
                {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className={labelClass}>{isArabic ? "الهاتف" : "Phone"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={isArabic ? "+974 XXXX XXXX" : "+1 234 567 8900"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  autoComplete="tel"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-primary font-luxury uppercase tracking-wide">{isArabic ? "تفاصيل المتجر" : "Store details"}</h3>
            <div className="space-y-2">
              <Label htmlFor="store_location" className={labelClass}>{isArabic ? "موقع المتجر" : "Store location"}</Label>
              <Input
                id="store_location"
                placeholder={isArabic ? "المدينة أو المنطقة أو العنوان الكامل" : "City, region or full address"}
                value={storeLocation}
                onChange={(e) => setStoreLocation(e.target.value)}
                disabled={loading}
                className={inputClass}
                required
              />
              {fieldErrors.store_location && (
                <p className="text-sm text-red-600">{fieldErrors.store_location}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_description" className={labelClass}>{isArabic ? "وصف المتجر" : "Store description"}</Label>
              <textarea
                id="store_description"
                placeholder={isArabic ? "وصف مختصر للمتجر والمنتجات..." : "Brief description of your store and products..."}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className={`flex w-full rounded-md border border-primary/20 bg-masa-light px-3 py-2 text-sm placeholder:text-masa-gray outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:opacity-50 font-sans ${fieldErrors.store_description ? "border-red-500" : ""}`}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-primary font-luxury uppercase tracking-wide">{isArabic ? "الشعار والمستندات" : "Logo & documents"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo" className={labelClass}>{isArabic ? "شعار المتجر / العلامة" : "Store / brand logo"}</Label>
                <div className="flex items-start gap-3">
                  {logoPreview && (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-primary/20 bg-masa-light shrink-0">
                      <Image src={logoPreview} alt={isArabic ? "معاينة الشعار" : "Logo preview"} fill className="object-contain" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Input
                      id="logo"
                      type="file"
                      accept={LOGO_ACCEPT}
                      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                      disabled={loading}
                      className={`font-sans ${inputClass}`}
                    />
                    <p className="text-xs text-masa-gray mt-1">{isArabic ? `اختياري. JPEG أو PNG أو WebP. بحد أقصى ${MAX_LOGO_MB}MB.` : `Optional. JPEG, PNG or WebP. Max ${MAX_LOGO_MB}MB.`}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license" className={labelClass}>{isArabic ? "السجل التجاري أو الرخصة" : "Business certificate or license"}</Label>
                <Input
                  id="license"
                  type="file"
                  accept={LICENSE_ACCEPT}
                  onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                  disabled={loading}
                  className={`font-sans ${inputClass}`}
                  required
                />
                <p className="text-xs text-masa-gray mt-1">{isArabic ? `PDF أو صورة. بحد أقصى ${MAX_LICENSE_MB}MB.` : `PDF or image. Max ${MAX_LICENSE_MB}MB.`}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-primary font-luxury uppercase tracking-wide">{isArabic ? "روابط التواصل (اختياري)" : "Social links (optional)"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website" className={labelClass}>{isArabic ? "الموقع الإلكتروني" : "Website"}</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
                {fieldErrors.website && <p className="text-sm text-red-600">{fieldErrors.website}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className={labelClass}>Instagram</Label>
                <Input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
                {fieldErrors.instagram && <p className="text-sm text-red-600">{fieldErrors.instagram}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className={labelClass}>Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
                {fieldErrors.facebook && <p className="text-sm text-red-600">{fieldErrors.facebook}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className={labelClass}>LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
                {fieldErrors.linkedin && <p className="text-sm text-red-600">{fieldErrors.linkedin}</p>}
              </div>
            </div>
          </section>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
              disabled={loading}
            >
              {loading ? (isArabic ? "جارٍ الإرسال…" : "Submitting…") : (isArabic ? "إرسال الطلب" : "Submit application")}
            </Button>
          </div>
        </form>
        <p className="text-center text-sm text-masa-gray font-sans">
          {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link href="/login" className="text-primary hover:underline">{isArabic ? "تسجيل الدخول" : "Sign in"}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
