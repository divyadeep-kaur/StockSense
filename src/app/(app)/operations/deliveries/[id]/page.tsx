import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cancelDelivery, checkAvailability, validateDelivery } from "@/lib/actions/deliveries";
import { Button, Card } from "@/components/ui";
import { StatusStepper } from "@/components/status-stepper";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const delivery = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: {
      fromLocation: { include: { warehouse: true } },
      responsible: true,
      lines: { include: { product: true } },
    },
  });

  if (!delivery) notFound();

  const boundCheck = checkAvailability.bind(null, delivery.id);
  const boundValidate = validateDelivery.bind(null, delivery.id);
  const boundCancel = cancelDelivery.bind(null, delivery.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/operations/deliveries" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to Delivery Orders
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{delivery.reference}</h1>
          <StatusStepper steps={["DRAFT", "WAITING", "READY", "DONE"]} current={delivery.status} />
        </div>
      </div>

      {delivery.status === "WAITING" && (
        <div className="rounded-xl border border-warning-soft bg-warning-soft/60 px-4 py-3 text-sm text-warning">
          Waiting for stock — one or more products don&apos;t have enough available quantity at the source location yet.
        </div>
      )}

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Customer" value={delivery.customerName} />
          <Field label="From" value={`${delivery.fromLocation.warehouse.name} / ${delivery.fromLocation.name}`} />
          <Field label="Schedule Date" value={formatDate(delivery.scheduleDate)} />
          <Field label="Responsible" value={delivery.responsible.fullName} />
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
            {delivery.lines.map((line) => (
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

      {delivery.status !== "DONE" && delivery.status !== "CANCELED" && (
        <div className="flex gap-3">
          {(delivery.status === "DRAFT" || delivery.status === "WAITING") && (
            <form action={boundCheck}>
              <Button type="submit">Check Availability</Button>
            </form>
          )}
          {delivery.status === "READY" && (
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
