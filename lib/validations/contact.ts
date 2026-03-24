import { z } from "zod";
import { CONTACT_SUBJECT_VALUES } from "@/lib/contact/subjects";

export const contactFormBodySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z.string().trim().max(50).optional(),
  subject: z.enum(CONTACT_SUBJECT_VALUES, { message: "Select a subject" }),
  message: z.string().trim().min(1, "Message is required").max(10000),
});

export type ContactFormBody = z.infer<typeof contactFormBodySchema>;
