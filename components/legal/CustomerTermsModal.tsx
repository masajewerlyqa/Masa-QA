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
  CUSTOMER_TERMS_SECTIONS,
  CUSTOMER_TERMS_VERSION,
  getTermsTitle,
  sectionBullets,
  sectionIntro,
  sectionParagraphs,
  sectionTitle,
} from "@/lib/legal";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function replaceVersion(template: string, version: string): string {
  return template.replace(/\{\{version\}\}/g, version);
}

export function CustomerTermsModal({ open, onOpenChange }: Props) {
  const { language, t, isArabic } = useI18n();
  const lang = language as Language;
  const dir = isArabic ? "rtl" : "ltr";
  const textAlign = isArabic ? "text-right" : "text-left";

  const versionLine = useMemo(
    () => replaceVersion(t("auth.register.terms.versionNote"), CUSTOMER_TERMS_VERSION),
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
            {t("auth.register.terms.modalTitle")}
          </DialogTitle>
          <p className="text-xs font-sans text-masa-gray mt-1">{getTermsTitle(lang)}</p>
        </DialogHeader>

        <div
          className={`overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6 max-h-[min(65vh,560px)] ${textAlign}`}
          dir={dir}
        >
          <article className="space-y-8 font-sans text-[15px] leading-relaxed text-masa-dark">
            {CUSTOMER_TERMS_SECTIONS.map((section) => {
              const intro = sectionIntro(section, lang);
              const bullets = sectionBullets(section, lang);
              const paras = sectionParagraphs(section, lang);
              return (
                <section key={section.id} className="space-y-3">
                  <h3 className="text-base font-semibold text-primary tracking-tight border-b border-primary/10 pb-2">
                    {sectionTitle(section, lang)}
                  </h3>
                  <div className="space-y-3 text-masa-dark/95">
                    {intro ? <p className="font-medium text-masa-dark">{intro}</p> : null}
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
              {t("auth.register.terms.modalClose")}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
