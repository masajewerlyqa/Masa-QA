/**
 * Client-safe constants for market prices (no server-only, no scraper).
 * Import from here in `"use client"` components instead of `@/lib/market-prices`.
 */

import { USD_TO_QAR } from "@/lib/currency";

export const QAR_TO_USD = 1 / USD_TO_QAR;
