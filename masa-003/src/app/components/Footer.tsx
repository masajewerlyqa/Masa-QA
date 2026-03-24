import { Link } from "react-router";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { DiamondPattern } from "./DiamondPattern";

export function Footer() {
  return (
    <footer className="relative bg-[#531C24] text-white mt-24">
      <DiamondPattern className="opacity-10" />
      
      <div className="relative max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2 L2 7 L12 12 L22 7 L12 2Z" fill="#E7D8C3"/>
                  <path d="M12 12 L2 7 L2 17 L12 22 L12 12Z" fill="#D4AF37"/>
                  <path d="M12 12 L22 7 L22 17 L12 22 L12 12Z" fill="#531C24"/>
                </svg>
              </div>
              <div>
                <div className="text-2xl tracking-wider" style={{ fontFamily: 'var(--font-luxury)' }}>
                  MASA
                </div>
                <div className="text-sm tracking-widest" style={{ fontFamily: 'var(--font-arabic)' }}>
                  ماسا
                </div>
              </div>
            </div>
            <p className="text-[#E7D8C3] leading-relaxed mb-6" style={{ fontFamily: 'var(--font-ui)' }}>
              A premium digital marketplace connecting luxury jewelry brands, boutique stores, and discerning customers worldwide.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div style={{ fontFamily: 'var(--font-ui)' }}>
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>Shop</h3>
            <ul className="space-y-3 text-[#E7D8C3]">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">All Jewelry</Link></li>
              <li><Link to="/marketplace?category=rings" className="hover:text-white transition-colors">Rings</Link></li>
              <li><Link to="/marketplace?category=necklaces" className="hover:text-white transition-colors">Necklaces</Link></li>
              <li><Link to="/marketplace?category=earrings" className="hover:text-white transition-colors">Earrings</Link></li>
              <li><Link to="/marketplace?category=bracelets" className="hover:text-white transition-colors">Bracelets</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div style={{ fontFamily: 'var(--font-ui)' }}>
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>Services</h3>
            <ul className="space-y-3 text-[#E7D8C3]">
              <li><Link to="/vault" className="hover:text-white transition-colors">Jewelry Vault</Link></li>
              <li><Link to="/ai-advisor" className="hover:text-white transition-colors">AI Advisor</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Investment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ring Sizer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AR Try-On</a></li>
            </ul>
          </div>

          {/* Support */}
          <div style={{ fontFamily: 'var(--font-ui)' }}>
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>Support</h3>
            <ul className="space-y-3 text-[#E7D8C3]">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex justify-between items-center text-sm text-[#E7D8C3]" style={{ fontFamily: 'var(--font-ui)' }}>
          <p>© 2024 MASA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <Link to="/design-system" className="hover:text-white transition-colors">Design System</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}