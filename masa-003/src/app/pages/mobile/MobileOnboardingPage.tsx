import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";

export function MobileOnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#531C24] to-[#8B3940] text-white px-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white flex items-center justify-center mb-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L2 7 L12 12 L22 7 L12 2Z" fill="#E7D8C3"/>
            <path d="M12 12 L2 7 L2 17 L12 22 L12 12Z" fill="#D4AF37"/>
            <path d="M12 12 L22 7 L22 17 L12 22 L12 12Z" fill="#531C24"/>
          </svg>
        </div>

        <h1 className="text-5xl mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
          MASA
        </h1>
        <p className="text-2xl mb-2" style={{ fontFamily: 'var(--font-arabic)' }}>
          ماسا
        </p>
        <p className="text-lg text-[#E7D8C3] mb-12 max-w-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          Your Premium Digital Marketplace for Luxury Jewelry
        </p>

        <div className="w-full max-w-sm space-y-4">
          <Link to="/mobile/login" className="block">
            <Button className="w-full h-12 bg-white text-[#531C24] hover:bg-[#E7D8C3]">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/mobile/home" className="block">
            <Button variant="outline" className="w-full h-12 border-white text-white hover:bg-white/10">
              Browse as Guest
            </Button>
          </Link>
        </div>
      </div>

      <div className="pb-8 text-center text-sm text-[#E7D8C3]">
        <p>© 2024 MASA. All rights reserved.</p>
      </div>
    </div>
  );
}
