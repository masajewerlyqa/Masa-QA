"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
};

/**
 * Only rendered when Supabase reports email not yet confirmed (rare if “Confirm email” is strict).
 */
export function ResendVerificationEmail({ email }: Props) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function resend() {
    setMsg(null);
    setPending(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/account`,
        },
      });
      if (error) setMsg(error.message);
      else setMsg("A new link has been sent. Please check your inbox.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not send");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm font-sans">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-primary/20 w-fit"
        onClick={resend}
        disabled={pending}
      >
        {pending ? "Sending…" : "Resend verification email"}
      </Button>
      {msg && <span className="text-masa-gray">{msg}</span>}
    </div>
  );
}
