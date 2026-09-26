import { prisma } from "@/lib/prisma";
import { createAdjustment } from "@/lib/actions/adjustments";
import { NewAdjustmentForm } from "./new-adjustment-form";

export default async function NewAdjustmentPage() {
  const [products, locations] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.location.findMany({ include: { warehouse: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Adjustment</h1>
        <p className="mt-1 text-sm text-muted">Enter the physical count for a product at a location.</p>
      </div>
      <NewAdjustmentForm action={createAdjustment} products={products} locations={locations} />
    </div>
  );
}
