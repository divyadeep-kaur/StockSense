import { prisma } from "@/lib/prisma";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function classifyStock(totalOnHand: number, minStockQty: number): StockStatus {
  if (totalOnHand <= 0) return "OUT_OF_STOCK";
  if (totalOnHand <= minStockQty) return "LOW_STOCK";
  return "IN_STOCK";
}

export async function listProductsWithStock(params?: { search?: string; categoryIds?: string[] }) {
  const products = await prisma.product.findMany({
    where: {
      AND: [
        params?.search
          ? {
              OR: [
                { name: { contains: params.search } },
                { sku: { contains: params.search } },
              ],
            }
          : {},
        params?.categoryIds && params.categoryIds.length > 0 ? { categoryId: { in: params.categoryIds } } : {},
      ],
    },
    include: { category: true, stockItems: true },
    orderBy: { name: "asc" },
  });

  return products.map((product) => {
    const totalOnHand = product.stockItems.reduce((sum, item) => sum + item.onHand, 0);
    return {
      ...product,
      totalOnHand,
      status: classifyStock(totalOnHand, product.minStockQty),
    };
  });
}
