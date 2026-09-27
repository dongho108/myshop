import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// 임시 주문 저장소: .data/orders.json 파일.
// Supabase를 붙이면 orders 테이블로 바꾼다. 이 파일은 서버에서만 읽고 쓴다.

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type ShippingStatus = "preparing" | "shipping" | "delivered";

export type Order = {
  id: string; // 토스 orderId로 그대로 쓴다
  productId: string;
  productName: string;
  quantity: number;
  amount: number; // 주문 만들 때 서버가 정한 금액. 승인 전 대조 기준
  status: PaymentStatus;
  recipient: string;
  phone: string;
  address: string;
  idempotencyKey: string;
  createdAt: string;
  paymentKey: string | null;
  method: string | null;
  approvedAt: string | null;
  tossSecret: string | null; // 웹훅 검증용. 절대 화면에 내보내지 않는다
  failReason: string | null;
  shippingStatus: ShippingStatus;
  trackingNumber: string | null;
};

export const shippingLabel: Record<ShippingStatus, string> = {
  preparing: "배송 준비 중",
  shipping: "배송 중",
  delivered: "배송 완료",
};

const file = path.join(process.cwd(), ".data", "orders.json");

async function readAll(): Promise<Order[]> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as Order[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(orders: Order[]) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(orders, null, 2));
}

// 같은 서버 안에서 동시에 쓰다가 덮어쓰지 않도록 한 줄로 세운다
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export async function listOrders() {
  const orders = await readAll();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string) {
  const orders = await readAll();
  return orders.find((order) => order.id === id) ?? null;
}

export function createOrder(order: Order) {
  return exclusive(async () => {
    const orders = await readAll();
    orders.push(order);
    await writeAll(orders);
    return order;
  });
}

// expectedStatus가 맞을 때만 바꾼다. 같은 주문을 두 번 승인하는 걸 막는다.
export function updateOrder(
  id: string,
  expectedStatus: PaymentStatus,
  changes: Partial<Order>,
) {
  return exclusive(async () => {
    const orders = await readAll();
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1 || orders[index].status !== expectedStatus) return null;
    orders[index] = { ...orders[index], ...changes };
    await writeAll(orders);
    return orders[index];
  });
}
