import { ArrowRight, TrendingUp, Award, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";
import { DiamondPattern } from "../components/DiamondPattern";
import { Badge } from "../components/ui/badge";

export function HomePage() {
  const featuredProducts = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Eternal Diamond Engagement Ring",
      brand: "Cartier",
      price: 12500,
      category: "Ring",
      metal: "18K White Gold",
      isNew: true,
      isFeatured: true,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Classic Gold Chain Necklace",
      brand: "Tiffany & Co",
      price: 8900,
      originalPrice: 10500,
      category: "Necklace",
      metal: "18K Yellow Gold",
      isFeatured: true,
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Diamond Drop Earrings",
      brand: "Bvlgari",
      price: 15200,
      category: "Earrings",
      metal: "Platinum",
      isNew: true,
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Luxury Tennis Bracelet",
      brand: "Harry Winston",
      price: 18700,
      category: "Bracelet",
      metal: "18K White Gold",
      isFeatured: true,
    },
  ];

  const trendingProducts = [
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1769857879388-df93b4c96bca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Pearl Statement Necklace",
      brand: "Mikimoto",
      price: 6800,
      category: "Necklace",
      metal: "18K Gold",
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1723328254549-24bb3deb4a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Diamond Luxury Watch",
      brand: "Rolex",
      price: 45000,
      originalPrice: 52000,
      category: "Watch",
      metal: "18K Gold",
    },
    {
      id: "7",
      image: "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Solitaire Diamond Ring",
      brand: "De Beers",
      price: 22000,
      category: "Ring",
      metal: "Platinum",
      isNew: true,
    },
    {
      id: "8",
      image: "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Gold Bangle Set",
      brand: "Van Cleef & Arpels",
      price: 9500,
      category: "Bracelet",
      metal: "22K Gold",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[700px] bg-[#F7F3EE] overflow-hidden">
        <DiamondPattern />
        
        <div className="relative max-w-[1440px] mx-auto px-6 h-full flex items-center">
          <div className="w-1/2 z-10">
            <Badge className="mb-4 bg-[#531C24] text-white">Spring Collection 2024</Badge>
            <h1 className="text-6xl mb-6 text-[#531C24] leading-tight" style={{ fontFamily: 'var(--font-luxury)' }}>
              Timeless Elegance
            </h1>
            <p className="text-xl text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-arabic)' }}>
              الأناقة الخالدة
            </p>
            <p className="text-lg text-[#8F8F8F] mb-8 leading-relaxed max-w-lg" style={{ fontFamily: 'var(--font-ui)' }}>
              Discover our curated collection of luxury jewelry from the world's most prestigious brands. Every piece tells a story of craftsmanship and beauty.
            </p>
            <div className="flex gap-4">
              <Link to="/marketplace">
                <Button size="lg" className="bg-[#531C24] hover:bg-[#531C24]/90 text-white px-8">
                  Explore Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/ai-advisor">
                <Button size="lg" variant="outline" className="border-[#531C24] text-[#531C24] hover:bg-[#F7F3EE]">
                  <Sparkles className="mr-2 w-5 h-5" />
                  AI Jewelry Advisor
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/2">
            <img
              src="https://images.unsplash.com/photo-1758995115682-1452a1a9e35b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Luxury Jewelry"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7F3EE] via-[#F7F3EE]/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-y border-[#531C24]/10">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-4 gap-8" style={{ fontFamily: 'var(--font-ui)' }}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F7F3EE] rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-[#531C24]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>Certified Authentic</h3>
              <p className="text-sm text-[#8F8F8F]">Every piece certified and authenticated</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F7F3EE] rounded-full flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-[#531C24]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>Premium Brands</h3>
              <p className="text-sm text-[#8F8F8F]">Curated from world's finest jewelers</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F7F3EE] rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#531C24]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>AI Advisor</h3>
              <p className="text-sm text-[#8F8F8F]">Personalized recommendations</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#F7F3EE] rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-[#531C24]" />
              </div>
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>Investment Value</h3>
              <p className="text-sm text-[#8F8F8F]">Track and grow your collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 max-w-[1440px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              Featured Collection
            </h2>
            <p className="text-lg text-[#8F8F8F]" style={{ fontFamily: 'var(--font-ui)' }}>
              Handpicked luxury pieces from renowned brands
            </p>
          </div>
          <Link to="/marketplace">
            <Button variant="outline" className="border-[#531C24] text-[#531C24]">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-[#F7F3EE]">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-4xl mb-12 text-center text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-4 gap-6">
            {["Rings", "Necklaces", "Earrings", "Bracelets"].map((category, idx) => (
              <Link
                key={category}
                to={`/marketplace?category=${category.toLowerCase()}`}
                className="group relative aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={featuredProducts[idx]?.image}
                  alt={category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl text-white mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
                    {category}
                  </h3>
                  <div className="text-sm text-white/80 flex items-center gap-2" style={{ fontFamily: 'var(--font-ui)' }}>
                    Explore Collection
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-20 max-w-[1440px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              Trending Now
            </h2>
            <p className="text-lg text-[#8F8F8F]" style={{ fontFamily: 'var(--font-ui)' }}>
              Most popular jewelry this season
            </p>
          </div>
          <Link to="/discover">
            <Button variant="outline" className="border-[#531C24] text-[#531C24]">
              Discover More
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Editorial Section */}
      <section className="relative py-32 bg-[#531C24] text-white overflow-hidden">
        <DiamondPattern className="opacity-10" />
        
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <Badge className="mb-6 bg-[#D4AF37] text-white">MASA Premium</Badge>
          <h2 className="text-5xl mb-6 max-w-3xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-luxury)' }}>
            Begin Your Jewelry Journey with AI-Powered Guidance
          </h2>
          <p className="text-xl text-[#E7D8C3] mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-ui)' }}>
            Our AI Jewelry Advisor helps you find the perfect piece based on your style, occasion, and budget.
          </p>
          <Link to="/ai-advisor">
            <Button size="lg" className="bg-white text-[#531C24] hover:bg-[#E7D8C3] px-10">
              <Sparkles className="mr-2 w-5 h-5" />
              Try AI Advisor
            </Button>
          </Link>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-4xl mb-12 text-center text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            Featured Brands
          </h2>
          
          <div className="grid grid-cols-6 gap-8 items-center">
            {["Cartier", "Tiffany & Co", "Bvlgari", "Harry Winston", "Van Cleef", "Chopard"].map((brand) => (
              <div
                key={brand}
                className="aspect-square border border-[#531C24]/10 rounded-lg flex items-center justify-center hover:border-[#531C24]/30 transition-colors cursor-pointer"
              >
                <span className="text-lg text-[#1A1A1A]" style={{ fontFamily: 'var(--font-luxury)' }}>
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
