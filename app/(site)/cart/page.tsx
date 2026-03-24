import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCartWithProducts } from "@/lib/customer";
import { CartItemRow } from "./CartItemRow";
import { FormattedPrice } from "@/components/FormattedPrice";
import { getServerLanguage } from "@/lib/language-server";

export default async function CartPage() {
  const language = getServerLanguage();
  const isArabic = language === "ar";
  const { user } = await getCurrentUserWithProfile();
  if (!user) redirect("/login");

  const cartWithProducts = await getCartWithProducts(user.id);
  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl mb-8 md:mb-12 text-primary font-luxury">
        {isArabic ? "سلة التسوق" : "Shopping Cart"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartWithProducts.length === 0 ? (
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-8 text-center text-masa-gray font-sans">
                {isArabic ? "سلتك فارغة." : "Your cart is empty."}
                <div className="mt-4">
                  <Link href="/discover">
                    <Button variant="outline">{isArabic ? "متابعة التسوق" : "Continue Shopping"}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            cartWithProducts.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        <div className="lg:order-2">
          <Card className="border-primary/10 shadow-lg sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-xl mb-6 text-primary font-luxury">{isArabic ? "ملخص الطلب" : "Order Summary"}</h3>
              <div className="space-y-4 mb-6 font-sans text-sm">
                <div className="flex justify-between">
                  <span className="text-masa-gray">{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span><FormattedPrice usd={subtotal} /></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-masa-gray">{isArabic ? "الشحن" : "Shipping"}</span>
                  <span className="text-green-600">{isArabic ? "مجاني" : "Free"}</span>
                </div>
                <div className="pt-4 border-t border-primary/10">
                  <div className="flex justify-between">
                    <span className="text-lg">{isArabic ? "الإجمالي" : "Total"}</span>
                    <span className="text-2xl text-primary font-luxury"><FormattedPrice usd={total} /></span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Input placeholder={isArabic ? "أدخل كود الخصم" : "Enter promo code"} />
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 h-12" disabled={cartWithProducts.length === 0}>
                    {isArabic ? "المتابعة إلى الدفع" : "Proceed to Checkout"}
                    <ArrowRight className={`w-5 h-5 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`} />
                  </Button>
                </Link>
                <Link href="/discover">
                  <Button variant="outline" className="w-full">{isArabic ? "متابعة التسوق" : "Continue Shopping"}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
