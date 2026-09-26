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

const headerSchema = z.object({
  customerName: z.string().trim().min(1, "Customer is required"),
  deliveryAddress: z.string().trim().optional(),
  operationType: z.string().trim().optional(),
  fromLocationId: z.string().trim().min(1, "Source location is required"),
  scheduleDate: z.string().trim().min(1),
});

export async function createDelivery(_prev: DocFormState, formData: FormData): Promise<DocFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = headerSchema.safeParse({
    customerName: formData.get("customerName"),
    deliveryAddress: formData.get("deliveryAddress") || undefined,
    operationType: formData.get("operationType") || undefined,
    fromLocationId: formData.get("fromLocationId"),
    scheduleDate: formData.get("scheduleDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const lines = parseLines(formData);
  if (lines.length === 0) return { error: "Add at least one product line" };

  const reference = await nextReference("DELIVERY");

  const delivery = await prisma.deliveryOrder.create({
    data: {
      reference,
      customerName: parsed.data.customerName,
      deliveryAddress: parsed.data.deliveryAddress || null,
      operationType: parsed.data.operationType || null,
      fromLocationId: parsed.data.fromLocationId,
      responsibleId: user.id,
      scheduleDate: new Date(parsed.data.scheduleDate),
      lines: { create: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) },
    },
  });

  revalidatePath("/operations/deliveries");
  redirect(`/operations/deliveries/${delivery.id}`);
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

export async function checkAvailability(id: string) {
  const delivery = await prisma.deliveryOrder.findUnique({ where: { id }, include: { lines: true } });
  if (!delivery || delivery.status === "DONE" || delivery.status === "CANCELED") return;

  const sufficient = await hasSufficientStock(delivery.fromLocationId, delivery.lines);
  await prisma.deliveryOrder.update({
    where: { id },
    data: { status: sufficient ? "READY" : "WAITING" },
  });

  revalidatePath(`/operations/deliveries/${id}`);
  revalidatePath("/operations/deliveries");
}

export async function validateDelivery(id: string) {
  const delivery = await prisma.deliveryOrder.findUnique({ where: { id }, include: { lines: true } });
  if (!delivery || delivery.status !== "READY") return;

  const sufficient = await hasSufficientStock(delivery.fromLocationId, delivery.lines);
  if (!sufficient) {
    await prisma.deliveryOrder.update({ where: { id }, data: { status: "WAITING" } });
    revalidatePath(`/operations/deliveries/${id}`);
    return;
  }

  for (const line of delivery.lines) {
    await adjustStock(line.productId, delivery.fromLocationId, -line.quantity);
    await recordMove({
      docType: "DELIVERY",
      reference: delivery.reference,
      productId: line.productId,
      quantity: -line.quantity,
      fromLocationId: delivery.fromLocationId,
      contact: delivery.customerName,
    });
  }

  await prisma.deliveryOrder.update({ where: { id }, data: { status: "DONE", validatedAt: new Date() } });
  revalidatePath(`/operations/deliveries/${id}`);
  revalidatePath("/operations/deliveries");
  revalidatePath("/dashboard");
  revalidatePath("/move-history");
  revalidatePath("/products");
}

export async function cancelDelivery(id: string) {
  await prisma.deliveryOrder.updateMany({
    where: { id, status: { in: ["DRAFT", "WAITING", "READY"] } },
    data: { status: "CANCELED" },
  });
  revalidatePath(`/operations/deliveries/${id}`);
  revalidatePath("/operations/deliveries");
}
