import type { Product } from "@/lib/types";

export type { Product };

const BASE_IMAGES = [
  "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
];

export const sampleProducts: Product[] = [
  {
    id: "1",
    slug: "eternal-diamond-engagement-ring",
    image: BASE_IMAGES[0],
    images: BASE_IMAGES,
    title: "Eternal Diamond Engagement Ring",
    brand: "Cartier",
    storeId: "store-1",
    storeName: "Cartier Boutique",
    price: 12500,
    originalPrice: 15000,
    category: "Ring",
    metal: "18K White Gold",
    isNew: true,
    isFeatured: true,
    description: "A timeless symbol of eternal love, this exquisite engagement ring features a brilliant-cut diamond set in 18K white gold.",
    specifications: {
      "Metal Type": "18K White Gold",
      "Diamond Weight": "2.5 Carats",
      "Diamond Grade": "VVS1 Clarity, D Color",
      "Ring Size": "6 (Resizable)",
      Certificate: "GIA Certified",
    },
    rating: 4.9,
    reviewCount: 127,
    stockQuantity: 10,
    status: "active",
  },
  {
    id: "2",
    slug: "classic-gold-chain-necklace",
    image: BASE_IMAGES[1],
    images: BASE_IMAGES,
    title: "Classic Gold Chain Necklace",
    brand: "Tiffany & Co",
    storeId: "store-2",
    storeName: "Tiffany Store",
    price: 8900,
    originalPrice: 10500,
    category: "Necklace",
    metal: "18K Yellow Gold",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 89,
    stockQuantity: 10,
    status: "active",
  },
  {
    id: "3",
    slug: "diamond-drop-earrings",
    image: BASE_IMAGES[2],
    images: BASE_IMAGES,
    title: "Diamond Drop Earrings",
    brand: "Bvlgari",
    storeId: "store-3",
    storeName: "Bvlgari Shop",
    price: 15200,
    category: "Earrings",
    metal: "Platinum",
    isNew: true,
    rating: 5,
    reviewCount: 42,
    stockQuantity: 10,
    status: "active",
  },
  {
    id: "4",
    slug: "luxury-tennis-bracelet",
    image: BASE_IMAGES[3],
    images: BASE_IMAGES,
    title: "Luxury Tennis Bracelet",
    brand: "Harry Winston",
    storeId: "store-4",
    storeName: "Harry Winston",
    price: 18700,
    category: "Bracelet",
    metal: "18K White Gold",
    isFeatured: true,
    rating: 4.9,
    reviewCount: 56,
    stockQuantity: 10,
    status: "active",
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `prod-${i + 5}`,
    slug: `product-${i + 5}`,
    image: BASE_IMAGES[i % 4],
    images: BASE_IMAGES,
    title: `Luxury ${["Diamond Ring", "Gold Necklace", "Pearl Earrings", "Tennis Bracelet"][i % 4]} ${i + 1}`,
    brand: ["Cartier", "Tiffany & Co", "Bvlgari", "Harry Winston"][i % 4],
    storeId: `store-${(i % 4) + 1}`,
    storeName: ["Cartier Boutique", "Tiffany Store", "Bvlgari Shop", "Harry Winston"][i % 4],
    price: Math.floor(Math.random() * 30000) + 5000,
    category: ["Ring", "Necklace", "Earrings", "Bracelet"][i % 4],
    metal: ["18K Gold", "Platinum", "White Gold", "Yellow Gold"][i % 4],
    isNew: i % 5 === 0,
    isFeatured: i % 3 === 0,
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 100),
    stockQuantity: 10,
    status: "active" as const,
  })),
];

export function getProductById(id: string): Product | undefined {
  return sampleProducts.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return sampleProducts.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return sampleProducts.filter((p) => p.isFeatured).slice(0, 4);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return sampleProducts;
  return sampleProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}

export function getProductsByStore(storeId: string): Product[] {
  return sampleProducts.filter((p) => p.storeId === storeId);
}
