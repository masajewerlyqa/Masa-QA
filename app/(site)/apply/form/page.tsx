import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { SellerApplicationForm } from "@/components/seller/SellerApplicationForm";
import { SellerApplicationExistingBlock } from "@/components/seller/SellerApplicationExistingBlock";
import { parseSellerPlanId } from "@/lib/seller-plans";

export default async function ApplyFormPage() {
  const { user } = await getCurrentUserWithProfile();
  const supabase = await createClient();

  if (user) {
    const { data: existing } = await supabase
      .from("seller_applications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
          <SellerApplicationExistingBlock status={existing.status} />
        </div>
      );
    }
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <SellerApplicationForm />
      </div>
    );
  }

  const { data: prof } = await supabase.from("profiles").select("pending_seller_plan").eq("id", user.id).maybeSingle();

  const plan = parseSellerPlanId(prof?.pending_seller_plan);
  if (!plan) {
    redirect("/apply");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <SellerApplicationForm selectedPlan={plan} />
    </div>
  );
}
