import "server-only";
import { createClient } from "@/lib/supabase/server";

// 사장님 구글 계정인지 확인한다. ADMIN_EMAIL과 로그인한 계정의 이메일이 같아야 한다.
export async function isAdminAllowed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  return typeof email === "string" && email.toLowerCase() === adminEmail.toLowerCase();
}
