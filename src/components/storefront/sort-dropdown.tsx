"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortDropdown({ defaultSort = "newest" }: { defaultSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <select
      name="sort"
      defaultValue={defaultSort}
      onChange={onChange}
      className="rounded-card border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink outline-none cursor-pointer"
    >
      <option value="newest">Newest Arrivals</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
