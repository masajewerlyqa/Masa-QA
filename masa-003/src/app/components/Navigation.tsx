import { Link } from "react-router";
import { Search, ShoppingCart, Heart, User, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#531C24]/10">
      {/* Top Bar */}
      <div className="bg-[#531C24] text-white py-2 px-6">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          <div className="flex items-center gap-6">
            <span>Free delivery on orders over $500</span>
            <span className="text-[#E7D8C3]">|</span>
            <span>Gold Price: $1,945/oz</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-[#E7D8C3] transition-colors">العربية</button>
            <span className="text-[#E7D8C3]">|</span>
            <button className="hover:text-[#E7D8C3] transition-colors">EN</button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-6 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#531C24] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2 L2 7 L12 12 L22 7 L12 2Z" fill="#E7D8C3"/>
                <path d="M12 12 L2 7 L2 17 L12 22 L12 12Z" fill="#D4AF37"/>
                <path d="M12 12 L22 7 L22 17 L12 22 L12 12Z" fill="#FFFFFF"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl tracking-wider" style={{ fontFamily: 'var(--font-luxury)' }}>
                <span className="text-[#531C24]">MASA</span>
              </div>
              <div className="text-sm tracking-widest" style={{ fontFamily: 'var(--font-arabic)' }}>
                <span className="text-[#8F8F8F]">ماسا</span>
              </div>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F8F8F]" />
            <Input
              placeholder="Search for jewelry, brands, or collections..."
              className="pl-10 bg-[#F7F3EE] border-none"
              style={{ fontFamily: 'var(--font-ui)' }}
            />
          </div>

          {/* Main Links */}
          <div className="flex items-center gap-6" style={{ fontFamily: 'var(--font-ui)' }}>
            <Link to="/discover" className="text-sm hover:text-[#531C24] transition-colors">
              Discover
            </Link>
            <Link to="/marketplace" className="text-sm hover:text-[#531C24] transition-colors">
              Marketplace
            </Link>
            <Link to="/vault" className="text-sm hover:text-[#531C24] transition-colors">
              Vault
            </Link>
            <Link to="/ai-advisor" className="text-sm hover:text-[#531C24] transition-colors">
              AI Advisor
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#531C24]">
                3
              </Badge>
            </Button>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#531C24]">
                  2
                </Badge>
              </Button>
            </Link>
            <Link to="/account">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
