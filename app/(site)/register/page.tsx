import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { getCurrentUserWithProfile, getRedirectPathForRole } from "@/lib/auth";

const RegisterFlow = dynamic(() => import("@/components/auth/RegisterFlow"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[40vh] flex items-center justify-center px-4 text-masa-gray font-sans text-sm">
      Loading…
    </div>
  ),
});

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { user, profile } = await getCurrentUserWithProfile();
  if (user && profile) {
    redirect(getRedirectPathForRole(profile.role));
  }
  const raw = searchParams?.intent;
  const intentParam = Array.isArray(raw) ? raw[0] : raw;
  const initialIntent =
    intentParam === "seller" || intentParam === "buyer" ? intentParam : null;
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <RegisterFlow initialIntent={initialIntent} />
    </div>
  );
}
