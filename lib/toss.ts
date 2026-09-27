import "server-only";

// 토스페이먼츠 서버 API. 시크릿 키는 이 파일에서만 읽는다.
// 인증: Basic base64(시크릿키 + ":") — 콜론을 빠뜨리면 401
function authHeader() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY가 .env.local에 없어요");
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

// 결제 승인·조회 응답 중 우리가 쓰는 필드만
export type TossPayment = {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string | null;
  approvedAt: string | null;
  secret: string | null;
};

export type TossResult =
  | { ok: true; payment: TossPayment }
  | { ok: false; code: string; message: string };

async function call(
  url: string,
  init: RequestInit & { idempotencyKey?: string },
): Promise<TossResult> {
  const headers: Record<string, string> = {
    Authorization: authHeader(),
    "Content-Type": "application/json",
  };
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  try {
    const res = await fetch(url, { ...init, headers, cache: "no-store" });
    const body = await res.json();
    if (!res.ok) return { ok: false, code: body.code, message: body.message };
    return { ok: true, payment: body as TossPayment };
  } catch {
    return {
      ok: false,
      code: "NETWORK_ERROR",
      message: "결제 서버와 연결하지 못했어요. 잠시 뒤 다시 시도해주세요.",
    };
  }
}

export function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
  idempotencyKey: string;
}) {
  const { idempotencyKey, ...body } = params;
  return call("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export function getPayment(paymentKey: string) {
  return call(
    `https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`,
    { method: "GET" },
  );
}
