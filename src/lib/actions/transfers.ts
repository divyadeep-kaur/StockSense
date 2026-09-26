"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { nextReference } from "@/lib/reference";
import { adjustStock, recordMove } from "@/lib/stock";
import { parseLines } from "@/lib/parse-lines";
import type { DocFormState } from "@/lib/actions/receipts";

const headerSchema = z
  .object({
    fromLocationId: z.string().trim().min(1, "Source location is required"),
    toLocationId: z.string().trim().min(1, "Destination location is required"),
    scheduleDate: z.string().trim().min(1),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: "Source and destination must be different locations",
    path: ["toLocationId"],
  });

export async function createTransfer(_prev: DocFormState, formData: FormData): Promise<DocFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = headerSchema.safeParse({
    fromLocationId: formData.get("fromLocationId"),
    toLocationId: formData.get("toLocationId"),
    scheduleDate: formData.get("scheduleDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const lines = parseLines(formData);
  if (lines.length === 0) return { error: "Add at least one product line" };

  const reference = await nextReference("TRANSFER");

  const transfer = await prisma.internalTransfer.create({
    data: {
      reference,
      fromLocationId: parsed.data.fromLocationId,
      toLocationId: parsed.data.toLocationId,
      responsibleId: user.id,
      scheduleDate: new Date(parsed.data.scheduleDate),
      lines: { create: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) },
    },
  });

  revalidatePath("/operations/transfers");
  redirect(`/operations/transfers/${transfer.id}`);
}

async function hasSufficientStock(fromLocationId: string, lines: { productId: string; quantity: number }[]) {
  for (const line of lines) {
    const stockItem = await prisma.stockItem.findUnique({
      where: { productId_locationId: { productId: line.productId, locationId: fromLocationId } },
    });
    const available = (stockItem?.onHand ?? 0) - (stockItem?.reserved ?? 0);
    if (available < line.quantity) return false;
  }
  return true;
}

export async function checkTransferAvailability(id: string) {
  const transfer = await prisma.internalTransfer.findUnique({ where: { id }, include: { lines: true } });
  if (!transfer || transfer.status === "DONE" || transfer.status === "CANCELED") return;

  const sufficient = await hasSufficientStock(transfer.fromLocationId, transfer.lines);
  await prisma.internalTransfer.update({ where: { id }, data: { status: sufficient ? "READY" : "WAITING" } });

  revalidatePath(`/operations/transfers/${id}`);
  revalidatePath("/operations/transfers");
}

export async function validateTransfer(id: string) {
  const transfer = await prisma.internalTransfer.findUnique({ where: { id }, include: { lines: true } });
  if (!transfer || transfer.status !== "READY") return;

  const sufficient = await hasSufficientStock(transfer.fromLocationId, transfer.lines);
  if (!sufficient) {
    await prisma.internalTransfer.update({ where: { id }, data: { status: "WAITING" } });
    revalidatePath(`/operations/transfers/${id}`);
    return;
  }

  for (const line of transfer.lines) {
    await adjustStock(line.productId, transfer.fromLocationId, -line.quantity);
    await adjustStock(line.productId, transfer.toLocationId, line.quantity);
    await recordMove({
      docType: "TRANSFER",
      reference: transfer.reference,
      productId: line.productId,
      quantity: line.quantity,
      fromLocationId: transfer.fromLocationId,
      toLocationId: transfer.toLocationId,
    });
  }

  await prisma.internalTransfer.update({ where: { id }, data: { status: "DONE", validatedAt: new Date() } });
  revalidatePath(`/operations/transfers/${id}`);
  revalidatePath("/operations/transfers");
  revalidatePath("/dashboard");
  revalidatePath("/move-history");
  revalidatePath("/products");
}

export async function cancelTransfer(id: string) {
  await prisma.internalTransfer.updateMany({
    where: { id, status: { in: ["DRAFT", "WAITING", "READY"] } },
    data: { status: "CANCELED" },
  });
  revalidatePath(`/operations/transfers/${id}`);
  revalidatePath("/operations/transfers");
}
