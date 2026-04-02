"use client";

import { useState } from "react";
import { RegisterPathChoice, type RegisterPath } from "./RegisterPathChoice";
import { RegisterForm } from "./RegisterForm";
import { SellerRegistrationPlanStep } from "./SellerRegistrationPlanStep";
import type { SellerPlanId } from "@/lib/seller-plans";

/**
 * Register flow: choose Buyer or Seller → (Seller only) choose plan → registration form.
 * Seller path sets profile role to pending_seller; plan is stored on profile before application.
 * `initialIntent` from `/register?intent=seller` opens plan selection first, then the form.
 */
export default function RegisterFlow({ initialIntent }: { initialIntent?: RegisterPath | null }) {
  const [path, setPath] = useState<RegisterPath | null>(() => initialIntent ?? null);
  const [sellerPlan, setSellerPlan] = useState<SellerPlanId | null>(null);

  if (path === null) {
    return (
      <RegisterPathChoice
        onChoose={(p) => {
          setPath(p);
          if (p === "buyer") setSellerPlan(null);
        }}
      />
    );
  }

  if (path === "seller" && sellerPlan === null) {
    return (
      <SellerRegistrationPlanStep
        onSelectPlan={(id) => setSellerPlan(id)}
        onBack={() => {
          setPath(null);
          setSellerPlan(null);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-md">
      <RegisterForm
        intent={path}
        selectedSellerPlan={path === "seller" ? sellerPlan! : undefined}
        onBack={() => {
          if (path === "seller") setSellerPlan(null);
          else setPath(null);
        }}
      />
    </div>
  );
}
