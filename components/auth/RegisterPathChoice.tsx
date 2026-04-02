"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { useI18n } from "@/components/useI18n";

export type RegisterPath = "buyer" | "seller";

type Props = {
  onChoose: (path: RegisterPath) => void;
};

export function RegisterPathChoice({ onChoose }: Props) {
  const { t } = useI18n();

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-luxury text-primary mb-2">{t("auth.register.createAccount")}</h1>
        <p className="text-masa-gray font-sans">{t("auth.register.joinMarketplace")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors group overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-luxury text-primary">{t("auth.register.becomeBuyer")}</CardTitle>
            <CardDescription className="font-sans text-masa-gray">
              {t("auth.register.becomeBuyerDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button type="button" className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={() => onChoose("buyer")}>
              {t("auth.register.continueAsBuyer")}
            </Button>
          </CardContent>
        </Card>
        <Card className="border-primary/20 hover:border-primary/40 transition-colors group overflow-hidden ring-2 ring-primary/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <Store className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl font-luxury text-primary">{t("auth.register.becomeSeller")}</CardTitle>
            <CardDescription className="font-sans text-masa-gray">
              {t("auth.register.becomeSellerDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button type="button" className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={() => onChoose("seller")}>
              {t("auth.register.continueAsSeller")}
            </Button>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-sm text-masa-gray font-sans">
        {t("auth.register.alreadyHaveAccount")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("auth.register.signIn")}
        </Link>
      </p>
    </div>
  );
}
