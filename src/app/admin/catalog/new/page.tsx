import { getCategories } from "@/server/admin-catalog";
import { ProductForm } from "../components/product-form";

export default async function NewAdminProductPage() {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Store Management
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">Add New Product</h1>
      </div>

      <ProductForm categories={categories} />
    </main>
  );
}
