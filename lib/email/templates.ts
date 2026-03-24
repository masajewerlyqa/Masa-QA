/**
 * Minimal HTML shells for MASA transactional mail (burgundy #531c24, cream #f7f3ee).
 */

import { getSiteUrl } from "./config";

const BRAND = {
  primary: "#531c24",
  light: "#f7f3ee",
  muted: "#8f8f8f",
  dark: "#1a1a1a",
};

function wrap(inner: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>MASA</title></head>
<body style="margin:0;background:${BRAND.light};font-family:Georgia,'Times New Roman',serif;color:${BRAND.dark};">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.light};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;border:1px solid rgba(83,28,36,0.12);background:#fff;border-radius:4px;">
        <tr><td style="padding:28px 28px 8px;font-size:20px;letter-spacing:0.06em;color:${BRAND.primary};">MASA</td></tr>
        <tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.6;font-family:system-ui,-apple-system,sans-serif;color:${BRAND.dark};">
          ${inner}
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid rgba(83,28,36,0.08);font-size:12px;color:${BRAND.muted};font-family:system-ui,sans-serif;">
          Luxury jewelry marketplace · Qatar
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmailHtml(name: string | null): string {
  const greeting = name ? `Dear ${name},` : "Hello,";
  return wrap(
    `<p>${greeting}</p>
    <p>Welcome to <strong style="color:${BRAND.primary};">MASA</strong> — Qatar’s luxury jewelry marketplace for discerning collectors and everyday elegance.</p>
    <p>Browse verified sellers, secure checkout, and pieces curated with care.</p>
    <p style="margin-top:20px;font-size:14px;">We’re glad you’re here.</p>
    <p style="margin-top:20px;color:${BRAND.muted};font-size:13px;">For your security, we may invite you to verify your phone number in the future.</p>`,
    "Welcome to MASA — luxury jewelry, with confidence"
  );
}

export function orderConfirmationHtml(orderId: string, total: string, currency = "QAR"): string {
  const base = getSiteUrl();
  return wrap(
    `<p>Thank you for your order.</p>
    <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been received.</p>
    <p>Total: <strong>${total} ${currency}</strong></p>
    <p>We’ll notify you as your order moves through each step — confirmation, processing, shipping, and delivery.</p>
    <p style="margin-top:20px;"><a href="${base}/account/orders/${orderId}" style="color:${BRAND.primary};">View order</a></p>`,
    "Order confirmation"
  );
}

export function orderStatusUpdateHtml(
  orderId: string,
  statusLabel: string,
  customerName: string | null
): string {
  const base = getSiteUrl();
  const greeting = customerName ? `Dear ${customerName},` : "Hello,";
  return wrap(
    `<p>${greeting}</p>
    <p>Your order <strong>#${orderId.slice(0, 8)}</strong> is now: <strong style="color:${BRAND.primary};">${statusLabel}</strong>.</p>
    <p style="margin-top:20px;"><a href="${base}/account/orders/${orderId}" style="color:${BRAND.primary};">View order details</a></p>`,
    `Order update: ${statusLabel}`
  );
}

export function accountSecurityNoticeHtml(message: string): string {
  return wrap(
    `<p>This is a security notification for your MASA account.</p>
    <p>${message}</p>
    <p style="margin-top:16px;color:${BRAND.muted};font-size:13px;">If you did not perform this action, please secure your account and contact support.</p>`,
    "Account security"
  );
}

export function newsletterSubscriptionConfirmationHtml(): string {
  const base = getSiteUrl();
  return wrap(
    `<p>Thank you for subscribing to the <strong style="color:${BRAND.primary};">MASA</strong> newsletter.</p>
    <p>You will receive updates on new arrivals, luxury trends, and selected offers.</p>
    <p style="margin-top:20px;"><a href="${base}" style="color:${BRAND.primary};">Visit MASA</a></p>`,
    "You are subscribed to MASA updates"
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

/** Visitor acknowledgment — From is always the verified MASA address, never the visitor. */
export function contactUserAcknowledgmentHtml(fullName: string): string {
  const safe = escapeHtml(fullName.trim() || "there");
  return wrap(
    `<p>Dear ${safe},</p>
    <p>We received your message — thank you for reaching out to <strong style="color:${BRAND.primary};">MASA</strong>.</p>
    <p>Our team will review it and get back to you soon.</p>`,
    "We received your message — MASA"
  );
}

/** Internal copy of the contact submission (support inbox). All user fields escaped. */
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
    "New contact message"
  );
}
