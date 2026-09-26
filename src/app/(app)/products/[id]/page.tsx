import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/product-form";
import { Card } from "@/components/ui";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, locations] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { stockItems: { include: { location: { include: { warehouse: true } } } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ include: { warehouse: true }, orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">{product.name}</h1>
      </div>

      <ProductForm
        action={boundUpdate}
        categories={categories}
        locations={locations}
        mode="edit"
        initialValues={{
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          uom: product.uom,
          minStockQty: product.minStockQty,
          reorderQty: product.reorderQty,
          lowStockAlert: product.lowStockAlert,
        }}
      />

      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground">Stock by location</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-2 font-medium">Warehouse</th>
              <th className="pb-2 font-medium">Location</th>
              <th className="pb-2 font-medium">On Hand</th>
              <th className="pb-2 font-medium">Reserved</th>
              <th className="pb-2 font-medium">Free to Use</th>
            </tr>
          </thead>
          <tbody>
            {product.stockItems.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="py-2.5 text-muted">{item.location.warehouse.name}</td>
                <td className="py-2.5 text-foreground">{item.location.name}</td>
                <td className="py-2.5 text-foreground">{item.onHand}</td>
                <td className="py-2.5 text-muted">{item.reserved}</td>
                <td className="py-2.5 text-foreground">{item.onHand - item.reserved}</td>
              </tr>
            ))}
            {product.stockItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted">
                  No stock recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
