import { prisma } from "@/lib/prisma";
import { Card, EmptyState, Select, StatusBadge } from "@/components/ui";
import { SearchIcon } from "@/components/icons";
import { Button } from "@/components/ui";

const DOC_TYPE_LABEL: Record<string, string> = {
  RECEIPT: "Receipt",
  DELIVERY: "Delivery",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function MoveHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;

  const moves = await prisma.stockMove.findMany({
    where: {
      AND: [
        params.type ? { docType: params.type as never } : {},
        params.q
          ? {
              OR: [
                { reference: { contains: params.q } },
                { contact: { contains: params.q } },
              ],
            }
          : {},
      ],
    },
    include: { product: true, fromLocation: true, toLocation: true },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Move History</h1>
        <p className="mt-1 text-sm text-muted">Every stock movement, in one ledger.</p>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap items-center gap-3" method="get">
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search by reference or contact..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <Select name="type" defaultValue={params.type} className="w-44">
            <option value="">All Types</option>
            <option value="RECEIPT">Receipt</option>
            <option value="DELIVERY">Delivery</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {moves.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No stock movements yet" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium">Quantity</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move) => (
                <tr key={move.id} className="border-t border-border hover:bg-background">
                  <td className="px-5 py-3 text-muted">{formatDate(move.date)}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{move.reference}</td>
                  <td className="px-5 py-3 text-muted">{DOC_TYPE_LABEL[move.docType] ?? move.docType}</td>
                  <td className="px-5 py-3 text-foreground">{move.product.name}</td>
                  <td className="px-5 py-3 text-muted">{move.fromLocation?.name ?? "-"}</td>
                  <td className="px-5 py-3 text-muted">{move.toLocation?.name ?? "-"}</td>
                  <td className={`px-5 py-3 font-medium ${move.quantity < 0 ? "text-danger" : "text-success"}`}>
                    {move.quantity > 0 ? "+" : ""}
                    {move.quantity}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={move.status} />
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
