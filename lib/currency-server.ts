import { cookies } from "next/headers";
import { CURRENCY_STORAGE_KEY, type Currency } from "@/lib/currency";

export function getServerCurrency(): Currency {
  const cookieStore = cookies();
  const value = cookieStore.get(CURRENCY_STORAGE_KEY)?.value;
  return value === "USD" || value === "QAR" ? value : "USD";
}
