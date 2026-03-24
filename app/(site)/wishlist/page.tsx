import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/customer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getServerLanguage } from "@/lib/language-server";

export default async function WishlistPage() {
  const isArabic = getServerLanguage() === "ar";
  const { user } = await getCurrentUserWithProfile();
  if (!user) redirect("/login");

  const products = await getWishlistProducts(user.id);

  return (
    <div className="max-w-content mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl mb-2 text-primary font-luxury">{isArabic ? "المفضلة" : "Wishlist"}</h1>
      <p className="text-masa-gray font-sans mb-8">
        {products.length === 0
          ? (isArabic ? "قائمة المفضلة فارغة حالياً." : "Your wishlist is empty.")
          : isArabic
            ? `${products.length} ${products.length === 1 ? "منتج محفوظ" : "منتجات محفوظة"}`
            : `${products.length} item${products.length === 1 ? "" : "s"} saved`}
      </p>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Link href="/discover">
            <Button className="bg-primary hover:bg-primary/90">{isArabic ? "اكتشف المجوهرات" : "Discover jewelry"}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isInWishlist />
          ))}
        </div>
      )}
    </div>
  );
}
