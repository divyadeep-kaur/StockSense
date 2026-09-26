import { prisma } from "@/lib/prisma";

const PREFIX = {
  RECEIPT: "WH/IN",
  DELIVERY: "WH/OUT",
  TRANSFER: "WH/INT",
  ADJUSTMENT: "WH/ADJ",
} as const;

type Kind = keyof typeof PREFIX;

const COUNTERS: Record<Kind, () => Promise<number>> = {
  RECEIPT: () => prisma.receipt.count(),
  DELIVERY: () => prisma.deliveryOrder.count(),
  TRANSFER: () => prisma.internalTransfer.count(),
  ADJUSTMENT: () => prisma.adjustment.count(),
};

export async function nextReference(kind: Kind) {
  const count = await COUNTERS[kind]();
  const seq = String(count + 1).padStart(4, "0");
  return `${PREFIX[kind]}/${seq}`;
}
