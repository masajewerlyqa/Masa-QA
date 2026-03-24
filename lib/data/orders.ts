import type { Order } from "@/lib/types";

export type { Order };

export const sampleOrders: Order[] = [
  { id: "#ORD-1234", customerName: "Sarah Johnson", productName: "Diamond Ring", amount: "$12,500", status: "Delivered", date: "Mar 6, 2024" },
  { id: "#ORD-1235", customerName: "Michael Chen", productName: "Gold Necklace", amount: "$8,900", status: "Processing", date: "Mar 6, 2024" },
  { id: "#ORD-1236", customerName: "Emma Wilson", productName: "Pearl Earrings", amount: "$3,200", status: "Shipped", date: "Mar 5, 2024" },
  { id: "#ORD-1237", customerName: "James Brown", productName: "Tennis Bracelet", amount: "$15,600", status: "Delivered", date: "Mar 5, 2024" },
];

export const sampleAdminTransactions = [
  { id: "#TXN-5678", seller: "Cartier Boutique", buyer: "Sarah Johnson", amount: "$12,500", fee: "$625", date: "Mar 6, 2024" },
  { id: "#TXN-5679", seller: "Tiffany Store", buyer: "Michael Chen", amount: "$8,900", fee: "$445", date: "Mar 6, 2024" },
  { id: "#TXN-5680", seller: "Bvlgari Shop", buyer: "Emma Wilson", amount: "$15,600", fee: "$780", date: "Mar 5, 2024" },
];
