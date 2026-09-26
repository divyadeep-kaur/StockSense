import { prisma } from "@/lib/prisma";
import { createTransfer } from "@/lib/actions/transfers";
import { NewTransferForm } from "./new-transfer-form";

export default async function NewTransferPage() {
  const [locations, products] = await Promise.all([
    prisma.location.findMany({ include: { warehouse: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Internal Transfer</h1>
        <p className="mt-1 text-sm text-muted">Move stock between two locations.</p>
      </div>
      <NewTransferForm action={createTransfer} locations={locations} products={products} />
    </div>
  );
}
