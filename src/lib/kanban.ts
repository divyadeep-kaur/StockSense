import { prisma } from "@/lib/prisma";
import type { DocStatus } from "@prisma/client";

export type KanbanKind = "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";

export type KanbanCard = {
  id: string;
  kind: KanbanKind;
  reference: string;
  status: DocStatus;
  date: Date;
  productSummary: string;
  quantitySummary: string;
  fromLocation: string | null;
  toLocation: string | null;
  warehouseIds: string[];
  href: string;
};

function summarizeLines(lines: { quantity: number; product: { name: string } }[], signPrefix: "+" | "-" | "") {
  if (lines.length === 0) return { productSummary: "—", quantitySummary: "—" };
  const first = lines[0];
  const productSummary = lines.length === 1 ? first.product.name : `${first.product.name} +${lines.length - 1} more`;
  const totalQty = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { productSummary, quantitySummary: `${signPrefix}${totalQty}` };
}

/** Aggregates receipts, deliveries, transfers and adjustments into a single normalized card list for the Kanban board. Reuses no business logic — read-only projection of existing models. */
export async function getKanbanCards(): Promise<KanbanCard[]> {
  const [receipts, deliveries, transfers, adjustments] = await Promise.all([
    prisma.receipt.findMany({
      include: { toLocation: { include: { warehouse: true } }, lines: { include: { product: true } } },
      orderBy: { scheduleDate: "desc" },
    }),
    prisma.deliveryOrder.findMany({
      include: { fromLocation: { include: { warehouse: true } }, lines: { include: { product: true } } },
      orderBy: { scheduleDate: "desc" },
    }),
    prisma.internalTransfer.findMany({
      include: {
        fromLocation: { include: { warehouse: true } },
        toLocation: { include: { warehouse: true } },
        lines: { include: { product: true } },
      },
      orderBy: { scheduleDate: "desc" },
    }),
    prisma.adjustment.findMany({
      include: { product: true, location: { include: { warehouse: true } } },
      orderBy: { date: "desc" },
    }),
  ]);

  const cards: KanbanCard[] = [];

  for (const r of receipts) {
    const { productSummary, quantitySummary } = summarizeLines(r.lines, "+");
    cards.push({
      id: r.id,
      kind: "RECEIPT",
      reference: r.reference,
      status: r.status,
      date: r.scheduleDate,
      productSummary,
      quantitySummary,
      fromLocation: r.supplierName,
      toLocation: `${r.toLocation.warehouse.name} / ${r.toLocation.name}`,
      warehouseIds: [r.toLocation.warehouseId],
      href: `/operations/receipts/${r.id}`,
    });
  }

  for (const d of deliveries) {
    const { productSummary, quantitySummary } = summarizeLines(d.lines, "-");
    cards.push({
      id: d.id,
      kind: "DELIVERY",
      reference: d.reference,
      status: d.status,
      date: d.scheduleDate,
      productSummary,
      quantitySummary,
      fromLocation: `${d.fromLocation.warehouse.name} / ${d.fromLocation.name}`,
      toLocation: d.customerName,
      warehouseIds: [d.fromLocation.warehouseId],
      href: `/operations/deliveries/${d.id}`,
    });
  }

  for (const t of transfers) {
    const { productSummary, quantitySummary } = summarizeLines(t.lines, "");
    cards.push({
      id: t.id,
      kind: "TRANSFER",
      reference: t.reference,
      status: t.status,
      date: t.scheduleDate,
      productSummary,
      quantitySummary,
      fromLocation: `${t.fromLocation.warehouse.name} / ${t.fromLocation.name}`,
      toLocation: `${t.toLocation.warehouse.name} / ${t.toLocation.name}`,
      warehouseIds: [t.fromLocation.warehouseId, t.toLocation.warehouseId],
      href: `/operations/transfers/${t.id}`,
    });
  }

  for (const a of adjustments) {
    const diff = a.countedQty - a.recordedQty;
    cards.push({
      id: a.id,
      kind: "ADJUSTMENT",
      reference: a.reference,
      status: a.status,
      date: a.date,
      productSummary: a.product.name,
      quantitySummary: `${diff > 0 ? "+" : ""}${diff}`,
      fromLocation: null,
      toLocation: `${a.location.warehouse.name} / ${a.location.name}`,
      warehouseIds: [a.location.warehouseId],
      href: `/operations/adjustments`,
    });
  }

  cards.sort((a, b) => b.date.getTime() - a.date.getTime());
  return cards;
}
