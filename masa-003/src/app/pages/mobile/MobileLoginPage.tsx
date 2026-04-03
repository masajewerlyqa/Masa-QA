import { Mail, Lock } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function MobileLoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white px-6 py-8">
      <div className="flex items-center justify-center mb-12">
        <div className="w-12 h-12 bg-[#531C24] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L2 7 L12 12 L22 7 L12 2Z" fill="#E7D8C3"/>
            <path d="M12 12 L2 7 L2 17 L12 22 L12 12Z" fill="#D4AF37"/>
            <path d="M12 12 L22 7 L22 17 L12 22 L12 12Z" fill="#FFFFFF"/>
          </svg>
        </div>
      </div>

      <h1 className="text-3xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
        Welcome Back
      </h1>
      <p className="text-[#635C5C] mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
        Sign in to continue
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#635C5C]" />
            <Input
              type="email"
              placeholder="your@email.com"
              className="pl-10 bg-[#F7F3EE] border-none h-12"
            />
          </div>
        </div>

        <div>
          <Label>Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#635C5C]" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-10 bg-[#F7F3EE] border-none h-12"
            />
          </div>
        </div>

        <div className="text-right">
          <a href="#" className="text-sm text-[#531C24]">Forgot Password?</a>
        </div>
      </div>

      <Link to="/mobile/home">
        <Button className="w-full h-12 bg-[#531C24] hover:bg-[#531C24]/90 mb-4">
          Sign In
        </Button>
      </Link>

      <div className="text-center text-sm text-[#635C5C]">
        Don't have an account?{" "}
        <a href="#" className="text-[#531C24]">Sign Up</a>
      </div>
    </div>
  );
}
