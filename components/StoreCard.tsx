import Link from "next/link";
import { Star } from "lucide-react";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import Image from "next/image";
import type { Store } from "@/lib/data";

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const { slug, name, coverImage, verified, rating, reviewCount, productCount } = store;

  return (
    <Link
      href={`/store/${slug}`}
      className="group block rounded-xl overflow-hidden border border-primary/10 bg-white hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-masa-light">
        <Image
          src={coverImage}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          {verified && (
            <div className="mb-2">
              <VerifiedBadge variant="gold" size="sm" />
            </div>
          )}
          <h3 className="text-xl font-luxury text-white drop-shadow-md">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-white/90 mt-1">
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-masa-gold text-masa-gold" : "text-white/50"}`}
                />
              ))}
            </span>
            <span>{rating} ({reviewCount} reviews)</span>
            <span>•</span>
            <span>{productCount} products</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
