import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardKpis, getRecentOperations } from "@/lib/dashboard";
import { KpiCard } from "@/components/kpi-card";
import { DonutChart } from "@/components/donut-chart";
import { Card, StatusBadge } from "@/components/ui";
import { BoxIcon, InboxIcon, SlidersIcon, TransferIcon, TruckIcon } from "@/components/icons";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [kpis, recentOps] = await Promise.all([getDashboardKpis(), getRecentOperations()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          What&apos;s happening with your inventory today, {user?.fullName.split(" ")[0]}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Products" value={kpis.totalProducts} icon={<BoxIcon />} />
        <KpiCard label="Low / Out of Stock" value={kpis.lowOrOutOfStock} icon={<SlidersIcon />} tone="warning" />
        <KpiCard label="Pending Receipts" value={kpis.pendingReceipts} icon={<InboxIcon />} tone="info" />
        <KpiCard label="Pending Deliveries" value={kpis.pendingDeliveries} icon={<TruckIcon />} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Operations</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">Quantity</th>
                <th className="pb-2 font-medium">Location</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOps.map((op) => (
                <tr key={op.id} className="border-t border-border">
                  <td className="py-2.5 text-foreground">{op.type}</td>
                  <td className="py-2.5 text-foreground">{op.item}</td>
                  <td className={`py-2.5 ${op.quantity < 0 ? "text-danger" : "text-success"}`}>
                    {op.quantity > 0 ? "+" : ""}
                    {op.quantity}
                  </td>
                  <td className="py-2.5 text-muted">{op.location}</td>
                  <td className="py-2.5">
                    <StatusBadge status={op.status} />
                  </td>
                  <td className="py-2.5 text-muted">{formatDate(op.date)}</td>
                </tr>
              ))}
              {recentOps.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted">
                    No operations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Stock Levels</h2>
          <DonutChart
            centerLabel="Total Products"
            centerValue={kpis.levels.total}
            segments={[
              { label: "In Stock", value: kpis.levels.inStock, color: "var(--success)" },
              { label: "Low Stock", value: kpis.levels.lowStock, color: "var(--warning)" },
              { label: "Out of Stock", value: kpis.levels.outOfStock, color: "var(--danger)" },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/operations/receipts" icon={<InboxIcon />} label="New Receipt" />
        <QuickLink href="/operations/deliveries" icon={<TruckIcon />} label="New Delivery" />
        <QuickLink href="/operations/transfers" icon={<TransferIcon />} label="New Transfer" />
        <QuickLink href="/operations/adjustments" icon={<SlidersIcon />} label="New Adjustment" />
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">{icon}</span>
      {label}
    </Link>
  );
}
