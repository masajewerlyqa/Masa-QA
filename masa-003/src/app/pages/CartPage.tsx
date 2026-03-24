import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";

export function CartPage() {
  const cartItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1742240439165-60790db1ee93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Diamond Engagement Ring",
      brand: "Cartier",
      price: 12500,
      quantity: 1,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1767921482419-d2d255b5b700?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      name: "Gold Chain Necklace",
      brand: "Tiffany & Co",
      price: 8900,
      quantity: 1,
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <h1 className="text-4xl mb-12 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
        Shopping Cart
      </h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-lg bg-[#F7F3EE]"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
                          {item.name}
                        </h3>
                        <p className="text-sm text-[#8F8F8F]">{item.brand}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-2xl text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                        ${item.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card className="border-none shadow-lg sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-xl mb-6 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6" style={{ fontFamily: 'var(--font-ui)' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8F8F8F]">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8F8F8F]">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8F8F8F]">Tax</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-[#531C24]/10">
                  <div className="flex justify-between">
                    <span className="text-lg">Total</span>
                    <span className="text-2xl text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Input placeholder="Enter promo code" />
                <Link to="/checkout" className="block">
                  <Button className="w-full bg-[#531C24] hover:bg-[#531C24]/90 h-12">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
