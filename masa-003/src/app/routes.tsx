import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { StorePage } from "./pages/StorePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CustomerAccountPage } from "./pages/CustomerAccountPage";
import { JewelryVaultPage } from "./pages/JewelryVaultPage";
import { AIAdvisorPage } from "./pages/AIAdvisorPage";
import { SellerDashboardPage } from "./pages/SellerDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { MobileOnboardingPage } from "./pages/mobile/MobileOnboardingPage";
import { MobileLoginPage } from "./pages/mobile/MobileLoginPage";
import { MobileHomePage } from "./pages/mobile/MobileHomePage";
import { RootLayout } from "./layouts/RootLayout";
import { MobileLayout } from "./layouts/MobileLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "discover", Component: DiscoverPage },
      { path: "marketplace", Component: MarketplacePage },
      { path: "product/:id", Component: ProductDetailsPage },
      { path: "store/:id", Component: StorePage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "account", Component: CustomerAccountPage },
      { path: "vault", Component: JewelryVaultPage },
      { path: "ai-advisor", Component: AIAdvisorPage },
      { path: "seller/dashboard", Component: SellerDashboardPage },
      { path: "admin/dashboard", Component: AdminDashboardPage },
      { path: "design-system", Component: DesignSystemPage },
    ],
  },
  {
    path: "/mobile",
    Component: MobileLayout,
    children: [
      { index: true, Component: MobileOnboardingPage },
      { path: "login", Component: MobileLoginPage },
      { path: "home", Component: MobileHomePage },
    ],
  },
]);