import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCartWithProducts } from "@/lib/customer";
import { validateCartStoresForCheckout } from "@/lib/cart-store-availability";
import { CartItemRow } from "./CartItemRow";
import { CartOrderSummary } from "@/components/cart/CartOrderSummary";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function CartPage() {
  const language = getServerLanguage();
  const { user } = await getCurrentUserWithProfile();
  if (!user) redirect("/login");

  const cartWithProducts = await getCartWithProducts(user.id);
  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const gate = cartWithProducts.length > 0 ? await validateCartStoresForCheckout(user.id) : { blocked: false as const };
  const checkoutBlocked = gate.blocked;
  const checkoutBlockReason = checkoutBlocked ? gate.reason : null;

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl mb-8 md:mb-12 text-primary font-luxury">{t(language, "cart.title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartWithProducts.length === 0 ? (
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-8 text-center text-masa-gray font-sans">
                {t(language, "cart.empty")}
                <div className="mt-4">
                  <Link href="/discover">
                    <Button variant="outline">{t(language, "cart.continueShopping")}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            cartWithProducts.map((item) => <CartItemRow key={item.productId} item={item} />)
          )}
        </div>

        <div className="lg:order-2">
          <CartOrderSummary
            subtotalUsd={subtotal}
            hasItems={cartWithProducts.length > 0}
            checkoutBlocked={checkoutBlocked}
            checkoutBlockReason={checkoutBlockReason}
          />
        </div>
      </div>
    </div>
  );
}
