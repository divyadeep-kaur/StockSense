import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgoDate(n: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function pad(n: number) {
  return String(n).padStart(4, "0");
}

const counters = { RECEIPT: 0, DELIVERY: 0, TRANSFER: 0, ADJUSTMENT: 0 };
function nextRef(kind: keyof typeof counters) {
  counters[kind] += 1;
  const prefix = { RECEIPT: "WH/IN", DELIVERY: "WH/OUT", TRANSFER: "WH/INT", ADJUSTMENT: "WH/ADJ" }[kind];
  return `${prefix}/${pad(counters[kind])}`;
}

async function adjustStock(productId: string, locationId: string, delta: number) {
  const existing = await prisma.stockItem.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });
  if (!existing) return prisma.stockItem.create({ data: { productId, locationId, onHand: delta } });
  return prisma.stockItem.update({ where: { id: existing.id }, data: { onHand: existing.onHand + delta } });
}

async function getOnHand(productId: string, locationId: string) {
  const item = await prisma.stockItem.findUnique({ where: { productId_locationId: { productId, locationId } } });
  return item?.onHand ?? 0;
}

async function applyReceipt(opts: {
  supplierName: string;
  toLocationId: string;
  responsibleId: string;
  date: Date;
  lines: { productId: string; quantity: number }[];
}) {
  const reference = nextRef("RECEIPT");
  await prisma.receipt.create({
    data: {
      reference,
      supplierName: opts.supplierName,
      toLocationId: opts.toLocationId,
      responsibleId: opts.responsibleId,
      scheduleDate: opts.date,
      status: "DONE",
      createdAt: opts.date,
      validatedAt: opts.date,
      lines: { create: opts.lines },
    },
  });
  for (const line of opts.lines) {
    await adjustStock(line.productId, opts.toLocationId, line.quantity);
    await prisma.stockMove.create({
      data: {
        docType: "RECEIPT",
        reference,
        productId: line.productId,
        quantity: line.quantity,
        toLocationId: opts.toLocationId,
        contact: opts.supplierName,
        date: opts.date,
        status: "DONE",
      },
    });
  }
}

async function applyDelivery(opts: {
  customerName: string;
  fromLocationId: string;
  responsibleId: string;
  date: Date;
  lines: { productId: string; quantity: number }[];
}) {
  const reference = nextRef("DELIVERY");
  await prisma.deliveryOrder.create({
    data: {
      reference,
      customerName: opts.customerName,
      fromLocationId: opts.fromLocationId,
      responsibleId: opts.responsibleId,
      scheduleDate: opts.date,
      status: "DONE",
      createdAt: opts.date,
      validatedAt: opts.date,
      lines: { create: opts.lines },
    },
  });
  for (const line of opts.lines) {
    await adjustStock(line.productId, opts.fromLocationId, -line.quantity);
    await prisma.stockMove.create({
      data: {
        docType: "DELIVERY",
        reference,
        productId: line.productId,
        quantity: -line.quantity,
        fromLocationId: opts.fromLocationId,
        contact: opts.customerName,
        date: opts.date,
        status: "DONE",
      },
    });
  }
}

async function applyTransfer(opts: {
  fromLocationId: string;
  toLocationId: string;
  responsibleId: string;
  date: Date;
  lines: { productId: string; quantity: number }[];
}) {
  const reference = nextRef("TRANSFER");
  await prisma.internalTransfer.create({
    data: {
      reference,
      fromLocationId: opts.fromLocationId,
      toLocationId: opts.toLocationId,
      responsibleId: opts.responsibleId,
      scheduleDate: opts.date,
      status: "DONE",
      createdAt: opts.date,
      validatedAt: opts.date,
      lines: { create: opts.lines },
    },
  });
  for (const line of opts.lines) {
    await adjustStock(line.productId, opts.fromLocationId, -line.quantity);
    await adjustStock(line.productId, opts.toLocationId, line.quantity);
    await prisma.stockMove.create({
      data: {
        docType: "TRANSFER",
        reference,
        productId: line.productId,
        quantity: line.quantity,
        fromLocationId: opts.fromLocationId,
        toLocationId: opts.toLocationId,
        date: opts.date,
        status: "DONE",
      },
    });
  }
}

async function applyAdjustment(opts: {
  productId: string;
  locationId: string;
  responsibleId: string;
  date: Date;
  diff: number;
}) {
  const reference = nextRef("ADJUSTMENT");
  const recordedQty = await getOnHand(opts.productId, opts.locationId);
  const countedQty = recordedQty + opts.diff;
  await adjustStock(opts.productId, opts.locationId, opts.diff);
  await prisma.adjustment.create({
    data: {
      reference,
      productId: opts.productId,
      locationId: opts.locationId,
      recordedQty,
      countedQty,
      responsibleId: opts.responsibleId,
      status: "DONE",
      date: opts.date,
    },
  });
  if (opts.diff !== 0) {
    await prisma.stockMove.create({
      data: {
        docType: "ADJUSTMENT",
        reference,
        productId: opts.productId,
        quantity: opts.diff,
        toLocationId: opts.diff > 0 ? opts.locationId : null,
        fromLocationId: opts.diff < 0 ? opts.locationId : null,
        date: opts.date,
        status: "DONE",
      },
    });
  }
}

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
    create: { name: "Main Warehouse", shortCode: "WH1", address: "1 Industrial Ave" },
  });

  const locationDefs: Array<[string, string]> = [
    ["Main Store", "STOCK"],
    ["Rack A", "RACK-A"],
    ["Production Floor", "PROD"],
  ];
  const locations: Record<string, string> = {};
  for (const [name, shortCode] of locationDefs) {
    const loc = await prisma.location.upsert({
      where: { warehouseId_shortCode: { warehouseId: warehouse.id, shortCode } },
      update: {},
      create: { name, shortCode, warehouseId: warehouse.id },
    });
    locations[name] = loc.id;
  }
  const mainStore = locations["Main Store"];
  const rackA = locations["Rack A"];
  const prodFloor = locations["Production Floor"];

  const categoryDefs = ["Raw Material", "Finished Goods", "Components"];
  const categories: Record<string, string> = {};
  for (const name of categoryDefs) {
    const c = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categories[name] = c.id;
  }

  const productDefs = [
    { name: "Steel Rods", sku: "SR001", category: "Raw Material", uom: "kg", cost: 120, min: 100, reorder: 200, alert: false, baseline: { [mainStore]: 150 } },
    { name: "Chairs", sku: "CH001", category: "Finished Goods", uom: "pcs", cost: 45, min: 20, reorder: 50, alert: false, baseline: { [mainStore]: 60 } },
    { name: "Tables", sku: "TB001", category: "Finished Goods", uom: "pcs", cost: 90, min: 25, reorder: 20, alert: true, baseline: { [mainStore]: 45 } },
    { name: "Desk", sku: "DESK001", category: "Finished Goods", uom: "pcs", cost: 150, min: 15, reorder: 30, alert: false, baseline: { [mainStore]: 40 } },
    { name: "Screws", sku: "SC001", category: "Components", uom: "pcs", cost: 1, min: 500, reorder: 1000, alert: false, baseline: { [mainStore]: 800 } },
    { name: "Paint", sku: "PT001", category: "Raw Material", uom: "ltr", cost: 30, min: 10, reorder: 25, alert: true, baseline: { [mainStore]: 25 } },
    { name: "Bolts", sku: "BLT001", category: "Components", uom: "pcs", cost: 2, min: 300, reorder: 500, alert: false, baseline: {} },
    { name: "Varnish", sku: "VRN001", category: "Raw Material", uom: "ltr", cost: 35, min: 15, reorder: 30, alert: false, baseline: {} },
  ] as const;

  const products: Record<string, string> = {};
  for (const p of productDefs) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        minStockQty: p.min,
        reorderQty: p.reorder,
        lowStockAlert: p.alert,
        categoryId: categories[p.category],
      },
      create: {
        name: p.name,
        sku: p.sku,
        uom: p.uom,
        categoryId: categories[p.category],
        costPerUnit: p.cost,
        minStockQty: p.min,
        reorderQty: p.reorder,
        lowStockAlert: p.alert,
      },
    });
    products[p.sku] = product.id;

    for (const [locationId, qty] of Object.entries(p.baseline)) {
      await prisma.stockItem.upsert({
        where: { productId_locationId: { productId: product.id, locationId } },
        update: { onHand: qty as number },
        create: { productId: product.id, locationId, onHand: qty as number },
      });
    }
  }

  const P = products;
  const uid = user.id;

  // --- Two weeks of history: day 13 (oldest) down to day 0 (today) ---
  await applyReceipt({ supplierName: "ABC Traders", toLocationId: mainStore, responsibleId: uid, date: daysAgoDate(13, 9), lines: [{ productId: P.SR001, quantity: 80 }] });
  await applyDelivery({ customerName: "Azure Interior", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(13, 15), lines: [{ productId: P.CH001, quantity: 10 }] });

  await applyTransfer({ fromLocationId: mainStore, toLocationId: rackA, responsibleId: uid, date: daysAgoDate(12, 11), lines: [{ productId: P.SC001, quantity: 100 }] });
  await applyAdjustment({ productId: P.TB001, locationId: mainStore, responsibleId: uid, date: daysAgoDate(12, 16), diff: -2 });

  await applyReceipt({ supplierName: "Fastener Co", toLocationId: rackA, responsibleId: uid, date: daysAgoDate(11, 10), lines: [{ productId: P.BLT001, quantity: 250 }] });

  await applyDelivery({ customerName: "Home Decor Co", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(10, 14), lines: [{ productId: P.DESK001, quantity: 5 }] });

  await applyReceipt({ supplierName: "ColorWorks", toLocationId: mainStore, responsibleId: uid, date: daysAgoDate(9, 9), lines: [{ productId: P.PT001, quantity: 20 }] });
  await applyDelivery({ customerName: "BuildCo", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(9, 13), lines: [{ productId: P.SR001, quantity: 20 }] });

  await applyTransfer({ fromLocationId: mainStore, toLocationId: prodFloor, responsibleId: uid, date: daysAgoDate(8, 11), lines: [{ productId: P.DESK001, quantity: 10 }] });

  await applyReceipt({ supplierName: "ColorWorks", toLocationId: prodFloor, responsibleId: uid, date: daysAgoDate(7, 9), lines: [{ productId: P.VRN001, quantity: 40 }] });
  await applyDelivery({ customerName: "Urban Loft", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(7, 15), lines: [{ productId: P.CH001, quantity: 8 }] });

  // This week
  await applyReceipt({ supplierName: "Fastener Co", toLocationId: mainStore, responsibleId: uid, date: daysAgoDate(6, 9), lines: [{ productId: P.SC001, quantity: 500 }] });
  await applyDelivery({ customerName: "Azure Interior", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(6, 14), lines: [{ productId: P.TB001, quantity: 5 }] });

  await applyTransfer({ fromLocationId: mainStore, toLocationId: rackA, responsibleId: uid, date: daysAgoDate(5, 10), lines: [{ productId: P.PT001, quantity: 5 }] });
  await applyAdjustment({ productId: P.SC001, locationId: mainStore, responsibleId: uid, date: daysAgoDate(5, 16), diff: -10 });

  await applyReceipt({ supplierName: "ABC Traders", toLocationId: mainStore, responsibleId: uid, date: daysAgoDate(4, 9), lines: [{ productId: P.SR001, quantity: 60 }] });
  await applyDelivery({ customerName: "Loft Living", fromLocationId: prodFloor, responsibleId: uid, date: daysAgoDate(4, 13), lines: [{ productId: P.DESK001, quantity: 6 }] });

  await applyDelivery({ customerName: "AutoWorks", fromLocationId: rackA, responsibleId: uid, date: daysAgoDate(3, 11), lines: [{ productId: P.BLT001, quantity: 50 }] });
  await applyTransfer({ fromLocationId: mainStore, toLocationId: prodFloor, responsibleId: uid, date: daysAgoDate(3, 15), lines: [{ productId: P.CH001, quantity: 10 }] });

  await applyReceipt({ supplierName: "ColorWorks", toLocationId: mainStore, responsibleId: uid, date: daysAgoDate(2, 9), lines: [{ productId: P.PT001, quantity: 15 }] });
  await applyDelivery({ customerName: "City Furnishings", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(2, 14), lines: [{ productId: P.TB001, quantity: 12 }] });
  await applyAdjustment({ productId: P.VRN001, locationId: prodFloor, responsibleId: uid, date: daysAgoDate(2, 16), diff: -3 });

  await applyDelivery({ customerName: "BuildCo", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(1, 10), lines: [{ productId: P.SR001, quantity: 40 }] });
  await applyTransfer({ fromLocationId: mainStore, toLocationId: prodFloor, responsibleId: uid, date: daysAgoDate(1, 14), lines: [{ productId: P.SC001, quantity: 80 }] });

  await applyReceipt({ supplierName: "ABC Traders", toLocationId: mainStore, responsibleId: uid, date: daysAgoDate(0, 10), lines: [{ productId: P.SR001, quantity: 50 }] });
  await applyAdjustment({ productId: P.PT001, locationId: mainStore, responsibleId: uid, date: daysAgoDate(0, 11), diff: -3 });
  await applyDelivery({ customerName: "Nordic Home", fromLocationId: mainStore, responsibleId: uid, date: daysAgoDate(0, 15), lines: [{ productId: P.TB001, quantity: 4 }] });

  // --- Open / pending documents, not yet validated ---
  await prisma.receipt.create({
    data: {
      reference: nextRef("RECEIPT"),
      supplierName: "New Vendor Co",
      toLocationId: mainStore,
      responsibleId: uid,
      scheduleDate: daysAgoDate(-1, 9),
      status: "DRAFT",
      lines: { create: [{ productId: P.DESK001, quantity: 25 }] },
    },
  });
  await prisma.receipt.create({
    data: {
      reference: nextRef("RECEIPT"),
      supplierName: "ABC Traders",
      toLocationId: rackA,
      responsibleId: uid,
      scheduleDate: daysAgoDate(0, 9),
      status: "READY",
      lines: { create: [{ productId: P.SR001, quantity: 30 }] },
    },
  });
  await prisma.deliveryOrder.create({
    data: {
      reference: nextRef("DELIVERY"),
      customerName: "Big Order Co",
      fromLocationId: mainStore,
      responsibleId: uid,
      scheduleDate: daysAgoDate(0, 9),
      status: "WAITING",
      lines: { create: [{ productId: P.TB001, quantity: 500 }] },
    },
  });
  await prisma.deliveryOrder.create({
    data: {
      reference: nextRef("DELIVERY"),
      customerName: "Retail Partner",
      fromLocationId: mainStore,
      responsibleId: uid,
      scheduleDate: daysAgoDate(0, 9),
      status: "READY",
      lines: { create: [{ productId: P.CH001, quantity: 5 }] },
    },
  });
  await prisma.internalTransfer.create({
    data: {
      reference: nextRef("TRANSFER"),
      fromLocationId: mainStore,
      toLocationId: rackA,
      responsibleId: uid,
      scheduleDate: daysAgoDate(0, 9),
      status: "READY",
      lines: { create: [{ productId: P.DESK001, quantity: 5 }] },
    },
  });

  console.log("Seed complete:", { user: user.email, warehouse: warehouse.name, ...counters });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
