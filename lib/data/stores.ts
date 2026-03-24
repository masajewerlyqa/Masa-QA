import type { Store } from "@/lib/types";

export type { Store };

export const sampleStores: Store[] = [
  {
    id: "store-1",
    slug: "cartier-boutique",
    name: "Cartier Boutique",
    tagline: "Timeless elegance since 1847",
    coverImage:
      "https://images.unsplash.com/photo-1764512680324-048f158cab2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Cartier Boutique brings you timeless elegance and exceptional craftsmanship. With over 170 years of heritage, Cartier represents the pinnacle of luxury jewelry.",
    location: "Paris, France",
    phone: "+33 1 234 5678",
    email: "contact@cartier.com",
    verified: true,
    rating: 4.9,
    reviewCount: 234,
    productCount: 156,
  },
  {
    id: "store-2",
    slug: "tiffany-store",
    name: "Tiffany Store",
    coverImage: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Discover iconic Tiffany & Co. designs and bespoke luxury jewelry.",
    location: "New York, USA",
    phone: "+1 212 755 8000",
    email: "contact@tiffany.com",
    verified: true,
    rating: 4.8,
    reviewCount: 189,
    productCount: 98,
  },
  {
    id: "store-3",
    slug: "bvlgari-shop",
    name: "Bvlgari Shop",
    coverImage: "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Italian luxury and bold designs from Bvlgari.",
    location: "Rome, Italy",
    phone: "+39 06 688 101",
    email: "contact@bvlgari.com",
    verified: true,
    rating: 4.9,
    reviewCount: 145,
    productCount: 87,
  },
  {
    id: "store-4",
    slug: "harry-winston",
    name: "Harry Winston",
    coverImage: "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description: "Diamonds as rare as the moments they celebrate.",
    location: "New York, USA",
    phone: "+1 212 245 2000",
    email: "contact@harrywinston.com",
    verified: true,
    rating: 5,
    reviewCount: 76,
    productCount: 52,
  },
];

export function getStoreById(id: string): Store | undefined {
  return sampleStores.find((s) => s.id === id);
}

export function getStoreBySlug(slug: string): Store | undefined {
  return sampleStores.find((s) => s.slug === slug);
}
