import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState, Select, StatusBadge } from "@/components/ui";
import { PlusIcon, SearchIcon } from "@/components/icons";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;

  const transfers = await prisma.internalTransfer.findMany({
    where: {
      AND: [
        params.status ? { status: params.status as never } : {},
        params.q ? { reference: { contains: params.q } } : {},
      ],
    },
    include: { fromLocation: true, toLocation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Internal Transfers</h1>
          <p className="mt-1 text-sm text-muted">Move stock between warehouses or locations.</p>
        </div>
        <Link href="/operations/transfers/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            New Transfer
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
              placeholder="Search by reference..."
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
        {transfers.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No transfers yet" description="Move stock between locations to see it here." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium">Schedule Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-background">
                  <td className="px-5 py-3">
                    <Link href={`/operations/transfers/${t.id}`} className="font-medium text-foreground hover:text-accent">
                      {t.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{t.fromLocation.name}</td>
                  <td className="px-5 py-3 text-muted">{t.toLocation.name}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(t.scheduleDate)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={t.status} />
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
