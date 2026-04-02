import "server-only";

import { sendEmailWithRetry, type SendEmailResult } from "./send-email";
import {
  welcomeEmailHtml,
  orderConfirmationHtml,
  orderStatusUpdateHtml,
  accountSecurityNoticeHtml,
  sellerApplicationReceivedHtml,
  sellerApplicationApprovedHtml,
} from "./templates";
import type { SellerPlanId } from "@/lib/seller-plans";
import { resolveEmailLanguage } from "./email-language";

export type { SendEmailResult };

export async function sendSellerApplicationReceivedEmail(
  to: string,
  planId: SellerPlanId,
  contactName: string | null,
  language: unknown = "en"
): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(language);
  return sendEmailWithRetry({
    to,
    subject: lang === "ar" ? "تم استلام طلب الانضمام كبائع — MASA" : "MASA Seller Application Received",
    html: sellerApplicationReceivedHtml(planId, contactName, lang),
    tags: [{ name: "category", value: "seller_application_received" }],
  });
}

/** After admin approves application — dashboard + availability links. */
export async function sendSellerApplicationApprovedEmail(
  to: string,
  contactName: string | null,
  storeDisplayName: string | null,
  language: unknown = "en"
): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(language);
  return sendEmailWithRetry({
    to,
    subject:
      lang === "ar" ? "تمت الموافقة — لوحة البائع جاهزة — MASA" : "You’re approved — open your MASA seller dashboard",
    html: sellerApplicationApprovedHtml(contactName, storeDisplayName, lang),
    tags: [{ name: "category", value: "seller_application_approved" }],
  });
}

export async function sendWelcomeEmail(
  to: string,
  fullName: string | null,
  language: unknown = "en"
): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(language);
  return sendEmailWithRetry({
    to,
    subject: lang === "ar" ? "مرحباً بك في MASA" : "Welcome to MASA",
    html: welcomeEmailHtml(fullName, lang),
    tags: [{ name: "category", value: "welcome" }],
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderId: string,
  orderNumber: string | null,
  /** Total in USD (matches `orders.total` in the database). */
  totalUsd: number,
  language: unknown = "en"
): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(language);
  return sendEmailWithRetry({
    to,
    subject: lang === "ar" ? "تم تأكيد طلبك — MASA" : "Your MASA order is confirmed",
    html: orderConfirmationHtml(orderId, orderNumber, totalUsd, lang),
    tags: [{ name: "category", value: "order_confirmation" }],
  });
}

export async function sendPasswordChangedNotice(to: string, language: unknown = "en"): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(language);
  const message =
    lang === "ar"
      ? "تم تغيير كلمة المرور بنجاح. إذا لم تقم بهذا التغيير، أعد تعيين كلمة المرور فوراً وتواصل مع الدعم."
      : "Your password was successfully changed. If you did not make this change, reset your password and contact support immediately.";
  return sendEmailWithRetry({
    to,
    subject: lang === "ar" ? "تم تحديث كلمة مرور حسابك — MASA" : "Your MASA password was updated",
    html: accountSecurityNoticeHtml(message, lang),
    tags: [{ name: "category", value: "security" }],
  });
}

export async function sendOrderStatusEmailWithRetry(
  to: string,
  orderId: string,
  orderNumber: string | null,
  statusLabel: string,
  customerName: string | null,
  language: unknown = "en",
  cancellationReason?: string | null
): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(language);
  return sendEmailWithRetry({
    to,
    subject:
      lang === "ar"
        ? `تحديث الطلب: ${statusLabel} — MASA`
        : `Order update: ${statusLabel} — MASA`,
    html: orderStatusUpdateHtml(orderId, orderNumber, statusLabel, customerName, lang, cancellationReason),
    tags: [
      { name: "category", value: "order_status" },
      { name: "order_id", value: orderId },
    ],
  });
}
