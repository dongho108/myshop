"use server";

import { randomUUID } from "node:crypto";
import { createOrder, updateOrder } from "@/lib/orders";
import { getProduct } from "@/data/products";

export type StartOrderResult =
  | { ok: true; orderId: string; amount: number; orderName: string }
  | { ok: false; message: string };

// 결제창을 열기 전에 서버에 '결제 대기' 주문을 만든다.
// 금액은 브라우저가 보낸 값이 아니라 서버의 상품 가격으로 정한다.
export async function startOrder(input: {
  productId: string;
  recipient: string;
  phone: string;
  address: string;
}): Promise<StartOrderResult> {
  const product = getProduct(String(input.productId));
  if (!product) return { ok: false, message: "없는 상품이에요." };
  if (product.stock === 0) return { ok: false, message: "다 팔린 상품이에요." };

  const recipient = String(input.recipient ?? "").trim();
  const phone = String(input.phone ?? "").trim();
  const address = String(input.address ?? "").trim();
  if (!recipient || recipient.length > 50)
    return { ok: false, message: "받는 분 이름을 확인해주세요." };
  if (!/^[0-9-]{9,15}$/.test(phone))
    return { ok: false, message: "연락처는 숫자와 - 만 써주세요." };
  if (address.length < 5 || address.length > 200)
    return { ok: false, message: "주소를 끝까지 적어주세요." };

  const order = await createOrder({
    id: randomUUID(), // 추측할 수 없는 orderId (36자, 영문·숫자·-)
    productId: product.id,
    productName: product.name,
    quantity: 1,
    amount: product.price,
    status: "pending",
    recipient,
    phone,
    address,
    idempotencyKey: randomUUID(),
    createdAt: new Date().toISOString(),
    paymentKey: null,
    method: null,
    approvedAt: null,
    tossSecret: null,
    failReason: null,
    shippingStatus: "preparing",
    trackingNumber: null,
  });

  return {
    ok: true,
    orderId: order.id,
    amount: order.amount,
    orderName: order.productName,
  };
}

// 결제창을 닫는 등 결제 요청 전에 멈춘 주문을 정리한다. 대기 중인 주문만 바뀐다.
export async function abandonOrder(orderId: string, code: string) {
  await updateOrder(String(orderId), "pending", {
    status: "failed",
    failReason: String(code).slice(0, 64),
  });
}
