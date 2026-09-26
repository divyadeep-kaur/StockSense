import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, Card, EmptyState } from "@/components/ui";
import { PlusIcon, WarehouseIcon } from "@/components/icons";

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    include: { locations: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Warehouses & Locations</h1>
          <p className="mt-1 text-sm text-muted">Manage your warehouses and storage locations.</p>
        </div>
        <Link href="/warehouses/new">
          <Button>
            <PlusIcon className="h-4 w-4" />
            Add Warehouse
          </Button>
        </Link>
      </div>

      {warehouses.length === 0 ? (
        <Card className="p-6">
          <EmptyState title="No warehouses yet" description="Add your first warehouse to start tracking locations." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <Link key={w.id} href={`/warehouses/${w.id}`}>
              <Card className="p-5 hover:border-accent">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <WarehouseIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{w.name}</p>
                    <p className="text-xs text-muted">{w.shortCode}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">
                  {w.locations.length} location{w.locations.length === 1 ? "" : "s"}
                </p>
                {w.address && <p className="mt-1 text-xs text-muted">{w.address}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
