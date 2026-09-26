"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Card, FieldError, Input, Label, Select } from "@/components/ui";
import { DocLines } from "@/components/doc-lines";
import type { DocFormState } from "@/lib/actions/receipts";

type Location = { id: string; name: string; warehouse: { name: string } };
type Product = { id: string; name: string; sku: string; uom: string };

export function NewDeliveryForm({
  action,
  locations,
  products,
}: {
  action: (state: DocFormState, formData: FormData) => Promise<DocFormState>;
  locations: Location[];
  products: Product[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Customer</Label>
            <Input id="customerName" name="customerName" placeholder="e.g. Azure Interior" required />
          </div>
          <div>
            <Label htmlFor="deliveryAddress">Delivery Address (optional)</Label>
            <Input id="deliveryAddress" name="deliveryAddress" placeholder="e.g. 12 Market St" />
          </div>
          <div>
            <Label htmlFor="fromLocationId">From Location</Label>
            <Select id="fromLocationId" name="fromLocationId" defaultValue="" required>
              <option value="">Select location</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.warehouse.name} / {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="scheduleDate">Schedule Date</Label>
            <Input id="scheduleDate" name="scheduleDate" type="date" defaultValue={today} required />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 text-base font-semibold text-foreground">Products</h2>
        <DocLines products={products} />
      </Card>

      <FieldError>{state.error}</FieldError>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Delivery"}
        </Button>
        <Link href="/operations/deliveries">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
