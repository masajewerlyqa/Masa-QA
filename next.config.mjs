/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  /**
   * Do not set `serverComponentsExternalPackages` for `tailwind-merge` / `clsx` here: pulling `cn()` from
   * `lib/utils` into the root layout client subtree (e.g. `<Toaster />` → `toast.tsx`) produced invalid
   * client chunks and React error "Element type is invalid … got: undefined" on every (site) route.
   */
  async redirects() {
    return [
      { source: "/shipping", destination: "/delivery", permanent: true },
      { source: "/shipping/", destination: "/delivery", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              // *.tile.openstreetmap.org serves the checkout map tiles; without it
              // Leaflet renders an empty grey box. unpkg.com is its marker icons.
              "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://*.googleusercontent.com https://unpkg.com https://*.tile.openstreetmap.org",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://goldapi.io https://api.gold-api.com https://api.resend.com",
              "frame-src https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  // Avoid forcing webpack `cache: { type: "memory" }` in dev — it can desync vendor chunks after
  // edits or package updates (missing ./vendor-chunks/*.js). Use Next’s default cache instead.
  // If CSS / _next/static/*.js return 404 in dev: stop dev, `npm run clean`, start again.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mddnkpitvzckqvgzobjo.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      /** Google OAuth profile photos (lh3, lh4, … are all under *.googleusercontent.com) */
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
