"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DocStatus } from "@prisma/client";
import type { KanbanCard, KanbanKind } from "@/lib/kanban";
import { moveKanbanCard } from "@/lib/actions/kanban";
import { validTargetsFor } from "@/lib/kanban-transitions";
import { Select } from "@/components/ui";
import { InboxIcon, SearchIcon, SlidersIcon, TransferIcon, TruckIcon } from "@/components/icons";

const COLUMNS: { status: DocStatus; label: string }[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "WAITING", label: "Waiting" },
  { status: "READY", label: "Ready" },
  { status: "DONE", label: "Done" },
  { status: "CANCELED", label: "Canceled" },
];

const KIND_META: Record<KanbanKind, { label: string; icon: (p: { className?: string }) => React.ReactNode }> = {
  RECEIPT: { label: "Receipt", icon: InboxIcon },
  DELIVERY: { label: "Delivery", icon: TruckIcon },
  TRANSFER: { label: "Transfer", icon: TransferIcon },
  ADJUSTMENT: { label: "Adjustment", icon: SlidersIcon },
};

const ALL_KINDS: KanbanKind[] = ["RECEIPT", "DELIVERY", "TRANSFER", "ADJUSTMENT"];

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(date));
}

function cardKey(c: { kind: KanbanKind; id: string }) {
  return `${c.kind}:${c.id}`;
}

export function KanbanBoard({
  initialCards,
  warehouses,
}: {
  initialCards: KanbanCard[];
  warehouses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [activeKinds, setActiveKinds] = useState<Set<KanbanKind>>(new Set(ALL_KINDS));
  const [warehouseId, setWarehouseId] = useState("");
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<DocStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const draggingCard = useMemo(() => cards.find((c) => cardKey(c) === draggingKey) ?? null, [cards, draggingKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      if (!activeKinds.has(c.kind)) return false;
      if (warehouseId && !c.warehouseIds.includes(warehouseId)) return false;
      if (q && !`${c.reference} ${c.productSummary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cards, search, activeKinds, warehouseId]);

  const byStatus = useMemo(() => {
    const map = new Map<DocStatus, KanbanCard[]>();
    for (const col of COLUMNS) map.set(col.status, []);
    for (const c of filtered) map.get(c.status)?.push(c);
    return map;
  }, [filtered]);

  function toggleKind(kind: KanbanKind) {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next.size === 0 ? new Set(ALL_KINDS) : next;
    });
  }

  async function performMove(card: KanbanCard, target: DocStatus) {
    if (card.status === target) return;

    const valid = validTargetsFor(card.kind, card.status);
    if (!valid.includes(target)) {
      setToast(`${KIND_META[card.kind].label}s can't move from ${card.status} to ${target}.`);
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const result = await moveKanbanCard(card.kind, card.id, target);
    if (!result.ok) {
      setToast(result.error ?? "That move couldn't be completed.");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const finalStatus = result.status ?? target;
    setCards((prev) => prev.map((c) => (cardKey(c) === cardKey(card) ? { ...c, status: finalStatus } : c)));
    if (finalStatus !== target) {
      setToast(`${card.reference} needs more stock — it moved to ${finalStatus} instead of ${target}.`);
      setTimeout(() => setToast(null), 4000);
    }
    router.refresh();
  }

  async function handleDrop(target: DocStatus) {
    setDragOverStatus(null);
    const card = draggingCard;
    setDraggingKey(null);
    if (!card) return;
    await performMove(card, target);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or product..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_KINDS.map((kind) => {
            const active = activeKinds.has(kind);
            const Icon = KIND_META[kind].icon;
            return (
              <button
                key={kind}
                onClick={() => toggleKind(kind)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-muted hover:border-accent/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {KIND_META[kind].label}
              </button>
            );
          })}
        </div>

        <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="w-auto max-w-[200px]">
          <option value="">All warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </Select>
      </div>

      {toast && (
        <div className="rounded-lg border border-warning-soft bg-warning-soft px-4 py-2 text-sm text-warning">{toast}</div>
      )}

      <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const columnCards = byStatus.get(col.status) ?? [];
          const isValidTarget = draggingCard ? validTargetsFor(draggingCard.kind, draggingCard.status).includes(col.status) : false;
          const isOver = dragOverStatus === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                if (!draggingCard) return;
                e.preventDefault();
                setDragOverStatus(col.status);
              }}
              onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.status);
              }}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-background/60 transition-colors ${
                isOver && isValidTarget
                  ? "border-accent bg-accent-soft/40"
                  : isOver && draggingCard
                  ? "border-danger/40"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
                  {columnCards.length}
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                {columnCards.map((card) => {
                  const targets = validTargetsFor(card.kind, card.status);
                  const draggable = targets.length > 0;
                  const Icon = KIND_META[card.kind].icon;
                  return (
                    <div
                      key={cardKey(card)}
                      draggable={draggable}
                      onDragStart={(e) => {
                        setDraggingKey(cardKey(card));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggingKey(null);
                        setDragOverStatus(null);
                      }}
                      onClick={() => router.push(card.href)}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(card.href);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${KIND_META[card.kind].label} ${card.reference}, open details`}
                      className={`rounded-xl border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer opacity-90"
                      } ${draggingKey === cardKey(card) ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
                        <Icon className="h-3.5 w-3.5" />
                        {KIND_META[card.kind].label}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-foreground">{card.reference}</p>
                      <p className="mt-1 truncate text-sm text-foreground">{card.productSummary}</p>
                      <p className="text-xs text-muted">{card.quantitySummary}</p>
                      {(card.fromLocation || card.toLocation) && (
                        <p className="mt-1 truncate text-[11px] text-muted">
                          {card.fromLocation ?? "—"} → {card.toLocation ?? "—"}
                        </p>
                      )}
                      <p className="mt-1.5 text-[11px] text-muted">{formatDate(card.date)}</p>

                      {targets.length > 0 && (
                        <select
                          aria-label={`Move ${card.reference} to a different status`}
                          value=""
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const target = e.target.value as DocStatus;
                            e.target.value = "";
                            if (target) performMove(card, target);
                          }}
                          className="mt-2 w-full rounded-md border border-border bg-background px-1.5 py-1 text-[11px] text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                        >
                          <option value="">Move to...</option>
                          {targets.map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0) + t.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
                {columnCards.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-muted">No operations here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
