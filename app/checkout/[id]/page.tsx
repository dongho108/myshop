import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { getProduct } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage(props: PageProps<"/checkout/[id]">) {
  const { id } = await props.params;
  const { error } = await props.searchParams;
  const product = await getProduct(id);
  if (!product || product.stock === 0) notFound();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const loggedIn = Boolean(userId);

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

      {loggedIn && userId ? (
        <CheckoutForm
          product={product}
          customerKey={userId}
          initialError={typeof error === "string" ? error : null}
        />
      ) : (
        <div className="mt-10 rounded-2xl bg-muted px-6 py-16 text-center">
          <p className="text-lg">구글 로그인을 하면 주문을 이어갈 수 있어요.</p>
          <GoogleLoginButton next={`/checkout/${product.id}`} className="mt-6" />
        </div>
      )}
    </main>
  );
}
