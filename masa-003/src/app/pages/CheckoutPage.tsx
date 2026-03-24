import { CreditCard, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

export function CheckoutPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <h1 className="text-4xl mb-12 text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>
        Secure Checkout
      </h1>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input placeholder="123 Main Street" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input placeholder="New York" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input placeholder="NY" />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input placeholder="10001" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup defaultValue="card">
                <div className="flex items-center space-x-2 p-4 border border-[#531C24]/10 rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Credit / Debit Card
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input placeholder="123" type="password" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-[#531C24] hover:bg-[#531C24]/90 h-12">
            <Lock className="w-5 h-5 mr-2" />
            Place Secure Order
          </Button>
        </div>

        <div>
          <Card className="border-none shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-luxury)' }}>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$21,400</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>$1,712</span>
              </div>
              <div className="pt-4 border-t border-[#531C24]/10">
                <div className="flex justify-between text-xl">
                  <span>Total</span>
                  <span className="text-[#531C24]" style={{ fontFamily: 'var(--font-luxury)' }}>$23,112</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
