import { z } from "zod";
import { parseTimeToMinutes } from "@/lib/store-availability";

/** Form payload: days 0–6, times "HH:mm". */
export const storeHoursFormSchema = z
  .object({
    working_days: z.array(z.number().int().min(0).max(6)).min(1, "Select at least one working day"),
    opening_time: z.string().min(1, "Opening time required"),
    closing_time: z.string().min(1, "Closing time required"),
    business_timezone: z.string().min(1).default("Asia/Qatar"),
  })
  .superRefine((data, ctx) => {
    const open = parseTimeToMinutes(data.opening_time);
    const close = parseTimeToMinutes(data.closing_time);
    if (open == null) {
      ctx.addIssue({ code: "custom", path: ["opening_time"], message: "Invalid opening time" });
    }
    if (close == null) {
      ctx.addIssue({ code: "custom", path: ["closing_time"], message: "Invalid closing time" });
    }
    if (open != null && close != null && close <= open) {
      ctx.addIssue({
        code: "custom",
        path: ["closing_time"],
        message: "Closing time must be after opening time",
      });
    }
  });

export type StoreHoursFormValues = z.infer<typeof storeHoursFormSchema>;
