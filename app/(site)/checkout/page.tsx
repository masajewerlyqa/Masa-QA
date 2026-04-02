import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getCartWithProducts } from "@/lib/customer";
import { validateCartStoresForCheckout } from "@/lib/cart-store-availability";
import { CheckoutWithSummary } from "./CheckoutWithSummary";
import { getServerLanguage } from "@/lib/language-server";
import { t } from "@/lib/i18n";

export default async function CheckoutPage() {
  const language = getServerLanguage();
  const { user } = await getCurrentUserWithProfile();
  if (!user) redirect("/login");

  const cartWithProducts = await getCartWithProducts(user.id);
  if (cartWithProducts.length === 0) redirect("/cart");

  const gate = await validateCartStoresForCheckout(user.id);
  const checkoutBlocked = gate.blocked;
  const checkoutBlockReason = checkoutBlocked ? gate.reason : null;

  const subtotal = cartWithProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItems = cartWithProducts.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: { title: item.product.title, price: item.product.price },
  }));

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl mb-8 md:mb-12 text-primary font-luxury">
        {t(language, "checkout.secureCheckout")}
      </h1>
      <CheckoutWithSummary
        cartItems={cartItems}
        subtotal={subtotal}
        checkoutBlocked={checkoutBlocked}
        checkoutBlockReason={checkoutBlockReason}
      />
    </div>
  );
}
