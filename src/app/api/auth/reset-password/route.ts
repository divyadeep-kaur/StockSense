import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionCookie } from "@/lib/auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  code: z.string().trim().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const INVALID_OR_EXPIRED = "That code is invalid or has expired";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, code, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: INVALID_OR_EXPIRED }, { status: 400 });
  }

  const otp = await prisma.passwordResetOtp.findFirst({
    where: { userId: user.id, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return NextResponse.json({ error: INVALID_OR_EXPIRED }, { status: 400 });
  }

  const valid = await bcrypt.compare(code, otp.codeHash);
  if (!valid) {
    return NextResponse.json({ error: INVALID_OR_EXPIRED }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetOtp.update({ where: { id: otp.id }, data: { consumed: true } }),
  ]);

  await createSessionCookie(user.id);

  return NextResponse.json({ ok: true });
}
