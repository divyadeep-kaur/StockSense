import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listProductsWithStock } from "@/lib/products";
import { Button, Card, CheckboxFilterGroup, EmptyState, StockStatusBadge } from "@/components/ui";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { toArray } from "@/lib/params";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string | string[] }>;
}) {
  const params = await searchParams;
  const categoryIds = toArray(params.category);
  const [products, categories] = await Promise.all([
    listProductsWithStock({ search: params.q, categoryIds }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted">Manage your products, categories, and stock rules.</p>
        </div>
        <Link href="/products/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-center gap-3" method="get">
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search by name, SKU, or category..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <CheckboxFilterGroup
            name="category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            selected={categoryIds}
          />
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No products found" description="Try adjusting your search or add a new product." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Available Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-border hover:bg-background">
                  <td className="px-5 py-3">
                    <Link href={`/products/${product.id}`} className="font-medium text-foreground hover:text-accent">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{product.sku}</td>
                  <td className="px-5 py-3 text-muted">{product.category?.name ?? "-"}</td>
                  <td className="px-5 py-3 text-muted">{product.uom}</td>
                  <td className="px-5 py-3 text-foreground">{product.totalOnHand}</td>
                  <td className="px-5 py-3">
                    <StockStatusBadge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
