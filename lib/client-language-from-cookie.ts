import { LANGUAGE_COOKIE_KEY, type Language } from "@/lib/language";

/** For client-only surfaces (e.g. global-error) where there is no React language context. */
export function readLanguageFromDocumentCookie(): Language {
  if (typeof document === "undefined") return "en";
  const part = document.cookie.split("; ").find((row) => row.startsWith(`${LANGUAGE_COOKIE_KEY}=`));
  const value = part?.split("=")[1]?.trim();
  return value === "ar" ? "ar" : "en";
}
