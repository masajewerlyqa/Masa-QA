# MASA – ماسا
## Premium Digital Jewelry Marketplace Platform

---

## 🎨 BRAND IDENTITY

**MASA** is a luxury jewelry marketplace connecting premium brands, boutique stores, and discerning customers worldwide.

### Visual Inspiration
- Cartier
- Tiffany & Co
- Farfetch
- Net-a-Porter

### Design Principles
- Luxury minimalism
- Premium spacing
- Large product imagery
- Elegant typography
- Soft shadows
- Gold accents
- Clean layouts
- High-end jewelry aesthetic

---

## 🎨 COLOR SYSTEM

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Burgundy | `#531C24` | Main brand color, buttons, headings |
| Champagne Beige | `#E7D8C3` | Secondary accents, backgrounds |
| Luxury Gold | `#D4AF37` | Premium highlights, badges |
| Dark Text | `#1A1A1A` | Primary text |
| Soft Gray | `#635C5C` | Secondary text |
| Light Background | `#F7F3EE` | Page backgrounds, cards |
| White | `#FFFFFF` | Pure white surfaces |

---

## 📝 TYPOGRAPHY

### Font Families

1. **Cinzel** (via Google Fonts)
   - Usage: Luxury headings, titles, brand name
   - Weights: 400, 500, 600, 700
   - CSS: `font-family: var(--font-luxury)`

2. **Almarai** (via Google Fonts)
   - Usage: Arabic typography
   - Weights: 300, 400, 700, 800
   - CSS: `font-family: var(--font-arabic)`

3. **Inter** (via Google Fonts)
   - Usage: UI text, body content
   - Weights: 300, 400, 500, 600, 700
   - CSS: `font-family: var(--font-ui)`

---

## 🧩 COMPONENT LIBRARY

### Core Components

1. **DiamondPattern** - Decorative luxury background pattern
2. **Navigation** - Main navigation with search, cart, wishlist
3. **Footer** - Complete footer with brand info and links
4. **ProductCard** - Reusable product display card
5. **CategoryCard** - Category showcase card

### UI Components (Shadcn)
- Buttons (Primary, Secondary, Outline, Ghost)
- Inputs & Forms
- Cards
- Badges
- Tables
- Tabs
- Sliders
- Dialogs
- Dropdowns
- And more...

---

## 📱 PAGES & ROUTES

### Public Pages
- **/** - Homepage (Hero, collections, trending)
- **/discover** - Curated collections
- **/marketplace** - Product grid with advanced filters
- **/product/:id** - Product details page
- **/store/:id** - Store/brand profile page
- **/cart** - Shopping cart
- **/checkout** - Secure checkout
- **/ai-advisor** - AI Jewelry Advisor

### Customer Pages
- **/account** - Customer profile & orders
- **/vault** - Digital jewelry vault & portfolio

### Seller Dashboard
- **/seller/dashboard** - Seller analytics & management
  - Dashboard overview
  - Product management
  - Order management
  - Analytics & reports

### Admin Dashboard
- **/admin/dashboard** - Platform management
  - Seller approval
  - Product oversight
  - User management
  - Transaction monitoring

### Mobile App
- **/mobile** - Onboarding screen
- **/mobile/login** - Mobile login
- **/mobile/home** - Mobile home screen

### Design System
- **/design-system** - Complete component showcase

---

## 🖥️ DESKTOP DESIGN (1440px)

### Layout Structure
- **Max Width**: 1440px
- **Padding**: 6 (1.5rem / 24px)
- **Grid Columns**: Typically 4 columns for products
- **Spacing**: gap-6 (1.5rem) or gap-8 (2rem)

### Key Features
- Sticky navigation with search
- Advanced filtering sidebar
- Large product imagery
- Premium spacing throughout
- Luxury hover effects
- Smooth transitions

---

## 📱 MOBILE DESIGN (390px)

### Layout Structure
- **Width**: 390px
- **Bottom Navigation**: Fixed bottom tab bar
  - Home
  - Search
  - Cart (with badge)
  - Wishlist
  - Profile

### Mobile Pages
1. **Onboarding** - Brand introduction
2. **Login/Register** - Authentication screens
3. **Home** - Mobile homepage with categories
4. **Product browsing** - Optimized for mobile

---

## 🎯 KEY FEATURES

### 1. Luxury Jewelry Marketplace
- Advanced product filtering
- Multiple category support
- Brand storefronts
- Product comparison

### 2. AI Jewelry Advisor
- Personalized recommendations
- Style preference learning
- Budget-based suggestions
- Occasion-specific guidance

### 3. Jewelry Vault
- Digital portfolio tracking
- Market value monitoring
- Certificate storage
- Investment analytics
- Appreciation tracking

### 4. Seller Dashboard
- Product inventory management
- Order processing
- Revenue analytics
- Customer insights
- Store customization

### 5. Admin Management
- Seller approval system
- Platform analytics
- User management
- Transaction oversight
- Product moderation

### 6. Advanced Filters
- Price range slider
- Metal type (18K Gold, Platinum, etc.)
- Gold karat (24K, 22K, 18K, 14K)
- Diamond grade (IF, VVS1, VVS2, VS1, VS2)
- Brand selection
- Category filtering

### 7. Additional Features
- Gift recommendations
- Ring size scanner
- AR jewelry try-on
- Gold price indicator
- Investment jewelry section
- Gold wallet

---

## 🌐 BILINGUAL SUPPORT

The platform supports both:
- **English** (Primary)
- **Arabic** (العربية) - Using Almarai font

Language switcher available in top navigation.

---

## 🎨 DESIGN PATTERNS

### Luxury Design Elements

1. **Diamond Pattern Background**
   - Subtle repeating pattern
   - Used in hero sections and premium cards
   - Opacity: 5% for subtlety

2. **Gradient Backgrounds**
   - `from-[#531C24] to-[#8B3940]` - Primary burgundy gradient
   - Used in premium sections and CTAs

3. **Card Shadows**
   - Soft shadows: `shadow-sm`
   - Premium shadows: `shadow-lg`
   - Hover effects: `hover:shadow-xl`

4. **Image Treatments**
   - `aspect-square` for product images
   - `object-cover` for proper scaling
   - Hover scale: `group-hover:scale-105`
   - Smooth transitions: `transition-transform duration-500`

5. **Typography Hierarchy**
   - Large luxury headings (Cinzel)
   - Clean UI text (Inter)
   - Arabic support (Almarai)

---

## 🔧 TECHNICAL STACK

### Core Technologies
- **React 18.3.1**
- **React Router 7.13.0** (Data Mode)
- **Tailwind CSS 4.1.12**
- **TypeScript**
- **Vite**

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Analytics charts
- **Motion** - Smooth animations

### Styling
- Tailwind CSS v4
- Custom theme tokens
- Google Fonts (Cinzel, Almarai, Inter)

---

## 📂 PROJECT STRUCTURE

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── DiamondPattern.tsx
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── CategoryCard.tsx
│   │
│   ├── layouts/
│   │   ├── RootLayout.tsx   # Desktop layout
│   │   └── MobileLayout.tsx  # Mobile layout
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── DiscoverPage.tsx
│   │   ├── MarketplacePage.tsx
│   │   ├── ProductDetailsPage.tsx
│   │   ├── StorePage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── CustomerAccountPage.tsx
│   │   ├── JewelryVaultPage.tsx
│   │   ├── AIAdvisorPage.tsx
│   │   ├── SellerDashboardPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── DesignSystemPage.tsx
│   │   └── mobile/
│   │       ├── MobileOnboardingPage.tsx
│   │       ├── MobileLoginPage.tsx
│   │       └── MobileHomePage.tsx
│   │
│   ├── App.tsx
│   └── routes.tsx
│
└── styles/
    ├── fonts.css            # Font imports
    ├── theme.css            # Color tokens
    ├── tailwind.css         # Tailwind directives
    └── index.css            # Global styles
```

---

## 🚀 GETTING STARTED

### View the Platform
1. Open the application
2. Navigate to **/** for the homepage
3. Explore all features through the navigation

### Explore Routes
- Browse to **/marketplace** for product browsing
- Visit **/ai-advisor** for AI recommendations
- Check **/vault** for jewelry portfolio
- View **/seller/dashboard** for seller interface
- Access **/admin/dashboard** for admin panel
- See **/design-system** for component library

### Mobile Experience
- Navigate to **/mobile** for onboarding
- Visit **/mobile/home** for mobile interface

---

## 🎨 USING THE DESIGN SYSTEM

### Access the Design System
Navigate to **/design-system** to view:
- Complete color palette
- Typography showcase
- Button variants
- Badge styles
- Input components
- Card variants
- Icon library
- Spacing guidelines

### Using Components

```tsx
// Import components
import { ProductCard } from '../components/ProductCard';
import { DiamondPattern } from '../components/DiamondPattern';

// Use luxury fonts
<h1 style={{ fontFamily: 'var(--font-luxury)' }}>MASA</h1>
<p style={{ fontFamily: 'var(--font-arabic)' }}>ماسا</p>
<p style={{ fontFamily: 'var(--font-ui)' }}>Body text</p>

// Use color classes
className="bg-[#531C24] text-white"
className="text-[#635C5C]"
className="bg-[#F7F3EE]"
```

---

## 🌟 BRAND HIGHLIGHTS

### MASA Logo
The diamond logo represents:
- **Top facet**: Excellence and quality
- **Left side**: Heritage and tradition  
- **Right side**: Innovation and future
- **Colors**: Champagne, Gold, Burgundy

### Tagline
"Your Premium Digital Marketplace for Luxury Jewelry"
"سوقك الرقمي الفاخر للمجوهرات الفاخرة"

---

## 📊 ANALYTICS & DASHBOARDS

### Seller Dashboard Features
- Revenue trend charts
- Sales by category
- Product inventory table
- Recent orders
- Performance metrics

### Admin Dashboard Features
- Platform growth tracking
- User acquisition metrics
- Seller approval queue
- Transaction monitoring
- Category distribution

---

## 💎 LUXURY FEATURES

1. **Gold Price Ticker** - Real-time gold price display
2. **Certificate Storage** - GIA certificate management
3. **Investment Tracking** - Portfolio appreciation
4. **AI Recommendations** - Personalized suggestions
5. **AR Try-On** - Virtual jewelry preview
6. **Ring Sizer** - Digital size measurement

---

## 🎯 USER FLOWS

### Shopping Flow
1. Browse marketplace or discover page
2. Filter by preferences
3. View product details
4. Add to cart or wishlist
5. Proceed to checkout
6. Complete secure payment

### AI Advisor Flow
1. Access AI Advisor
2. Set preferences (budget, occasion, style)
3. Chat with AI for recommendations
4. View personalized suggestions
5. Add recommended items to cart

### Vault Flow
1. Access Jewelry Vault
2. Add purchased items
3. Track market value
4. View appreciation
5. Access certificates
6. Monitor investment

---

## 🔐 SECURITY FEATURES

- Secure checkout process
- Certificate verification
- Encrypted data storage
- Seller authentication
- Admin approval system

---

## ✨ CONCLUSION

MASA is a complete, world-class luxury jewelry marketplace platform featuring:

✅ **Complete Design System**
✅ **Bilingual Support** (EN/AR)
✅ **Responsive Design** (Desktop 1440px + Mobile 390px)
✅ **13+ Full Pages**
✅ **Seller & Admin Dashboards**
✅ **AI-Powered Features**
✅ **Digital Vault System**
✅ **Premium UI Components**
✅ **Luxury Brand Aesthetics**

Built with modern technologies and designed to provide an exceptional luxury jewelry shopping experience.

---

**MASA – ماسا**
*Timeless Elegance in Every Piece*
