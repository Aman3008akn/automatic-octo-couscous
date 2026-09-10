"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function AutoScrollToProducts() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("categorySlug");
  const q = searchParams.get("q");

  useEffect(() => {
    // When a category or search query is present, automatically scroll to the products
    if (categorySlug || q || (typeof window !== "undefined" && window.location.hash.includes("product"))) {
      const timer = setTimeout(() => {
        // Target products grid directly (on mobile this skips past the sidebar filters)
        const target =
          window.innerWidth < 1024
            ? document.getElementById("products-grid") || document.getElementById("products")
            : document.getElementById("products") || document.getElementById("products-grid");

        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [categorySlug, q]);

  return null;
}
