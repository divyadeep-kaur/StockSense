"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Card, FieldError, Input, Label, Select } from "@/components/ui";
import type { DocFormState } from "@/lib/actions/receipts";

type Product = { id: string; name: string; sku: string; uom: string };
type Location = { id: string; name: string; warehouse: { name: string } };

export function NewAdjustmentForm({
  action,
  products,
  locations,
}: {
  action: (state: DocFormState, formData: FormData) => Promise<DocFormState>;
  products: Product[];
  locations: Location[];
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-lg">
      <Card className="space-y-4 p-6">
        <div>
          <Label htmlFor="productId">Product</Label>
          <Select id="productId" name="productId" defaultValue="" required>
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="locationId">Location</Label>
          <Select id="locationId" name="locationId" defaultValue="" required>
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.warehouse.name} / {l.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="countedQty">Counted Quantity</Label>
          <Input id="countedQty" name="countedQty" type="number" min={0} step="any" required />
        </div>

        <FieldError>{state.error}</FieldError>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Saving..." : "Save Adjustment"}
          </Button>
          <Link href="/operations/adjustments">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </Card>
    </form>
  );
}
