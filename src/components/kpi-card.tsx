import { Card } from "@/components/ui";

export function KpiCard({
  label,
  value,
  icon,
  tone = "default",
  badge,
  trendPct,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "default" | "warning" | "info" | "success";
  badge?: string;
  trendPct?: number | null;
}) {
  const toneStyles = {
    default: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning",
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
  };

  return (
    <Card className="group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${toneStyles[tone]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-muted">{label}</p>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="break-words text-2xl font-semibold text-foreground">{value}</p>
          {badge && <span className={`text-xs font-medium ${toneStyles[tone].split(" ")[1]}`}>{badge}</span>}
        </div>
        {trendPct !== undefined && trendPct !== null && (
          <p className={`mt-0.5 text-xs font-medium ${trendPct >= 0 ? "text-success" : "text-danger"}`}>
            {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct)}%
          </p>
        )}
      </div>
    </Card>
  );
}
