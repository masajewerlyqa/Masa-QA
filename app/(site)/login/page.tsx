import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUserWithProfile, getRedirectPathForRole } from "@/lib/auth";
import { getServerLanguage } from "@/lib/language-server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const isArabic = getServerLanguage() === "ar";
  const { user, profile } = await getCurrentUserWithProfile();
  if (user && profile) {
    redirect(getRedirectPathForRole(profile.role));
  }

  const registered = searchParams?.registered === "1";
  const verified = searchParams?.verified === "1";
  const configError = searchParams?.error === "config";
  const authError = searchParams?.error === "auth";
  const oauthError = searchParams?.error === "oauth";
  const errorMsgRaw = searchParams?.msg;
  const errorMsg =
    typeof errorMsgRaw === "string"
      ? errorMsgRaw
      : Array.isArray(errorMsgRaw)
        ? errorMsgRaw[0]
        : undefined;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 gap-4">
      {registered && (
        <div className="w-full max-w-md rounded-md border border-primary/15 bg-masa-light px-4 py-3 text-sm text-masa-dark font-sans text-center">
          {isArabic ? "تحقق من بريدك الإلكتروني لتأكيد الحساب، ثم سجّل الدخول من الأسفل." : "Check your inbox to verify your email, then sign in below."}
        </div>
      )}
      {verified && (
        <div className="w-full max-w-md rounded-md border border-primary/15 bg-masa-light px-4 py-3 text-sm text-masa-dark font-sans text-center">
          {isArabic ? "تم تأكيد بريدك الإلكتروني بنجاح. أهلاً بك في MASA، سجّل الدخول للمتابعة." : "Your email is verified. Welcome to MASA — sign in to continue."}
        </div>
      )}
      {configError && (
        <div className="w-full max-w-md rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-sans text-center">
          {isArabic ? "إعدادات تسجيل الدخول غير مكتملة. يرجى التحقق من متغيرات البيئة." : "Authentication is not configured. Check environment variables."}
        </div>
      )}
      {authError && (
        <div className="w-full max-w-md rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-sans text-center space-y-1">
          <p>{isArabic ? "تعذر إتمام تسجيل الدخول. حاول مرة أخرى أو استخدم البريد الإلكتروني وكلمة المرور." : "Sign-in could not be completed. Try again or use email and password."}</p>
          {errorMsg ? <p className="text-xs text-amber-800/90 break-words">{errorMsg}</p> : null}
        </div>
      )}
      {oauthError && (
        <div className="w-full max-w-md rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 font-sans text-center space-y-1">
          <p>{isArabic ? "تم إلغاء أو حظر تسجيل الدخول عبر Google أو Apple." : "Google or Apple sign-in was cancelled or blocked."}</p>
          {errorMsg ? (
            <p className="text-xs text-amber-800/90 break-words">{errorMsg}</p>
          ) : (
            <p className="text-xs text-amber-800/90">
              {isArabic ? "في Supabase: فعّل مزود تسجيل الدخول، وأضف رابط الموقع ضمن Redirect URLs، وطابق عناوين إعادة التوجيه في Google Cloud." : "In Supabase: enable the provider, add this site URL to Redirect URLs, and match Google Cloud redirect URIs."}
            </p>
          )}
        </div>
      )}
      <LoginForm />
    </div>
  );
}
