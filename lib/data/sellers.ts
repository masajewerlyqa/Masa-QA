export interface SellerApplication {
  id: number;
  name: string;
  email: string;
  products: number;
  status: string;
  date: string;
}

export const sampleSellerApplications: SellerApplication[] = [
  { id: 1, name: "Luxury Gems Co.", email: "contact@luxurygems.com", products: 24, status: "Pending", date: "Mar 6, 2024" },
  { id: 2, name: "Golden Treasures", email: "info@goldentreasures.com", products: 18, status: "Pending", date: "Mar 5, 2024" },
  { id: 3, name: "Diamond Palace", email: "sales@diamondpalace.com", products: 31, status: "Pending", date: "Mar 4, 2024" },
];

export const sampleSellersList = [
  { id: "s1", name: "Cartier Boutique", email: "contact@cartier.com", stores: 1, products: 156, status: "Active" },
  { id: "s2", name: "Tiffany Store", email: "contact@tiffany.com", stores: 1, products: 98, status: "Active" },
  { id: "s3", name: "Bvlgari Shop", email: "contact@bvlgari.com", stores: 1, products: 87, status: "Active" },
];
