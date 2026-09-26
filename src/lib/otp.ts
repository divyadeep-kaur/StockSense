import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode() {
  // Cryptographically secure — never Math.random() for a security-sensitive OTP.
  return String(randomInt(100000, 1000000));
}

export type IssueOtpResult = { sent: true } | { sent: false; reason: "cooldown" } | { sent: false; reason: "delivery_failed" };

/**
 * Invalidates any outstanding OTP for this user and emails a fresh 6-digit
 * code, unless the last one was issued within the resend cooldown window (in
 * which case this silently no-ops — the caller must still respond as if it
 * succeeded, so this endpoint can't be used to probe registered emails).
 */
export async function issuePasswordOtp(userId: string, email: string): Promise<IssueOtpResult> {
  const mostRecent = await prisma.passwordResetOtp.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (mostRecent && Date.now() - mostRecent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return { sent: false, reason: "cooldown" };
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.$transaction([
    prisma.passwordResetOtp.updateMany({
      where: { userId, consumed: false },
      data: { consumed: true },
    }),
    prisma.passwordResetOtp.create({
      data: { userId, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    }),
  ]);

  try {
    await sendOtpEmail(email, code);
  } catch {
    return { sent: false, reason: "delivery_failed" };
  }

  return { sent: true };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

/** Checks the code against the user's latest unconsumed OTP. On success, marks it consumed + verified (single-use). */
export async function verifyPasswordOtp(userId: string, code: string): Promise<VerifyOtpResult> {
  const otp = await prisma.passwordResetOtp.findFirst({
    where: { userId, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, reason: "invalid" };

  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };
  if (otp.expiresAt < new Date()) return { ok: false, reason: "expired" };

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    const updated = await prisma.passwordResetOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: updated.attempts >= MAX_ATTEMPTS ? "too_many_attempts" : "invalid" };
  }

  await prisma.passwordResetOtp.update({
    where: { id: otp.id },
    data: { consumed: true, verifiedAt: new Date() },
  });
  return { ok: true };
}

/**
 * Confirms this user verified an OTP recently (within the same TTL window)
 * and hasn't already used that verification to reset their password. On
 * success, the OTP row is deleted so the verification can't be reused.
 */
export async function consumeVerifiedOtp(userId: string): Promise<boolean> {
  const otp = await prisma.passwordResetOtp.findFirst({
    where: {
      userId,
      consumed: true,
      verifiedAt: { gt: new Date(Date.now() - OTP_TTL_MS) },
    },
    orderBy: { verifiedAt: "desc" },
  });
  if (!otp) return false;

  await prisma.passwordResetOtp.delete({ where: { id: otp.id } });
  return true;
}
