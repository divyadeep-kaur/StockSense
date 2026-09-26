"use client";

import { useState } from "react";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 200;

type TrendPoint = { label: string; inbound: number; outbound: number };

export function MovementAreaChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => Math.max(d.inbound, d.outbound)));
  const stepX = CHART_WIDTH / (data.length - 1 || 1);
  const scaleY = (v: number) => CHART_HEIGHT - (v / max) * (CHART_HEIGHT - 20);

  const linePoints = data.map((d, i) => [i * stepX, scaleY(d.inbound)] as const);
  const areaPath =
    `M0,${CHART_HEIGHT} ` +
    linePoints.map(([x, y]) => `L${x},${y}`).join(" ") +
    ` L${CHART_WIDTH},${CHART_HEIGHT} Z`;
  const linePath = `M${linePoints.map(([x, y]) => `${x},${y}`).join(" L")}`;

  const active = hoverIndex !== null ? data[hoverIndex] : null;
  const activeX = hoverIndex !== null ? hoverIndex * stepX : 0;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const index = Math.round(x / stepX);
    setHoverIndex(Math.min(Math.max(index, 0), data.length - 1));
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 24}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border)" strokeWidth="1.5" />
          </pattern>
        </defs>
        <path d={areaPath} fill="url(#hatch)" opacity={0.9} />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
        {active && (
          <line x1={activeX} y1={0} x2={activeX} y2={CHART_HEIGHT} stroke="var(--accent)" strokeDasharray="3 3" strokeWidth="1" />
        )}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={i * stepX}
            cy={scaleY(d.inbound)}
            r={hoverIndex === i ? 6 : 3.5}
            fill={hoverIndex === i ? "var(--accent)" : "white"}
            stroke="var(--accent)"
            strokeWidth="2"
            className="transition-all duration-150"
          />
        ))}
        {data.map((d, i) => (
          <text key={i} x={i * stepX} y={CHART_HEIGHT + 18} fontSize="11" fill="var(--muted)" textAnchor="middle">
            {d.label}
          </text>
        ))}
      </svg>
      {active && hoverIndex !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl bg-accent p-3 text-xs text-white shadow-lg"
          style={{ left: `${(activeX / CHART_WIDTH) * 100}%` }}
        >
          <p className="font-semibold">{data[hoverIndex].label}</p>
          <p className="mt-1 opacity-90">In: {active.inbound}</p>
          <p className="opacity-90">Out: {active.outbound}</p>
        </div>
      )}
    </div>
  );
}

export function WeekdayBarChart({ data }: { data: { label: string; count: number }[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const peakIndex = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);

  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((d, i) => {
        const heightPct = (d.count / max) * 100;
        const isPeak = i === peakIndex && d.count > 0;
        const showBadge = isPeak || hoverIndex === i;
        return (
          <div
            key={d.label}
            className="flex flex-1 flex-col items-center gap-2"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div className="relative flex h-28 w-full items-end justify-center">
              {showBadge && (
                <span
                  className={`absolute -top-6 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isPeak ? "bg-accent text-white" : "bg-accent-soft text-accent"
                  }`}
                >
                  {d.count}
                </span>
              )}
              <div
                className={`w-full max-w-[28px] cursor-pointer rounded-t-md transition-all duration-150 ${
                  isPeak ? "bg-accent" : hoverIndex === i ? "bg-accent/60" : "bg-accent-soft"
                }`}
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
            </div>
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WeeklyTrendLine({ series }: { series: { current: number; previous: number }[] }) {
  const max = Math.max(1, ...series.flatMap((s) => [s.current, s.previous]));
  const stepX = CHART_WIDTH / (series.length - 1 || 1);
  const scaleY = (v: number) => CHART_HEIGHT * 0.6 - (v / max) * (CHART_HEIGHT * 0.55);

  const currentPoints = series.map((s, i) => [i * stepX, scaleY(s.current)] as const);
  const previousPoints = series.map((s, i) => [i * stepX, scaleY(s.previous)] as const);
  const currentPath = `M${currentPoints.map(([x, y]) => `${x},${y}`).join(" L")}`;
  const previousPath = `M${previousPoints.map(([x, y]) => `${x},${y}`).join(" L")}`;

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT * 0.6 + 10}`} className="w-full">
      <path d={previousPath} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="4 4" />
      {previousPoints.map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r={3} fill="white" stroke="var(--muted)" strokeWidth="1.5" />
      ))}
      <path d={currentPath} fill="none" strokeDasharray="1 6" strokeLinecap="round" stroke="var(--accent)" strokeWidth="3" />
      {currentPoints.map(([x, y], i) => (
        <circle key={`c${i}`} cx={x} cy={y} r={3.5} fill="var(--accent)" stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

export function StatusSegmentBar({
  draft,
  inProgress,
  completed,
}: {
  draft: number;
  inProgress: number;
  completed: number;
}) {
  const max = Math.max(1, draft, inProgress, completed);
  const bars = [
    { label: "In Progress", value: inProgress, opacity: 1 },
    { label: "Draft", value: draft, opacity: 0.55 },
    { label: "Completed Today", value: completed, opacity: 0.3 },
  ];

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label} className="h-3.5 w-full overflow-hidden rounded-full bg-accent-soft">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${Math.max((b.value / max) * 100, b.value > 0 ? 6 : 0)}%`, opacity: b.opacity }}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" style={{ opacity: b.opacity }} />
            <span className="text-muted">{b.label}</span>
            <span className="font-medium text-foreground">{b.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HEX_POINTS = "25,0 50,14.5 50,37.5 25,52 0,37.5 0,14.5";

/** Deterministic integer hash (no transcendental math) so server and client render identical values. */
function hashToUnitInterval(i: number) {
  let x = (i * 2654435761) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4294967296;
}

// Row hex-counts shaped to read as a rounded cluster/blob rather than a plain rectangle.
const BLOB_ROWS = [2, 4, 6, 7, 7, 6, 4, 2];
const X_STEP = 34;
const Y_STEP = 30;
const HEX_SCALE = 0.62;

export function LocationHexGrid({ intensity }: { intensity: number }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const maxCols = Math.max(...BLOB_ROWS);
  const maxWidth = maxCols * X_STEP;

  const hexes = BLOB_ROWS.flatMap((count, row) => {
    const rowWidth = count * X_STEP;
    const startX = (maxWidth - rowWidth) / 2 + (row % 2 === 1 ? X_STEP / 2 : 0);
    return Array.from({ length: count }, (_, col) => ({ x: startX + col * X_STEP, y: row * Y_STEP }));
  });

  return (
    <svg viewBox={`0 0 ${maxWidth + X_STEP} ${BLOB_ROWS.length * Y_STEP + 30}`} className="w-full overflow-visible">
      {hexes.map(({ x, y }, i) => {
        const value = Math.min(1, Math.max(0, hashToUnitInterval(i) * 0.6 + intensity * 0.4));
        const opacity = hoverIndex === i ? 1 : 0.15 + value * 0.85;
        const scale = hoverIndex === i ? HEX_SCALE * 1.15 : HEX_SCALE;
        return (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${x},${y}) scale(${scale})`}
            fill="var(--accent)"
            opacity={opacity}
            className="cursor-pointer transition-all duration-150 ease-out"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        );
      })}
    </svg>
  );
}
