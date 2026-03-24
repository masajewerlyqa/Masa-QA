import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/PageContainer";
import { getServerLanguage } from "@/lib/language-server";

export default function NotFound() {
  const isArabic = getServerLanguage() === "ar";
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <PageContainer as="div" className="text-center">
        <h1 className="text-4xl md:text-6xl font-luxury text-primary mb-4">404</h1>
        <p className="text-lg text-masa-gray font-sans mb-8">
          {isArabic ? "الصفحة المطلوبة غير موجودة." : "This page could not be found."}
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">{isArabic ? "العودة إلى الرئيسية" : "Back to Home"}</Link>
        </Button>
      </PageContainer>
    </div>
  );
}
