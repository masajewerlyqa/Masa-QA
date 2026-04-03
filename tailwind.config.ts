import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#531C24",
        secondary: "#E7D8C3",
        "masa-dark": "#1A1A1A",
        "masa-gray": "#635c5c",
        "masa-light": "#F7F3EE",
        "masa-gold": "#D4AF37",
        /** shadcn-style tokens used by Card, Badge, etc. — must exist or those utilities produce no CSS */
        background: "#ffffff",
        foreground: "#1A1A1A",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1A1A1A",
        },
        border: "rgba(83, 28, 36, 0.1)",
      },
      fontFamily: {
        /** Cinzel Decorative site-wide for English (body uses font-sans). */
        luxury: ["var(--font-cinzel)", "serif"],
        /** Arabic copy site-wide: Alilato (see `app/fonts/Alilato-Regular.woff2`), then IBM Plex as glyph fallback. */
        arabic: ["var(--font-alilato)", "var(--font-ibm-plex-arabic)", "sans-serif"],
        "arabic-luxury": ["var(--font-alilato)", "var(--font-ibm-plex-arabic)", "sans-serif"],
        sans: ["var(--font-cinzel)", "serif"],
      },
      maxWidth: {
        content: "1440px",
      },
      width: {
        content: "1440px",
      },
      keyframes: {
        "whatsapp-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(83, 28, 36, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(83, 28, 36, 0)" },
        },
      },
      animation: {
        "whatsapp-pulse": "whatsapp-pulse 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
