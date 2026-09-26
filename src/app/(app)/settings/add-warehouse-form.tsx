"use client";

import { useActionState } from "react";
import { createWarehouse, type DocFormState } from "@/lib/actions/warehouses";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function AddWarehouseForm() {
  const [state, formAction, pending] = useActionState(createWarehouse, {} as DocFormState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="wh-name">Name</Label>
        <Input id="wh-name" name="name" placeholder="e.g. Main Warehouse" required />
      </div>
      <div>
        <Label htmlFor="wh-shortCode">Short Code</Label>
        <Input id="wh-shortCode" name="shortCode" placeholder="e.g. WH2" required />
      </div>
      <div>
        <Label htmlFor="wh-address">Address</Label>
        <Input id="wh-address" name="address" placeholder="e.g. 1 Industrial Ave" />
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Adding..." : "Add Warehouse"}
      </Button>
    </form>
  );
}
