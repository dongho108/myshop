import Link from "next/link";
import { cn } from "@/lib/utils";

// 검은색 알약 모양 버튼. 이 가게의 모든 주요 행동에 쓴다.
export const pillClass =
  "inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function PillLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return <Link className={cn(pillClass, className)} {...props} />;
}
