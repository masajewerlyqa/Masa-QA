import { Star, MapPin, Phone, Mail } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";

export function StorePage() {
  const storeProducts = Array.from({ length: 8 }, (_, i) => ({
    id: `store-${i}`,
    image: i % 4 === 0
      ? "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      : i % 4 === 1
      ? "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      : i % 4 === 2
      ? "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      : "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: `Premium ${["Ring", "Necklace", "Earrings", "Bracelet"][i % 4]}`,
    brand: "Cartier",
    price: Math.floor(Math.random() * 30000) + 5000,
    category: ["Ring", "Necklace", "Earrings", "Bracelet"][i % 4],
    metal: "18K Gold",
  }));

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Store Header */}
      <div className="relative h-64 bg-gradient-to-r from-[#531C24] to-[#8B3940] rounded-2xl mb-12 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1764512680324-048f158cab2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Store"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 p-12 text-white">
          <Badge className="mb-4 bg-[#D4AF37] text-white">Verified Seller</Badge>
          <h1 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
            Cartier Boutique
          </h1>
          <div className="flex items-center gap-4 text-[#E7D8C3]">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
              <span className="ml-2">4.9 (234 reviews)</span>
            </div>
            <span>•</span>
            <span>156 Products</span>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="col-span-3">
          <h2 className="text-2xl mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            About Cartier Boutique
          </h2>
          <p className="text-[#1A1A1A] leading-relaxed mb-6" style={{ fontFamily: 'var(--font-ui)' }}>
            Cartier Boutique brings you timeless elegance and exceptional craftsmanship. With over 170 years of heritage, Cartier represents the pinnacle of luxury jewelry. Each piece in our collection is meticulously crafted using the finest materials and traditional techniques passed down through generations.
          </p>
        </div>
        <div className="bg-[#F7F3EE] rounded-lg p-6 space-y-4" style={{ fontFamily: 'var(--font-ui)' }}>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#531C24] mt-1" />
            <div>
              <div className="text-sm text-[#635C5C]">Location</div>
              <div className="text-sm">Paris, France</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#531C24] mt-1" />
            <div>
              <div className="text-sm text-[#635C5C]">Phone</div>
              <div className="text-sm">+33 1 234 5678</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#531C24] mt-1" />
            <div>
              <div className="text-sm text-[#635C5C]">Email</div>
              <div className="text-sm">contact@cartier.com</div>
            </div>
          </div>
          <Button className="w-full bg-[#531C24] hover:bg-[#531C24]/90 mt-4">
            Contact Store
          </Button>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Products
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {storeProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
