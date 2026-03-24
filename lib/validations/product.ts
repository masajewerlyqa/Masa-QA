import { z } from "zod";

const PRODUCT_STATUSES = ["draft", "active", "archived", "out_of_stock"] as const;
const CATEGORIES = ["Ring", "Necklace", "Bracelet", "Earrings", "Pendant", "Anklet", "Other"] as const;

export const productFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  description: z.string().max(5000).optional().or(z.literal("")),
  category: z.enum(CATEGORIES, { message: "Category is required" }),
  price: z.coerce.number().min(0, "Price must be 0 or greater").finite(),
  metal_type: z.string().min(1, "Metal type is required").max(100),
  gold_karat: z.string().max(20).optional().or(z.literal("")),
  weight: z.coerce.number().min(0, "Weight must be 0 or greater").optional().nullable(),
  stock_quantity: z.coerce.number().int().min(0, "Stock must be 0 or greater"),
  status: z.enum(PRODUCT_STATUSES, { message: "Status is required" }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export { PRODUCT_STATUSES, CATEGORIES };
