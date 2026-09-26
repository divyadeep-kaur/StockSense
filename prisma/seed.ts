import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "manager@stocksense.dev" },
    update: {},
    create: {
      fullName: "Demo Manager",
      email: "manager@stocksense.dev",
      passwordHash,
      role: "MANAGER",
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { shortCode: "WH1" },
    update: {},
    create: {
      name: "Main Warehouse",
      shortCode: "WH1",
      address: "1 Industrial Ave",
    },
  });

  const locationNames: Array<[string, string]> = [
    ["Main Store", "STOCK"],
    ["Rack A", "RACK-A"],
    ["Production Floor", "PROD"],
  ];

  const locations = [];
  for (const [name, shortCode] of locationNames) {
    locations.push(
      await prisma.location.upsert({
        where: { warehouseId_shortCode: { warehouseId: warehouse.id, shortCode } },
        update: {},
        create: { name, shortCode, warehouseId: warehouse.id },
      })
    );
  }
  const [mainStore] = locations;

  const categoryNames = ["Raw Material", "Finished Goods", "Components"];
  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories[name] = category.id;
  }

  const products = [
    { name: "Steel Rods", sku: "SR001", category: "Raw Material", uom: "kg", cost: 120, min: 100, reorder: 200 },
    { name: "Chairs", sku: "CH001", category: "Finished Goods", uom: "pcs", cost: 45, min: 20, reorder: 50 },
    { name: "Tables", sku: "TB001", category: "Finished Goods", uom: "pcs", cost: 90, min: 10, reorder: 20 },
    { name: "Desk", sku: "DESK001", category: "Finished Goods", uom: "pcs", cost: 150, min: 15, reorder: 30 },
    { name: "Screws", sku: "SC001", category: "Components", uom: "pcs", cost: 1, min: 500, reorder: 1000 },
    { name: "Paint", sku: "PT001", category: "Raw Material", uom: "ltr", cost: 30, min: 10, reorder: 25 },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        uom: p.uom,
        categoryId: categories[p.category],
        costPerUnit: p.cost,
        minStockQty: p.min,
        reorderQty: p.reorder,
      },
    });

    const onHand = p.min * 2;
    await prisma.stockItem.upsert({
      where: { productId_locationId: { productId: product.id, locationId: mainStore.id } },
      update: {},
      create: { productId: product.id, locationId: mainStore.id, onHand },
    });

    await prisma.stockMove.create({
      data: {
        docType: "ADJUSTMENT",
        reference: "SEED/INIT",
        productId: product.id,
        quantity: onHand,
        toLocationId: mainStore.id,
        status: "DONE",
      },
    });
  }

  console.log("Seed complete:", { user: user.email, warehouse: warehouse.name });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
