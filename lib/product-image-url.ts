/**
 * Product photos stored in Supabase public buckets should load at original quality.
 * Next.js image optimization re-encodes (AVIF/WebP), which can look soft on fine jewelry detail.
 */
export function isSupabaseStoragePublicUrl(src: string): boolean {
  if (!src || src.startsWith("data:")) return false;
  try {
    const u = new URL(src);
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".supabase.co") &&
      u.pathname.includes("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}
