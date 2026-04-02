"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/useI18n";
import type { Language } from "@/lib/language";
import {
  MERCHANT_TERMS_SECTIONS,
  MERCHANT_TERMS_VERSION,
  getMerchantTermsTitle,
  merchantSecondaryBullets,
  merchantSecondaryIntro,
  merchantSectionBullets,
  merchantSectionIntro,
  merchantSectionParagraphs,
  merchantSectionTitle,
  merchantSubsections,
} from "@/lib/legal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function replaceVersion(template: string, version: string): string {
  return template.replace(/\{\{version\}\}/g, version);
}

export function MerchantTermsModal({ open, onOpenChange }: Props) {
  const { language, t, isArabic } = useI18n();
  const lang = language as Language;
  const dir = isArabic ? "rtl" : "ltr";
  const textAlign = isArabic ? "text-right" : "text-left";

  const versionLine = useMemo(
    () => replaceVersion(t("auth.register.merchantTerms.versionNote"), MERCHANT_TERMS_VERSION),
    [t]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        dir={dir}
        className="max-h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden border-primary/15 p-0 sm:rounded-xl"
      >
        <DialogHeader className={`border-b border-primary/10 bg-masa-light/60 px-5 py-4 sm:px-6 ${textAlign}`}>
          <DialogTitle className="text-xl sm:text-2xl font-luxury text-primary pr-8">
            {t("auth.register.merchantTerms.modalTitle")}
          </DialogTitle>
          <p className="text-xs font-sans text-masa-gray mt-1">{getMerchantTermsTitle(lang)}</p>
        </DialogHeader>

        <div
          className={`overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 max-h-[min(65vh,560px)] ${textAlign}`}
          dir={dir}
        >
          <article className="space-y-8 font-sans text-[15px] leading-relaxed text-masa-dark">
            {MERCHANT_TERMS_SECTIONS.map((section) => {
              const intro = merchantSectionIntro(section, lang);
              const bullets = merchantSectionBullets(section, lang);
              const paras = merchantSectionParagraphs(section, lang);
              const subs = merchantSubsections(section);
              const secIntro = merchantSecondaryIntro(section, lang);
              const secBullets = merchantSecondaryBullets(section, lang);
              return (
                <section key={section.id} className="space-y-3">
                  <h3 className="text-base font-semibold text-primary tracking-tight border-b border-primary/10 pb-2">
                    {merchantSectionTitle(section, lang)}
                  </h3>
                  <div className="space-y-3 text-masa-dark/95">
                    {intro ? <p className="font-medium text-masa-dark">{intro}</p> : null}
                    {subs.length > 0 ? (
                      <div className="space-y-5">
                        {subs.map((sub) => {
                          const subBullets = lang === "ar" ? sub.bullets.ar : sub.bullets.en;
                          const subTitle = lang === "ar" ? sub.title.ar : sub.title.en;
                          return (
                            <div key={sub.title.en} className="space-y-2">
                              <h4 className="text-sm font-semibold text-masa-dark/90">{subTitle}</h4>
                              <ul
                                className={`list-disc space-y-2 ${isArabic ? "pr-5 mr-1" : "pl-5 ml-1"} marker:text-primary text-sm`}
                              >
                                {subBullets.map((item, i) => (
                                  <li key={i} className="leading-relaxed">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    {bullets.length > 0 ? (
                      <ul
                        className={`list-disc space-y-2 ${isArabic ? "pr-5 mr-1" : "pl-5 ml-1"} marker:text-primary`}
                      >
                        {bullets.map((item, i) => (
                          <li key={i} className="leading-relaxed pl-0.5">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {secIntro ? <p className="font-medium text-masa-dark pt-1">{secIntro}</p> : null}
                    {secBullets.length > 0 ? (
                      <ul
                        className={`list-disc space-y-2 ${isArabic ? "pr-5 mr-1" : "pl-5 ml-1"} marker:text-primary`}
                      >
                        {secBullets.map((item, i) => (
                          <li key={`s-${i}`} className="leading-relaxed pl-0.5">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {paras.map((p, i) => (
                      <p key={`p-${i}`}>{p}</p>
                    ))}
                  </div>
                </section>
              );
            })}
          </article>
          <p className={`mt-8 text-xs text-masa-gray font-sans border-t border-primary/10 pt-4 ${textAlign}`}>
            {versionLine}
          </p>
        </div>

        <div className={`border-t border-primary/10 bg-white px-5 py-4 sm:px-6 ${textAlign}`}>
          <DialogClose asChild>
            <Button type="button" className="w-full sm:w-auto bg-primary hover:bg-primary/90 font-sans">
              {t("auth.register.merchantTerms.modalClose")}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
