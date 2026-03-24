import { z } from "zod";

export const sellerApplicationFormSchema = z.object({
  brand_store_name: z.string().min(1, "Brand / store name is required").max(200),
  contact_full_name: z.string().min(1, "Contact person name is required").max(200),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().max(50).optional().or(z.literal("")),
  store_location: z.string().min(1, "Store location is required").max(500),
  store_description: z.string().max(2000).optional().or(z.literal("")),
  website: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  facebook: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  instagram: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
  linkedin: z.union([z.string().url("Enter a valid URL"), z.literal("")]).optional(),
});

export type SellerApplicationFormValues = z.infer<typeof sellerApplicationFormSchema>;

export function socialLinksFromForm(values: SellerApplicationFormValues): Record<string, string> | null {
  const links: Record<string, string> = {};
  if (values.website?.trim()) links.website = values.website.trim();
  if (values.facebook?.trim()) links.facebook = values.facebook.trim();
  if (values.instagram?.trim()) links.instagram = values.instagram.trim();
  if (values.linkedin?.trim()) links.linkedin = values.linkedin.trim();
  return Object.keys(links).length > 0 ? links : null;
}
