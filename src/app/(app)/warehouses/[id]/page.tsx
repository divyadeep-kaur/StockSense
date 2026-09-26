import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createLocation } from "@/lib/actions/warehouses";
import { Card } from "@/components/ui";
import { AddLocationForm } from "./add-location-form";

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
    include: { locations: { include: { stockItems: true }, orderBy: { name: "asc" } } },
  });

  if (!warehouse) notFound();

  const boundCreateLocation = createLocation.bind(null, warehouse.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/warehouses" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to Warehouses
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">{warehouse.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {warehouse.shortCode}
          {warehouse.address ? ` · ${warehouse.address}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Short Code</th>
                <th className="px-5 py-3 font-medium">Items Stocked</th>
              </tr>
            </thead>
            <tbody>
              {warehouse.locations.map((loc) => (
                <tr key={loc.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium text-foreground">{loc.name}</td>
                  <td className="px-5 py-3 text-muted">{loc.shortCode}</td>
                  <td className="px-5 py-3 text-muted">
                    {loc.stockItems.reduce((sum, s) => sum + s.onHand, 0)} units
                  </td>
                </tr>
              ))}
              {warehouse.locations.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-muted">
                    No locations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Add Location</h2>
          <AddLocationForm action={boundCreateLocation} />
        </Card>
      </div>
    </div>
  );
}
