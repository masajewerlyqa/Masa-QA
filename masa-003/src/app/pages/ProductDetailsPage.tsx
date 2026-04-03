import { useState } from "react";
import { Heart, ShoppingCart, Share2, Award, Shield, TrendingUp, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ProductCard } from "../components/ProductCard";

export function ProductDetailsPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = [
    "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ];

  const relatedProducts = [
    {
      id: "rel-1",
      image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Matching Gold Necklace",
      brand: "Cartier",
      price: 8900,
      category: "Necklace",
      metal: "18K Gold",
    },
    {
      id: "rel-2",
      image: "https://images.unsplash.com/photo-1769078595478-5f756986b818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Diamond Stud Earrings",
      brand: "Cartier",
      price: 6500,
      category: "Earrings",
      metal: "Platinum",
    },
    {
      id: "rel-3",
      image: "https://images.unsplash.com/photo-1767921777873-81818b812a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Diamond Tennis Bracelet",
      brand: "Cartier",
      price: 15200,
      category: "Bracelet",
      metal: "18K White Gold",
    },
    {
      id: "rel-4",
      image: "https://images.unsplash.com/photo-1769857879388-df93b4c96bca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      title: "Pearl Pendant Necklace",
      brand: "Mikimoto",
      price: 4200,
      category: "Necklace",
      metal: "18K Gold",
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="grid grid-cols-2 gap-12 mb-20">
        {/* Images */}
        <div>
          <div className="aspect-square bg-[#F7F3EE] rounded-lg overflow-hidden mb-4">
            <img
              src={images[selectedImage]}
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === idx ? "border-[#531C24]" : "border-transparent"
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div style={{ fontFamily: 'var(--font-ui)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#531C24]">New Arrival</Badge>
            <Badge variant="outline">Certified Authentic</Badge>
          </div>

          <h1 className="text-4xl mb-2 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
            Eternal Diamond Engagement Ring
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg text-[#635C5C]">Cartier</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
              <span className="text-sm text-[#635C5C] ml-2">(127 reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-5xl text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
              $12,500
            </span>
            <span className="text-xl text-[#635C5C] line-through">$15,000</span>
            <Badge className="bg-green-600">17% OFF</Badge>
          </div>

          <p className="text-[#1A1A1A] leading-relaxed mb-8">
            A timeless symbol of eternal love, this exquisite engagement ring features a brilliant-cut diamond set in 18K white gold. Crafted with exceptional precision by Cartier's master jewelers, this piece embodies luxury and sophistication.
          </p>

          {/* Specifications */}
          <div className="bg-[#F7F3EE] rounded-lg p-6 mb-8">
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#635C5C] mb-1">Metal Type</div>
                <div className="text-[#1A1A1A]">18K White Gold</div>
              </div>
              <div>
                <div className="text-[#635C5C] mb-1">Gold Karat</div>
                <div className="text-[#1A1A1A]">18K (75% Pure Gold)</div>
              </div>
              <div>
                <div className="text-[#635C5C] mb-1">Diamond Weight</div>
                <div className="text-[#1A1A1A]">2.5 Carats</div>
              </div>
              <div>
                <div className="text-[#635C5C] mb-1">Diamond Grade</div>
                <div className="text-[#1A1A1A]">VVS1 Clarity, D Color</div>
              </div>
              <div>
                <div className="text-[#635C5C] mb-1">Ring Size</div>
                <div className="text-[#1A1A1A]">6 (Resizable)</div>
              </div>
              <div>
                <div className="text-[#635C5C] mb-1">Certificate</div>
                <div className="text-[#1A1A1A]">GIA Certified</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button className="flex-1 bg-[#531C24] hover:bg-[#531C24]/90 h-12">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 border-[#531C24] text-[#531C24]">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 border-[#531C24] text-[#531C24]">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#531C24]/10">
            <div className="text-center">
              <Shield className="w-6 h-6 text-[#531C24] mx-auto mb-2" />
              <div className="text-xs text-[#635C5C]">Certified Authentic</div>
            </div>
            <div className="text-center">
              <Award className="w-6 h-6 text-[#531C24] mx-auto mb-2" />
              <div className="text-xs text-[#635C5C]">Lifetime Warranty</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-[#531C24] mx-auto mb-2" />
              <div className="text-xs text-[#635C5C]">Investment Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-20">
        <Tabs defaultValue="description" style={{ fontFamily: 'var(--font-ui)' }}>
          <TabsList className="w-full justify-start border-b border-[#531C24]/10 rounded-none bg-transparent p-0">
            <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-[#531C24]">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="data-[state=active]:border-b-2 data-[state=active]:border-[#531C24]">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-[#531C24]">
              Reviews (127)
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:border-b-2 data-[state=active]:border-[#531C24]">
              Shipping & Returns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="py-8">
            <div className="prose max-w-none">
              <p className="text-[#1A1A1A] leading-relaxed mb-4">
                The Eternal Diamond Engagement Ring from Cartier represents the pinnacle of fine jewelry craftsmanship. Each ring is meticulously handcrafted by master jewelers with over 50 years of combined experience, ensuring every detail meets Cartier's exacting standards.
              </p>
              <p className="text-[#1A1A1A] leading-relaxed">
                The centerpiece diamond is carefully selected for its exceptional quality, featuring VVS1 clarity and D color grade - the highest possible ratings. Set in 18K white gold with a classic six-prong setting, this ring is designed to last generations while maintaining its brilliant sparkle.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="py-8">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>Metal Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Metal Type:</span>
                    <span>18K White Gold</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Purity:</span>
                    <span>75% (18K)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Weight:</span>
                    <span>4.2g</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>Diamond Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Carat Weight:</span>
                    <span>2.5ct</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Clarity:</span>
                    <span>VVS1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Color:</span>
                    <span>D (Colorless)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Cut:</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>Other Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Ring Size:</span>
                    <span>6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Resizable:</span>
                    <span>Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635C5C]">Certificate:</span>
                    <span>GIA</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="py-8">
            <div className="space-y-6">
              {[1, 2, 3].map((review) => (
                <div key={review} className="border-b border-[#531C24]/10 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                      ))}
                    </div>
                    <span className="text-sm text-[#635C5C]">2 days ago</span>
                  </div>
                  <h4 className="mb-2">Absolutely Stunning!</h4>
                  <p className="text-[#635C5C] text-sm leading-relaxed">
                    This ring exceeded all my expectations. The craftsmanship is impeccable, and the diamond sparkles brilliantly. My fiancée was absolutely thrilled!
                  </p>
                  <div className="mt-2 text-sm text-[#635C5C]">
                    <span className="text-[#1A1A1A]">Sarah M.</span> • Verified Purchase
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="py-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>Shipping Information</h4>
                <div className="space-y-3 text-sm text-[#1A1A1A]">
                  <p>• Free deliveryon orders over $500</p>
                  <p>• Express delivery available (1-2 business days)</p>
                  <p>• Fully insured and tracked shipments</p>
                  <p>• Signature required on delivery</p>
                  <p>• Ships within 1-2 business days</p>
                </div>
              </div>
              <div>
                <h4 className="mb-4 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>Returns & Exchanges</h4>
                <div className="space-y-3 text-sm text-[#1A1A1A]">
                  <p>• 30-day return policy</p>
                  <p>• Free returns and exchanges</p>
                  <p>• Items must be unworn and in original packaging</p>
                  <p>• Lifetime warranty on all jewelry</p>
                  <p>• Free resizing within first year</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-3xl mb-8 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
          You May Also Like
        </h2>
        <div className="grid grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
