"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { ProductPhoto } from "@/components/product-photo";
import { pillClass } from "@/components/pill-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, type Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { abandonOrder, startOrder } from "../actions";

const fields = [
  { id: "recipient", label: "이름", placeholder: "홍길동", autoComplete: "name", type: "text" },
  { id: "phone", label: "연락처", placeholder: "010-1234-5678", autoComplete: "tel", type: "tel" },
  { id: "address", label: "주소", placeholder: "도로명 주소와 상세 주소", autoComplete: "street-address", type: "text" },
] as const;

export function CheckoutForm({
  product,
  customerKey,
  initialError,
}: {
  product: Product;
  customerKey: string;
  initialError: string | null;
}) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  // 토스 결제 UI(결제수단 + 약관)를 주문서 안에 그린다
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY가 없어요");
        const tossPayments = await loadTossPayments(clientKey);
        if (cancelled) return;
        const widgets = tossPayments.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: product.price });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method" }),
          widgets.renderAgreement({ selector: "#agreement" }),
        ]);
        if (cancelled) return;
        widgetsRef.current = widgets;
        setReady(true);
      } catch {
        if (!cancelled) setError("결제 화면을 불러오지 못했어요. 새로고침해주세요.");
      }
    })();
    return () => {
      cancelled = true;
      widgetsRef.current = null;
      setReady(false);
      // 개발 모드에서 두 번 그려지는 걸 막으려고 자리를 비운다
      for (const id of ["payment-method", "agreement"]) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
      }
    };
  }, [product.price, customerKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const widgets = widgetsRef.current;
    if (!widgets || submitting) return;
    setError(null);
    setSubmitting(true);

    const data = new FormData(event.currentTarget);
    const order = await startOrder({
      productId: product.id,
      recipient: String(data.get("recipient") ?? ""),
      phone: String(data.get("phone") ?? ""),
      address: String(data.get("address") ?? ""),
    });
    if (!order.ok) {
      setError(order.message);
      setSubmitting(false);
      return;
    }

    try {
      // 서버가 정한 금액으로 한 번 더 맞춘 다음 결제창을 연다
      await widgets.setAmount({ currency: "KRW", value: order.amount });
      await widgets.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail/${product.id}`,
      });
    } catch (err) {
      // PC에서 결제창을 닫거나 약관에 동의하지 않으면 failUrl 대신 여기로 온다
      const { code, message } = (err ?? {}) as { code?: string; message?: string };
      await abandonOrder(order.orderId, code ?? "UNKNOWN");
      setError(
        code === "USER_CANCEL"
          ? "결제를 취소했어요. 준비되면 다시 결제해주세요."
          : (message ?? "결제창을 열지 못했어요. 다시 시도해주세요."),
      );
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-10 md:grid-cols-[1fr_22rem] md:gap-12"
    >
      <div className="min-w-0 space-y-5">
        <h2 className="text-lg font-semibold">받는 분</h2>
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-base">
              {field.label}
            </Label>
            <Input
              id={field.id}
              name={field.id}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              className="h-12 rounded-xl px-4 text-base"
              required
            />
          </div>
        ))}

        <h2 className="pt-6 text-lg font-semibold">결제 수단</h2>
        {/* 토스 결제 UI가 이 두 칸에 그려진다 */}
        <div className="-mx-4 min-h-40 sm:-mx-6">
          <div id="payment-method" />
          <div id="agreement" />
        </div>
      </div>

      <aside className="h-fit rounded-2xl bg-muted p-6 md:sticky md:top-24">
        <div className="flex gap-4">
          <ProductPhoto
            name={product.name}
            imageUrl={product.imageUrl}
            sizes="80px"
            className="size-20 shrink-0 bg-background [&_svg]:size-8"
          />
          <div>
            <p className="text-base font-semibold">{product.name}</p>
            <p className="text-sm text-muted-foreground">1개</p>
          </div>
        </div>
        <dl className="mt-6 space-y-2 text-base">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">상품 금액</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">배송비</dt>
            <dd>무료</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
            <dt>결제 금액</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
        </dl>

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-background p-3 text-base text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!ready || submitting}
          className={cn(pillClass, "mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40")}
        >
          {submitting
            ? "결제창 여는 중…"
            : ready
              ? `${formatPrice(product.price)} 결제하기`
              : "결제 화면 불러오는 중…"}
        </button>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          지금은 연습용 결제라 실제로 돈이 나가지 않아요.
        </p>
      </aside>
    </form>
  );
}
