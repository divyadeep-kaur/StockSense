import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, CheckboxFilterGroup, EmptyState, StatusBadge } from "@/components/ui";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { toArray } from "@/lib/params";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "READY", label: "Ready" },
  { value: "DONE", label: "Done" },
  { value: "CANCELED", label: "Canceled" },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string | string[] }>;
}) {
  const params = await searchParams;
  const statuses = toArray(params.status);

  const receipts = await prisma.receipt.findMany({
    where: {
      AND: [
        statuses.length > 0 ? { status: { in: statuses as never[] } } : {},
        params.q
          ? {
              OR: [
                { reference: { contains: params.q } },
                { supplierName: { contains: params.q } },
              ],
            }
          : {},
      ],
    },
    include: { toLocation: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Receipts</h1>
          <p className="mt-1 text-sm text-muted">Incoming stock from suppliers.</p>
        </div>
        <Link href="/operations/receipts/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            New Receipt
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
              placeholder="Search by reference or supplier..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <CheckboxFilterGroup name="status" options={STATUS_OPTIONS} selected={statuses} />
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {receipts.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No receipts yet" description="Create a receipt when stock arrives from a supplier." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Supplier</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium">Schedule Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-background">
                  <td className="px-5 py-3">
                    <Link href={`/operations/receipts/${r.id}`} className="font-medium text-foreground hover:text-accent">
                      {r.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted">{r.supplierName}</td>
                  <td className="px-5 py-3 text-muted">{r.toLocation.name}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(r.scheduleDate)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
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
