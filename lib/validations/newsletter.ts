import { z } from "zod";

export const newsletterSubscribeBodySchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(320),
  source: z.string().trim().max(100).optional(),
});

export type NewsletterSubscribeBody = z.infer<typeof newsletterSubscribeBodySchema>;
