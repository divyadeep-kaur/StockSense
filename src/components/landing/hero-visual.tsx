import { AlertTriangleIcon, ArrowUpRightIcon, BoxIcon, TruckIcon } from "@/components/icons";

function WarehouseScene() {
  return (
    <svg viewBox="0 0 480 380" className="h-full w-full">
      <defs>
        <linearGradient id="rack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* floor */}
      <ellipse cx="240" cy="345" rx="210" ry="18" fill="var(--accent)" opacity="0.06" />

      {/* back shelving units */}
      {[70, 190, 310].map((x, i) => (
        <g key={i}>
          <rect x={x} y={70} width="90" height="230" rx="6" fill="url(#rack)" stroke="var(--accent)" strokeOpacity="0.25" />
          {[0, 1, 2, 3].map((row) => (
            <line
              key={row}
              x1={x}
              y1={70 + row * 58 + 40}
              x2={x + 90}
              y2={70 + row * 58 + 40}
              stroke="var(--accent)"
              strokeOpacity="0.25"
            />
          ))}
          {/* boxes on shelves */}
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={x + 10 + col * 40}
                y={70 + row * 58 + 8}
                width="30"
                height="26"
                rx="3"
                fill="var(--accent)"
                opacity={0.35 + ((row + col + i) % 3) * 0.12}
              />
            ))
          )}
        </g>
      ))}

      {/* floor boxes */}
      <g>
        <rect x="30" y="300" width="46" height="40" rx="4" fill="var(--accent)" opacity="0.55" />
        <rect x="86" y="310" width="34" height="30" rx="4" fill="var(--accent)" opacity="0.4" />
        <rect x="360" y="305" width="40" height="35" rx="4" fill="var(--accent)" opacity="0.5" />
      </g>

      {/* forklift */}
      <g transform="translate(190,270)">
        <rect x="0" y="20" width="70" height="34" rx="6" fill="var(--accent)" />
        <rect x="60" y="-6" width="8" height="60" fill="var(--accent)" />
        <rect x="60" y="-6" width="26" height="8" fill="var(--accent)" />
        <circle cx="16" cy="60" r="10" fill="var(--foreground)" opacity="0.8" />
        <circle cx="54" cy="60" r="10" fill="var(--foreground)" opacity="0.8" />
      </g>
    </svg>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex h-[420px] w-full max-w-lg items-center justify-center lg:h-[460px]">
      <div
        className="absolute inset-4 bg-gradient-to-br from-accent-soft via-white to-accent-soft"
        style={{ borderRadius: "62% 38% 55% 45% / 45% 55% 45% 55%" }}
      />
      <div className="relative z-10 h-[85%] w-[85%]">
        <WarehouseScene />
      </div>

      {/* Floating card: Total Stock */}
      <div className="animate-float-slow absolute left-0 top-6 w-44 rounded-2xl border border-border bg-surface p-4 shadow-lg sm:left-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <BoxIcon className="h-4 w-4" />
          </span>
          <p className="text-xs text-muted">Total Stock</p>
        </div>
        <p className="mt-2 text-xl font-semibold text-foreground">12,450</p>
        <p className="text-xs font-medium text-success">↑ 12%</p>
        <svg viewBox="0 0 100 24" className="mt-2 h-5 w-full">
          <polyline
            points="0,20 15,16 30,18 45,10 60,12 75,4 100,6"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Floating card: Low Stock Alert */}
      <div className="animate-float absolute right-0 top-0 w-52 rounded-2xl border border-border bg-surface p-4 shadow-lg sm:-right-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-soft text-danger">
            <AlertTriangleIcon className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs font-semibold text-foreground">Low Stock Alert</p>
        </div>
        <div className="mt-2.5 space-y-1.5 text-xs">
          {[
            ["Chairs", 8],
            ["Tables", 12],
            ["Monitors", 5],
          ].map(([name, qty]) => (
            <div key={name as string} className="flex items-center justify-between text-muted">
              <span>{name}</span>
              <span className="font-medium text-foreground">{qty} left</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card: Pending Deliveries */}
      <div className="animate-float-slow absolute bottom-4 right-2 w-52 rounded-2xl border border-border bg-surface p-4 shadow-lg sm:right-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-success">
              <TruckIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs text-muted">Pending Deliveries</p>
              <p className="text-lg font-semibold text-foreground">12</p>
            </div>
          </div>
          <ArrowUpRightIcon className="h-4 w-4 text-muted" />
        </div>
        <p className="mt-1 text-[11px] text-muted">Awaiting dispatch</p>
      </div>

      {/* decorative forklift dot */}
      <span className="absolute -bottom-2 left-1/2 hidden h-2 w-2 rounded-full bg-accent/40 sm:block" />
    </div>
  );
}
