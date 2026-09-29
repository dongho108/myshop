import Link from "next/link";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          myshop 키링공방
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            aria-label="내 구매목록"
            className="flex items-center gap-2 rounded-full p-2 text-base hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <UserRound className="size-6" strokeWidth={1.75} />
            <span className="hidden sm:inline">내 구매목록</span>
          </Link>
          {loggedIn ? (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full p-2 px-3 text-base text-muted-foreground hover:bg-muted"
              >
                로그아웃
              </button>
            </form>
          ) : (
            <GoogleLoginButton className="h-10 px-4 text-sm" />
          )}
        </div>
      </div>
    </header>
  );
}
