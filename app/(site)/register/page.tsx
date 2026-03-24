import { redirect } from "next/navigation";
import { RegisterFlow } from "@/components/auth/RegisterFlow";
import { getCurrentUserWithProfile, getRedirectPathForRole } from "@/lib/auth";

export default async function RegisterPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (user && profile) {
    redirect(getRedirectPathForRole(profile.role));
  }
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <RegisterFlow />
    </div>
  );
}
