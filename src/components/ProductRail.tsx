"use client";

import Link from "next/link";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/store";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  categorySlug?: string;
  items: Product[];
  onAddToCart?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductRail({
  title,
  subtitle,
  categorySlug,
  items,
  onAddToCart,
  onBuyNow,
}: ProductRailProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-8 py-6 md:py-10">
      {/* Rail Header */}
      {title && (
        <div className="text-center mb-3">
          <h2 className="text-xl md:text-3xl font-serif tracking-wider uppercase text-neutral-900 font-normal">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-500 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Centered Taitva Pill Button */}
      <div className="flex justify-center mb-8 sm:mb-10">
        <Link
          href="/products"
          className="rounded-full border border-neutral-800 px-6 py-1 text-xs font-normal text-neutral-900 hover:bg-neutral-100 transition"
        >
          View All
        </Link>
      </div>

      {/* Responsive Grid of Taitva Borderless Product Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 items-start">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </section>
  );
}
