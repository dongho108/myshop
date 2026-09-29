// 상품 타입과 화면 표시용 유틸. 실제 상품 데이터는 lib/products.ts에서 Supabase로 조회한다.
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}
