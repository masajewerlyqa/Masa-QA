import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  count?: number;
}

export function CategoryCard({ title, image, href, count }: CategoryCardProps) {
  return (
    <Link
      to={href}
      className="group relative aspect-square rounded-lg overflow-hidden bg-[#F7F3EE] hover:shadow-xl transition-all duration-300"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
          {title}
        </h3>
        {count && (
          <div className="text-sm text-white/80 mb-3">{count} items</div>
        )}
        <div className="flex items-center gap-2 text-sm group-hover:gap-3 transition-all">
          <span>Explore Collection</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
