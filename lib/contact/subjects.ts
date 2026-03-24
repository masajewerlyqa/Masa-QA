/**
 * Contact form subject values — shared by UI and API validation.
 */

export const CONTACT_SUBJECT_VALUES = [
  "customer-support",
  "seller-partnership",
  "order-inquiry",
  "technical-issue",
  "business-collaboration",
] as const;

export type ContactSubjectValue = (typeof CONTACT_SUBJECT_VALUES)[number];

export const CONTACT_SUBJECT_OPTIONS: { value: ContactSubjectValue; label: string }[] = [
  { value: "customer-support", label: "Customer Support" },
  { value: "seller-partnership", label: "Seller Partnership" },
  { value: "order-inquiry", label: "Order Inquiry" },
  { value: "technical-issue", label: "Technical Issue" },
  { value: "business-collaboration", label: "Business Collaboration" },
];

const CONTACT_SUBJECT_LABELS_AR: Record<ContactSubjectValue, string> = {
  "customer-support": "دعم العملاء",
  "seller-partnership": "شراكة البائعين",
  "order-inquiry": "استفسار عن الطلب",
  "technical-issue": "مشكلة تقنية",
  "business-collaboration": "تعاون تجاري",
};

export function getContactSubjectLabel(value: string): string {
  return CONTACT_SUBJECT_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function getContactSubjectLabelByLanguage(
  value: string,
  language: "en" | "ar" = "en"
): string {
  if (language === "ar" && value in CONTACT_SUBJECT_LABELS_AR) {
    return CONTACT_SUBJECT_LABELS_AR[value as ContactSubjectValue];
  }
  return getContactSubjectLabel(value);
}
