import { prisma } from "@/lib/prisma";
import type { DocType } from "@prisma/client";

/** Adds `delta` (positive or negative) to the on-hand quantity for a product at a location. */
export async function adjustStock(productId: string, locationId: string, delta: number) {
  const existing = await prisma.stockItem.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });

  if (!existing) {
    return prisma.stockItem.create({
      data: { productId, locationId, onHand: delta },
    });
  }

  return prisma.stockItem.update({
    where: { id: existing.id },
    data: { onHand: existing.onHand + delta },
  });
}

export async function setStock(productId: string, locationId: string, onHand: number) {
  return prisma.stockItem.upsert({
    where: { productId_locationId: { productId, locationId } },
    update: { onHand },
    create: { productId, locationId, onHand },
  });
}

export async function recordMove(params: {
  docType: DocType;
  reference: string;
  productId: string;
  quantity: number;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  contact?: string | null;
}) {
  return prisma.stockMove.create({
    data: {
      docType: params.docType,
      reference: params.reference,
      productId: params.productId,
      quantity: params.quantity,
      fromLocationId: params.fromLocationId ?? null,
      toLocationId: params.toLocationId ?? null,
      contact: params.contact ?? null,
    },
  });
}
