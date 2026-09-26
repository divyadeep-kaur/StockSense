"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setStock } from "@/lib/stock";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  categoryId: z.string().trim().optional(),
  uom: z.string().trim().min(1).default("pcs"),
  minStockQty: z.coerce.number().min(0).default(0),
  reorderQty: z.coerce.number().min(0).default(0),
  lowStockAlert: z.coerce.boolean().default(false),
  initialStock: z.coerce.number().min(0).optional(),
  locationId: z.string().trim().optional(),
});

export type ProductFormState = { error?: string };

export async function createProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId") || undefined,
    uom: formData.get("uom") || "pcs",
    minStockQty: formData.get("minStockQty") || 0,
    reorderQty: formData.get("reorderQty") || 0,
    lowStockAlert: formData.get("lowStockAlert") === "on",
    initialStock: formData.get("initialStock") || undefined,
    locationId: formData.get("locationId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing) {
    return { error: "A product with this SKU already exists" };
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      sku: parsed.data.sku,
      categoryId: parsed.data.categoryId || null,
      uom: parsed.data.uom,
      minStockQty: parsed.data.minStockQty,
      reorderQty: parsed.data.reorderQty,
      lowStockAlert: parsed.data.lowStockAlert,
    },
  });

  if (parsed.data.initialStock && parsed.data.locationId) {
    await setStock(product.id, parsed.data.locationId, parsed.data.initialStock);
    await prisma.stockMove.create({
      data: {
        docType: "ADJUSTMENT",
        reference: "INITIAL/STOCK",
        productId: product.id,
        quantity: parsed.data.initialStock,
        toLocationId: parsed.data.locationId,
        status: "DONE",
      },
    });
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProduct(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const parsed = productSchema.omit({ initialStock: true, locationId: true }).safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId") || undefined,
    uom: formData.get("uom") || "pcs",
    minStockQty: formData.get("minStockQty") || 0,
    reorderQty: formData.get("reorderQty") || 0,
    lowStockAlert: formData.get("lowStockAlert") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing && existing.id !== productId) {
    return { error: "A product with this SKU already exists" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      sku: parsed.data.sku,
      categoryId: parsed.data.categoryId || null,
      uom: parsed.data.uom,
      minStockQty: parsed.data.minStockQty,
      reorderQty: parsed.data.reorderQty,
      lowStockAlert: parsed.data.lowStockAlert,
    },
  });

  revalidatePath("/products");
  redirect("/products");
}

export async function createCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const category = await prisma.category.upsert({
    where: { name: trimmed },
    update: {},
    create: { name: trimmed },
  });
  revalidatePath("/products");
  return category;
}

export async function addCategoryAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required" };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: "This category already exists" };

  await prisma.category.create({ data: { name } });
  revalidatePath("/settings");
  revalidatePath("/products");
  return {};
}
