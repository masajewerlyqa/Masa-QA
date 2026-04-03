import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  metal?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  image,
  title,
  brand,
  price,
  originalPrice,
  category,
  metal,
  isNew,
  isFeatured,
}: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-lg overflow-hidden border border-[#531C24]/10 hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <Link to={`/product/${id}`} className="block relative aspect-square overflow-hidden bg-[#F7F3EE]">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-[#531C24] text-white">New</Badge>
          )}
          {isFeatured && (
            <Badge className="bg-[#D4AF37] text-white">Featured</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-3 right-3 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <Button className="w-full bg-white text-[#531C24] hover:bg-[#E7D8C3]" size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4" style={{ fontFamily: 'var(--font-ui)' }}>
        <div className="text-xs text-[#635C5C] mb-1 uppercase tracking-wide">{brand}</div>
        <Link to={`/product/${id}`}>
          <h3 className="text-sm mb-2 line-clamp-2 hover:text-[#531C24] transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3 text-xs text-[#635C5C]">
          <span>{category}</span>
          {metal && (
            <>
              <span>•</span>
              <span>{metal}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-[#635C5C] line-through">
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
