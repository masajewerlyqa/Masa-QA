import { cookies } from "next/headers";
import { LANGUAGE_COOKIE_KEY, isLanguage, type Language } from "@/lib/language";

export function getServerLanguage(): Language {
  const cookieStore = cookies();
  const language = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
  return isLanguage(language) ? language : "en";
}
