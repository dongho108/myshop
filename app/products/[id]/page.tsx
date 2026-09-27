import { notFound } from "next/navigation";
import { Hand, RotateCcw, Truck } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";
import { PillLink } from "@/components/pill-link";
import { ProductGrid } from "@/components/product-grid";
import { ProductPhoto } from "@/components/product-photo";
import { formatPrice, getProduct, products } from "@/data/products";

const promises = [
  { icon: Truck, title: "무료배송", body: "모든 키링을 배송비 없이 보내드려요" },
  { icon: Hand, title: "손으로 제작", body: "하나씩 만들어서 모양이 조금씩 달라요" },
  { icon: RotateCcw, title: "7일 안에 교환", body: "받은 키링이 망가져 있으면 바꿔드려요" },
];

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;
  const product = getProduct(id);
  if (!product) notFound();

  const soldOut = product.stock === 0;
  const others = products.filter((p) => p.id !== product.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:px-6">
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: "키링", href: "/#products" },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductPhoto
          name={product.name}
          imageUrl={product.imageUrl}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="rounded-2xl"
        />

        <div className="md:py-4">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold">
            {formatPrice(product.price)}
          </p>
          <p
            className={
              soldOut
                ? "mt-2 text-base text-destructive"
                : "mt-2 text-base text-muted-foreground"
            }
          >
            {soldOut ? "다 팔렸어요" : `${product.stock}개 남았어요`}
          </p>

          <p className="mt-6 text-lg leading-relaxed">{product.description}</p>

          {soldOut ? (
            <p className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
              다음 판을 기다려주세요
            </p>
          ) : (
            <PillLink href={`/checkout/${product.id}`} className="mt-8 w-full">
              구매하기
            </PillLink>
          )}

          <ul className="mt-8 divide-y divide-border border-y border-border">
            {promises.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex items-center gap-4 py-4">
                <Icon aria-hidden className="size-6 shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-base font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {others.length > 0 && (
        <section className="pt-20">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">
            다른 키링도 있어요
          </h2>
          <ProductGrid products={others} />
        </section>
      )}
    </main>
  );
}
