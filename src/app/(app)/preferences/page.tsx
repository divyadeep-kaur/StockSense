import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePreferences } from "@/lib/actions/preferences";
import { Card } from "@/components/ui";
import { PreferencesForm } from "./preferences-form";

export default async function PreferencesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const warehouses = await prisma.warehouse.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Preferences</h1>
        <p className="mt-1 text-sm text-muted">Tune how StockSense alerts you and how it looks day to day.</p>
      </div>

      <Card className="max-w-xl p-6">
        <PreferencesForm
          action={updatePreferences}
          notifyLowStock={user.notifyLowStock}
          compactTables={user.compactTables}
          defaultWarehouseId={user.defaultWarehouseId}
          warehouses={warehouses}
        />
      </Card>
    </div>
  );
}
