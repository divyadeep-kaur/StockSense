import {
  BoxIcon,
  GridIcon,
  HistoryIcon,
  InboxIcon,
  SearchIcon,
  SettingsIcon,
  SwapIcon,
  WarehouseIcon,
} from "@/components/icons";

const SIDEBAR_ITEMS = [
  { icon: GridIcon, active: true },
  { icon: BoxIcon, active: false },
  { icon: SwapIcon, active: false },
  { icon: HistoryIcon, active: false },
  { icon: WarehouseIcon, active: false },
  { icon: SettingsIcon, active: false },
];

const KPIS = [
  { label: "Total Stock", value: "12,450", trend: "+12%", tone: "success" as const },
  { label: "Low Stock", value: "18", trend: "-3%", tone: "danger" as const },
  { label: "Pending Receipts", value: "7", trend: "+2%", tone: "success" as const },
  { label: "Pending Deliveries", value: "12", trend: "-1%", tone: "danger" as const },
];

const RECENT_OPS = [
  { type: "Receipt", item: "Steel Rods", qty: "+100", loc: "Main Warehouse" },
  { type: "Transfer", item: "Chairs", qty: "-30", loc: "A → B" },
  { type: "Delivery", item: "Tables", qty: "-20", loc: "Warehouse 1" },
  { type: "Adjustment", item: "Screws", qty: "-5", loc: "Rack A" },
];

export function DashboardMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl ${
        compact ? "text-[10px]" : "text-xs"
      }`}
    >
      <div className={`flex shrink-0 flex-col gap-3 bg-sidebar-bg p-3 ${compact ? "w-12" : "w-16"}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M3 7 L12 12 L21 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        {SIDEBAR_ITEMS.map((item, i) => (
          <span
            key={i}
            className={`flex items-center justify-center rounded-lg p-2 ${
              item.active ? "bg-accent text-white" : "text-sidebar-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
          </span>
        ))}
      </div>

      <div className="flex-1 space-y-4 bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-heading text-foreground ${compact ? "text-lg" : "text-2xl"}`}>Dashboard</p>
            <p className="text-muted">Here&apos;s what&apos;s happening with your inventory today</p>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 sm:flex">
            <SearchIcon className="h-3.5 w-3.5 text-muted" />
            <span className="text-muted">Search anything...</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-border bg-surface p-3">
              <p className="text-muted">{kpi.label}</p>
              <p className="mt-1 font-semibold text-foreground">{kpi.value}</p>
              <p className={kpi.tone === "success" ? "text-success" : "text-danger"}>
                {kpi.tone === "success" ? "↑" : "↓"} {kpi.trend}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="mb-2 font-medium text-foreground">Recent Operations</p>
          <div className="space-y-1.5">
            {RECENT_OPS.map((op, i) => (
              <div key={i} className="flex items-center justify-between border-t border-border pt-1.5 first:border-0 first:pt-0">
                <span className="text-foreground">{op.type}</span>
                <span className="text-muted">{op.item}</span>
                <span className={op.qty.startsWith("+") ? "text-success" : "text-danger"}>{op.qty}</span>
                <span className="hidden text-muted sm:inline">{op.loc}</span>
              </div>
            ))}
          </div>
        </div>

        {!compact && (
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 text-warning">
              <InboxIcon className="h-3.5 w-3.5" />
              <span className="font-medium">Low stock alerts</span>
            </div>
            <p className="mt-1 text-muted">Chairs — 8 left · Tables — 12 left · Monitors — 5 left</p>
          </div>
        )}
      </div>
    </div>
  );
}
