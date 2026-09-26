"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import type { DocFormState } from "@/lib/actions/warehouses";

export function NewWarehouseForm({
  action,
}: {
  action: (state: DocFormState, formData: FormData) => Promise<DocFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-lg">
      <Card className="space-y-4 p-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g. Main Warehouse" required />
        </div>
        <div>
          <Label htmlFor="shortCode">Short Code</Label>
          <Input id="shortCode" name="shortCode" placeholder="e.g. WH2" required />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" placeholder="e.g. 1 Industrial Ave" />
        </div>

        <FieldError>{state.error}</FieldError>

        <div className="flex gap-3">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "Saving..." : "Create Warehouse"}
          </Button>
          <Link href="/warehouses">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </Card>
    </form>
  );
}
