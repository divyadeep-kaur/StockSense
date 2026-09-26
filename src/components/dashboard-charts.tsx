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
            r={hoverIndex === i ? 5 : 0}
            fill="var(--accent)"
            stroke="white"
            strokeWidth="2"
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
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 text-xs shadow-lg"
          style={{ left: `${(activeX / CHART_WIDTH) * 100}%` }}
        >
          <p className="font-medium text-foreground">{data[hoverIndex].label}</p>
          <p className="mt-1 text-success">↙ In: {active.inbound}</p>
          <p className="text-danger">↗ Out: {active.outbound}</p>
        </div>
      )}
    </div>
  );
}

export function WeekdayBarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const peakIndex = data.reduce((best, d, i) => (d.count > data[best].count ? i : best), 0);

  return (
    <div className="flex h-40 items-end justify-between gap-2">
      {data.map((d, i) => {
        const heightPct = (d.count / max) * 100;
        const isPeak = i === peakIndex && d.count > 0;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-28 w-full items-end justify-center">
              {isPeak && (
                <span className="absolute -top-6 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                  {d.count}
                </span>
              )}
              <div
                className={`w-full max-w-[28px] rounded-t-md ${isPeak ? "bg-accent" : "bg-accent-soft"}`}
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

  const currentPath = `M${series.map((s, i) => `${i * stepX},${scaleY(s.current)}`).join(" L")}`;
  const previousPath = `M${series.map((s, i) => `${i * stepX},${scaleY(s.previous)}`).join(" L")}`;

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT * 0.6 + 10}`} className="w-full">
      <path d={previousPath} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 5" />
      <path d={currentPath} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
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
  const total = Math.max(1, draft + inProgress + completed);
  const segments = [
    { label: "Draft", value: draft, color: "var(--border)" },
    { label: "In Progress", value: inProgress, color: "var(--accent)", opacity: 0.6 },
    { label: "Completed Today", value: completed, color: "var(--accent)" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color, opacity: s.opacity ?? 1 }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, opacity: s.opacity ?? 1 }} />
            <span className="text-muted">{s.label}</span>
            <span className="font-medium text-foreground">{s.value}</span>
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

export function LocationHexGrid({ intensity }: { intensity: number }) {
  const cols = 7;
  const rows = 4;
  const cells = Array.from({ length: cols * rows }, (_, i) => {
    const noise = hashToUnitInterval(i);
    return Math.min(1, Math.max(0, noise * 0.6 + intensity * 0.4));
  });

  return (
    <svg viewBox="0 0 380 220" className="w-full">
      {cells.map((value, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * 44 + (row % 2 === 1 ? 22 : 0);
        const y = row * 40;
        const opacity = 0.15 + value * 0.85;
        return (
          <polygon
            key={i}
            points={HEX_POINTS}
            transform={`translate(${x},${y}) scale(0.75)`}
            fill="var(--accent)"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}
