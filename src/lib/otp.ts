import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Invalidates any outstanding OTP for this user and emails a fresh 6-digit code. */
export async function issuePasswordOtp(userId: string, email: string) {
  await prisma.passwordResetOtp.updateMany({
    where: { userId, consumed: false },
    data: { consumed: true },
  });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.passwordResetOtp.create({
    data: { userId, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  await sendOtpEmail(email, code);
}

/** Checks the code against the user's latest unconsumed OTP and consumes it on success. */
export async function verifyPasswordOtp(userId: string, code: string) {
  const otp = await prisma.passwordResetOtp.findFirst({
    where: { userId, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) return false;

  await prisma.passwordResetOtp.update({ where: { id: otp.id }, data: { consumed: true } });
  return true;
}
