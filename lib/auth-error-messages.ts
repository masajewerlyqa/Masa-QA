import type { Language } from "@/lib/language";

const EN_FALLBACK = "Something went wrong. Please try again.";
const AR_FALLBACK = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

const AUTH_ERROR_MAP: Array<{ match: RegExp; en: string; ar: string }> = [
  {
    match: /invalid login credentials|invalid email or password/i,
    en: "Invalid email or password.",
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  },
  {
    match: /email not confirmed|confirm your email/i,
    en: "Please verify your email before signing in.",
    ar: "يرجى توثيق بريدك الإلكتروني قبل تسجيل الدخول.",
  },
  {
    match: /too many requests|rate limit/i,
    en: "Too many attempts. Please try again in a moment.",
    ar: "محاولات كثيرة جداً. يرجى المحاولة بعد قليل.",
  },
];

export function normalizeAuthError(message: string | null | undefined, language: Language): string {
  const raw = (message ?? "").trim();
  for (const rule of AUTH_ERROR_MAP) {
    if (rule.match.test(raw)) return language === "ar" ? rule.ar : rule.en;
  }
  if (!raw) return language === "ar" ? AR_FALLBACK : EN_FALLBACK;
  return raw;
}
