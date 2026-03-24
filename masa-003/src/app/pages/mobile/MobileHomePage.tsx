import { Bell, Search, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function MobileHomePage() {
  const featuredProducts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Diamond Ring",
      brand: "Cartier",
      price: "$12,500",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Gold Necklace",
      brand: "Tiffany & Co",
      price: "$8,900",
    },
  ];

  const categories = ["Rings", "Necklaces", "Earrings", "Bracelets"];

  return (
    <div className="bg-[#F7F3EE] min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              MASA
            </h1>
            <p className="text-xs text-[#8F8F8F]" style={{ fontFamily: 'var(--font-arabic)' }}>
              ماسا
            </p>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
          <Input
            placeholder="Search jewelry..."
            className="pl-10 bg-[#F7F3EE] border-none h-10"
          />
        </div>
      </div>

      {/* Gold Price */}
      <div className="bg-[#531C24] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Gold Price</span>
        </div>
        <span className="text-sm">$1,945/oz</span>
      </div>

      {/* Hero Banner */}
      <div className="relative h-48 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge className="mb-2 bg-[#D4AF37]">New Collection</Badge>
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-luxury)' }}>
            Spring 2026
          </h2>
          <p className="text-sm text-white/80">Timeless Elegance</p>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-6">
        <h3 className="text-lg mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Categories
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="h-20 border-[#531C24]/10 hover:bg-[#F7F3EE]"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            Featured
          </h3>
          <Button variant="ghost" size="sm" className="text-[#531C24]">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden flex gap-4 p-4"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg bg-[#F7F3EE]"
              />
              <div className="flex-1">
                <div className="text-xs text-[#8F8F8F] mb-1">{product.brand}</div>
                <h4 className="text-sm mb-2">{product.name}</h4>
                <div className="text-lg text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                  {product.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Advisor CTA */}
      <div className="mx-6 mb-6 bg-gradient-to-r from-[#531C24] to-[#8B3940] rounded-lg p-6 text-white">
        <Sparkles className="w-8 h-8 mb-3" />
        <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
          AI Jewelry Advisor
        </h3>
        <p className="text-sm text-[#E7D8C3] mb-4">
          Get personalized recommendations
        </p>
        <Button className="w-full bg-white text-[#531C24] hover:bg-[#E7D8C3]">
          Try Now
        </Button>
      </div>
    </div>
  );
}
