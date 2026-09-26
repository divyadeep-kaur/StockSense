import { createWarehouse } from "@/lib/actions/warehouses";
import { NewWarehouseForm } from "./new-warehouse-form";

export default function NewWarehousePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Add Warehouse</h1>
        <p className="mt-1 text-sm text-muted">This holds the multiple locations of a warehouse (racks, rooms, etc).</p>
      </div>
      <NewWarehouseForm action={createWarehouse} />
    </div>
  );
}
