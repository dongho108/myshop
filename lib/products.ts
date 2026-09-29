import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/data/products";

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  stock: number;
};

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.image_url,
    stock: row.stock,
  };
}

// 판매 중인 상품만 (RLS: active = true). 로그인 여부와 상관없이 누구나 볼 수 있다.
export async function listProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as ProductRow[]).map(fromRow);
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as ProductRow) : null;
}
