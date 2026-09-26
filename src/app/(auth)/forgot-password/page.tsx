"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";

const RESEND_COOLDOWN_SECONDS = 45;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestOtp() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    setStep("verify");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    void requestOtp();
  }

  function handleCodeChange(index: number, value: string) {
    if (value && !/^\d$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function verifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: code.join(""), newPassword }),
    });
    const data = await res.json();

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (step === "request") {
    return (
      <Card className="p-8">
        <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">Enter your email to receive a 6-digit code</p>

        <form className="mt-6 space-y-4" onSubmit={handleRequestSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>
          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-accent hover:underline">
            Back to login
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        If <span className="font-medium text-foreground">{email}</span> is registered, a 6-digit code was just sent
        to it.
      </p>

      <form className="mt-6 space-y-5" onSubmit={verifyAndReset}>
        <div className="flex justify-between gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-11 rounded-lg border border-border bg-surface text-center text-lg font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          ))}
        </div>

        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        <FieldError>{error}</FieldError>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>

        <p className="text-center text-sm text-muted">
          {cooldown > 0 ? (
            `Resend OTP in ${String(Math.floor(cooldown / 60)).padStart(2, "0")}:${String(
              cooldown % 60
            ).padStart(2, "0")}`
          ) : (
            <button
              type="button"
              className="font-medium text-accent hover:underline"
              onClick={() => void requestOtp()}
            >
              Resend OTP
            </button>
          )}
        </p>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
