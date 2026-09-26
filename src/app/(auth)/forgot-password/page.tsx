"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, FieldError, Input, Label } from "@/components/ui";

const RESEND_COOLDOWN_SECONDS = 60;

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 1);
  const masked = "•".repeat(Math.max(local.length - 1, 3));
  return `${visible}${masked}@${domain}`;
}

type Step = "request" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendOtp() {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    setCode(["", "", "", "", "", ""]);
    setStep("otp");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendOtp();
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

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/verify-reset-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: code.join("") }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong");
      return;
    }
    setStep("password");
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, confirmPassword }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Something went wrong");
      return;
    }
    setStep("success");
  }

  if (step === "request") {
    return (
      <Card className="p-8">
        <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">Enter your registered email to receive a 6-digit code</p>

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

  if (step === "otp") {
    return (
      <Card className="p-8">
        <h1 className="text-xl font-semibold text-foreground">Check your email</h1>
        <p className="mt-1 text-sm text-muted">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-foreground">{maskEmail(email)}</span>
        </p>

        <form className="mt-6 space-y-5" onSubmit={verifyOtp}>
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
                autoFocus={i === 0}
                className="h-12 w-11 rounded-lg border border-border bg-surface text-center text-lg font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            ))}
          </div>

          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" disabled={loading || code.some((d) => !d)}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <p className="text-center text-sm text-muted">
            Didn&apos;t receive the code?{" "}
            {cooldown > 0 ? (
              <span>Resend OTP in {cooldown}s</span>
            ) : (
              <button type="button" className="font-medium text-accent hover:underline" onClick={() => void sendOtp()}>
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

  if (step === "password") {
    return (
      <Card className="p-8">
        <p className="text-sm font-medium text-success">OTP verified ✓</p>
        <h1 className="mt-1 text-xl font-semibold text-foreground">Create your new password</h1>

        <form className="mt-6 space-y-4" onSubmit={resetPassword}>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8+ chars, upper, lower & special character"
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <FieldError>{error}</FieldError>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-8 text-center">
      <p className="text-lg font-semibold text-success">Password reset successfully ✓</p>
      <p className="mt-1 text-sm text-muted">You can now log in with your new password.</p>

      <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
        Continue to Login
      </Button>
    </Card>
  );
}
