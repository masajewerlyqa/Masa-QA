import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { ApplicationActions } from "../ApplicationActions";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

const BUCKET_LOGOS = "store-logos";
const BUCKET_LICENSES = "store-licenses";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

type ApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  business_name: string;
  business_description: string | null;
  contact_email: string;
  contact_phone: string | null;
  contact_full_name: string | null;
  store_location: string | null;
  license_path: string | null;
  logo_path: string | null;
  social_links: Record<string, string> | null;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
  reviewer: { full_name: string | null; email: string | null } | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function SellerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const language = getServerLanguage();
  const { id } = await params;
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || profile?.role !== "admin") {
    notFound();
  }

  const supabase = await createClient();
  const { data: app, error } = await supabase
    .from("seller_applications")
    .select(
      "id, user_id, status, business_name, business_description, contact_email, contact_phone, " +
        "contact_full_name, store_location, license_path, logo_path, social_links, " +
        "created_at, reviewed_at, review_notes, " +
        "profiles:profiles!seller_applications_user_id_fkey(full_name, email), " +
        "reviewer:profiles!seller_applications_reviewed_by_fkey(full_name, email)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !app) {
    notFound();
  }

  const row = app as unknown as ApplicationRow;

  // Signed URLs for private storage (admin only, via service role)
  let logoUrl: string | null = null;
  let licenseUrl: string | null = null;
  const service = createServiceClient();
  if (row.logo_path) {
    const { data: logo } = await service.storage
      .from(BUCKET_LOGOS)
      .createSignedUrl(row.logo_path, SIGNED_URL_EXPIRY);
    logoUrl = logo?.signedUrl ?? null;
  }
  if (row.license_path) {
    const { data: license } = await service.storage
      .from(BUCKET_LICENSES)
      .createSignedUrl(row.license_path, SIGNED_URL_EXPIRY);
    licenseUrl = license?.signedUrl ?? null;
  }

  const socialLinks = row.social_links && typeof row.social_links === "object" ? row.social_links : null;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/seller-applications"
            className="text-sm text-masa-gray hover:text-primary font-sans mb-2 inline-block"
          >
            {t(language, "admin.applications.backToApplications")}
          </Link>
          <h1 className="text-3xl font-luxury text-primary">{t(language, "admin.applications.details")}</h1>
          <p className="text-masa-gray font-sans mt-1">
            {row.business_name} · {formatDate(row.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              row.status === "approved"
                ? "text-green-600 border-green-600"
                : row.status === "rejected"
                  ? "text-red-600 border-red-600"
                  : "text-orange-600 border-orange-600"
            }
          >
            {t(language, `order.statuses.${row.status}`, row.status.replace(/_/g, " "))}
          </Badge>
          {row.status === "pending" && <ApplicationActions applicationId={row.id} />}
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact & business – from seller_applications */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-luxury text-primary">{t(language, "admin.applications.contactBusiness")}</CardTitle>
            <p className="text-xs text-masa-gray font-sans">{t(language, "admin.applications.contactBusinessHint")}</p>
          </CardHeader>
          <CardContent className="space-y-3 font-sans">
            <DetailRow label={t(language, "admin.applications.brandStoreName")} value={row.business_name} />
            <DetailRow label={t(language, "admin.applications.contactPerson")} value={row.contact_full_name} />
            <DetailRow label={t(language, "admin.applications.email")} value={row.contact_email} />
            <DetailRow label={t(language, "common.phone")} value={row.contact_phone} />
            <DetailRow label={t(language, "admin.applications.storeLocation")} value={row.store_location} />
          </CardContent>
        </Card>

        {/* Applicant account – from profiles (user_id) */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-luxury text-primary">{t(language, "admin.applications.applicantAccount")}</CardTitle>
            <p className="text-xs text-masa-gray font-sans">{t(language, "admin.applications.applicantAccountHint")}</p>
          </CardHeader>
          <CardContent className="space-y-3 font-sans">
            <DetailRow label={t(language, "admin.applications.profileName")} value={row.profiles?.full_name} />
            <DetailRow label={t(language, "admin.applications.profileEmail")} value={row.profiles?.email} />
          </CardContent>
        </Card>

        {/* Store description – from seller_applications */}
        {(row.business_description != null && row.business_description !== "") && (
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-luxury text-primary">{t(language, "admin.applications.storeDescription")}</CardTitle>
              <p className="text-xs text-masa-gray font-sans">
                {language === "ar" ? "من حقل وصف النشاط في طلب البائع." : "From the business description field in seller application."}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-masa-dark font-sans whitespace-pre-wrap">{row.business_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Logo & certificate – from seller_applications (paths); files from Storage */}
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-luxury text-primary">{t(language, "admin.applications.logoCertificate")}</CardTitle>
            <p className="text-xs text-masa-gray font-sans">{t(language, "admin.applications.logoCertificateHint")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {logoUrl ? (
              <div>
                <p className="text-sm font-medium text-masa-dark mb-2">{t(language, "admin.applications.logo")}</p>
                <div className="relative w-24 h-24 rounded-md overflow-hidden border border-primary/20 bg-masa-light">
                  <Image src={logoUrl} alt={t(language, "admin.applications.logo")} fill className="object-contain" unoptimized />
                </div>
                <a href={logoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 inline-block">
                  {t(language, "admin.applications.openInNewTab")}
                </a>
              </div>
            ) : (
              <p className="text-sm text-masa-gray font-sans">{t(language, "admin.applications.noLogo")}</p>
            )}
            {licenseUrl ? (
              <div>
                <p className="text-sm font-medium text-masa-dark mb-2">{t(language, "admin.applications.businessCertificate")}</p>
                <Button asChild variant="outline" size="sm">
                  <a href={licenseUrl} target="_blank" rel="noopener noreferrer">
                    {t(language, "admin.applications.viewDownloadCertificate")}
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-masa-gray font-sans">{t(language, "admin.applications.noCertificate")}</p>
            )}
          </CardContent>
        </Card>

        {/* Social links – from seller_applications.social_links */}
        {socialLinks && Object.keys(socialLinks).length > 0 && (
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-luxury text-primary">{t(language, "admin.applications.socialLinks")}</CardTitle>
              <p className="text-xs text-masa-gray font-sans">
                {language === "ar" ? "من روابط التواصل في طلب البائع (حقل اختياري)." : "From seller application social links (optional field)."}
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 font-sans">
                {Object.entries(socialLinks).map(([key, url]) => (
                  <li key={key}>
                    <span className="capitalize text-masa-gray mr-2">{key}:</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Review info – from seller_applications + profiles (reviewer) */}
        {(row.reviewed_at || row.reviewer) && (
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-luxury text-primary">{t(language, "admin.applications.review")}</CardTitle>
              <p className="text-xs text-masa-gray font-sans">
                {language === "ar"
                  ? "وقت المراجعة والمراجع من طلب البائع، واسم المراجع من الملف الشخصي."
                  : "Reviewed timestamp and reviewer come from the application; reviewer name comes from profile."}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 font-sans">
              <DetailRow label={t(language, "admin.applications.reviewedAt")} value={formatDate(row.reviewed_at)} />
              <DetailRow label={t(language, "admin.applications.reviewedBy")} value={row.reviewer?.full_name ?? row.reviewer?.email ?? "—"} />
              {row.review_notes && (
                <DetailRow label={t(language, "admin.applications.notes")} value={row.review_notes} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  const v = value?.trim();
  return (
    <div>
      <span className="text-masa-gray text-sm">{label}</span>
      <p className="text-masa-dark font-medium">{v || "—"}</p>
    </div>
  );
}
