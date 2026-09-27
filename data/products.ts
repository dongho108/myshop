// 임시 상품 데이터. 나중에 Supabase products 테이블로 옮긴다.
// 사진 출처: Unsplash (무료 상업적 사용 가능, https://unsplash.com/license)
//   red-panda.jpg      https://images.unsplash.com/photo-1767149500578-ffc18547de2f
//   crochet-bunny.jpg  https://images.unsplash.com/photo-1753370474846-afc7a13defc4
//   leather-tag.jpg    https://images.unsplash.com/photo-1676488690948-8020c4851c50
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export const products: Product[] = [
  {
    id: "clay-red-panda",
    name: "점토 레서판다 키링",
    description:
      "점토로 얼굴을 빚고 유약을 발라 반짝이게 구웠어요. 눈과 볼 무늬는 하나씩 붓으로 그려서 표정이 조금씩 달라요.",
    price: 12000,
    imageUrl: "/products/red-panda.jpg",
    stock: 5,
  },
  {
    id: "crochet-bunny",
    name: "코바늘 토끼 키링",
    description:
      "면실로 한 코씩 떠서 만든 토끼예요. 빨간 모자를 쓰고 당근을 안고 있어요. 가방에 달면 폭신하게 흔들려요.",
    price: 12000,
    imageUrl: "/products/crochet-bunny.jpg",
    stock: 3,
  },
  {
    id: "leather-tag",
    name: "가죽 태그 키링",
    description:
      "천연 가죽을 물방울 모양으로 잘라 테두리를 눌러 찍었어요. 쓸수록 색이 깊어지고 손때가 멋스럽게 남아요.",
    price: 12000,
    imageUrl: "/products/leather-tag.jpg",
    stock: 0,
  },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}
