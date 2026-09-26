import { prisma } from "@/lib/prisma";
import { createReceipt } from "@/lib/actions/receipts";
import { NewReceiptForm } from "./new-receipt-form";

export default async function NewReceiptPage() {
  const [locations, products] = await Promise.all([
    prisma.location.findMany({ include: { warehouse: true }, orderBy: { name: "asc" } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">New Receipt</h1>
        <p className="mt-1 text-sm text-muted">Record incoming stock from a supplier.</p>
      </div>
      <NewReceiptForm action={createReceipt} locations={locations} products={products} />
    </div>
  );
}
