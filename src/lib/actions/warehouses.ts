"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type DocFormState = { error?: string };

const warehouseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z.string().trim().min(1, "Short code is required").toUpperCase(),
  address: z.string().trim().optional(),
});

export async function createWarehouse(_prev: DocFormState, formData: FormData): Promise<DocFormState> {
  const parsed = warehouseSchema.safeParse({
    name: formData.get("name"),
    shortCode: formData.get("shortCode"),
    address: formData.get("address") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.warehouse.findUnique({ where: { shortCode: parsed.data.shortCode } });
  if (existing) return { error: "A warehouse with this short code already exists" };

  const warehouse = await prisma.warehouse.create({
    data: { name: parsed.data.name, shortCode: parsed.data.shortCode, address: parsed.data.address || null },
  });

  revalidatePath("/warehouses");
  redirect(`/warehouses/${warehouse.id}`);
}

const locationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortCode: z.string().trim().min(1, "Short code is required").toUpperCase(),
});

export async function createLocation(warehouseId: string, _prev: DocFormState, formData: FormData): Promise<DocFormState> {
  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    shortCode: formData.get("shortCode"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.location.findUnique({
    where: { warehouseId_shortCode: { warehouseId, shortCode: parsed.data.shortCode } },
  });
  if (existing) return { error: "A location with this short code already exists in this warehouse" };

  await prisma.location.create({
    data: { name: parsed.data.name, shortCode: parsed.data.shortCode, warehouseId },
  });

  revalidatePath(`/warehouses/${warehouseId}`);
  return {};
}
