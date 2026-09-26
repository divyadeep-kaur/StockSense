"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, verifyPassword } from "@/lib/auth";
import { seedDemoData } from "../../../prisma/seed-data";

export type ResetDataState = { error?: string; success?: string };

/** Wipes every warehouse, product, and operation and rebuilds the original
 * demo dataset, gated on the requesting user re-entering their password. */
export async function resetDemoData(_prev: ResetDataState, formData: FormData): Promise<ResetDataState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Enter your password to confirm" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Incorrect password" };

  await prisma.$transaction(
    async (tx) => {
      await tx.user.updateMany({ data: { defaultWarehouseId: null } });
      await tx.notificationState.deleteMany({});
      await tx.receiptLine.deleteMany({});
      await tx.deliveryLine.deleteMany({});
      await tx.transferLine.deleteMany({});
      await tx.stockMove.deleteMany({});
      await tx.adjustment.deleteMany({});
      await tx.receipt.deleteMany({});
      await tx.deliveryOrder.deleteMany({});
      await tx.internalTransfer.deleteMany({});
      await tx.stockItem.deleteMany({});
      await tx.product.deleteMany({});
      await tx.category.deleteMany({});
      await tx.location.deleteMany({});
      await tx.warehouse.deleteMany({});

      await seedDemoData(tx, user.id);
    },
    { timeout: 20000 }
  );

  revalidatePath("/", "layout");
  return { success: "Demo data has been reset." };
}
