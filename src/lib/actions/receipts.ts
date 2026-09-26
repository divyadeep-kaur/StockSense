"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { nextReference } from "@/lib/reference";
import { adjustStock, recordMove } from "@/lib/stock";
import { parseLines } from "@/lib/parse-lines";

const headerSchema = z.object({
  supplierName: z.string().trim().min(1, "Supplier is required"),
  toLocationId: z.string().trim().min(1, "Destination location is required"),
  scheduleDate: z.string().trim().min(1),
});

export type DocFormState = { error?: string };

export async function createReceipt(_prev: DocFormState, formData: FormData): Promise<DocFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = headerSchema.safeParse({
    supplierName: formData.get("supplierName"),
    toLocationId: formData.get("toLocationId"),
    scheduleDate: formData.get("scheduleDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const lines = parseLines(formData);
  if (lines.length === 0) return { error: "Add at least one product line" };

  const reference = await nextReference("RECEIPT");

  const receipt = await prisma.receipt.create({
    data: {
      reference,
      supplierName: parsed.data.supplierName,
      toLocationId: parsed.data.toLocationId,
      responsibleId: user.id,
      scheduleDate: new Date(parsed.data.scheduleDate),
      lines: { create: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) },
    },
  });

  revalidatePath("/operations/receipts");
  redirect(`/operations/receipts/${receipt.id}`);
}

export async function markReceiptReady(id: string) {
  await prisma.receipt.updateMany({ where: { id, status: "DRAFT" }, data: { status: "READY" } });
  revalidatePath(`/operations/receipts/${id}`);
  revalidatePath("/operations/receipts");
}

export async function validateReceipt(id: string) {
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: { lines: true } });
  if (!receipt || receipt.status === "DONE" || receipt.status === "CANCELED") return;

  for (const line of receipt.lines) {
    await adjustStock(line.productId, receipt.toLocationId, line.quantity);
    await recordMove({
      docType: "RECEIPT",
      reference: receipt.reference,
      productId: line.productId,
      quantity: line.quantity,
      toLocationId: receipt.toLocationId,
      contact: receipt.supplierName,
    });
  }

  await prisma.receipt.update({ where: { id }, data: { status: "DONE", validatedAt: new Date() } });
  revalidatePath(`/operations/receipts/${id}`);
  revalidatePath("/operations/receipts");
  revalidatePath("/dashboard");
  revalidatePath("/move-history");
  revalidatePath("/products");
}

export async function cancelReceipt(id: string) {
  await prisma.receipt.updateMany({
    where: { id, status: { in: ["DRAFT", "READY"] } },
    data: { status: "CANCELED" },
  });
  revalidatePath(`/operations/receipts/${id}`);
  revalidatePath("/operations/receipts");
}
