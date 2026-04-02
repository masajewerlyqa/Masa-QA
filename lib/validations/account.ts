import { z } from "zod";

/** International-friendly phone: digits, spaces, +, min length after strip. */
export const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a valid phone number")
  .max(32)
  .regex(/^[\d\s+().-]+$/, "Use digits and an optional country code");

export const registerAccountSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: phoneSchema,
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .max(32)
    .refine((val) => val === "" || val.length >= 8, "Enter a valid phone number")
    .refine((val) => val === "" || /^[\d\s+().-]+$/.test(val), "Use digits and an optional country code"),
});

export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;

/** Customer email signup must include explicit Terms acceptance (mirrors DB trigger). */
export const registerCustomerTermsAcceptanceSchema = z.object({
  acceptTerms: z.boolean().refine((v) => v === true, { message: "terms_required" }),
});

/** Seller email signup must include explicit Merchant Terms acceptance (mirrors DB trigger). */
export const registerMerchantTermsAcceptanceSchema = z.object({
  acceptMerchantTerms: z.boolean().refine((v) => v === true, { message: "merchant_terms_required" }),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
