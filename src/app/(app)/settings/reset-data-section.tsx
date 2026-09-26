"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resetDemoData, type ResetDataState } from "@/lib/actions/settings";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";
import { AlertTriangleIcon } from "@/components/icons";

export function ResetDataSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetDemoData, {} as ResetDataState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <>
      <Card className="border-danger/30 p-5">
        <h2 className="mb-1 text-base font-semibold text-foreground">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted">
          Wipes every warehouse, product, and operation for all users and restores the original demo data. This
          cannot be undone.
        </p>
        <Button type="button" variant="danger" onClick={() => setOpen(true)}>
          Reset Data
        </Button>
        {state.success && <p className="mt-3 text-sm text-success">{state.success}</p>}
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-center text-lg font-semibold text-foreground">Reset all data?</h2>
            <p className="mt-1 text-center text-sm text-muted">
              This permanently deletes every warehouse, product, and operation for everyone using this app and
              replaces them with the original demo data. Enter your password to confirm.
            </p>

            <form action={formAction} className="mt-5 space-y-4">
              <div>
                <Label htmlFor="reset-password">Password</Label>
                <Input id="reset-password" name="password" type="password" required autoFocus />
              </div>
              <FieldError>{state.error}</FieldError>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" className="flex-1" disabled={pending}>
                  {pending ? "Resetting..." : "Reset Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
