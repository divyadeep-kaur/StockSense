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
