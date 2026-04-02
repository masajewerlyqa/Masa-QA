import { createClient } from "@/lib/supabase/server";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { SellerPlanSelection } from "@/components/seller/SellerPlanSelection";
import { SellerApplicationExistingBlock } from "@/components/seller/SellerApplicationExistingBlock";

export default async function ApplyPage() {
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

  return (
    <div className="min-h-[60vh] flex flex-col items-center">
      <SellerPlanSelection signedIn={Boolean(user)} />
    </div>
  );
}
