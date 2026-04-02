/**
 * Lightweight structured logging for scraper (server-only).
 * Uses console with a prefix so Vercel / local logs stay searchable.
 */

const PREFIX = "[gold-scraper]";

export const goldScraperLog = {
  info(message: string, meta?: Record<string, unknown>) {
    if (meta && Object.keys(meta).length > 0) {
      console.info(PREFIX, message, JSON.stringify(meta));
    } else {
      console.info(PREFIX, message);
    }
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (meta && Object.keys(meta).length > 0) {
      console.warn(PREFIX, message, JSON.stringify(meta));
    } else {
      console.warn(PREFIX, message);
    }
  },
  error(message: string, meta?: Record<string, unknown>) {
    if (meta && Object.keys(meta).length > 0) {
      console.error(PREFIX, message, JSON.stringify(meta));
    } else {
      console.error(PREFIX, message);
    }
  },
};
