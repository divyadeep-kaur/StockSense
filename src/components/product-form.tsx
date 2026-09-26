"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Card, FieldError, Input, Label, Select } from "@/components/ui";
import type { ProductFormState } from "@/lib/actions/products";

type Category = { id: string; name: string };
type Location = { id: string; name: string; warehouse: { name: string } };

export function ProductForm({
  action,
  categories,
  locations,
  mode,
  initialValues,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  locations: Location[];
  mode: "create" | "edit";
  initialValues?: {
    name: string;
    sku: string;
    categoryId: string | null;
    uom: string;
    minStockQty: number;
    reorderQty: number;
    lowStockAlert: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <h2 className="text-base font-semibold text-foreground">Product details</h2>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" placeholder="e.g. Steel Rods" defaultValue={initialValues?.name} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU / Code</Label>
              <Input id="sku" name="sku" placeholder="e.g. SR001" defaultValue={initialValues?.sku} required />
            </div>
            <div>
              <Label htmlFor="uom">Unit of Measure</Label>
              <Select id="uom" name="uom" defaultValue={initialValues?.uom ?? "pcs"}>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
                <option value="box">box</option>
                <option value="m">m</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select id="categoryId" name="categoryId" defaultValue={initialValues?.categoryId ?? ""}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {mode === "create" && (
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <Label htmlFor="initialStock">Initial Stock (optional)</Label>
                <Input id="initialStock" name="initialStock" type="number" min={0} step="any" placeholder="e.g. 100" />
              </div>
              <div>
                <Label htmlFor="locationId">Location</Label>
                <Select id="locationId" name="locationId" defaultValue="">
                  <option value="">Select location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.warehouse.name} / {l.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="h-fit p-6">
        <h2 className="text-base font-semibold text-foreground">Reordering Rules</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="lowStockAlert"
              defaultChecked={initialValues?.lowStockAlert}
              className="h-4 w-4 rounded border-border accent-accent"
            />
            Enable low stock alerts
          </label>
          <div>
            <Label htmlFor="minStockQty">Min. Stock Quantity</Label>
            <Input
              id="minStockQty"
              name="minStockQty"
              type="number"
              min={0}
              step="any"
              defaultValue={initialValues?.minStockQty ?? 0}
            />
          </div>
          <div>
            <Label htmlFor="reorderQty">Reorder Quantity</Label>
            <Input
              id="reorderQty"
              name="reorderQty"
              type="number"
              min={0}
              step="any"
              defaultValue={initialValues?.reorderQty ?? 0}
            />
          </div>
        </div>

        <FieldError>{state.error}</FieldError>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
          <Link href="/products">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </Card>
    </form>
  );
}
