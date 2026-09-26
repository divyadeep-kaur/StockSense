import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState } from "@/components/ui";
import { PlusIcon } from "@/components/icons";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdjustmentsPage() {
  const adjustments = await prisma.adjustment.findMany({
    include: { product: true, location: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Adjustments</h1>
          <p className="mt-1 text-sm text-muted">Reconcile recorded stock against physical counts.</p>
        </div>
        <Link href="/operations/adjustments/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            New Adjustment
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        {adjustments.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No adjustments yet" description="Log a physical count to reconcile stock." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Recorded</th>
                <th className="px-5 py-3 font-medium">Counted</th>
                <th className="px-5 py-3 font-medium">Diff</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((a) => {
                const diff = a.countedQty - a.recordedQty;
                return (
                  <tr key={a.id} className="border-t border-border hover:bg-background">
                    <td className="px-5 py-3 font-medium text-foreground">{a.reference}</td>
                    <td className="px-5 py-3 text-foreground">{a.product.name}</td>
                    <td className="px-5 py-3 text-muted">{a.location.name}</td>
                    <td className="px-5 py-3 text-muted">{a.recordedQty}</td>
                    <td className="px-5 py-3 text-muted">{a.countedQty}</td>
                    <td className={`px-5 py-3 font-medium ${diff < 0 ? "text-danger" : diff > 0 ? "text-success" : "text-muted"}`}>
                      {diff > 0 ? "+" : ""}
                      {diff}
                    </td>
                    <td className="px-5 py-3 text-muted">{formatDate(a.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
