import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { AddCategoryForm } from "./add-category-form";
import { AddWarehouseForm } from "./add-warehouse-form";

export default async function SettingsPage() {
  const [categories, warehouses] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.warehouse.findMany({
      include: { _count: { select: { locations: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted">Configure your warehouses, categories, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 className="text-base font-semibold text-foreground">Warehouses</h2>
            <Link href="/warehouses" className="text-sm font-medium text-accent hover:underline">
              Manage locations →
            </Link>
          </div>
          <table className="mt-2 w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Warehouse</th>
                <th className="px-5 py-3 font-medium">Short Code</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Locations</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="border-t border-border">
                  <td className="px-5 py-3">
                    <Link href={`/warehouses/${w.id}`} className="font-medium text-foreground hover:text-accent">
                      {w.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{w.shortCode}</td>
                  <td className="px-5 py-3 text-muted">{w.address ?? "-"}</td>
                  <td className="px-5 py-3 text-muted">{w._count.locations}</td>
                </tr>
              ))}
              {warehouses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-muted">
                    No warehouses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Add Warehouse</h2>
          <AddWarehouseForm />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Products</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-5 py-3 text-muted">{c._count.products}</td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-6 text-center text-muted">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Add Category</h2>
          <AddCategoryForm />
        </Card>
      </div>
    </div>
  );
}
