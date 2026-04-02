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
