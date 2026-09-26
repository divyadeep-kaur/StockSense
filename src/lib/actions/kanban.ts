"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { DocStatus } from "@prisma/client";
import type { KanbanKind } from "@/lib/kanban";
import { markReceiptReady, validateReceipt, cancelReceipt } from "@/lib/actions/receipts";
import { checkAvailability, validateDelivery, cancelDelivery } from "@/lib/actions/deliveries";
import { checkTransferAvailability, validateTransfer, cancelTransfer } from "@/lib/actions/transfers";

export type MoveResult = { ok: boolean; status?: DocStatus; error?: string };

/** Moves a Kanban card to a new column by calling the same server actions the operation detail pages use — no stock logic is duplicated here. */
export async function moveKanbanCard(kind: KanbanKind, id: string, target: DocStatus): Promise<MoveResult> {
  if (kind === "ADJUSTMENT") {
    return { ok: false, error: "Adjustments are finalized immediately and can't be moved." };
  }

  if (kind === "RECEIPT") {
    if (target === "READY") await markReceiptReady(id);
    else if (target === "DONE") await validateReceipt(id);
    else if (target === "CANCELED") await cancelReceipt(id);
    else return { ok: false, error: "That move isn't supported for receipts." };
  } else if (kind === "DELIVERY") {
    if (target === "READY" || target === "WAITING") await checkAvailability(id);
    else if (target === "DONE") await validateDelivery(id);
    else if (target === "CANCELED") await cancelDelivery(id);
    else return { ok: false, error: "That move isn't supported for deliveries." };
  } else {
    if (target === "READY" || target === "WAITING") await checkTransferAvailability(id);
    else if (target === "DONE") await validateTransfer(id);
    else if (target === "CANCELED") await cancelTransfer(id);
    else return { ok: false, error: "That move isn't supported for transfers." };
  }

  const finalStatus = await readBackStatus(kind, id);
  revalidatePath("/kanban");
  return { ok: true, status: finalStatus };
}

async function readBackStatus(kind: KanbanKind, id: string): Promise<DocStatus | undefined> {
  if (kind === "RECEIPT") return (await prisma.receipt.findUnique({ where: { id }, select: { status: true } }))?.status;
  if (kind === "DELIVERY") return (await prisma.deliveryOrder.findUnique({ where: { id }, select: { status: true } }))?.status;
  return (await prisma.internalTransfer.findUnique({ where: { id }, select: { status: true } }))?.status;
}
