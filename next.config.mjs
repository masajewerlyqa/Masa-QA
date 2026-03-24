/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // If CSS / _next/static/*.js return 404 in dev: (1) stop every `next dev`, (2) `npm run clean`,
  // (3) start once with `npm run dev` and open the exact URL shown (e.g. :3001 if :3000 is busy —
  // do not keep a tab on another port).
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
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
