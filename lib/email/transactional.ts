import "server-only";

import { sendEmailWithRetry, type SendEmailResult } from "./send-email";
import {
  welcomeEmailHtml,
  orderConfirmationHtml,
  orderStatusUpdateHtml,
  accountSecurityNoticeHtml,
} from "./templates";

export type { SendEmailResult };

export async function sendWelcomeEmail(to: string, fullName: string | null): Promise<SendEmailResult> {
  return sendEmailWithRetry({
    to,
    subject: "Welcome to MASA",
    html: welcomeEmailHtml(fullName),
    tags: [{ name: "category", value: "welcome" }],
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderId: string,
  totalFormatted: string
): Promise<SendEmailResult> {
  return sendEmailWithRetry({
    to,
    subject: "Your MASA order is confirmed",
    html: orderConfirmationHtml(orderId, totalFormatted),
    tags: [{ name: "category", value: "order_confirmation" }],
  });
}

export async function sendPasswordChangedNotice(to: string): Promise<SendEmailResult> {
  return sendEmailWithRetry({
    to,
    subject: "Your MASA password was updated",
    html: accountSecurityNoticeHtml(
      "Your password was successfully changed. If you did not make this change, reset your password and contact support immediately."
    ),
    tags: [{ name: "category", value: "security" }],
  });
}

export async function sendOrderStatusEmailWithRetry(
  to: string,
  orderId: string,
  statusLabel: string,
  customerName: string | null
): Promise<SendEmailResult> {
  return sendEmailWithRetry({
    to,
    subject: `Order update: ${statusLabel} — MASA`,
    html: orderStatusUpdateHtml(orderId, statusLabel, customerName),
    tags: [
      { name: "category", value: "order_status" },
      { name: "order_id", value: orderId },
    ],
  });
}
