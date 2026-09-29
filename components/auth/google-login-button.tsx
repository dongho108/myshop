"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { pillClass } from "@/components/pill-link";

export function GoogleLoginButton({
  next,
  className,
}: {
  next?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(pillClass, "disabled:cursor-not-allowed disabled:opacity-60", className)}
    >
      {loading ? "이동하는 중…" : "구글로 로그인"}
    </button>
  );
}
