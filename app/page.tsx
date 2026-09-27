import { KeyRound } from "lucide-react";
import { PillLink } from "@/components/pill-link";
import { ProductGrid } from "@/components/product-grid";
import { products } from "@/data/products";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl bg-muted px-6 py-14 sm:px-12 sm:py-24">
        <KeyRound
          aria-hidden
          className="absolute -right-10 -bottom-10 size-64 -rotate-12 text-foreground/5 sm:size-96"
          strokeWidth={1}
        />
        <div className="relative max-w-xl">
          <h1 className="text-4xl leading-[1.15] font-bold tracking-tight sm:text-5xl">
            하나씩 손으로 만든
            <br />
            작은 키링
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
            같은 모양이 하나도 없어요. 모든 키링은 무료배송이에요.
          </p>
          <PillLink href="#products" className="mt-8">
            키링 보러 가기
          </PillLink>
        </div>
      </section>

      <section id="products" className="scroll-mt-20 pt-16">
        <h2 className="text-2xl font-bold tracking-tight">이번에 만든 키링</h2>
        <p className="mt-2 mb-8 text-base text-muted-foreground">
          한 번에 몇 개씩만 만들어요. 다 팔리면 다음 판을 기다려주세요.
        </p>
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
