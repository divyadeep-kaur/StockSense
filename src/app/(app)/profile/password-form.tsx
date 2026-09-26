"use client";

import { useActionState } from "react";
import { Button, FieldError, Input, Label } from "@/components/ui";
import type { ProfileFormState } from "@/lib/actions/profile";

export function PasswordForm({
  action,
}: {
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
      </div>

      {state.error && <FieldError>{state.error}</FieldError>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Updating..." : "Change Password"}
      </Button>
    </form>
  );
}
