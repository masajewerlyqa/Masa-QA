import { Outlet } from "react-router";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-ui)' }}>
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
