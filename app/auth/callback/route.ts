import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { LANGUAGE_COOKIE_KEY, isLanguage } from "@/lib/language";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * OAuth PKCE, email confirmation, and password-recovery code exchange.
 * After session: ensure profile, enrich OAuth metadata, send welcome email once (idempotent).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const oauthErr = searchParams.get("error");
  const oauthErrDesc = searchParams.get("error_description");
  if (oauthErr) {
    const qs = new URLSearchParams();
    qs.set("error", "oauth");
    if (oauthErrDesc) qs.set("msg", oauthErrDesc.slice(0, 280));
    return NextResponse.redirect(`${origin}/login?${qs.toString()}`);
  }

  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/account";
  if (!next.startsWith("/") || next.startsWith("//")) next = "/account";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            /* ignore in edge cases */
          }
        },
      },
    });

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      const flowType = searchParams.get("type");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const { ensureProfileForAuthUser, enrichProfileFromOAuthMetadata } = await import("@/lib/auth/profile-sync");
        await ensureProfileForAuthUser(user);
        await enrichProfileFromOAuthMetadata(user).catch(() => {});

        const applyPath = next === "/apply" || next.startsWith("/apply?");
        if (applyPath) {
          const service = createServiceClient();
          const { data: prof } = await service.from("profiles").select("role").eq("id", user.id).maybeSingle();
          if (prof && (prof as { role: string }).role === "customer") {
            await service
              .from("profiles")
              .update({ role: "pending_seller", updated_at: new Date().toISOString() })
              .eq("id", user.id);
          }
        }

        const langCookie = cookieStore.get(LANGUAGE_COOKIE_KEY)?.value;
        if (isLanguage(langCookie)) {
          await createServiceClient()
            .from("profiles")
            .update({
              preferred_language: langCookie,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        }

        // Password recovery: do not send welcome (account already exists).
        if (flowType !== "recovery") {
          const meta = user.user_metadata ?? {};
          const fullName =
            (typeof meta.full_name === "string" && meta.full_name) ||
            (typeof meta.name === "string" && meta.name) ||
            null;
          const { sendWelcomeEmailIfEligible } = await import("@/lib/auth/welcome-email");
          await sendWelcomeEmailIfEligible(user.id, user.email, fullName);
        }
      }

      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
      const verified =
        flowType === "signup" || flowType === "email_change" || flowType === "email_confirmation";
      const join = safeNext.includes("?") ? "&" : "?";
      const suffix = verified ? `${join}verified=1` : "";
      return NextResponse.redirect(`${origin}${safeNext}${suffix}`);
    }
    const qs = new URLSearchParams();
    qs.set("error", "auth");
    if (exchangeError?.message) qs.set("msg", exchangeError.message.slice(0, 280));
    return NextResponse.redirect(`${origin}/login?${qs.toString()}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
