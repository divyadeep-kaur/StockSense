import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedDemoData } from "./seed-data";

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

  const { counters } = await seedDemoData(prisma, user.id);

  console.log("Seed complete:", { user: user.email, warehouse: "Main Warehouse", ...counters });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
