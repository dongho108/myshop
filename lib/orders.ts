import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type ShippingStatus = "preparing" | "shipping" | "delivered";

export type Order = {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  status: PaymentStatus;
  recipient: string;
  phone: string;
  address: string;
  idempotencyKey: string;
  createdAt: string;
  paymentKey: string | null;
  method: string | null;
  approvedAt: string | null;
  tossSecret: string | null;
  failReason: string | null;
  shippingStatus: ShippingStatus;
  trackingNumber: string | null;
};

type OrderRow = {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  amount: number;
  status: PaymentStatus;
  recipient: string;
  phone: string;
  address: string;
  idempotency_key: string;
  created_at: string;
  payment_key: string | null;
  method: string | null;
  approved_at: string | null;
  toss_secret: string | null;
  fail_reason: string | null;
  shipping_status: ShippingStatus;
  tracking_number: string | null;
};

export const shippingLabel: Record<ShippingStatus, string> = {
  preparing: "배송 준비 중",
  shipping: "배송 중",
  delivered: "배송 완료",
};

function fromRow(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    amount: row.amount,
    status: row.status,
    recipient: row.recipient,
    phone: row.phone,
    address: row.address,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
    paymentKey: row.payment_key,
    method: row.method,
    approvedAt: row.approved_at,
    tossSecret: row.toss_secret,
    failReason: row.fail_reason,
    shippingStatus: row.shipping_status,
    trackingNumber: row.tracking_number,
  };
}

// 로그인한 사용자 본인의 주문만 (RLS가 걸러준다). /orders 화면에서 쓴다.
export async function listOrders(): Promise<Order[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(fromRow);
}

// 모든 사용자의 주문. 관리자 화면 전용 — 호출 전에 반드시 isAdminAllowed()로 확인한다.
export async function listAllOrdersForAdmin(): Promise<Order[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(fromRow);
}

// 결제 승인 흐름 전용 조회라 RLS를 우회한다 (토스 리다이렉트로 돌아온 요청은 세션이 불안정할 수 있다).
export async function getOrder(id: string): Promise<Order | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as OrderRow) : null;
}

// 로그인한 사용자 본인 명의로 주문을 만든다 (RLS: user_id = auth.uid() 체크).
export async function createOrder(
  order: Omit<Order, "userId"> & { userId: string },
): Promise<Order> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      id: order.id,
      user_id: order.userId,
      product_id: order.productId,
      product_name: order.productName,
      quantity: order.quantity,
      amount: order.amount,
      status: order.status,
      recipient: order.recipient,
      phone: order.phone,
      address: order.address,
      idempotency_key: order.idempotencyKey,
      payment_key: order.paymentKey,
      method: order.method,
      approved_at: order.approvedAt,
      toss_secret: order.tossSecret,
      fail_reason: order.failReason,
      shipping_status: order.shippingStatus,
      tracking_number: order.trackingNumber,
    })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as OrderRow);
}

// 결제 상태·배송 상태 전환. 본인이라도 client에서 직접 못 바꾸게 막아뒀으므로 여기서만 바꾼다.
// expectedStatus가 맞을 때만 바뀐다 (같은 주문을 두 번 승인하는 것을 막는다).
export async function updateOrder(
  id: string,
  expectedStatus: PaymentStatus,
  changes: Partial<Order>,
): Promise<Order | null> {
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (changes.status !== undefined) patch.status = changes.status;
  if (changes.paymentKey !== undefined) patch.payment_key = changes.paymentKey;
  if (changes.method !== undefined) patch.method = changes.method;
  if (changes.approvedAt !== undefined) patch.approved_at = changes.approvedAt;
  if (changes.tossSecret !== undefined) patch.toss_secret = changes.tossSecret;
  if (changes.failReason !== undefined) patch.fail_reason = changes.failReason;
  if (changes.shippingStatus !== undefined) patch.shipping_status = changes.shippingStatus;
  if (changes.trackingNumber !== undefined) patch.tracking_number = changes.trackingNumber;

  const { data, error } = await admin
    .from("orders")
    .update(patch)
    .eq("id", id)
    .eq("status", expectedStatus)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as OrderRow) : null;
}
