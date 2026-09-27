import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { getProduct } from "@/data/products";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage(props: PageProps<"/checkout/[id]">) {
  const { id } = await props.params;
  const { error } = await props.searchParams;
  const product = getProduct(id);
  if (!product || product.stock === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:px-6">
      <Breadcrumb
        items={[
          { label: "홈", href: "/" },
          { label: product.name, href: `/products/${product.id}` },
          { label: "주문하기" },
        ]}
      />
      <h1 className="mt-6 text-3xl font-bold tracking-tight">주문하기</h1>
      <CheckoutForm
        product={product}
        initialError={typeof error === "string" ? error : null}
      />
    </main>
  );
}
