import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState, Select, StatusBadge } from "@/components/ui";
import { PlusIcon, SearchIcon } from "@/components/icons";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;

  const deliveries = await prisma.deliveryOrder.findMany({
    where: {
      AND: [
        params.status ? { status: params.status as never } : {},
        params.q
          ? {
              OR: [
                { reference: { contains: params.q } },
                { customerName: { contains: params.q } },
              ],
            }
          : {},
      ],
    },
    include: { fromLocation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Delivery Orders</h1>
          <p className="mt-1 text-sm text-muted">Outgoing stock to customers.</p>
        </div>
        <Link href="/operations/deliveries/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            New Delivery
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
              placeholder="Search by reference or customer..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <Select name="status" defaultValue={params.status} className="w-44">
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="WAITING">Waiting</option>
            <option value="READY">Ready</option>
            <option value="DONE">Done</option>
            <option value="CANCELED">Canceled</option>
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {deliveries.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No delivery orders yet" description="Create one when stock needs to ship to a customer." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">Schedule Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-background">
                  <td className="px-5 py-3">
                    <Link href={`/operations/deliveries/${d.id}`} className="font-medium text-foreground hover:text-accent">
                      {d.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{d.customerName}</td>
                  <td className="px-5 py-3 text-muted">{d.fromLocation.name}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(d.scheduleDate)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={d.status} />
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
