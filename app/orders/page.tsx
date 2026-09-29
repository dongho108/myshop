import { CircleCheck } from "lucide-react";
import { PillLink } from "@/components/pill-link";
import { ProductPhoto } from "@/components/product-photo";
import { formatPrice } from "@/data/products";
import { listProducts } from "@/lib/products";
import { listOrders, shippingLabel } from "@/lib/orders";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeZone: "Asia/Seoul",
});

export default async function OrdersPage(props: PageProps<"/orders">) {
  const { new: newId } = await props.searchParams;
  // RLS 덕분에 listOrders()는 로그인한 본인 주문만 돌려준다
  const [orders, products] = await Promise.all([
    listOrders().then((all) => all.filter((order) => order.status === "paid")),
    listProducts(),
  ]);
  const productById = new Map(products.map((p) => [p.id, p]));
  const justBought = orders.find((order) => order.id === newId);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-20 sm:px-6">
      {justBought && (
        <section className="mb-12 rounded-2xl bg-muted px-6 py-10 text-center">
          <CircleCheck className="mx-auto size-12" strokeWidth={1.5} />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            결제가 끝났어요
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {justBought.productName}, 정성껏 포장해서 보내드릴게요.
            <br />
            보내면 이 화면에 송장번호가 떠요.
          </p>
        </section>
      )}

      <h2 className="text-2xl font-bold tracking-tight">내 구매목록</h2>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-muted px-6 py-12 text-center">
          <p className="text-lg text-muted-foreground">아직 산 키링이 없어요.</p>
          <PillLink href="/#products" className="mt-6">
            키링 보러 가기
          </PillLink>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {orders.map((order) => {
            const product = productById.get(order.productId);
            return (
              <li key={order.id} className="flex gap-4 py-5">
                <ProductPhoto
                  name={order.productName}
                  imageUrl={product?.imageUrl ?? null}
                  sizes="80px"
                  className="size-20 shrink-0 [&_svg]:size-7"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{order.productName}</h3>
                    <span
                      className={
                        order.shippingStatus === "delivered"
                          ? "shrink-0 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
                          : "shrink-0 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                      }
                    >
                      {shippingLabel[order.shippingStatus]}
                    </span>
                  </div>
                  <p className="mt-1 text-base text-muted-foreground">
                    {dateFormat.format(new Date(order.createdAt))} ·{" "}
                    {formatPrice(order.amount)}
                  </p>
                  {order.trackingNumber && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      송장번호 {order.trackingNumber}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
