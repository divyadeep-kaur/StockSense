import { prisma } from "@/lib/prisma";
import type { DocStatus } from "@prisma/client";

export type NotificationSeverity = "critical" | "warning" | "info";

export type NotificationItem = {
  key: string;
  title: string;
  message: string;
  href: string;
  severity: NotificationSeverity;
  date: Date;
  read: boolean;
};

const PENDING_RECEIPT_STATUSES: DocStatus[] = ["DRAFT", "READY"];
const PENDING_DELIVERY_STATUSES: DocStatus[] = ["DRAFT", "WAITING", "READY"];
const PENDING_TRANSFER_STATUSES: DocStatus[] = ["DRAFT", "WAITING", "READY"];

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/** Builds the current set of notification candidates from live inventory data — nothing is persisted here. */
async function buildCandidates(): Promise<Omit<NotificationItem, "read">[]> {
  const [products, receipts, deliveries, transfers, adjustments] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        minStockQty: true,
        reorderQty: true,
        lowStockAlert: true,
        stockItems: { select: { onHand: true } },
      },
    }),
    prisma.receipt.findMany({
      where: { status: { in: PENDING_RECEIPT_STATUSES } },
      orderBy: { scheduleDate: "desc" },
      take: 8,
    }),
    prisma.deliveryOrder.findMany({
      where: { status: { in: PENDING_DELIVERY_STATUSES } },
      orderBy: { scheduleDate: "desc" },
      take: 8,
    }),
    prisma.internalTransfer.findMany({
      where: { status: { in: PENDING_TRANSFER_STATUSES } },
      orderBy: { scheduleDate: "desc" },
      take: 8,
    }),
    prisma.adjustment.findMany({
      orderBy: { date: "desc" },
      take: 8,
      include: { product: true },
    }),
  ]);

  const items: Omit<NotificationItem, "read">[] = [];

  for (const product of products) {
    const totalOnHand = product.stockItems.reduce((sum, s) => sum + s.onHand, 0);

    if (totalOnHand <= 0) {
      items.push({
        key: `out-of-stock:${product.id}`,
        title: "Out of Stock",
        message: `${product.name} is currently unavailable.`,
        href: `/products/${product.id}`,
        severity: "critical",
        date: new Date(),
      });
    } else if (product.lowStockAlert && totalOnHand <= product.minStockQty) {
      items.push({
        key: `low-stock:${product.id}`,
        title: "Low Stock Alert",
        message: `${product.name} has fallen below the reorder level (${totalOnHand} left, minimum ${product.minStockQty}).`,
        href: `/products/${product.id}`,
        severity: "warning",
        date: new Date(),
      });
    } else if (product.reorderQty > 0 && totalOnHand <= product.reorderQty) {
      items.push({
        key: `reorder:${product.id}`,
        title: "Reorder Suggested",
        message: `Consider replenishing ${product.name} — stock is approaching its reorder point.`,
        href: `/products/${product.id}`,
        severity: "info",
        date: new Date(),
      });
    }
  }

  for (const r of receipts) {
    items.push({
      key: `pending-receipt:${r.id}`,
      title: "Pending Receipt",
      message: `Receipt ${r.reference} is waiting for validation (${statusLabel(r.status)}).`,
      href: `/operations/receipts/${r.id}`,
      severity: "info",
      date: r.scheduleDate,
    });
  }

  for (const d of deliveries) {
    items.push({
      key: `pending-delivery:${d.id}`,
      title: "Pending Delivery",
      message: `Delivery ${d.reference} is awaiting processing (${statusLabel(d.status)}).`,
      href: `/operations/deliveries/${d.id}`,
      severity: "info",
      date: d.scheduleDate,
    });
  }

  for (const t of transfers) {
    items.push({
      key: `pending-transfer:${t.id}`,
      title: "Internal Transfer",
      message: `Transfer ${t.reference} is scheduled (${statusLabel(t.status)}).`,
      href: `/operations/transfers/${t.id}`,
      severity: "info",
      date: t.scheduleDate,
    });
  }

  for (const a of adjustments) {
    const diff = a.countedQty - a.recordedQty;
    if (diff === 0) continue;
    items.push({
      key: `adjustment:${a.id}`,
      title: "Inventory Adjusted",
      message: `${a.product.name} was adjusted by ${diff > 0 ? "+" : ""}${diff}.`,
      href: `/operations/adjustments`,
      severity: "info",
      date: a.date,
    });
  }

  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  return items.slice(0, 30);
}

export async function getNotificationsForUser(userId: string): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const candidates = await buildCandidates();
  if (candidates.length === 0) return { items: [], unreadCount: 0 };

  const states = await prisma.notificationState.findMany({
    where: { userId, key: { in: candidates.map((c) => c.key) } },
  });
  const stateByKey = new Map(states.map((s) => [s.key, s]));

  const items = candidates
    .filter((c) => !stateByKey.get(c.key)?.dismissed)
    .map((c) => ({ ...c, read: stateByKey.get(c.key)?.read ?? false }));

  const unreadCount = items.filter((i) => !i.read).length;
  return { items, unreadCount };
}
