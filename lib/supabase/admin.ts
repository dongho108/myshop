import "server-only";
import { createClient } from "@supabase/supabase-js";

// RLS를 우회하는 서버 전용 클라이언트. 결제 상태 전환, 배송 상태 변경처럼
// 사용자 본인이라도 직접 바꾸면 안 되는 값을 서버 로직에서만 바꿀 때 쓴다.
// 절대 클라이언트 컴포넌트나 NEXT_PUBLIC_ 환경변수로 내보내지 않는다.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) throw new Error("SUPABASE_SECRET_KEY가 .env.local에 없어요");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
