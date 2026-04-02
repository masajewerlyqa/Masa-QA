/**
 * Transactional HTML mail for MASA (burgundy #531c24, cream #f7f3ee).
 * Customer-facing bodies follow `language` (en | ar).
 */

import type { Language } from "@/lib/language";
import { formatPrice, USD_TO_QAR } from "@/lib/currency";
import type { SellerPlanId } from "@/lib/seller-plans";
import { getSellerPlanEmailSummaryLines } from "@/lib/seller-plans";
import { formatOrderDisplayRef } from "@/lib/order-display";
import { getSiteUrl } from "./config";
import { resolveEmailLanguage } from "./email-language";

const BRAND = {
  primary: "#531c24",
  light: "#f7f3ee",
  muted: "#8f8f8f",
  dark: "#1a1a1a",
};

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(inner: string, preheader: string | undefined, lang: Language): string {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const htmlLang = lang === "ar" ? "ar" : "en";
  const contentFont =
    lang === "ar"
      ? "font-family: Tahoma, 'Segoe UI', 'Arial Unicode MS', sans-serif"
      : "font-family: system-ui, -apple-system, sans-serif";
  const footerLine =
    lang === "ar" ? "سوق المجوهرات الفاخرة · قطر" : "Luxury jewelry marketplace · Qatar";
  return `<!DOCTYPE html>
<html lang="${htmlLang}" dir="${dir}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>MASA</title></head>
<body style="margin:0;background:${BRAND.light};font-family:Georgia,'Times New Roman',serif;color:${BRAND.dark};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.light};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;border:1px solid rgba(83,28,36,0.12);background:#fff;border-radius:4px;">
        <tr><td style="padding:28px 28px 8px;font-size:20px;letter-spacing:0.06em;color:${BRAND.primary};">MASA</td></tr>
        <tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.65;${contentFont};color:${BRAND.dark};">
          ${inner}
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid rgba(83,28,36,0.08);font-size:12px;color:${BRAND.muted};${contentFont};">
          ${footerLine}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailHtml(name: string | null, language: unknown = "en"): string {
  const lang = resolveEmailLanguage(language);
  if (lang === "ar") {
    const greeting = name ? `مرحباً ${name}،` : "مرحباً،";
    return wrap(
      `<p>${greeting}</p>
    <p>نرحب بك في <strong style="color:${BRAND.primary};">MASA</strong> — سوق المجوهرات الفاخرة في قطر لعشاق الجمال والأناقة اليومية.</p>
    <p>تسوّق من بائعين موثّقين، مع دفع آمن وقطع منتقاة بعناية.</p>
    <p style="margin-top:20px;font-size:14px;">يسعدنا انضمامك إلينا.</p>
    <p style="margin-top:20px;color:${BRAND.muted};font-size:13px;">لأمان حسابك، قد ندعوك لاحقاً إلى توثيق رقم هاتفك.</p>`,
      "مرحباً بك في MASA",
      lang
    );
  }
  const greeting = name ? `Dear ${name},` : "Hello,";
  return wrap(
    `<p>${greeting}</p>
    <p>Welcome to <strong style="color:${BRAND.primary};">MASA</strong> — Qatar’s luxury jewelry marketplace for discerning collectors and everyday elegance.</p>
    <p>Browse verified sellers, secure checkout, and pieces curated with care.</p>
    <p style="margin-top:20px;font-size:14px;">We’re glad you’re here.</p>
    <p style="margin-top:20px;color:${BRAND.muted};font-size:13px;">For your security, we may invite you to verify your phone number in the future.</p>`,
    "Welcome to MASA — luxury jewelry, with confidence",
    lang
  );
}

export function orderConfirmationHtml(
  orderId: string,
  orderNumber: string | null,
  /** Order total in USD (same as database). */
  totalUsd: number,
  language: unknown = "en"
): string {
  const lang = resolveEmailLanguage(language);
  const base = getSiteUrl();
  const ref = formatOrderDisplayRef({ id: orderId, order_number: orderNumber });
  const usd = formatPrice(totalUsd, "USD");
  const qar = formatPrice(totalUsd, "QAR", { language: lang });
  if (lang === "ar") {
    return wrap(
      `<p>شكراً لطلبك.</p>
    <p>تم استلام طلبك رقم <strong>${ref}</strong>.</p>
    <p>الإجمالي: <strong>${usd}</strong> · <strong>${qar}</strong></p>
    <p style="font-size:13px;color:${BRAND.muted};">سعر التحويل المعروض: 1 دولار أمريكي = ${USD_TO_QAR} ريال قطري.</p>
    <p>سنُعلمك عند كل خطوة — التأكيد، التجهيز، والتوصيل.</p>
    <p style="margin-top:20px;"><a href="${base}/account/orders/${orderId}" style="color:${BRAND.primary};">عرض الطلب</a></p>`,
      "تأكيد الطلب",
      lang
    );
  }
  return wrap(
    `<p>Thank you for your order.</p>
    <p>Your order <strong>${ref}</strong> has been received.</p>
    <p>Total: <strong>${usd}</strong> · <strong>${qar}</strong></p>
    <p style="font-size:13px;color:${BRAND.muted};">Conversion shown at 1 USD = ${USD_TO_QAR} QAR.</p>
    <p>We’ll notify you at each step — confirmation, processing, and delivery.</p>
    <p style="margin-top:20px;"><a href="${base}/account/orders/${orderId}" style="color:${BRAND.primary};">View order</a></p>`,
    "Order confirmation",
    lang
  );
}

export function orderStatusUpdateHtml(
  orderId: string,
  orderNumber: string | null,
  statusLabel: string,
  customerName: string | null,
  language: unknown = "en",
  cancellationReason?: string | null
): string {
  const lang = resolveEmailLanguage(language);
  const base = getSiteUrl();
  const ref = formatOrderDisplayRef({ id: orderId, order_number: orderNumber });
  const reason = cancellationReason?.trim();
  const reasonBlockAr = reason
    ? `<p style="margin-top:14px;padding:14px;background:${BRAND.light};border-radius:6px;font-size:14px;line-height:1.5;">
    <strong>سبب الإلغاء من البائع:</strong><br/>
    ${escapeHtmlText(reason).replace(/\n/g, "<br/>")}
    </p>`
    : "";
  const reasonBlockEn = reason
    ? `<p style="margin-top:14px;padding:14px;background:${BRAND.light};border-radius:6px;font-size:14px;line-height:1.5;">
    <strong>Message from the seller:</strong><br/>
    ${escapeHtmlText(reason).replace(/\n/g, "<br/>")}
    </p>`
    : "";
  if (lang === "ar") {
    const greeting = customerName ? `مرحباً ${customerName}،` : "مرحباً،";
    return wrap(
      `<p>${greeting}</p>
    <p>طلبك <strong>${ref}</strong> أصبح الآن: <strong style="color:${BRAND.primary};">${statusLabel}</strong>.</p>
    ${reasonBlockAr}
    <p style="margin-top:20px;"><a href="${base}/account/orders/${orderId}" style="color:${BRAND.primary};">تفاصيل الطلب</a></p>`,
      `تحديث الطلب: ${statusLabel}`,
      lang
    );
  }
  const greeting = customerName ? `Dear ${customerName},` : "Hello,";
  return wrap(
    `<p>${greeting}</p>
    <p>Your order <strong>${ref}</strong> is now: <strong style="color:${BRAND.primary};">${statusLabel}</strong>.</p>
    ${reasonBlockEn}
    <p style="margin-top:20px;"><a href="${base}/account/orders/${orderId}" style="color:${BRAND.primary};">View order details</a></p>`,
    `Order update: ${statusLabel}`,
    lang
  );
}

export function accountSecurityNoticeHtml(message: string, language: unknown = "en"): string {
  const lang = resolveEmailLanguage(language);
  if (lang === "ar") {
    return wrap(
      `<p>هذا إشعار أمني لحسابك على MASA.</p>
    <p>${message}</p>
    <p style="margin-top:16px;color:${BRAND.muted};font-size:13px;">إذا لم تقم بهذا الإجراء، يُرجى تأمين حسابك والتواصل مع الدعم.</p>`,
      "تنبيه أمني للحساب",
      lang
    );
  }
  return wrap(
    `<p>This is a security notification for your MASA account.</p>
    <p>${message}</p>
    <p style="margin-top:16px;color:${BRAND.muted};font-size:13px;">If you did not perform this action, please secure your account and contact support.</p>`,
    "Account security",
    lang
  );
}

export function newsletterSubscriptionConfirmationHtml(language: unknown = "en"): string {
  const lang = resolveEmailLanguage(language);
  const base = getSiteUrl();
  if (lang === "ar") {
    return wrap(
      `<p>شكراً لاشتراكك في النشرة الإخبارية لـ <strong style="color:${BRAND.primary};">MASA</strong>.</p>
    <p>ستصلك أخبار أحدث القطع واتجاهات الفخامة وعروض مختارة.</p>
    <p style="margin-top:20px;"><a href="${base}" style="color:${BRAND.primary};">زيارة MASA</a></p>`,
      "أنت مشترك في تحديثات MASA",
      lang
    );
  }
  return wrap(
    `<p>Thank you for subscribing to the <strong style="color:${BRAND.primary};">MASA</strong> newsletter.</p>
    <p>You will receive updates on new arrivals, luxury trends, and selected offers.</p>
    <p style="margin-top:20px;"><a href="${base}" style="color:${BRAND.primary};">Visit MASA</a></p>`,
    "You are subscribed to MASA updates",
    lang
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultilineForEmail(s: string): string {
  return escapeHtml(s).replace(/\r\n/g, "\n").split("\n").join("<br/>");
}

export function sellerApplicationReceivedHtml(
  planId: SellerPlanId,
  contactName: string | null,
  language: unknown = "en"
): string {
  const lang = resolveEmailLanguage(language);
  const safeName = escapeHtmlText((contactName ?? "").trim() || (lang === "ar" ? "صديقنا البائع" : "there"));
  const lines = getSellerPlanEmailSummaryLines(planId, lang);
  const planDetailsHtml = lines
    .map((line) => `<p style="margin:6px 0;font-size:14px;line-height:1.55;">${escapeHtmlText(line)}</p>`)
    .join("");
  if (lang === "ar") {
    return wrap(
      `<p style="margin:0 0 16px;">مرحباً ${safeName}،</p>
    <p style="margin:0 0 16px;">شكراً لتقديمك طلب الانضمام كبائع على <strong style="color:${BRAND.primary};">MASA</strong>. لقد استلمنا طلبك بنجاح.</p>
    <p style="margin:0 0 12px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">ملخص الخطة المختارة</p>
    <div style="margin:0 0 20px;padding:16px 18px;background:${BRAND.light};border-radius:6px;border:1px solid rgba(83,28,36,0.08);">
      ${planDetailsHtml}
    </div>
    <p style="margin:0 0 12px;">يراجع فريق MASA طلبك حالياً. ستصلك رسالة بريد إلكتروني أخرى عند الموافقة على حسابك وخطواتك التالية.</p>
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">هذه رسالة تأكيد تلقائية — لا يلزم الرد عليها.</p>`,
      "تم استلام طلب البائع",
      lang
    );
  }
  return wrap(
    `<p style="margin:0 0 16px;">Dear ${safeName},</p>
    <p style="margin:0 0 16px;">Thank you for applying to sell on <strong style="color:${BRAND.primary};">MASA</strong>. We have received your seller application.</p>
    <p style="margin:0 0 12px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">Your selected plan</p>
    <div style="margin:0 0 20px;padding:16px 18px;background:${BRAND.light};border-radius:6px;border:1px solid rgba(83,28,36,0.08);">
      ${planDetailsHtml}
    </div>
    <p style="margin:0 0 12px;">Your application is now under review by the MASA team. You will receive another email once your account has been approved and with your next steps.</p>
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">This is an automated confirmation — no reply is required.</p>`,
    "Seller application received",
    lang
  );
}

export function contactUserAcknowledgmentHtml(fullName: string, language: unknown = "en"): string {
  const lang = resolveEmailLanguage(language);
  const safe = escapeHtml(fullName.trim() || (lang === "ar" ? "ضيفنا" : "there"));
  if (lang === "ar") {
    return wrap(
      `<p>مرحباً ${safe}،</p>
    <p>لقد استلمنا رسالتك — شكراً لتواصلك مع <strong style="color:${BRAND.primary};">MASA</strong>.</p>
    <p>سيراجعها فريقنا ويعود إليك قريباً.</p>`,
      "تم استلام رسالتك — MASA",
      lang
    );
  }
  return wrap(
    `<p>Dear ${safe},</p>
    <p>We received your message — thank you for reaching out to <strong style="color:${BRAND.primary};">MASA</strong>.</p>
    <p>Our team will review it and get back to you soon.</p>`,
    "We received your message — MASA",
    lang
  );
}

/** Internal support inbox copy (operators); English only. */
export function contactSupportNotificationHtml(fields: {
  fullName: string;
  email: string;
  phone: string | null;
  subjectLabel: string;
  message: string;
}): string {
  const phoneDisplay = fields.phone ? escapeHtml(fields.phone) : "—";
  return wrap(
    `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.muted};">A new message was submitted through the MASA contact form.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:1.6;font-family:system-ui,-apple-system,sans-serif;">
      <tr><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);color:${BRAND.muted};width:120px;vertical-align:top;">Full name</td><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);">${escapeHtml(fields.fullName.trim())}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);color:${BRAND.muted};vertical-align:top;">Email</td><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);">${escapeHtml(fields.email.trim())}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);color:${BRAND.muted};vertical-align:top;">Phone</td><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);">${phoneDisplay}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);color:${BRAND.muted};vertical-align:top;">Subject</td><td style="padding:6px 0;border-bottom:1px solid rgba(83,28,36,0.08);">${escapeHtml(fields.subjectLabel)}</td></tr>
    </table>
    <p style="margin:16px 0 6px;font-size:13px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">Message</p>
    <p style="margin:0;font-size:15px;line-height:1.65;">${formatMultilineForEmail(fields.message)}</p>
    <p style="margin:20px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.5;">Use <strong>Reply</strong> in your email app to respond directly to the address above.</p>`,
    "New contact message",
    "en"
  );
}
