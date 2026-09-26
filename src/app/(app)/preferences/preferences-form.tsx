"use client";

import { useActionState } from "react";
import { Button, FieldError, Label, Select } from "@/components/ui";
import type { ProfileFormState } from "@/lib/actions/profile";

export function PreferencesForm({
  action,
  notifyLowStock,
  compactTables,
  defaultWarehouseId,
  warehouses,
}: {
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  notifyLowStock: boolean;
  compactTables: boolean;
  defaultWarehouseId: string | null;
  warehouses: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="defaultWarehouseId">Default warehouse</Label>
        <Select id="defaultWarehouseId" name="defaultWarehouseId" defaultValue={defaultWarehouseId ?? ""}>
          <option value="">No default</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-muted">Used to pre-select a warehouse across the app.</p>
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="notifyLowStock"
          defaultChecked={notifyLowStock}
          className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">Low-stock alerts</span>
          <span className="block text-xs text-muted">Show notifications when products fall below their reorder level.</span>
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="compactTables"
          defaultChecked={compactTables}
          className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
        />
        <span>
          <span className="block text-sm font-medium text-foreground">Compact table density</span>
          <span className="block text-xs text-muted">Tighter row spacing on tables like Products.</span>
        </span>
      </label>

      {state.error && <FieldError>{state.error}</FieldError>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  );
}
