import { ar } from "@/lib/i18n/ar";
import { en } from "@/lib/i18n/en";
import type { Language } from "@/lib/language";

export const dictionaries = { en, ar } as const;
type WidenLiterals<T> = T extends string
  ? string
  : T extends Array<infer U>
    ? Array<WidenLiterals<U>>
    : T extends object
      ? { [K in keyof T]: WidenLiterals<T[K]> }
      : T;
export type I18nDictionary = WidenLiterals<typeof en>;

type Primitive = string | number | boolean | null | undefined;
type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & string]: T[K] extends Primitive ? K : K | Join<K, Paths<T[K]>>;
    }[keyof T & string];

export type KeyPath = Paths<I18nDictionary>;

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
}

export function getDictionary(language: Language): I18nDictionary {
  return dictionaries[language] ?? en;
}

export function t(language: Language, key: KeyPath | string, fallback?: string): string {
  const dict = getDictionary(language) as Record<string, unknown>;
  const value = getByPath(dict, key);
  if (typeof value === "string") return value;
  return fallback ?? key;
}

export function createTranslator(language: Language) {
  return (key: KeyPath | string, fallback?: string) => t(language, key, fallback);
}
