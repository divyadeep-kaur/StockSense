"use client";

import { useActionState, useState, useTransition } from "react";
import { Button, FieldError, Input, Label } from "@/components/ui";
import { requestPasswordChangeOtp, type ProfileFormState } from "@/lib/actions/profile";

export function PasswordForm({
  action,
}: {
  action: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
}) {
  const [step, setStep] = useState<"start" | "otp">("start");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const [state, formAction, pending] = useActionState(action, {});

  function handleSendOtp() {
    setSendError(null);
    startSending(async () => {
      const result = await requestPasswordChangeOtp();
      if (result.error) {
        setSendError(result.error);
        return;
      }
      setSentTo(result.success ?? null);
      setStep("otp");
    });
  }

  if (step === "start") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          For security, changing your password requires a one-time code sent to your email.
        </p>
        <FieldError>{sendError}</FieldError>
        <Button type="button" onClick={handleSendOtp} disabled={sending}>
          {sending ? "Sending code..." : "Send verification code"}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {sentTo && <p className="text-sm text-success">{sentTo}</p>}
      <div>
        <Label htmlFor="code">6-digit code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          required
        />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
      </div>

      {state.error && <FieldError>{state.error}</FieldError>}
      {state.success && <p className="text-sm text-success">{state.success}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Updating..." : "Change Password"}
        </Button>
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={sending}
          className="text-sm font-medium text-accent hover:underline"
        >
          {sending ? "Resending..." : "Resend code"}
        </button>
      </div>
    </form>
  );
}
