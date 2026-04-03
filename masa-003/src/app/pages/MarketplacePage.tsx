import { useState } from "react";
import { Filter, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function MarketplacePage() {
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const products = Array.from({ length: 12 }, (_, i) => ({
    id: `prod-${i + 1}`,
    image: i % 4 === 0
      ? "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      : i % 4 === 1
      ? "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      : i % 4 === 2
      ? "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
      : "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    title: `Luxury ${["Diamond Ring", "Gold Necklace", "Pearl Earrings", "Tennis Bracelet"][i % 4]}`,
    brand: ["Cartier", "Tiffany & Co", "Bvlgari", "Harry Winston"][i % 4],
    price: Math.floor(Math.random() * 40000) + 5000,
    category: ["Ring", "Necklace", "Earrings", "Bracelet"][i % 4],
    metal: ["18K Gold", "Platinum", "White Gold", "Yellow Gold"][i % 4],
    isNew: i % 5 === 0,
    isFeatured: i % 3 === 0,
  }));

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          Luxury Jewelry Marketplace
        </h1>
        <p className="text-lg text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
          Discover exquisite jewelry from world-renowned brands
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-lg border border-[#531C24]/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg" style={{ fontFamily: 'var(--font-luxury)' }}>Filters</h3>
              <Button variant="ghost" size="sm" className="text-[#531C24]">
                Clear All
              </Button>
            </div>

            <div className="space-y-6" style={{ fontFamily: 'var(--font-ui)' }}>
              {/* Category */}
              <div>
                <h4 className="mb-3 text-sm">Category</h4>
                <div className="space-y-2">
                  {["All Jewelry", "Rings", "Necklaces", "Earrings", "Bracelets", "Watches"].map((cat) => (
                    <div key={cat} className="flex items-center">
                      <Checkbox id={cat} />
                      <Label htmlFor={cat} className="ml-2 text-sm cursor-pointer">
                        {cat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="mb-3 text-sm">Price Range</h4>
                <Slider
                  min={0}
                  max={50000}
                  step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-sm text-[#635C5C]">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Metal Type */}
              <div>
                <h4 className="mb-3 text-sm">Metal Type</h4>
                <div className="space-y-2">
                  {["18K Yellow Gold", "18K White Gold", "18K Rose Gold", "Platinum", "Silver"].map((metal) => (
                    <div key={metal} className="flex items-center">
                      <Checkbox id={metal} />
                      <Label htmlFor={metal} className="ml-2 text-sm cursor-pointer">
                        {metal}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gold Karat */}
              <div>
                <h4 className="mb-3 text-sm">Gold Karat</h4>
                <div className="space-y-2">
                  {["24K", "22K", "18K", "14K"].map((karat) => (
                    <div key={karat} className="flex items-center">
                      <Checkbox id={karat} />
                      <Label htmlFor={karat} className="ml-2 text-sm cursor-pointer">
                        {karat}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diamond Type */}
              <div>
                <h4 className="mb-3 text-sm">Diamond Grade</h4>
                <div className="space-y-2">
                  {["IF (Internally Flawless)", "VVS1", "VVS2", "VS1", "VS2"].map((grade) => (
                    <div key={grade} className="flex items-center">
                      <Checkbox id={grade} />
                      <Label htmlFor={grade} className="ml-2 text-sm cursor-pointer">
                        {grade}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="mb-3 text-sm">Brand</h4>
                <div className="space-y-2">
                  {["Cartier", "Tiffany & Co", "Bvlgari", "Harry Winston", "Van Cleef & Arpels"].map((brand) => (
                    <div key={brand} className="flex items-center">
                      <Checkbox id={brand} />
                      <Label htmlFor={brand} className="ml-2 text-sm cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#531C24]/10">
            <div className="text-sm text-[#635C5C]" style={{ fontFamily: 'var(--font-ui)' }}>
              Showing <span className="text-[#1A1A1A]">1-12</span> of <span className="text-[#1A1A1A]">246</span> products
            </div>

            <div className="flex items-center gap-4">
              <Select defaultValue="featured">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-[#531C24]/10 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === "grid" ? "bg-[#F7F3EE]" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === "list" ? "bg-[#F7F3EE]" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className={viewMode === "grid" ? "grid grid-cols-3 gap-6" : "space-y-4"}>
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={page === 1 ? "default" : "outline"}
                  size="sm"
                  className={page === 1 ? "bg-[#531C24]" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
