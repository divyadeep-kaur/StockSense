"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { ProfileFormState } from "@/lib/actions/profile";

const schema = z.object({
  notifyLowStock: z.coerce.boolean(),
  compactTables: z.coerce.boolean(),
  defaultWarehouseId: z.string().trim().optional(),
});

export async function updatePreferences(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = schema.safeParse({
    notifyLowStock: formData.get("notifyLowStock") === "on",
    compactTables: formData.get("compactTables") === "on",
    defaultWarehouseId: formData.get("defaultWarehouseId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      notifyLowStock: parsed.data.notifyLowStock,
      compactTables: parsed.data.compactTables,
      defaultWarehouseId: parsed.data.defaultWarehouseId || null,
    },
  });

  revalidatePath("/preferences");
  revalidatePath("/products");
  return { success: "Preferences saved" };
}
