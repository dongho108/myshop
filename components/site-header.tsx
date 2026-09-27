import Link from "next/link";
import { UserRound } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          myshop 키링공방
        </Link>
        <Link
          href="/orders"
          aria-label="내 구매목록"
          className="flex items-center gap-2 rounded-full p-2 text-base hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <UserRound className="size-6" strokeWidth={1.75} />
          <span className="hidden sm:inline">내 구매목록</span>
        </Link>
      </div>
    </header>
  );
}
