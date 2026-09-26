import { prisma } from "@/lib/prisma";

export type StockLevelSummary = { inStock: number; lowStock: number; outOfStock: number; total: number };

export async function getStockLevelSummary(): Promise<StockLevelSummary> {
  const products = await prisma.product.findMany({
    select: { id: true, minStockQty: true, stockItems: { select: { onHand: true } } },
  });

  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  for (const product of products) {
    const total = product.stockItems.reduce((sum, item) => sum + item.onHand, 0);
    if (total <= 0) outOfStock += 1;
    else if (total <= product.minStockQty) lowStock += 1;
    else inStock += 1;
  }

  return { inStock, lowStock, outOfStock, total: products.length };
}

export async function getDashboardKpis() {
  const [levels, pendingReceipts, pendingDeliveries, transfersScheduled] = await Promise.all([
    getStockLevelSummary(),
    prisma.receipt.count({ where: { status: { in: ["DRAFT", "READY"] } } }),
    prisma.deliveryOrder.count({ where: { status: { in: ["DRAFT", "WAITING", "READY"] } } }),
    prisma.internalTransfer.count({ where: { status: { in: ["DRAFT", "READY"] } } }),
  ]);

  return {
    totalProducts: levels.total,
    lowOrOutOfStock: levels.lowStock + levels.outOfStock,
    pendingReceipts,
    pendingDeliveries,
    transfersScheduled,
    levels,
  };
}

export async function getLowStockAlerts(limit = 5) {
  const products = await prisma.product.findMany({
    where: { lowStockAlert: true },
    select: { id: true, name: true, sku: true, minStockQty: true, stockItems: { select: { onHand: true } } },
  });

  return products
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      totalOnHand: p.stockItems.reduce((sum, s) => sum + s.onHand, 0),
      minStockQty: p.minStockQty,
    }))
    .filter((p) => p.totalOnHand <= p.minStockQty)
    .slice(0, limit);
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Inbound vs outbound quantity moved per day, for the trailing 7 days (oldest first). */
export async function getWeeklyMovementTrend() {
  const since = daysAgo(6);
  const moves = await prisma.stockMove.findMany({
    where: { date: { gte: since } },
    select: { date: true, quantity: true },
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = daysAgo(6 - i);
    return { date, label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), inbound: 0, outbound: 0 };
  });

  for (const move of moves) {
    const dayKey = startOfDay(move.date).getTime();
    const bucket = days.find((d) => d.date.getTime() === dayKey);
    if (!bucket) continue;
    if (move.quantity > 0) bucket.inbound += move.quantity;
    else bucket.outbound += Math.abs(move.quantity);
  }

  return days.map(({ date, ...rest }) => rest);
}

/** Current total value of on-hand stock (cost basis), and how it's changed over the trailing 7 days. */
export async function getInventoryValueSummary() {
  const since = daysAgo(6);

  const [stockItems, recentMoves] = await Promise.all([
    prisma.stockItem.findMany({ select: { onHand: true, product: { select: { costPerUnit: true } } } }),
    prisma.stockMove.findMany({
      where: { date: { gte: since } },
      select: { quantity: true, product: { select: { costPerUnit: true } } },
    }),
  ]);

  const currentValue = stockItems.reduce((sum, item) => sum + item.onHand * (item.product.costPerUnit ?? 0), 0);
  const valueMovedThisWeek = recentMoves.reduce(
    (sum, m) => sum + m.quantity * (m.product.costPerUnit ?? 0),
    0
  );
  const valueAWeekAgo = currentValue - valueMovedThisWeek;
  const changePct = valueAWeekAgo <= 0 ? null : Math.round(((currentValue - valueAWeekAgo) / valueAWeekAgo) * 100);

  return { currentValue: Math.round(currentValue), changePct };
}

/** Cost-basis value received (in) vs shipped (out) per day, for the trailing 7 days (oldest first). */
export async function getWeeklyValueComparison() {
  const thisWeekStart = daysAgo(6);
  const lastWeekStart = daysAgo(13);

  const [thisWeek, lastWeek] = await Promise.all([
    prisma.stockMove.findMany({
      where: { date: { gte: thisWeekStart } },
      select: { date: true, quantity: true, product: { select: { costPerUnit: true } } },
    }),
    prisma.stockMove.findMany({
      where: { date: { gte: lastWeekStart, lt: thisWeekStart } },
      select: { date: true, quantity: true, product: { select: { costPerUnit: true } } },
    }),
  ]);

  const bucket = (moves: { date: Date; quantity: number; product: { costPerUnit: number | null } }[], start: Date) => {
    const totals = new Array(7).fill(0);
    for (const m of moves) {
      const dayIndex = Math.floor((startOfDay(m.date).getTime() - start.getTime()) / 86400000);
      if (dayIndex >= 0 && dayIndex < 7) totals[dayIndex] += Math.abs(m.quantity) * (m.product.costPerUnit ?? 0);
    }
    return totals;
  };

  const current = bucket(thisWeek, thisWeekStart);
  const previous = bucket(lastWeek, lastWeekStart);

  const currentTotal = Math.round(current.reduce((a, b) => a + b, 0));
  const previousTotal = Math.round(previous.reduce((a, b) => a + b, 0));
  const changePct = previousTotal === 0 ? null : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

  return {
    currentTotal,
    previousTotal,
    changePct,
    series: current.map((value, i) => ({ current: Math.round(value), previous: Math.round(previous[i]) })),
    rangeLabel: `${thisWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  };
}

/** How many stock movements happened on each weekday over the trailing 7 days. */
export async function getWeekdayActivity() {
  const since = daysAgo(6);
  const moves = await prisma.stockMove.findMany({ where: { date: { gte: since } }, select: { date: true } });

  const counts = new Array(7).fill(0);
  for (const move of moves) {
    counts[move.date.getDay()] += 1;
  }

  return WEEKDAY_LABELS.map((label, i) => ({ label, count: counts[i] }));
}

/** Total quantity moved this trailing week vs the prior week, aligned by weekday for a line comparison. */
export async function getWeeklyComparison() {
  const thisWeekStart = daysAgo(6);
  const lastWeekStart = daysAgo(13);

  const [thisWeek, lastWeek] = await Promise.all([
    prisma.stockMove.findMany({ where: { date: { gte: thisWeekStart } }, select: { date: true, quantity: true } }),
    prisma.stockMove.findMany({
      where: { date: { gte: lastWeekStart, lt: thisWeekStart } },
      select: { date: true, quantity: true },
    }),
  ]);

  const bucket = (moves: { date: Date; quantity: number }[], start: Date) => {
    const totals = new Array(7).fill(0);
    for (const m of moves) {
      const dayIndex = Math.floor((startOfDay(m.date).getTime() - start.getTime()) / 86400000);
      if (dayIndex >= 0 && dayIndex < 7) totals[dayIndex] += Math.abs(m.quantity);
    }
    return totals;
  };

  const current = bucket(thisWeek, thisWeekStart);
  const previous = bucket(lastWeek, lastWeekStart);

  const currentTotal = current.reduce((a, b) => a + b, 0);
  const previousTotal = previous.reduce((a, b) => a + b, 0);
  const changePct = previousTotal === 0 ? null : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

  return {
    currentTotal,
    previousTotal,
    changePct,
    series: current.map((value, i) => ({ current: value, previous: previous[i] })),
    rangeLabel: `${thisWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  };
}

/** Snapshot of open work across receipts, deliveries, and transfers. */
export async function getOperationsStatusBreakdown() {
  const todayStart = startOfDay(new Date());

  const [draftCounts, inProgressCounts, doneToday] = await Promise.all([
    Promise.all([
      prisma.receipt.count({ where: { status: "DRAFT" } }),
      prisma.deliveryOrder.count({ where: { status: "DRAFT" } }),
      prisma.internalTransfer.count({ where: { status: "DRAFT" } }),
    ]),
    Promise.all([
      prisma.receipt.count({ where: { status: "READY" } }),
      prisma.deliveryOrder.count({ where: { status: { in: ["WAITING", "READY"] } } }),
      prisma.internalTransfer.count({ where: { status: { in: ["WAITING", "READY"] } } }),
    ]),
    Promise.all([
      prisma.receipt.count({ where: { status: "DONE", validatedAt: { gte: todayStart } } }),
      prisma.deliveryOrder.count({ where: { status: "DONE", validatedAt: { gte: todayStart } } }),
      prisma.internalTransfer.count({ where: { status: "DONE", validatedAt: { gte: todayStart } } }),
    ]),
  ]);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const draft = sum(draftCounts);
  const inProgress = sum(inProgressCounts);
  const completedToday = sum(doneToday);

  return { draft, inProgress, completedToday, openTotal: draft + inProgress };
}

/** Top locations by total stock on hand, for the location distribution card. */
export async function getLocationStockRanking(limit = 3) {
  const locations = await prisma.location.findMany({
    include: { warehouse: true, stockItems: true },
  });

  return locations
    .map((loc) => ({
      id: loc.id,
      name: loc.name,
      warehouseName: loc.warehouse.name,
      totalOnHand: loc.stockItems.reduce((sum, s) => sum + s.onHand, 0),
    }))
    .sort((a, b) => b.totalOnHand - a.totalOnHand)
    .slice(0, limit);
}

/** Secondary badge values shown under each KPI tile. */
export async function getKpiBadges() {
  const todayStart = startOfDay(new Date());
  const weekAgo = daysAgo(6);

  const [newProductsThisWeek, receiptsDueToday, deliveriesDueToday, outOfStock] = await Promise.all([
    prisma.product.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.receipt.count({ where: { scheduleDate: { gte: todayStart }, status: { in: ["DRAFT", "READY"] } } }),
    prisma.deliveryOrder.count({
      where: { scheduleDate: { gte: todayStart }, status: { in: ["DRAFT", "WAITING", "READY"] } },
    }),
    getStockLevelSummary().then((s) => s.outOfStock),
  ]);

  return { newProductsThisWeek, receiptsDueToday, deliveriesDueToday, outOfStock };
}

const DOC_TYPE_LABEL: Record<string, string> = {
  RECEIPT: "Receipt",
  DELIVERY: "Delivery",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
};

export async function getRecentOperations(limit = 6) {
  const moves = await prisma.stockMove.findMany({
    take: limit,
    orderBy: { date: "desc" },
    include: { product: true, fromLocation: true, toLocation: true },
  });

  return moves.map((move) => ({
    id: move.id,
    type: DOC_TYPE_LABEL[move.docType] ?? move.docType,
    item: move.product.name,
    quantity: move.quantity,
    location: move.toLocation?.name ?? move.fromLocation?.name ?? "-",
    status: move.status,
    date: move.date,
  }));
}
