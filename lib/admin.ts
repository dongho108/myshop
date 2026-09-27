import "server-only";

// 관리자 화면을 열어도 되는지.
// 로그인을 붙이기 전까지는 내 컴퓨터(개발 서버)에서만 열린다.
// 로그인을 붙이면 "사장님 구글 계정인가"로 바꾼다. 그 전에는 절대 배포하지 않는다.
export function isAdminAllowed() {
  return process.env.NODE_ENV === "development";
}
