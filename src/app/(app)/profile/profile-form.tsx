"use client";

import { useActionState } from "react";
import { Button, FieldError, Input, Label } from "@/components/ui";
import type { ProfileFormState } from "@/lib/actions/profile";

export function ProfileForm({
  action,
  fullName,
  email,
  role,
}: {
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  fullName: string;
  email: string;
  role: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input id="role" value={role.charAt(0) + role.slice(1).toLowerCase()} disabled />
      </div>

      {state.error && <FieldError>{state.error}</FieldError>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
