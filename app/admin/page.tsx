import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { formatPrice } from "@/data/products";
import { isAdminAllowed } from "@/lib/admin";
import { listAllOrdersForAdmin, shippingLabel, type ShippingStatus } from "@/lib/orders";
import { ShippingForm } from "./shipping-form";

export const metadata: Metadata = {
  title: "관리자 · myshop 키링공방",
  robots: { index: false },
};

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

const order: ShippingStatus[] = ["preparing", "shipping", "delivered"];

export default async function AdminPage() {
  await connection(); // 매번 최신 주문을 읽는다
  if (!(await isAdminAllowed())) notFound();

  const all = await listAllOrdersForAdmin();
  const paid = all
    .filter((o) => o.status === "paid")
    // 할 일이 남은 주문(준비 중)이 위로 오게
    .sort((a, b) => order.indexOf(a.shippingStatus) - order.indexOf(b.shippingStatus));
  const unpaid = all.filter((o) => o.status !== "paid");

  const count = (status: ShippingStatus) =>
    paid.filter((o) => o.shippingStatus === status).length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-6 pb-20 sm:px-6">
      <p className="text-sm text-muted-foreground">사장님 전용</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">주문 관리</h1>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {order.map((status) => (
          <div key={status} className="rounded-2xl bg-muted p-4">
            <dt className="text-sm text-muted-foreground">{shippingLabel[status]}</dt>
            <dd className="mt-1 text-2xl font-bold">{count(status)}건</dd>
          </div>
        ))}
      </dl>

      {paid.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-muted px-6 py-12 text-center text-lg text-muted-foreground">
          아직 결제된 주문이 없어요.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {paid.map((o) => (
            <li key={o.id} className="rounded-2xl border border-border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-lg font-semibold">
                  {o.productName} × {o.quantity}
                </h2>
                <p className="text-base font-semibold">{formatPrice(o.amount)}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFormat.format(new Date(o.approvedAt ?? o.createdAt))} 결제 ·{" "}
                {o.method ?? "결제수단 모름"} · 주문번호 {o.id.slice(0, 8)}
              </p>

              <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-xl bg-muted p-4 text-base sm:grid-cols-[5rem_1fr]">
                <dt className="text-muted-foreground">받는 분</dt>
                <dd>{o.recipient}</dd>
                <dt className="text-muted-foreground">연락처</dt>
                <dd>
                  <a href={`tel:${o.phone}`} className="underline-offset-4 hover:underline">
                    {o.phone}
                  </a>
                </dd>
                <dt className="text-muted-foreground">주소</dt>
                <dd className="break-keep">{o.address}</dd>
              </dl>

              <div className="mt-4">
                <ShippingForm
                  orderId={o.id}
                  shippingStatus={o.shippingStatus}
                  trackingNumber={o.trackingNumber}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {unpaid.length > 0 && (
        <details className="mt-10 text-base">
          <summary className="cursor-pointer text-muted-foreground">
            결제가 안 끝난 주문 {unpaid.length}건 (취소·실패·대기)
          </summary>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {unpaid.map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span>
                  {o.productName} · {o.recipient}
                </span>
                <span className="text-muted-foreground">
                  {o.status === "pending" ? "결제 대기" : `실패: ${o.failReason ?? "-"}`} ·{" "}
                  {dateFormat.format(new Date(o.createdAt))}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
