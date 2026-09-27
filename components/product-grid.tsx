import Link from "next/link";
import { ProductPhoto } from "@/components/product-photo";
import { formatPrice, type Product } from "@/data/products";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const soldOut = product.stock === 0;
        return (
          <li key={product.id}>
            <Link
              href={`/products/${product.id}`}
              className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <div className="relative overflow-hidden rounded-xl">
                <ProductPhoto
                  name={product.name}
                  imageUrl={product.imageUrl}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                {soldOut && (
                  <span className="absolute top-3 left-3 rounded-full bg-background px-3 py-1 text-sm font-medium">
                    품절
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg">{product.name}</h3>
              <p
                className={
                  soldOut
                    ? "mt-1 text-lg font-semibold text-muted-foreground line-through"
                    : "mt-1 text-lg font-semibold"
                }
              >
                {formatPrice(product.price)}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
