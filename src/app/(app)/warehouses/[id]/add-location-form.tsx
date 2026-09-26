"use client";

import { useActionState } from "react";
import { Button, FieldError, Input, Label } from "@/components/ui";
import type { DocFormState } from "@/lib/actions/warehouses";

export function AddLocationForm({
  action,
}: {
  action: (state: DocFormState, formData: FormData) => Promise<DocFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. Rack B" required />
      </div>
      <div>
        <Label htmlFor="shortCode">Short Code</Label>
        <Input id="shortCode" name="shortCode" placeholder="e.g. RACK-B" required />
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Adding..." : "Add Location"}
      </Button>
    </form>
  );
}
