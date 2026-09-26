import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cancelReceipt, markReceiptReady, validateReceipt } from "@/lib/actions/receipts";
import { Button, Card } from "@/components/ui";
import { StatusStepper } from "@/components/status-stepper";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: { toLocation: { include: { warehouse: true } }, responsible: true, lines: { include: { product: true } } },
  });

  if (!receipt) notFound();

  const boundReady = markReceiptReady.bind(null, receipt.id);
  const boundValidate = validateReceipt.bind(null, receipt.id);
  const boundCancel = cancelReceipt.bind(null, receipt.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/operations/receipts" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to Receipts
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{receipt.reference}</h1>
          <StatusStepper steps={["DRAFT", "READY", "DONE"]} current={receipt.status} />
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Supplier" value={receipt.supplierName} />
          <Field label="To" value={`${receipt.toLocation.warehouse.name} / ${receipt.toLocation.name}`} />
          <Field label="Schedule Date" value={formatDate(receipt.scheduleDate)} />
          <Field label="Responsible" value={receipt.responsible.fullName} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 text-base font-semibold text-foreground">Products</h2>
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">SKU</th>
              <th className="pb-2 font-medium">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((line) => (
              <tr key={line.id} className="border-t border-border">
                <td className="py-2.5 text-foreground">{line.product.name}</td>
                <td className="py-2.5 text-muted">{line.product.sku}</td>
                <td className="py-2.5 text-foreground">
                  {line.quantity} {line.product.uom}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {receipt.status !== "DONE" && receipt.status !== "CANCELED" && (
        <div className="flex gap-3">
          {receipt.status === "DRAFT" && (
            <form action={boundReady}>
              <Button type="submit">Mark as Ready</Button>
            </form>
          )}
          {receipt.status === "READY" && (
            <form action={boundValidate}>
              <Button type="submit">Validate</Button>
            </form>
          )}
          <form action={boundCancel}>
            <Button type="submit" variant="secondary">
              Cancel
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
