import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/product-form";

export default async function NewProductPage() {
  const [categories, locations] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ include: { warehouse: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Add Product</h1>
      </div>

      <ProductForm action={createProduct} categories={categories} locations={locations} mode="create" />
    </div>
  );
}
