import { Heart, ShoppingCart, User, Search, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DiamondPattern } from "../components/DiamondPattern";

export function DesignSystemPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-5xl mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          MASA Design System
        </h1>
        <p className="text-xl text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
          Luxury Jewelry Marketplace Components
        </p>
      </div>

      {/* Color Palette */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Color Palette
        </h2>
        <div className="grid grid-cols-5 gap-6">
          <div className="space-y-3">
            <div className="h-24 bg-[#531C24] rounded-lg"></div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              <div className="text-[#1A1A1A]">Primary Burgundy</div>
              <div className="text-[#635C5C] font-mono text-xs">#531C24</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-[#E7D8C3] rounded-lg border border-[#531C24]/10"></div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              <div className="text-[#1A1A1A]">Champagne Beige</div>
              <div className="text-[#635C5C] font-mono text-xs">#E7D8C3</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-[#D4AF37] rounded-lg"></div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              <div className="text-[#1A1A1A]">Luxury Gold</div>
              <div className="text-[#635C5C] font-mono text-xs">#D4AF37</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-[#635C5C] rounded-lg"></div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              <div className="text-[#1A1A1A]">Soft Gray</div>
              <div className="text-[#635C5C] font-mono text-xs">#635C5C</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-[#F7F3EE] rounded-lg border border-[#531C24]/10"></div>
            <div className="text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              <div className="text-[#1A1A1A]">Light Background</div>
              <div className="text-[#635C5C] font-mono text-xs">#F7F3EE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Typography
        </h2>
        <div className="space-y-6">
          <div>
            <div className="text-6xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              Cinzel Decorative
            </div>
            <p className="text-[#635C5C]">Luxury headings and titles</p>
          </div>
          <div>
            <div className="text-4xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-arabic)' }}>
              الخط العربي - Alilato
            </div>
            <p className="text-[#635C5C]">Arabic typography</p>
          </div>
          <div>
            <div className="text-2xl mb-2 text-[#1A1A1A]" style={{ fontFamily: 'var(--font-ui)' }}>
              Cinzel Decorative (UI)
            </div>
            <p className="text-[#635C5C]">Clean modern UI text</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-[#531C24] hover:bg-[#531C24]/90">Primary Button</Button>
          <Button variant="outline" className="border-[#531C24] text-[#531C24]">
            Secondary Button
          </Button>
          <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90">
            <Sparkles className="w-4 h-4 mr-2" />
            Gold Accent
          </Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button size="sm">Small Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge className="bg-[#531C24]">New Arrival</Badge>
          <Badge className="bg-[#D4AF37]">Featured</Badge>
          <Badge variant="outline">Certified</Badge>
          <Badge className="bg-green-600">In Stock</Badge>
          <Badge variant="secondary">Out of Stock</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Input Fields
        </h2>
        <div className="max-w-md space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#635C5C]" />
            <Input
              placeholder="Search for jewelry..."
              className="pl-10 bg-[#F7F3EE] border-none"
            />
          </div>
          <Input placeholder="Standard input" />
          <Input placeholder="Email address" type="email" />
        </div>
      </section>

      {/* Cards */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Cards
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Standard Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#635C5C]">Card content goes here</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-[#531C24] to-[#8B3940] text-white">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Premium Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#E7D8C3]">Gradient background card</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-[#F7F3EE]">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Light Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#635C5C]">Light background variant</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Icons */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Icons
        </h2>
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#F7F3EE] rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#531C24]" />
            </div>
            <span className="text-xs text-[#635C5C]">Wishlist</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#F7F3EE] rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#531C24]" />
            </div>
            <span className="text-xs text-[#635C5C]">Cart</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#F7F3EE] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-[#531C24]" />
            </div>
            <span className="text-xs text-[#635C5C]">Profile</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[#F7F3EE] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#531C24]" />
            </div>
            <span className="text-xs text-[#635C5C]">AI Advisor</span>
          </div>
        </div>
      </section>

      {/* Diamond Pattern */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Diamond Pattern
        </h2>
        <div className="relative h-48 bg-[#F7F3EE] rounded-lg overflow-hidden">
          <DiamondPattern />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-[#531C24] text-xl" style={{ fontFamily: 'var(--font-luxury)' }}>
              Decorative Background Pattern
            </p>
          </div>
        </div>
      </section>

      {/* Spacing System */}
      <section className="mb-16">
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Spacing & Layout
        </h2>
        <div className="space-y-4" style={{ fontFamily: 'var(--font-ui)' }}>
          <div className="flex items-center gap-4">
            <div className="w-32 text-[#635C5C]">Container:</div>
            <div className="text-[#1A1A1A]">max-w-[1440px] - Desktop width</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-[#635C5C]">Mobile:</div>
            <div className="text-[#1A1A1A]">w-[390px] - Mobile width</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-[#635C5C]">Padding:</div>
            <div className="text-[#1A1A1A]">px-6 py-12 - Standard section</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-[#635C5C]">Gap:</div>
            <div className="text-[#1A1A1A]">gap-6, gap-8, gap-12 - Premium spacing</div>
          </div>
        </div>
      </section>
    </div>
  );
}
