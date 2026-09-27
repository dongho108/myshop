import { NextResponse, type NextRequest } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";

// 결제창에서 실패하거나 손님이 닫으면 여기로 온다: ?code&message&orderId
// 승인 API는 부르지 않는다. 주문을 실패로 바꾸고 주문 화면으로 돌려보낸다.
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/payments/fail/[productId]">,
) {
  const { productId } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const code = params.get("code") ?? "";
  const orderId = params.get("orderId");

  const message =
    code === "PAY_PROCESS_CANCELED"
      ? "결제를 취소했어요. 준비되면 다시 결제해주세요."
      : (params.get("message") ?? "결제하지 못했어요. 다시 시도해주세요.");

  if (orderId) {
    const order = await getOrder(orderId);
    if (order?.productId === productId) {
      await updateOrder(orderId, "pending", { status: "failed", failReason: message });
    }
  }

  return NextResponse.redirect(
    new URL(
      `/checkout/${encodeURIComponent(productId)}?error=${encodeURIComponent(message)}`,
      request.url,
    ),
  );
}
