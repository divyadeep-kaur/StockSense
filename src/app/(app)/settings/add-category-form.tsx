"use client";

import { useActionState } from "react";
import { addCategoryAction } from "@/lib/actions/products";
import { Button, FieldError, Input, Label } from "@/components/ui";

export function AddCategoryForm() {
  const [state, formAction, pending] = useActionState(addCategoryAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="name">Category name</Label>
        <Input id="name" name="name" placeholder="e.g. Packaging" required />
      </div>
      <FieldError>{state.error}</FieldError>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Adding..." : "Add Category"}
      </Button>
    </form>
  );
}
