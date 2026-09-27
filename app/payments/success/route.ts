import { NextResponse, type NextRequest } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";
import { confirmPayment, getPayment, type TossPayment } from "@/lib/toss";

// 토스 결제창에서 인증이 끝나면 여기로 온다: ?paymentKey&orderId&amount
// 여기서 금액을 대조하고 승인 API를 불러야 결제가 끝난다.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const paymentKey = params.get("paymentKey") ?? "";
  const orderId = params.get("orderId") ?? "";
  const amount = Number(params.get("amount"));

  const go = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const order = await getOrder(orderId);
  if (!order || !paymentKey) return go("/");

  const backToCheckout = (message: string) =>
    go(`/checkout/${order.productId}?error=${encodeURIComponent(message)}`);

  // 새로고침 등으로 다시 들어온 경우: 이미 끝난 주문이면 결과만 보여준다
  if (order.status === "paid" && order.paymentKey === paymentKey) {
    return go(`/orders?new=${order.id}`);
  }
  if (order.status !== "pending") {
    return backToCheckout("이미 처리된 주문이에요. 처음부터 다시 주문해주세요.");
  }

  // ★ 가장 중요한 한 줄: 브라우저가 보낸 금액이 서버가 정한 주문 금액과 같은지 확인
  if (amount !== order.amount) {
    await updateOrder(order.id, "pending", { failReason: "금액 불일치", status: "failed" });
    return backToCheckout("결제 금액이 주문과 달라서 결제하지 않았어요.");
  }

  // 승인 요청 금액은 쿼리 값이 아니라 서버에 저장된 금액을 쓴다
  let result = await confirmPayment({
    paymentKey,
    orderId: order.id,
    amount: order.amount,
    idempotencyKey: order.idempotencyKey,
  });

  // 승인 응답이 실패여도 실제로는 승인됐을 수 있다. 조회해서 한 번 더 확인한다
  if (!result.ok && result.code !== "NETWORK_ERROR") {
    const check = await getPayment(paymentKey);
    if (check.ok && isDoneFor(check.payment, order.id, order.amount)) result = check;
  }

  if (result.ok && isDoneFor(result.payment, order.id, order.amount)) {
    await updateOrder(order.id, "pending", {
      status: "paid",
      paymentKey: result.payment.paymentKey,
      method: result.payment.method,
      approvedAt: result.payment.approvedAt,
      tossSecret: result.payment.secret,
    });
    return go(`/orders?new=${order.id}`);
  }

  const message = result.ok ? "결제가 끝나지 않았어요." : result.message;
  // 연결 문제면 주문을 대기 상태로 남겨서 다시 시도할 수 있게 한다
  if (result.ok || result.code !== "NETWORK_ERROR") {
    await updateOrder(order.id, "pending", { status: "failed", failReason: message });
  }
  return backToCheckout(message);
}

function isDoneFor(payment: TossPayment, orderId: string, amount: number) {
  return (
    payment.status === "DONE" &&
    payment.orderId === orderId &&
    payment.totalAmount === amount
  );
}
