import Image from "next/image";
import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

// 상품 사진. 사진이 없으면 열쇠 아이콘 자리를 보여준다.
export function ProductPhoto({
  name,
  imageUrl,
  sizes,
  priority = false,
  className,
}: {
  name: string;
  imageUrl: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <KeyRound
          role="img"
          aria-label={`${name} 사진 자리`}
          className="size-12 opacity-30"
          strokeWidth={1.25}
        />
      )}
    </div>
  );
}
