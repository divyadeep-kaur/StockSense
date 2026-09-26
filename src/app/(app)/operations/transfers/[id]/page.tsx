import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cancelTransfer, checkTransferAvailability, validateTransfer } from "@/lib/actions/transfers";
import { Button, Card } from "@/components/ui";
import { StatusStepper } from "@/components/status-stepper";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const transfer = await prisma.internalTransfer.findUnique({
    where: { id },
    include: {
      fromLocation: { include: { warehouse: true } },
      toLocation: { include: { warehouse: true } },
      responsible: true,
      lines: { include: { product: true } },
    },
  });

  if (!transfer) notFound();

  const boundCheck = checkTransferAvailability.bind(null, transfer.id);
  const boundValidate = validateTransfer.bind(null, transfer.id);
  const boundCancel = cancelTransfer.bind(null, transfer.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/operations/transfers" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to Internal Transfers
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{transfer.reference}</h1>
          <StatusStepper steps={["DRAFT", "WAITING", "READY", "DONE"]} current={transfer.status} />
        </div>
      </div>

      {transfer.status === "WAITING" && (
        <div className="rounded-xl border border-warning-soft bg-warning-soft/60 px-4 py-3 text-sm text-warning">
          Waiting for stock — the source location doesn&apos;t have enough available quantity yet.
        </div>
      )}

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="From" value={`${transfer.fromLocation.warehouse.name} / ${transfer.fromLocation.name}`} />
          <Field label="To" value={`${transfer.toLocation.warehouse.name} / ${transfer.toLocation.name}`} />
          <Field label="Schedule Date" value={formatDate(transfer.scheduleDate)} />
          <Field label="Responsible" value={transfer.responsible.fullName} />
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
            {transfer.lines.map((line) => (
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

      {transfer.status !== "DONE" && transfer.status !== "CANCELED" && (
        <div className="flex gap-3">
          {(transfer.status === "DRAFT" || transfer.status === "WAITING") && (
            <form action={boundCheck}>
              <Button type="submit">Check Availability</Button>
            </form>
          )}
          {transfer.status === "READY" && (
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
