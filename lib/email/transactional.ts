import "server-only";

import { sendEmailWithRetry, type SendEmailResult } from "./send-email";
import {
  welcomeEmailHtml,
  orderConfirmationHtml,
  orderStatusUpdateHtml,
  accountSecurityNoticeHtml,
  sellerApplicationReceivedHtml,
  sellerApplicationApprovedHtml,
  sellerPaymentInstructionsHtml,
  sellerPaymentProofReceivedHtml,
  sellerPaymentRejectedHtml,
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
    subject: lang === "ar" ? "تم استلام طلب الانضمام كبائع — ماسا" : "MASA Seller Application Received",
    html: sellerApplicationReceivedHtml(planId, contactName, lang),
    tags: [{ name: "category", value: "seller_application_received" }],
  });
}

/** Bank-transfer instructions, sent as soon as an application is submitted. */
export async function sendSellerPaymentInstructionsEmail(args: {
  to: string;
  contactName: string | null;
  planId: SellerPlanId;
  amountQar: number;
  paymentReference: string;
  bank: {
    bankName: string;
    accountName: string;
    iban: string;
    accountNumber?: string | null;
  } | null;
  language?: unknown;
}): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(args.language ?? "en");
  return sendEmailWithRetry({
    to: args.to,
    subject:
      lang === "ar"
        ? "طلب الانضمام كبائع — تعليمات الدفع — ماسا"
        : "MASA Seller Application — Payment Instructions",
    html: sellerPaymentInstructionsHtml({ ...args, language: lang }),
    tags: [{ name: "category", value: "seller_payment_instructions" }],
  });
}

/** Confirms the proof landed and that review is pending. */
export async function sendSellerPaymentProofReceivedEmail(args: {
  to: string;
  amountQar: number | null;
  paymentReference: string | null;
  language?: unknown;
}): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(args.language ?? "en");
  return sendEmailWithRetry({
    to: args.to,
    subject:
      lang === "ar"
        ? "طلب الانضمام كبائع — تم استلام إثبات الدفع — ماسا"
        : "MASA Seller Application — Payment Proof Received",
    html: sellerPaymentProofReceivedHtml({ ...args, language: lang }),
    tags: [{ name: "category", value: "seller_payment_proof_received" }],
  });
}

/** Payment could not be verified; tells the seller what to correct. */
export async function sendSellerPaymentRejectedEmail(args: {
  to: string;
  contactName: string | null;
  reason: string;
  language?: unknown;
}): Promise<SendEmailResult> {
  const lang = resolveEmailLanguage(args.language ?? "en");
  return sendEmailWithRetry({
    to: args.to,
    subject:
      lang === "ar"
        ? "طلب الانضمام كبائع — مطلوب إجراء — ماسا"
        : "MASA Seller Application — Action Required",
    html: sellerPaymentRejectedHtml({ ...args, language: lang }),
    tags: [{ name: "category", value: "seller_payment_rejected" }],
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
      lang === "ar" ? "تمت الموافقة — لوحة البائع جاهزة — ماسا" : "You’re approved — open your MASA seller dashboard",
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
    subject: lang === "ar" ? "مرحباً بك في ماسا" : "Welcome to MASA",
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
    subject: lang === "ar" ? "تم تأكيد طلبك — ماسا" : "Your MASA order is confirmed",
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
    subject: lang === "ar" ? "تم تحديث كلمة مرور حسابك — ماسا" : "Your MASA password was updated",
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
        ? `تحديث الطلب: ${statusLabel} — ماسا`
        : `Order update: ${statusLabel} — MASA`,
    html: orderStatusUpdateHtml(orderId, orderNumber, statusLabel, customerName, lang, cancellationReason),
    tags: [
      { name: "category", value: "order_status" },
      { name: "order_id", value: orderId },
    ],
  });
}
