"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONTACT_SUBJECT_OPTIONS,
  getContactSubjectLabelByLanguage,
} from "@/lib/contact/subjects";
import { useLanguage } from "@/components/LanguageProvider";
import { normalizeAuthError } from "@/lib/auth-error-messages";
import { toast } from "@/hooks/use-toast";

export function ContactForm() {
  const { isArabic, language } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(
    "Please fill in all required fields."
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current ?? e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!name || !email || !message || !subject) {
      setErrorMessage(isArabic ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill in all required fields.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email,
          ...(phone ? { phone } : {}),
          subject,
          message,
          language,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErrorMessage(
          typeof data.error === "string"
            ? normalizeAuthError(data.error, isArabic ? "ar" : "en")
            : isArabic ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }
      form.reset();
      setSubject("");
      setStatus("idle");
      toast({
        variant: "success",
        title: isArabic ? "شكراً لك" : "Thank you",
        description: isArabic
          ? "استلمنا رسالتك وسنرد عليك قريباً."
          : "We received your message and will get back to you shortly.",
      });
    } catch {
      setErrorMessage(isArabic ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-masa-dark font-sans">
            {isArabic ? "الاسم الكامل" : "Full Name"} <span className="text-primary">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder={isArabic ? "الاسم الكامل" : "Your full name"}
            className="h-11 border-primary/20 focus-visible:ring-primary"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-masa-dark font-sans">
            {isArabic ? "البريد الإلكتروني" : "Email Address"} <span className="text-primary">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-11 border-primary/20 focus-visible:ring-primary"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone" className="text-masa-dark font-sans">
          {isArabic ? "رقم الهاتف" : "Phone Number"} <span className="text-masa-gray text-xs font-normal">{isArabic ? "(اختياري)" : "(optional)"}</span>
        </Label>
        <Input
          id="contact-phone"
          name="phone"
          type="tel"
          placeholder="+974 0000 0000"
          className="h-11 border-primary/20 focus-visible:ring-primary"
          autoComplete="tel"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-subject" className="text-masa-dark font-sans">
          {isArabic ? "الموضوع" : "Subject"} <span className="text-primary">*</span>
        </Label>
        <input type="hidden" name="subject" value={subject} readOnly aria-hidden />
        <Select value={subject || undefined} onValueChange={setSubject}>
          <SelectTrigger id="contact-subject" className="h-11 border-primary/20 focus:ring-2 focus:ring-primary">
            <SelectValue placeholder={isArabic ? "اختر الموضوع" : "Select a topic"} />
          </SelectTrigger>
          <SelectContent>
            {CONTACT_SUBJECT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {getContactSubjectLabelByLanguage(opt.value, isArabic ? "ar" : "en")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-masa-dark font-sans">
          {isArabic ? "الرسالة" : "Message"} <span className="text-primary">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          placeholder={isArabic ? "كيف يمكننا مساعدتك؟" : "How can we help you?"}
          rows={5}
          className="min-h-[120px] border-primary/20 focus-visible:ring-primary resize-y"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 font-sans" role="alert">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 font-sans px-8 h-11 focus-visible:ring-primary"
      >
        {status === "loading" ? (isArabic ? "جارٍ الإرسال…" : "Sending…") : (isArabic ? "إرسال الرسالة" : "Send Message")}
      </Button>
    </form>
  );
}
