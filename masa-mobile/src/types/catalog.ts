export type Product = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: string;
  priceUsd?: number;
  originalPrice?: string;
  discountLabel?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  description?: string;
  storeName?: string;
  brand?: string;
  metal?: string;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  storeId?: string;
};

export type Category = {
  id: string;
  name: string;
};
