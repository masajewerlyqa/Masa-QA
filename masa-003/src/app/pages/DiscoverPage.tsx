import { ProductCard } from "../components/ProductCard";

export function DiscoverPage() {
  const collections = [
    {
      title: "Editor's Picks",
      products: Array.from({ length: 4 }, (_, i) => ({
        id: `ep-${i}`,
        image: i % 2 === 0
          ? "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          : "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        title: `Luxury ${i % 2 === 0 ? "Ring" : "Necklace"}`,
        brand: ["Cartier", "Tiffany & Co"][i % 2],
        price: Math.floor(Math.random() * 20000) + 5000,
        category: i % 2 === 0 ? "Ring" : "Necklace",
        metal: "18K Gold",
        isFeatured: true,
      })),
    },
    {
      title: "New Arrivals",
      products: Array.from({ length: 4 }, (_, i) => ({
        id: `na-${i}`,
        image: i % 2 === 0
          ? "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          : "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        title: `New ${i % 2 === 0 ? "Earrings" : "Bracelet"}`,
        brand: ["Bvlgari", "Harry Winston"][i % 2],
        price: Math.floor(Math.random() * 15000) + 3000,
        category: i % 2 === 0 ? "Earrings" : "Bracelet",
        metal: "Platinum",
        isNew: true,
      })),
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-5xl mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Discover
        </h1>
        <p className="text-xl text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
          Curated collections of exceptional jewelry
        </p>
      </div>

      {collections.map((collection, idx) => (
        <div key={idx} className="mb-16">
          <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            {collection.title}
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {collection.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
