import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

const OTP_TTL_MS = 10 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same way so this endpoint can't be used to enumerate
  // registered emails.
  if (user) {
    await prisma.passwordResetOtp.updateMany({
      where: { userId: user.id, consumed: false },
      data: { consumed: true },
    });

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await sendOtpEmail(user.email, code);
  }

  return NextResponse.json({ ok: true });
}
