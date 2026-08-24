import { notFound } from "next/navigation";
import { getCategories, getAdminProductById } from "@/server/admin-catalog";
import { ProductForm } from "../../components/product-form";

export default async function EditAdminProductPage({ params }: { params: { id: string } }) {
  const categories = await getCategories();
  const product = await getAdminProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <span className="text-xs font-mono font-medium text-amber-500 uppercase tracking-wider">
          Store Management
        </span>
        <h1 className="text-3xl font-display font-bold text-ink">Edit Product</h1>
      </div>

      <ProductForm categories={categories} initialData={product} />
    </main>
  );
}
