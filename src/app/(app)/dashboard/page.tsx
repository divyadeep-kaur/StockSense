import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getDashboardKpis,
  getInventoryValueSummary,
  getKpiBadges,
  getLocationStockRanking,
  getLowStockAlerts,
  getOperationsStatusBreakdown,
  getRecentOperations,
  getWeekdayActivity,
  getWeeklyMovementTrend,
  getWeeklyValueComparison,
} from "@/lib/dashboard";
import { KpiCard } from "@/components/kpi-card";
import { DonutChart } from "@/components/donut-chart";
import {
  LocationHexGrid,
  MovementAreaChart,
  StatusSegmentBar,
  WeekdayBarChart,
  WeeklyTrendLine,
} from "@/components/dashboard-charts";
import { Card, StatusBadge } from "@/components/ui";
import {
  ArrowUpRightIcon,
  BellIcon,
  BoxIcon,
  DollarIcon,
  InboxIcon,
  SlidersIcon,
  TransferIcon,
  TruckIcon,
} from "@/components/icons";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [
    kpis,
    badges,
    recentOps,
    lowStockAlerts,
    movementTrend,
    weekdayActivity,
    weeklyValue,
    statusBreakdown,
    topLocations,
    inventoryValue,
  ] = await Promise.all([
    getDashboardKpis(),
    getKpiBadges(),
    getRecentOperations(),
    getLowStockAlerts(),
    getWeeklyMovementTrend(),
    getWeekdayActivity(),
    getWeeklyValueComparison(),
    getOperationsStatusBreakdown(),
    getLocationStockRanking(),
    getInventoryValueSummary(),
  ]);

  const totalOnHandAcrossLocations = topLocations.reduce((sum, l) => sum + l.totalOnHand, 0) || 1;

  return (
    <div className="animate-reveal space-y-6">
      <div>
        <h1 className="font-heading text-4xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          What&apos;s happening with your inventory today, {user?.fullName.split(" ")[0]}.
        </p>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="flex gap-3 rounded-2xl border border-accent-soft bg-accent-soft/60 p-4 backdrop-blur-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
            <BellIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Low stock alerts</p>
            <ul className="mt-1.5 space-y-1 text-sm">
              {lowStockAlerts.map((p) => (
                <li key={p.id} className="text-muted">
                  <Link href={`/products/${p.id}`} className="font-medium text-accent hover:underline">
                    {p.name} ({p.sku})
                  </Link>{" "}
                  — {p.totalOnHand} left, minimum is {p.minStockQty}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Inventory Value"
          value={formatCurrency(inventoryValue.currentValue)}
          icon={<DollarIcon />}
          trendPct={inventoryValue.changePct}
        />
        <KpiCard
          label="Total Products"
          value={kpis.totalProducts}
          icon={<BoxIcon />}
          badge={badges.newProductsThisWeek > 0 ? `+${badges.newProductsThisWeek} this wk` : undefined}
        />
        <KpiCard
          label="Low / Out of Stock"
          value={kpis.lowOrOutOfStock}
          icon={<SlidersIcon />}
          tone="warning"
          badge={badges.outOfStock > 0 ? `${badges.outOfStock} out of stock` : undefined}
        />
        <KpiCard
          label="Pending Receipts"
          value={kpis.pendingReceipts}
          icon={<InboxIcon />}
          tone="info"
          badge={badges.receiptsDueToday > 0 ? `${badges.receiptsDueToday} due today` : undefined}
        />
        <KpiCard
          label="Pending Deliveries"
          value={kpis.pendingDeliveries}
          icon={<TruckIcon />}
          tone="success"
          badge={badges.deliveriesDueToday > 0 ? `${badges.deliveriesDueToday} due today` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-2xl text-foreground">Stock Movement</h2>
            <span className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted">
              Last 7 days
            </span>
          </div>
          <div className="mb-4 flex gap-6 text-sm">
            <div>
              <p className="text-muted">Inbound</p>
              <p className="text-lg font-semibold text-success">
                +{movementTrend.reduce((s, d) => s + d.inbound, 0)}
              </p>
            </div>
            <div>
              <p className="text-muted">Outbound</p>
              <p className="text-lg font-semibold text-danger">
                -{movementTrend.reduce((s, d) => s + d.outbound, 0)}
              </p>
            </div>
          </div>
          <MovementAreaChart data={movementTrend} />
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-2xl text-foreground">Locations</h2>
            <Link href="/warehouses" className="text-muted hover:text-accent">
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <LocationHexGrid intensity={Math.min(1, totalOnHandAcrossLocations / 1000)} />
          <div className="mt-3 space-y-1.5">
            {topLocations.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  {loc.warehouseName} / {loc.name}
                </span>
                <span className="font-medium text-foreground">{loc.totalOnHand}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-4 font-heading text-2xl text-foreground">Order Status</h2>
          <Link
            href="/move-history"
            className="mb-4 flex items-center justify-between rounded-xl bg-accent px-4 py-3 text-white"
          >
            <span className="text-sm font-medium">Open Operations: {statusBreakdown.openTotal}</span>
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
          <StatusSegmentBar
            draft={statusBreakdown.draft}
            inProgress={statusBreakdown.inProgress}
            completed={statusBreakdown.completedToday}
          />
        </Card>

        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-heading text-2xl text-foreground">Weekly Activity</h2>
          </div>
          <p className="mb-3 text-sm text-muted">
            Average{" "}
            <span className="font-medium text-foreground">
              {Math.round(weekdayActivity.reduce((s, d) => s + d.count, 0) / 7)}
            </span>{" "}
            moves/day
          </p>
          <WeekdayBarChart data={weekdayActivity} />
        </Card>

        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-heading text-2xl text-foreground">Weekly Summary</h2>
            <span className="text-xs text-muted">{weeklyValue.rangeLabel}</span>
          </div>
          <p className="text-xs text-muted">Stock value moved (cost basis)</p>
          <div className="mb-3 flex items-center gap-2">
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(weeklyValue.currentTotal)}</p>
            {weeklyValue.changePct !== null && (
              <span className={`text-sm font-medium ${weeklyValue.changePct >= 0 ? "text-success" : "text-danger"}`}>
                {weeklyValue.changePct >= 0 ? "▲" : "▼"} {Math.abs(weeklyValue.changePct)}%
              </span>
            )}
          </div>
          <WeeklyTrendLine series={weeklyValue.series} />
          <div className="mt-2 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> This week
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border border-muted" /> Last week
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-2xl text-foreground">Recent Operations</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted">
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 font-medium">Item</th>
                <th className="pb-2 pr-3 font-medium">Quantity</th>
                <th className="pb-2 pr-3 font-medium">Location</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOps.map((op) => (
                <tr key={op.id} className="border-t border-border">
                  <td className="py-2.5 pr-3 text-foreground">{op.type}</td>
                  <td className="py-2.5 pr-3 text-foreground">{op.item}</td>
                  <td className={`py-2.5 pr-3 ${op.quantity < 0 ? "text-danger" : "text-success"}`}>
                    {op.quantity > 0 ? "+" : ""}
                    {op.quantity}
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{op.location}</td>
                  <td className="py-2.5 pr-3">
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
          <h2 className="mb-4 font-heading text-2xl text-foreground">Stock Levels</h2>
          <DonutChart
            centerLabel="Total Products"
            centerValue={kpis.levels.total}
            segments={[
              { label: "In Stock", value: kpis.levels.inStock, color: "var(--accent)" },
              { label: "Low Stock", value: kpis.levels.lowStock, color: "#818CF8" },
              { label: "Out of Stock", value: kpis.levels.outOfStock, color: "#C7D2FE" },
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
