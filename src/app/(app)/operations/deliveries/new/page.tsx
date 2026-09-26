import { prisma } from "@/lib/prisma";
import { createDelivery } from "@/lib/actions/deliveries";
import { NewDeliveryForm } from "./new-delivery-form";

export default async function NewDeliveryPage() {
  const [locations, products] = await Promise.all([
    prisma.location.findMany({ include: { warehouse: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Delivery</h1>
        <p className="mt-1 text-sm text-muted">Ship stock out to a customer.</p>
      </div>
      <NewDeliveryForm action={createDelivery} locations={locations} products={products} />
    </div>
  );
}
