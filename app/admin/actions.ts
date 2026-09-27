"use server";

import { revalidatePath } from "next/cache";
import { isAdminAllowed } from "@/lib/admin";
import { updateOrder, type ShippingStatus } from "@/lib/orders";

export type ShippingFormState = { ok: boolean; message: string } | null;

const statuses: ShippingStatus[] = ["preparing", "shipping", "delivered"];

export async function saveShipping(
  _prev: ShippingFormState,
  formData: FormData,
): Promise<ShippingFormState> {
  if (!isAdminAllowed()) return { ok: false, message: "권한이 없어요." };

  const orderId = String(formData.get("orderId") ?? "");
  const shippingStatus = String(formData.get("shippingStatus") ?? "") as ShippingStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();

  if (!statuses.includes(shippingStatus))
    return { ok: false, message: "배송 상태를 골라주세요." };
  if (trackingNumber && !/^[0-9-]{6,30}$/.test(trackingNumber))
    return { ok: false, message: "송장번호는 숫자와 - 만 써주세요." };
  if (shippingStatus !== "preparing" && !trackingNumber)
    return { ok: false, message: "보냈다면 송장번호를 넣어주세요." };

  // 결제가 끝난 주문만 배송 정보를 바꿀 수 있다
  const updated = await updateOrder(orderId, "paid", {
    shippingStatus,
    trackingNumber: trackingNumber || null,
  });
  if (!updated) return { ok: false, message: "결제 완료된 주문을 찾지 못했어요." };

  revalidatePath("/admin");
  revalidatePath("/orders");
  return { ok: true, message: "저장했어요." };
}
