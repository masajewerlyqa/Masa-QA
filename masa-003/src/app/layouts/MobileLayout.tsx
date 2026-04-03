import { Outlet } from "react-router";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { Link } from "react-router";

export function MobileLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white w-[390px] mx-auto">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-[#531C24]/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/mobile/home" className="flex flex-col items-center gap-1">
            <Home className="w-5 h-5 text-[#531C24]" />
            <span className="text-xs text-[#531C24]" style={{ fontFamily: 'var(--font-ui)' }}>Home</span>
          </Link>
          <Link to="/mobile/search" className="flex flex-col items-center gap-1">
            <Search className="w-5 h-5 text-[#635C5C]" />
            <span className="text-xs text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>Search</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-1 relative">
            <ShoppingCart className="w-5 h-5 text-[#635C5C]" />
            <span className="text-xs text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>Cart</span>
            <div className="absolute -top-1 right-2 w-4 h-4 bg-[#531C24] rounded-full flex items-center justify-center text-[10px] text-white">
              2
            </div>
          </Link>
          <Link to="/mobile/wishlist" className="flex flex-col items-center gap-1">
            <Heart className="w-5 h-5 text-[#635C5C]" />
            <span className="text-xs text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>Wishlist</span>
          </Link>
          <Link to="/account" className="flex flex-col items-center gap-1">
            <User className="w-5 h-5 text-[#635C5C]" />
            <span className="text-xs text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
