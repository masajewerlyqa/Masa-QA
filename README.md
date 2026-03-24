# MASA – Luxury Jewelry Marketplace

Next.js 14 (App Router) frontend for the MASA luxury jewelry marketplace. Built from the Figma design with a clean, production-ready structure.

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** (Dialog, Select, Tabs, Label, Checkbox, Slider)
- **Recharts** (dashboard charts)
- **Lucide React** (icons)

## Brand

- **Primary:** `#531C24`
- **Secondary:** `#E7D8C3`
- **Fonts:** Cinzel (luxury), Inter (UI), Almarai (Arabic)

## Project structure

```
├── app/
│   ├── (site)/          # Public website (/, /discover, /product/[id], /store/[slug], /cart, /checkout, /login, /register)
│   ├── admin/           # Admin dashboard
│   └── seller/          # Seller dashboard
├── components/          # Reusable UI (Navbar, Footer, Hero, ProductCard, StoreCard, FilterSidebar, DashboardSidebar, DataTable, StatsCard, Modal, etc.)
├── lib/
│   ├── data/            # Sample data (products, stores, orders, cart, sellers)
│   └── utils.ts
└── BACKEND_INTEGRATION.md   # What is ready vs what needs API integration
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Next steps

See **BACKEND_INTEGRATION.md** for what is implemented with placeholder data and what still needs backend/API integration (auth, products, cart, orders, admin/seller APIs).
