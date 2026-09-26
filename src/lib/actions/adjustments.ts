"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { nextReference } from "@/lib/reference";
import { setStock, recordMove } from "@/lib/stock";
import type { DocFormState } from "@/lib/actions/receipts";

const schema = z.object({
  productId: z.string().trim().min(1, "Product is required"),
  locationId: z.string().trim().min(1, "Location is required"),
  countedQty: z.coerce.number().min(0, "Counted quantity can't be negative"),
});

export async function createAdjustment(_prev: DocFormState, formData: FormData): Promise<DocFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    locationId: formData.get("locationId"),
    countedQty: formData.get("countedQty"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { productId, locationId, countedQty } = parsed.data;

  const stockItem = await prisma.stockItem.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  const recordedQty = stockItem?.onHand ?? 0;
  const diff = countedQty - recordedQty;

  const reference = await nextReference("ADJUSTMENT");

  await setStock(productId, locationId, countedQty);

  if (diff !== 0) {
    await recordMove({
      docType: "ADJUSTMENT",
      reference,
      productId,
      quantity: diff,
      toLocationId: diff > 0 ? locationId : null,
      fromLocationId: diff < 0 ? locationId : null,
    });
  }

  await prisma.adjustment.create({
    data: {
      reference,
      productId,
      locationId,
      recordedQty,
      countedQty,
      responsibleId: user.id,
      status: "DONE",
    },
  });

  revalidatePath("/operations/adjustments");
  revalidatePath("/dashboard");
  revalidatePath("/move-history");
  revalidatePath("/products");
  redirect("/operations/adjustments");
}
