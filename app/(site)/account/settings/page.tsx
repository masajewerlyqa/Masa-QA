import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getPhoneVerificationPolicy } from "@/lib/auth/phone-verification";
import { Button } from "@/components/ui/button";
import { AccountSettingsForm } from "./AccountSettingsForm";
import { getServerLanguage } from "@/lib/language-server";

export default async function AccountSettingsPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) redirect("/login");

  const phonePolicy = getPhoneVerificationPolicy();

  return (
    <div className="min-h-[60vh] px-4 py-8 md:py-12">
      <div className="max-w-content mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 text-masa-gray" asChild>
            <Link href="/account">
              <ChevronLeft className="w-4 h-4 mr-1 inline" />
              {isArabic ? "العودة إلى الحساب" : "Back to account"}
            </Link>
          </Button>
          <h1 className="text-3xl font-luxury text-primary">{isArabic ? "إعدادات الحساب" : "Account settings"}</h1>
          <p className="text-masa-gray font-sans max-w-2xl">
            {isArabic
              ? "أدر ملفك الشخصي ورقم الهاتف وتفضيلات الأمان."
              : "Manage your profile, phone number, and security preferences."}
          </p>
        </div>
        <AccountSettingsForm
          profile={profile}
          email={user.email ?? profile.email ?? undefined}
          phonePolicy={phonePolicy}
        />
      </div>
    </div>
  );
}
