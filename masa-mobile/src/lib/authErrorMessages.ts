export type AuthLanguage = 'en' | 'ar';

const EN_FALLBACK = 'Something went wrong. Please try again.';
const AR_FALLBACK = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

const AUTH_ERROR_MAP: Array<{ match: RegExp; en: string; ar: string }> = [
  {
    match: /invalid login credentials|invalid email or password/i,
    en: 'Invalid email or password.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  },
  {
    match: /email not confirmed|confirm your email/i,
    en: 'Please verify your email before signing in.',
    ar: 'يرجى توثيق بريدك الإلكتروني قبل تسجيل الدخول.',
  },
  {
    match: /user already registered|already been registered/i,
    en: 'An account with this email already exists. Try signing in.',
    ar: 'يوجد حساب بهذا البريد بالفعل. جرّب تسجيل الدخول.',
  },
  {
    match: /password.*at least|too short/i,
    en: 'Password must be at least 8 characters.',
    ar: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.',
  },
  {
    match: /pkce|code verifier/i,
    en: 'Sign-in session expired. Close the app, reopen it, and try Google sign-in again.',
    ar: 'انتهت جلسة تسجيل الدخول. أغلق التطبيق وأعد فتحه ثم جرّب تسجيل الدخول عبر Google مرة أخرى.',
  },
  {
    match: /too many requests|rate limit/i,
    en: 'Too many attempts. Please try again in a moment.',
    ar: 'محاولات كثيرة جداً. يرجى المحاولة بعد قليل.',
  },
];

export function normalizeAuthError(
  message: string | null | undefined,
  language: AuthLanguage,
): string {
  const raw = (message ?? '').trim();
  for (const rule of AUTH_ERROR_MAP) {
    if (rule.match.test(raw)) {
      return language === 'ar' ? rule.ar : rule.en;
    }
  }
  if (!raw) return language === 'ar' ? AR_FALLBACK : EN_FALLBACK;
  return raw;
}
